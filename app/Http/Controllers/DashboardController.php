<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventCoupon;
use App\Models\EventTicket;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';

        // Scope event IDs to the logged-in vendor when not admin
        $eventIds = $isAdmin
            ? null
            : Event::where('user_id', $user->id)->pluck('id');

        $stats = $isAdmin
            ? [
                'totalEvents' => Event::count(),
                'totalTickets' => EventTicket::count(),
                'totalCoupons' => EventCoupon::count(),
                'totalVendors' => User::where('role', 'vendor')->count(),
            ]
            : [
                'totalEvents' => Event::where('user_id', $user->id)->count(),
                'totalTickets' => EventTicket::whereIn('event_id', $eventIds)->count(),
                'totalCoupons' => EventCoupon::whereIn('event_id', $eventIds)->count(),
                'totalPaidOrders' => Order::whereIn('event_id', $eventIds)->where('status', 'paid')->count(),
            ];

        $eventsByStatus = Event::selectRaw('status, COUNT(*) as count')
            ->when(! $isAdmin, fn ($q) => $q->where('user_id', $user->id))
            ->groupBy('status')
            ->get()
            ->map(fn ($item) => [
                'name' => ucfirst($item->status),
                'value' => (int) $item->count,
            ])
            ->values()
            ->all();

        $eventsByType = Event::selectRaw('type, COUNT(*) as count')
            ->when(! $isAdmin, fn ($q) => $q->where('user_id', $user->id))
            ->groupBy('type')
            ->get()
            ->map(fn ($item) => [
                'name' => ucfirst($item->type),
                'value' => (int) $item->count,
            ])
            ->values()
            ->all();

        $driver = DB::connection()->getDriverName();
        $monthExpr = $driver === 'sqlite' ? "cast(strftime('%m', created_at) as integer)" : 'MONTH(created_at)';
        $monthlyEvents = Event::selectRaw("{$monthExpr} as month, COUNT(*) as count")
            ->when(! $isAdmin, fn ($q) => $q->where('user_id', $user->id))
            ->whereYear('created_at', now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($item) => [
                'month' => now()->startOfYear()->addMonths(((int) $item->month) - 1)->format('M'),
                'count' => (int) $item->count,
            ])
            ->values()
            ->all();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'eventsByStatus' => $eventsByStatus,
            'eventsByType' => $eventsByType,
            'monthlyEvents' => $monthlyEvents,
            'is_admin' => $isAdmin,
        ]);
    }
}
