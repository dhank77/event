<?php

use App\Models\Event;
use App\Models\EventTicket;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;

beforeEach(function () {
    $this->vendor = User::factory()->create(['role' => 'vendor']);
    $this->event = Event::factory()->create([
        'user_id' => $this->vendor->id,
        'status' => 'published',
    ]);
});

it('validates required checkout fields', function () {
    $this->post('/checkout', [])
        ->assertSessionHasErrors(['event_id', 'buyer_name', 'buyer_email', 'buyer_phone', 'items']);
});

it('validates that ticket belongs to the event', function () {
    $otherEvent = Event::factory()->create(['user_id' => $this->vendor->id, 'status' => 'published']);
    $ticket = EventTicket::factory()->create([
        'event_id' => $otherEvent->id,
        'type' => 'paid',
        'price' => 50000,
        'is_active' => true,
    ]);

    $this->post('/checkout', [
        'event_id' => $this->event->id,
        'buyer_name' => 'John Doe',
        'buyer_email' => 'john@example.com',
        'buyer_phone' => '08123456789',
        'items' => [['ticket_id' => $ticket->id, 'quantity' => 1]],
    ])->assertRedirectBack();
});

it('creates order and order items for free tickets and redirects to order status page', function () {
    $ticket = EventTicket::factory()->create([
        'event_id' => $this->event->id,
        'type' => 'free',
        'price' => 0,
        'quota' => 10,
        'max_per_order' => 5,
        'is_active' => true,
    ]);

    $response = $this->post('/checkout', [
        'event_id' => $this->event->id,
        'buyer_name' => 'Jane Doe',
        'buyer_email' => 'jane@example.com',
        'buyer_phone' => '08111222333',
        'items' => [['ticket_id' => $ticket->id, 'quantity' => 2]],
    ]);

    $order = Order::where('buyer_email', 'jane@example.com')->first();

    expect($order)->not->toBeNull();
    expect($order->status)->toBe('paid');
    expect($order->total_price)->toBe(0);
    expect($order->items)->toHaveCount(1);
    expect($order->items->first()->quantity)->toBe(2);

    // Quota should have been decremented
    expect($ticket->fresh()->quota)->toBe(8);

    $response->assertRedirect(route('orders.show', $order->order_number));
});

it('decrements ticket quota on successful free order', function () {
    $ticket = EventTicket::factory()->create([
        'event_id' => $this->event->id,
        'type' => 'free',
        'price' => 0,
        'quota' => 5,
        'max_per_order' => 5,
        'is_active' => true,
    ]);

    $this->post('/checkout', [
        'event_id' => $this->event->id,
        'buyer_name' => 'Test',
        'buyer_email' => 'test@example.com',
        'buyer_phone' => '08000000000',
        'items' => [['ticket_id' => $ticket->id, 'quantity' => 3]],
    ]);

    expect($ticket->fresh()->quota)->toBe(2);
});

it('does not decrement quota for unlimited tickets', function () {
    $ticket = EventTicket::factory()->create([
        'event_id' => $this->event->id,
        'type' => 'free',
        'price' => 0,
        'quota' => null,
        'max_per_order' => 10,
        'is_active' => true,
    ]);

    $this->post('/checkout', [
        'event_id' => $this->event->id,
        'buyer_name' => 'Test',
        'buyer_email' => 'test@example.com',
        'buyer_phone' => '08000000000',
        'items' => [['ticket_id' => $ticket->id, 'quantity' => 1]],
    ]);

    expect($ticket->fresh()->quota)->toBeNull();
});

it('displays order status page', function () {
    $this->withoutVite();

    $ticket = EventTicket::factory()->create([
        'event_id' => $this->event->id,
        'type' => 'free',
        'price' => 0,
        'is_active' => true,
    ]);

    $order = Order::factory()->create([
        'event_id' => $this->event->id,
        'status' => 'paid',
        'total_price' => 0,
    ]);

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'event_ticket_id' => $ticket->id,
        'ticket_name' => $ticket->name,
        'ticket_tier' => $ticket->tier,
        'price' => 0,
        'quantity' => 1,
    ]);

    $this->get(route('orders.show', $order->order_number))
        ->assertOk();
});

it('returns 404 for non-existent order', function () {
    $this->get(route('orders.show', 'ORD-NONEXISTENT'))->assertNotFound();
});

it('rejects notification with invalid signature', function () {
    $this->postJson('/api/midtrans/notification', [
        'order_id' => 'ORD-TEST',
        'status_code' => '200',
        'gross_amount' => '50000.00',
        'signature_key' => 'invalid_signature',
        'transaction_status' => 'settlement',
    ])->assertStatus(403);
});

it('updates order status on valid midtrans settlement notification', function () {
    $order = Order::factory()->create([
        'event_id' => $this->event->id,
        'status' => 'pending',
        'total_price' => 50000,
    ]);

    $serverKey = config('midtrans.server_key', '');
    $signature = hash('sha512', $order->order_number.'200'.'50000.00'.$serverKey);

    $this->postJson('/api/midtrans/notification', [
        'order_id' => $order->order_number,
        'status_code' => '200',
        'gross_amount' => '50000.00',
        'signature_key' => $signature,
        'transaction_status' => 'settlement',
        'payment_type' => 'bank_transfer',
    ])->assertOk();

    expect($order->fresh()->status)->toBe('paid');
    expect($order->fresh()->payment_type)->toBe('bank_transfer');
});
