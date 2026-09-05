<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\StoreEventRequest;
use App\Http\Requests\Vendor\UpdateEventRequest;
use App\Models\Event;
use App\Models\EventAgenda;
use App\Models\EventSpeaker;
use App\Models\EventSponsor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    /**
     * Display the vendor's event list.
     */
    public function index(Request $request): Response
    {
        $this->authorizeVendor($request);

        $events = Event::query()
            ->where('user_id', $request->user()->id)
            ->withCount('tickets')
            ->latest()
            ->get()
            ->map(fn (Event $event) => [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
                'category' => $event->category,
                'type' => $event->type,
                'status' => $event->status,
                'starts_at' => $event->starts_at?->toDateTimeString(),
                'ends_at' => $event->ends_at?->toDateTimeString(),
                'tickets_count' => $event->tickets_count,
                'banner' => $event->banner,
            ]);

        return Inertia::render('vendor/events/index', [
            'events' => $events,
        ]);
    }

    /**
     * Show the event creation form.
     */
    public function create(Request $request): Response
    {
        $this->authorizeVendor($request);

        return Inertia::render('vendor/events/create');
    }

    /**
     * Store a new event.
     */
    public function store(StoreEventRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('banner')) {
            $validated['banner'] = $request->file('banner')->store('events/banners', 'public');
        }

        $event = $request->user()->events()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? null,
            'type' => $validated['type'],
            'status' => $validated['status'],
            'location' => $validated['location'] ?? null,
            'maps_url' => $validated['maps_url'] ?? null,
            'online_platform' => $validated['online_platform'] ?? null,
            'online_url' => $validated['online_url'] ?? null,
            'banner' => $validated['banner'] ?? null,
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
            'max_attendees' => $validated['max_attendees'] ?? null,
        ]);

        $this->syncAgendas($event, $validated['agendas'] ?? []);
        $this->syncSpeakers($event, $request, $validated['speakers'] ?? []);
        $this->syncSponsors($event, $request, $validated['sponsors'] ?? []);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Event berhasil dibuat.']);

        return to_route('vendor.events.edit', $event);
    }

    /**
     * Show the event edit form.
     */
    public function edit(Request $request, Event $event): Response
    {
        $this->authorizeVendor($request);
        abort_if($event->user_id !== $request->user()->id, 403);

        $event->load(['agendas', 'speakers', 'sponsors', 'tickets', 'coupons']);

        return Inertia::render('vendor/events/edit', [
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
                'description' => $event->description,
                'category' => $event->category,
                'type' => $event->type,
                'status' => $event->status,
                'location' => $event->location,
                'maps_url' => $event->maps_url,
                'online_platform' => $event->online_platform,
                'online_url' => $event->online_url,
                'banner' => $event->banner,
                'starts_at' => $event->starts_at?->format('Y-m-d\TH:i'),
                'ends_at' => $event->ends_at?->format('Y-m-d\TH:i'),
                'max_attendees' => $event->max_attendees,
                'agendas' => $event->agendas->map(fn ($a) => [
                    'id' => $a->id,
                    'time' => $a->time ? substr((string) $a->time, 0, 5) : '',
                    'title' => $a->title,
                    'description' => $a->description,
                    'speaker' => $a->speaker,
                    'order' => $a->order,
                ]),
                'speakers' => $event->speakers->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'title' => $s->title,
                    'bio' => $s->bio,
                    'avatar' => $s->avatar,
                    'order' => $s->order,
                ]),
                'sponsors' => $event->sponsors->map(fn ($sp) => [
                    'id' => $sp->id,
                    'name' => $sp->name,
                    'logo' => $sp->logo,
                    'website' => $sp->website,
                    'tier' => $sp->tier,
                    'order' => $sp->order,
                ]),
                'tickets' => $event->tickets->map(fn ($t) => [
                    'id' => $t->id,
                    'name' => $t->name,
                    'type' => $t->type,
                    'tier' => $t->tier,
                    'price' => $t->price,
                    'quota' => $t->quota,
                    'max_per_order' => $t->max_per_order,
                    'sales_start' => $t->sales_start?->format('Y-m-d\TH:i'),
                    'sales_end' => $t->sales_end?->format('Y-m-d\TH:i'),
                    'description' => $t->description,
                    'is_active' => $t->is_active,
                ]),
                'coupons' => $event->coupons->map(fn ($c) => [
                    'id' => $c->id,
                    'code' => $c->code,
                    'type' => $c->type,
                    'value' => $c->value,
                    'max_uses' => $c->max_uses,
                    'used_count' => $c->used_count,
                    'min_purchase' => $c->min_purchase,
                    'valid_from' => $c->valid_from?->format('Y-m-d\TH:i'),
                    'valid_until' => $c->valid_until?->format('Y-m-d\TH:i'),
                    'is_active' => $c->is_active,
                ]),
            ],
        ]);
    }

    /**
     * Update an existing event.
     */
    public function update(UpdateEventRequest $request, Event $event): RedirectResponse
    {
        abort_if($event->user_id !== $request->user()->id, 403);

        $validated = $request->validated();

        if ($request->hasFile('banner')) {
            if ($event->banner) {
                Storage::disk('public')->delete($event->banner);
            }
            $validated['banner'] = $request->file('banner')->store('events/banners', 'public');
        } else {
            unset($validated['banner']);
        }

        $event->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? null,
            'type' => $validated['type'],
            'status' => $validated['status'],
            'location' => $validated['location'] ?? null,
            'maps_url' => $validated['maps_url'] ?? null,
            'online_platform' => $validated['online_platform'] ?? null,
            'online_url' => $validated['online_url'] ?? null,
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
            'max_attendees' => $validated['max_attendees'] ?? null,
            ...isset($validated['banner']) ? ['banner' => $validated['banner']] : [],
        ]);

        $this->syncAgendas($event, $validated['agendas'] ?? []);
        $this->syncSpeakers($event, $request, $validated['speakers'] ?? []);
        $this->syncSponsors($event, $request, $validated['sponsors'] ?? []);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Event berhasil diperbarui.']);

        return back();
    }

    /**
     * Delete an event.
     */
    public function destroy(Request $request, Event $event): RedirectResponse
    {
        $this->authorizeVendor($request);
        abort_if($event->user_id !== $request->user()->id, 403);

        if ($event->banner) {
            Storage::disk('public')->delete($event->banner);
        }

        $event->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Event berhasil dihapus.']);

        return to_route('vendor.events.index');
    }

    /**
     * Sync agenda items for an event.
     *
     * @param  array<int, array<string, mixed>>  $agendas
     */
    private function syncAgendas(Event $event, array $agendas): void
    {
        $keepIds = [];

        foreach ($agendas as $index => $agendaData) {
            $data = [
                'time' => $agendaData['time'] ?? null,
                'title' => $agendaData['title'],
                'description' => $agendaData['description'] ?? null,
                'speaker' => $agendaData['speaker'] ?? null,
                'order' => $index,
            ];

            if (! empty($agendaData['id'])) {
                $agenda = EventAgenda::find($agendaData['id']);
                if ($agenda && $agenda->event_id === $event->id) {
                    $agenda->update($data);
                    $keepIds[] = $agenda->id;
                }
            } else {
                $agenda = $event->agendas()->create($data);
                $keepIds[] = $agenda->id;
            }
        }

        $event->agendas()->whereNotIn('id', $keepIds)->delete();
    }

    /**
     * Sync speakers for an event.
     *
     * @param  array<int, array<string, mixed>>  $speakers
     */
    private function syncSpeakers(Event $event, Request $request, array $speakers): void
    {
        $keepIds = [];

        foreach ($speakers as $index => $speakerData) {
            $avatarPath = null;

            if (isset($speakerData['avatar']) && $speakerData['avatar'] instanceof UploadedFile) {
                $avatarPath = $speakerData['avatar']->store('events/speakers', 'public');
            }

            $data = [
                'name' => $speakerData['name'],
                'title' => $speakerData['title'] ?? null,
                'bio' => $speakerData['bio'] ?? null,
                'order' => $index,
                ...($avatarPath ? ['avatar' => $avatarPath] : []),
            ];

            if (! empty($speakerData['id'])) {
                $speaker = EventSpeaker::find($speakerData['id']);
                if ($speaker && $speaker->event_id === $event->id) {
                    if ($avatarPath && $speaker->avatar) {
                        Storage::disk('public')->delete($speaker->avatar);
                    }
                    $speaker->update($data);
                    $keepIds[] = $speaker->id;
                }
            } else {
                $speaker = $event->speakers()->create($data);
                $keepIds[] = $speaker->id;
            }
        }

        // Delete removed speakers and their avatars
        $event->speakers()->whereNotIn('id', $keepIds)->get()->each(function (EventSpeaker $speaker): void {
            if ($speaker->avatar) {
                Storage::disk('public')->delete($speaker->avatar);
            }
            $speaker->delete();
        });
    }

    /**
     * Sync sponsors for an event.
     *
     * @param  array<int, array<string, mixed>>  $sponsors
     */
    private function syncSponsors(Event $event, Request $request, array $sponsors): void
    {
        $keepIds = [];

        foreach ($sponsors as $index => $sponsorData) {
            $logoPath = null;

            if (isset($sponsorData['logo']) && $sponsorData['logo'] instanceof UploadedFile) {
                $logoPath = $sponsorData['logo']->store('events/sponsors', 'public');
            }

            $data = [
                'name' => $sponsorData['name'],
                'website' => $sponsorData['website'] ?? null,
                'tier' => $sponsorData['tier'] ?? 'bronze',
                'order' => $index,
                ...($logoPath ? ['logo' => $logoPath] : []),
            ];

            if (! empty($sponsorData['id'])) {
                $sponsor = EventSponsor::find($sponsorData['id']);
                if ($sponsor && $sponsor->event_id === $event->id) {
                    if ($logoPath && $sponsor->logo) {
                        Storage::disk('public')->delete($sponsor->logo);
                    }
                    $sponsor->update($data);
                    $keepIds[] = $sponsor->id;
                }
            } else {
                $sponsor = $event->sponsors()->create($data);
                $keepIds[] = $sponsor->id;
            }
        }

        $event->sponsors()->whereNotIn('id', $keepIds)->get()->each(function (EventSponsor $sponsor): void {
            if ($sponsor->logo) {
                Storage::disk('public')->delete($sponsor->logo);
            }
            $sponsor->delete();
        });
    }

    private function authorizeVendor(Request $request): void
    {
        abort_if($request->user()?->role !== 'vendor', 403, 'Hanya vendor yang dapat mengakses halaman ini.');
    }
}
