<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class PublicEventController extends Controller
{
    /**
     * Display the specified public event.
     */
    public function show(User $user, Event $event): Response
    {
        abort_if($event->user_id !== $user->id, 404);
        abort_if($event->status !== 'published', 404);

        $event->load([
            'agendas',
            'speakers',
            'sponsors',
            'tickets' => fn ($query) => $query->where('is_active', true)
                ->where(fn ($q) => $q->whereNull('sales_start')->orWhere('sales_start', '<=', now()))
                ->where(fn ($q) => $q->whereNull('sales_end')->orWhere('sales_end', '>=', now())),
        ]);

        return Inertia::render('events/show', [
            'vendor' => [
                'name' => $user->name,
                'username' => $user->username,
                'avatar' => $user->avatar ? asset('storage/'.$user->avatar) : null,
            ],
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
                'description' => $event->description,
                'category' => $event->category,
                'type' => $event->type,
                'location' => $event->location,
                'maps_url' => $event->maps_url,
                'online_platform' => $event->online_platform,
                'online_url' => $event->online_url,
                'banner' => $event->banner ? asset('storage/'.$event->banner) : null,
                'starts_at' => $event->starts_at?->toIso8601String(),
                'ends_at' => $event->ends_at?->toIso8601String(),
                'formatted_date' => $event->starts_at ? $event->starts_at->translatedFormat('d M Y, H:i') : 'TBA',
                'formatted_end_date' => $event->ends_at ? $event->ends_at->translatedFormat('d M Y, H:i') : null,
                'agendas' => $event->agendas,
                'speakers' => $event->speakers->map(fn ($s) => array_merge($s->toArray(), [
                    'avatar_url' => $s->avatar ? asset('storage/'.$s->avatar) : null,
                ])),
                'sponsors' => $event->sponsors->map(fn ($s) => array_merge($s->toArray(), [
                    'logo_url' => $s->logo ? asset('storage/'.$s->logo) : null,
                ])),
                'tickets' => $event->tickets,
            ],
        ]);
    }
}
