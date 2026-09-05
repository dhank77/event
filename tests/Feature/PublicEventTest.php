<?php

use App\Models\Event;
use App\Models\EventTicket;
use App\Models\User;

use function Pest\Laravel\get;

it('displays the public event detail page for a published event', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);
    $event = Event::factory()->create([
        'user_id' => $vendor->id,
        'status' => 'published',
    ]);

    get("/{$vendor->username}/events/{$event->slug}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('events/show')
            ->has('vendor.name')
            ->has('event.title')
        );
});

it('returns 404 for a draft event', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);
    $event = Event::factory()->create([
        'user_id' => $vendor->id,
        'status' => 'draft',
    ]);

    get("/{$vendor->username}/events/{$event->slug}")
        ->assertNotFound();
});

it('returns 404 if the event does not belong to the vendor', function () {
    $vendor1 = User::factory()->create(['role' => 'vendor']);
    $vendor2 = User::factory()->create(['role' => 'vendor']);

    $event = Event::factory()->create([
        'user_id' => $vendor1->id,
        'status' => 'published',
    ]);

    get("/{$vendor2->username}/events/{$event->slug}")
        ->assertNotFound();
});

it('displays active tickets including upcoming tickets on the public event page', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);
    $event = Event::factory()->create([
        'user_id' => $vendor->id,
        'status' => 'published',
    ]);

    EventTicket::factory()->create([
        'event_id' => $event->id,
        'name' => 'Tiket Tersedia',
        'is_active' => true,
        'sales_start' => now()->subDay(),
        'sales_end' => now()->addDays(5),
    ]);

    EventTicket::factory()->create([
        'event_id' => $event->id,
        'name' => 'Tiket Segera Hadir',
        'is_active' => true,
        'sales_start' => now()->addDays(2),
        'sales_end' => now()->addDays(10),
    ]);

    EventTicket::factory()->create([
        'event_id' => $event->id,
        'name' => 'Tiket Tidak Aktif',
        'is_active' => false,
    ]);

    get("/{$vendor->username}/events/{$event->slug}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('events/show')
            ->has('event.tickets', 2)
            ->where('event.tickets.0.name', 'Tiket Tersedia')
            ->where('event.tickets.0.sales_status', 'available')
            ->where('event.tickets.1.name', 'Tiket Segera Hadir')
            ->where('event.tickets.1.sales_status', 'upcoming')
        );
});
