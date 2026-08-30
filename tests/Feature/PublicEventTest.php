<?php

use App\Models\Event;
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
