<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';

        abort_unless(in_array($user->role, ['admin', 'vendor']), 403);

        $query = Order::with(['event.vendor', 'items'])
            ->when(! $isAdmin, fn ($q) => $q->whereHas('event', fn ($eq) => $eq->where('user_id', $user->id)));

        // Filters
        $query
            ->when($request->filled('event_id'), fn ($q) => $q->where('event_id', $request->integer('event_id')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search');
                $q->where(function ($inner) use ($search) {
                    $inner->where('order_number', 'like', "%{$search}%")
                        ->orWhere('buyer_name', 'like', "%{$search}%")
                        ->orWhere('buyer_email', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('date_from'), fn ($q) => $q->whereDate('created_at', '>=', $request->string('date_from')))
            ->when($request->filled('date_to'), fn ($q) => $q->whereDate('created_at', '<=', $request->string('date_to')));

        $orders = $query->latest()->paginate(25)->withQueryString();

        $totalRevenue = (clone $query)->where('status', 'paid')->sum('total_price');
        $totalOrders = (clone $query)->count();
        $paidOrders = (clone $query)->where('status', 'paid')->count();

        /** @var array<int, array{id: int, title: string}> $events */
        $events = $isAdmin
            ? Event::select('id', 'title')->orderBy('title')->get()->toArray()
            : Event::select('id', 'title')->where('user_id', $user->id)->orderBy('title')->get()->toArray();

        $feeRate = 0.03;

        return Inertia::render('orders/index', [
            'orders' => $orders->through(fn (Order $order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'buyer_name' => $order->buyer_name,
                'buyer_email' => $order->buyer_email,
                'buyer_phone' => $order->buyer_phone,
                'total_price' => $order->total_price,
                'status' => $order->status,
                'payment_type' => $order->payment_type,
                'created_at' => $order->created_at?->toDateTimeString(),
                'event' => [
                    'id' => $order->event->id,
                    'title' => $order->event->title,
                ],
                'items_count' => $order->items->sum('quantity'),
                ...($isAdmin ? [
                    'fee' => (int) round($order->total_price * $feeRate),
                    'vendor_name' => $order->event->vendor?->name ?? '—',
                ] : []),
            ]),
            'events' => $events,
            'filters' => $request->only(['event_id', 'status', 'search', 'date_from', 'date_to']),
            'summary' => [
                'total_orders' => $totalOrders,
                'paid_orders' => $paidOrders,
                'total_revenue' => $totalRevenue,
                ...($isAdmin ? ['total_fee' => (int) round($totalRevenue * $feeRate)] : []),
            ],
            'is_admin' => $isAdmin,
        ]);
    }
}
