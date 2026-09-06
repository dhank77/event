<?php

namespace App\Http\Controllers;

use Akira\QrCode\Facades\QrCode;
use App\Models\Event;
use App\Models\EventTicket;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\FonnteService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Midtrans\Config;
use Midtrans\Snap;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class CheckoutController extends Controller
{
    public function __construct(
        protected FonnteService $fonnteService,
    ) {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
    }

    /**
     * Process checkout: create order, generate Midtrans Snap token, and redirect to payment.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'event_id' => ['required', 'integer', 'exists:events,id'],
            'buyer_name' => ['required', 'string', 'max:255'],
            'buyer_email' => ['required', 'email', 'max:255'],
            'buyer_phone' => ['required', 'string', 'max:20'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.ticket_id' => ['required', 'integer', 'exists:event_tickets,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $event = Event::findOrFail($validated['event_id']);

        // Resolve tickets and calculate total
        $ticketIds = collect($validated['items'])->pluck('ticket_id');
        $tickets = EventTicket::whereIn('id', $ticketIds)
            ->where('event_id', $event->id)
            ->where('is_active', true)
            ->get()
            ->keyBy('id');

        $totalPrice = 0;
        $itemsData = [];

        foreach ($validated['items'] as $item) {
            $ticket = $tickets->get($item['ticket_id']);

            if (! $ticket) {
                return back()->withErrors(['items' => 'Tiket tidak valid atau tidak tersedia.']);
            }

            $maxQty = min($ticket->max_per_order, $ticket->quota ?? PHP_INT_MAX);
            if ($item['quantity'] > $maxQty) {
                return back()->withErrors(['items' => "Kuantitas melebihi batas untuk tiket {$ticket->name}."]);
            }

            $subtotal = $ticket->price * $item['quantity'];
            $totalPrice += $subtotal;

            $itemsData[] = [
                'ticket' => $ticket,
                'quantity' => $item['quantity'],
                'subtotal' => $subtotal,
            ];
        }

        $isFree = $totalPrice === 0;

        $order = DB::transaction(function () use ($validated, $event, $itemsData, $totalPrice, $isFree): Order {
            $order = Order::create([
                'order_number' => 'ORD-'.strtoupper(Str::random(12)),
                'event_id' => $event->id,
                'user_id' => auth()->id(),
                'buyer_name' => $validated['buyer_name'],
                'buyer_email' => $validated['buyer_email'],
                'buyer_phone' => $validated['buyer_phone'],
                'total_price' => $totalPrice,
                'status' => $isFree ? 'paid' : 'pending',
            ]);

            foreach ($itemsData as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'event_ticket_id' => $item['ticket']->id,
                    'ticket_name' => $item['ticket']->name,
                    'ticket_tier' => $item['ticket']->tier,
                    'price' => $item['ticket']->price,
                    'quantity' => $item['quantity'],
                ]);

                // Decrement quota if not unlimited
                if ($item['ticket']->quota !== null) {
                    $item['ticket']->decrement('quota', $item['quantity']);
                }
            }

            return $order;
        });

        // Free order — go straight to success page
        if ($isFree) {
            $this->fonnteService->sendOrderPaidNotification($order);

            return redirect()->route('orders.show', $order->order_number);
        }

        // Paid order — get Midtrans Snap token and redirect
        try {
            $params = [
                'transaction_details' => [
                    'order_id' => $order->order_number,
                    'gross_amount' => $order->total_price,
                ],
                'customer_details' => [
                    'first_name' => $order->buyer_name,
                    'email' => $order->buyer_email,
                    'phone' => $order->buyer_phone,
                ],
                'item_details' => collect($itemsData)->map(fn ($item) => [
                    'id' => (string) $item['ticket']->id,
                    'price' => $item['ticket']->price,
                    'quantity' => $item['quantity'],
                    'name' => $item['ticket']->name,
                ])->toArray(),
                'callbacks' => [
                    'finish' => route('orders.show', $order->order_number),
                ],
            ];

            $snapToken = Snap::getSnapToken($params);
            $snapRedirectUrl = config('midtrans.is_production')
                ? "https://app.midtrans.com/snap/v2/vtweb/{$snapToken}"
                : "https://app.sandbox.midtrans.com/snap/v2/vtweb/{$snapToken}";

            $order->update([
                'snap_token' => $snapToken,
                'snap_redirect_url' => $snapRedirectUrl,
            ]);

            $this->fonnteService->sendOrderPendingNotification($order);

            return redirect()->route('orders.show', $order->order_number);
        } catch (\Exception $e) {
            $order->update(['status' => 'cancelled']);

            return back()->withErrors(['payment' => 'Gagal menghubungi Midtrans: '.$e->getMessage()]);
        }
    }

    /**
     * Display order status page.
     * Also handles Midtrans finish callback query params to update order status
     * in case the webhook hasn't fired yet.
     */
    public function show(string $orderNumber, Request $request): Response
    {
        $order = Order::with(['items', 'event'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        // Handle Midtrans finish callback query params
        $transactionStatus = $request->query('transaction_status');
        if ($transactionStatus && $order->status === 'pending') {
            $newStatus = match ($transactionStatus) {
                'settlement', 'capture' => 'paid',
                'pending' => 'pending',
                'deny', 'expire', 'cancel' => 'cancelled',
                default => $order->status,
            };

            if ($newStatus !== $order->status) {
                $order->update(['status' => $newStatus]);
                $order->refresh();

                if ($newStatus === 'paid') {
                    $this->fonnteService->sendOrderPaidNotification($order);
                }
            }
        }

        $qrCode = null;
        if ($order->status === 'paid') {
            $rawPng = QrCode::format('png')
                ->size(280)
                ->margin(1)
                ->errorCorrection('M')
                ->generateRaw($order->order_number);

            $qrCode = 'data:image/png;base64,'.base64_encode($rawPng);
        }

        return Inertia::render('orders/show', [
            'order' => [
                'order_number' => $order->order_number,
                'buyer_name' => $order->buyer_name,
                'buyer_email' => $order->buyer_email,
                'buyer_phone' => $order->buyer_phone,
                'total_price' => $order->total_price,
                'status' => $order->status,
                'payment_type' => $order->payment_type,
                'snap_redirect_url' => $order->snap_redirect_url,
                'qr_code' => $qrCode,
                'event' => [
                    'title' => $order->event->title,
                    'slug' => $order->event->slug,
                ],
                'items' => $order->items->map(fn ($item) => [
                    'ticket_name' => $item->ticket_name,
                    'ticket_tier' => $item->ticket_tier,
                    'price' => $item->price,
                    'quantity' => $item->quantity,
                    'subtotal' => $item->price * $item->quantity,
                ]),
            ],
        ]);
    }

    /**
     * Handle Midtrans payment notification webhook.
     */
    public function notification(Request $request): JsonResponse
    {
        $serverKey = config('midtrans.server_key');
        $hashedKey = hash('sha512', $request->order_id.$request->status_code.$request->gross_amount.$serverKey);

        if ($hashedKey !== $request->signature_key) {
            return response()->json(['message' => 'Invalid signature key'], 403);
        }

        $order = Order::where('order_number', $request->order_id)->first();

        if (! $order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $transactionStatus = $request->transaction_status;
        $fraudStatus = $request->fraud_status;

        $newStatus = match (true) {
            $transactionStatus === 'capture' && $fraudStatus === 'accept' => 'paid',
            $transactionStatus === 'capture' && $fraudStatus === 'challenge' => 'pending',
            $transactionStatus === 'settlement' => 'paid',
            $transactionStatus === 'pending' => 'pending',
            in_array($transactionStatus, ['deny', 'expire', 'cancel']) => 'cancelled',
            default => $order->status,
        };

        $wasNotPaid = $order->status !== 'paid';

        $order->update([
            'status' => $newStatus,
            'payment_type' => $request->payment_type ?? $order->payment_type,
        ]);

        if ($wasNotPaid && $newStatus === 'paid') {
            $this->fonnteService->sendOrderPaidNotification($order);
        }

        return response()->json(['message' => 'Notification processed successfully']);
    }

    /**
     * Download QR code as PNG image.
     */
    public function downloadQrCode(string $orderNumber): SymfonyResponse
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        if ($order->status !== 'paid') {
            abort(403, 'QR Code hanya tersedia untuk pesanan yang sudah lunas.');
        }

        $rawPng = QrCode::format('png')
            ->size(500)
            ->margin(2)
            ->errorCorrection('H')
            ->generateRaw($order->order_number);

        return response($rawPng, 200, [
            'Content-Type' => 'image/png',
            'Content-Disposition' => 'attachment; filename="qrcode-'.$order->order_number.'.png"',
        ]);
    }

    /**
     * Download E-Ticket as PDF using laravel-dompdf.
     */
    public function downloadPdf(string $orderNumber): SymfonyResponse
    {
        $order = Order::with(['items', 'event.vendor'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        if ($order->status !== 'paid') {
            abort(403, 'E-Ticket hanya tersedia untuk pesanan yang sudah lunas.');
        }

        $rawPng = QrCode::format('png')
            ->size(250)
            ->margin(1)
            ->errorCorrection('M')
            ->generateRaw($order->order_number);

        $qrCodeBase64 = base64_encode($rawPng);

        $pdf = Pdf::loadView('pdf.ticket', [
            'order' => $order,
            'qrCodeBase64' => $qrCodeBase64,
        ])->setPaper('a4', 'portrait');

        return $pdf->download('tiket-'.$order->order_number.'.pdf');
    }
}
