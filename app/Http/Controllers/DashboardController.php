<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventCoupon;
use App\Models\EventTicket;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $stats = [
            'totalEvents' => Event::count(),
            'totalTickets' => EventTicket::count(),
            'totalCoupons' => EventCoupon::count(),
            'totalVendors' => User::where('role', 'vendor')->count(),
        ];

        $eventsByStatus = Event::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->map(fn ($item) => [
                'name' => ucfirst($item->status),
                'value' => (int) $item->count,
            ])
            ->values()
            ->all();

        $eventsByType = Event::selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->get()
            ->map(fn ($item) => [
                'name' => ucfirst($item->type),
                'value' => (int) $item->count,
            ])
            ->values()
            ->all();

        $monthlyEvents = Event::selectRaw('MONTH(created_at) as month, COUNT(*) as count')
            ->whereYear('created_at', now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($item) => [
                'month' => now()->startOfYear()->addMonths($item->month - 1)->format('M'),
                'count' => (int) $item->count,
            ])
            ->values()
            ->all();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'eventsByStatus' => $eventsByStatus,
            'eventsByType' => $eventsByType,
            'monthlyEvents' => $monthlyEvents,
        ]);
    }
}
