<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class VendorProfileController extends Controller
{
    /**
     * Display the vendor's public profile page.
     */
    public function show(User $user): Response
    {
        $now = now();

        $events = $user->events()
            ->where('status', 'published')
            ->orderBy('starts_at', 'asc')
            ->get();

        $upcomingEvents = $events->filter(function ($event) use ($now) {
            return $event->starts_at >= $now || $event->ends_at >= $now || ! $event->starts_at;
        })->map(function ($event) {
            return [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
                'date' => $event->starts_at ? $event->starts_at->translatedFormat('d M Y') : 'TBA',
                'location' => $event->type === 'online' ? ($event->online_platform ?: 'Online') : ($event->location ?: 'Location TBA'),
                'attendees' => $event->max_attendees ? $event->max_attendees : 'Tak terbatas',
                'price' => 'Lihat Tiket',
                'category' => $event->category ?? 'Event',
                'banner' => $event->banner ? asset('storage/'.$event->banner) : null,
                'bgColor' => 'bg-secondary',
                'status' => 'upcoming',
            ];
        })->values();

        $pastEvents = $events->filter(function ($event) use ($now) {
            return $event->starts_at && $event->starts_at < $now && $event->ends_at < $now;
        })->map(function ($event) {
            return [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
                'date' => $event->starts_at->translatedFormat('d M Y'),
                'attendees' => 'Selesai',
                'category' => $event->category ?? 'Event',
                'banner' => $event->banner ? asset('storage/'.$event->banner) : null,
                'bgColor' => 'bg-primary',
                'status' => 'past',
            ];
        })->values();

        return Inertia::render('vendor/show', [
            'vendor' => [
                'name' => $user->name,
                'username' => $user->username,
                'role' => $user->role,
                'joined' => $user->created_at?->format('F Y'),
                'avatar' => $user->avatar ? asset('storage/'.$user->avatar) : null,
                'about' => $user->about,
                'social_media' => $user->social_media ?? [],
            ],
            'upcomingEvents' => $upcomingEvents,
            'pastEvents' => $pastEvents,
        ]);
    }
}
