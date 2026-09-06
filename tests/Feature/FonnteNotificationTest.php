<?php

use App\Models\Event;
use App\Models\EventTicket;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Services\FonnteService;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Config::set('services.fonnte.token', 'dummy-fonnte-token');
    Config::set('services.fonnte.url', 'https://api.fonnte.com/send');
    Config::set('services.fonnte.country_code', '62');

    $this->vendor = User::factory()->create(['role' => 'vendor']);
    $this->event = Event::factory()->create([
        'user_id' => $this->vendor->id,
        'title' => 'Konser Musik Nusantara',
        'status' => 'published',
        'location' => 'Stadion Utama Gelora Bung Karno',
    ]);
});

it('sends pending whatsapp notification with order details and payment link', function () {
    Http::fake([
        'https://api.fonnte.com/send' => Http::response(['status' => true, 'detail' => 'success! message in queue'], 200),
    ]);

    $order = Order::factory()->create([
        'event_id' => $this->event->id,
        'buyer_name' => 'Budi Santoso',
        'buyer_phone' => '081234567890',
        'total_price' => 150000,
        'status' => 'pending',
        'snap_redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/dummy-token',
    ]);

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'ticket_name' => 'VIP Ticket',
        'price' => 150000,
        'quantity' => 1,
    ]);

    $fonnteService = app(FonnteService::class);
    $result = $fonnteService->sendOrderPendingNotification($order);

    expect($result)->toBeTrue();
    expect($order->fresh()->wa_pending_sent_at)->not->toBeNull();

    Http::assertSent(function (Request $request) use ($order) {
        return $request->url() === 'https://api.fonnte.com/send'
            && $request->hasHeader('Authorization', 'dummy-fonnte-token')
            && $request['target'] === '081234567890'
            && str_contains($request['message'], $order->order_number)
            && str_contains($request['message'], 'Konser Musik Nusantara')
            && str_contains($request['message'], 'MENUNGGU PEMBAYARAN')
            && str_contains($request['message'], 'dummy-token');
    });
});

it('sends paid whatsapp notification with e-ticket link', function () {
    Http::fake([
        'https://api.fonnte.com/send' => Http::response(['status' => true, 'detail' => 'success! message in queue'], 200),
    ]);

    $order = Order::factory()->create([
        'event_id' => $this->event->id,
        'buyer_name' => 'Siti Nurhaliza',
        'buyer_phone' => '+62 812-9876-5432',
        'total_price' => 100000,
        'status' => 'paid',
    ]);

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'ticket_name' => 'Regular Pass',
        'price' => 100000,
        'quantity' => 2,
    ]);

    $fonnteService = app(FonnteService::class);
    $result = $fonnteService->sendOrderPaidNotification($order);

    expect($result)->toBeTrue();
    expect($order->fresh()->wa_paid_sent_at)->not->toBeNull();

    Http::assertSent(function (Request $request) use ($order) {
        return $request->url() === 'https://api.fonnte.com/send'
            && $request['target'] === '6281298765432'
            && str_contains($request['message'], $order->order_number)
            && str_contains($request['message'], 'BERHASIL')
            && str_contains($request['message'], 'Regular Pass')
            && str_contains($request['message'], route('orders.show', $order->order_number));
    });
});

it('sends paid whatsapp notification on free ticket checkout creation', function () {
    Http::fake([
        'https://api.fonnte.com/send' => Http::response(['status' => true], 200),
    ]);

    $ticket = EventTicket::factory()->create([
        'event_id' => $this->event->id,
        'type' => 'free',
        'price' => 0,
        'quota' => 10,
        'max_per_order' => 5,
        'is_active' => true,
    ]);

    $this->post('/checkout', [
        'event_id' => $this->event->id,
        'buyer_name' => 'Ahmad Dahlan',
        'buyer_email' => 'ahmad@example.com',
        'buyer_phone' => '08551234567',
        'items' => [['ticket_id' => $ticket->id, 'quantity' => 1]],
    ])->assertRedirect();

    $order = Order::where('buyer_email', 'ahmad@example.com')->first();
    expect($order)->not->toBeNull();
    expect($order->status)->toBe('paid');
    expect($order->wa_paid_sent_at)->not->toBeNull();

    Http::assertSent(function (Request $request) use ($order) {
        return $request['target'] === '08551234567'
            && str_contains($request['message'], $order->order_number)
            && str_contains($request['message'], 'BERHASIL');
    });
});

it('sends paid whatsapp notification when midtrans webhook confirms payment settlement', function () {
    Http::fake([
        'https://api.fonnte.com/send' => Http::response(['status' => true], 200),
    ]);

    $order = Order::factory()->create([
        'event_id' => $this->event->id,
        'buyer_name' => 'Dewi Sartika',
        'buyer_phone' => '08771234567',
        'status' => 'pending',
        'total_price' => 75000,
    ]);

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'ticket_name' => 'Early Bird',
        'price' => 75000,
        'quantity' => 1,
    ]);

    $serverKey = config('midtrans.server_key', '');
    $signature = hash('sha512', $order->order_number.'200'.'75000.00'.$serverKey);

    $this->postJson('/api/midtrans/notification', [
        'order_id' => $order->order_number,
        'status_code' => '200',
        'gross_amount' => '75000.00',
        'signature_key' => $signature,
        'transaction_status' => 'settlement',
        'payment_type' => 'qris',
    ])->assertOk();

    expect($order->fresh()->status)->toBe('paid');
    expect($order->fresh()->wa_paid_sent_at)->not->toBeNull();

    Http::assertSent(function (Request $request) use ($order) {
        return $request['target'] === '08771234567'
            && str_contains($request['message'], $order->order_number)
            && str_contains($request['message'], 'BERHASIL');
    });
});

it('does not send duplicate paid notification if already sent', function () {
    Http::fake([
        'https://api.fonnte.com/send' => Http::response(['status' => true], 200),
    ]);

    $order = Order::factory()->create([
        'event_id' => $this->event->id,
        'status' => 'paid',
        'wa_paid_sent_at' => now()->subMinutes(10),
    ]);

    $fonnteService = app(FonnteService::class);
    $result = $fonnteService->sendOrderPaidNotification($order);

    expect($result)->toBeFalse();
    Http::assertNothingSent();
});

it('gracefully handles missing fonnte token without throwing exception', function () {
    Config::set('services.fonnte.token', null);

    $order = Order::factory()->create([
        'event_id' => $this->event->id,
        'status' => 'pending',
    ]);

    $fonnteService = app(FonnteService::class);
    $result = $fonnteService->sendOrderPendingNotification($order);

    expect($result)->toBeFalse();
    expect($order->fresh()->wa_pending_sent_at)->toBeNull();
});
