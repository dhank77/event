<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class CheckInController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';

        abort_unless(in_array($user->role, ['admin', 'vendor']), 403);

        $events = Event::query()
            ->when(! $isAdmin, fn ($q) => $q->where('user_id', $user->id))
            ->orderBy('title')
            ->get()
            ->map(fn (Event $event) => [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
                'starts_at' => $event->starts_at?->toDateTimeString(),
                'total_paid' => Order::where('event_id', $event->id)->where('status', 'paid')->count(),
                'total_checked_in' => Order::where('event_id', $event->id)->where('status', 'paid')->whereNotNull('checked_in_at')->count(),
            ]);

        return Inertia::render('check-in/index', [
            'events' => $events,
            'is_admin' => $isAdmin,
        ]);
    }

    public function scan(Request $request): JsonResponse
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';

        abort_unless(in_array($user->role, ['admin', 'vendor']), 403);

        $validated = $request->validate([
            'order_number' => ['required', 'string', 'max:50'],
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
        ]);

        $order = Order::with(['event.vendor', 'items'])
            ->where('order_number', trim($validated['order_number']))
            ->first();

        if (! $order) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Order tidak ditemukan.',
            ], 404);
        }

        if (! $isAdmin && $order->event->user_id !== $user->id) {
            return response()->json([
                'status' => 'forbidden',
                'message' => 'Anda tidak punya akses ke order ini.',
            ], 403);
        }

        if (! empty($validated['event_id']) && (int) $order->event_id !== (int) $validated['event_id']) {
            return response()->json([
                'status' => 'wrong_event',
                'message' => 'Tiket ini terdaftar untuk event "'.$order->event->title.'", bukan event yang sedang dipilih.',
                'order' => $this->formatOrder($order, $isAdmin),
            ], 422);
        }

        if ($order->status !== 'paid') {
            return response()->json([
                'status' => 'not_paid',
                'message' => 'Order ini belum lunas (status: '.$order->status.').',
                'order' => $this->formatOrder($order, $isAdmin),
            ], 422);
        }

        if ($order->checked_in_at !== null) {
            return response()->json([
                'status' => 'already_checked_in',
                'message' => 'Peserta sudah check-in pada '.$order->checked_in_at->format('d M Y H:i').'.',
                'order' => $this->formatOrder($order, $isAdmin),
            ], 409);
        }

        $order->update(['checked_in_at' => Carbon::now()]);
        $order->refresh();

        return response()->json([
            'status' => 'success',
            'message' => 'Check-in berhasil!',
            'order' => $this->formatOrder($order, $isAdmin),
        ]);
    }

    /** @return array<string, mixed> */
    private function formatOrder(Order $order, bool $isAdmin): array
    {
        return [
            'order_number' => $order->order_number,
            'buyer_name' => $order->buyer_name,
            'buyer_email' => $order->buyer_email,
            'buyer_phone' => $order->buyer_phone,
            'total_price' => $order->total_price,
            'status' => $order->status,
            'checked_in_at' => $order->checked_in_at?->toDateTimeString(),
            'event' => [
                'id' => $order->event->id,
                'title' => $order->event->title,
            ],
            'items_count' => $order->items->sum('quantity'),
            'items' => $order->items->map(fn ($item) => [
                'ticket_name' => $item->ticket_name,
                'ticket_tier' => $item->ticket_tier,
                'quantity' => $item->quantity,
            ]),
            ...($isAdmin ? ['vendor_name' => $order->event->vendor?->name ?? '—'] : []),
        ];
    }
}
