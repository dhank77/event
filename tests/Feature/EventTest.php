<?php

use App\Models\Event;
use App\Models\User;

beforeEach(function (): void {
    $this->vendor = User::factory()->create([
        'role' => 'vendor',
        'username' => 'testvendor',
        'email_verified_at' => now(),
    ]);

    $this->other = User::factory()->create([
        'role' => 'vendor',
        'username' => 'othervendor',
        'email_verified_at' => now(),
    ]);
});

it('redirects guests from vendor events index', function (): void {
    $this->get('/vendor/events')
        ->assertRedirect('/login');
});

it('shows vendor events index', function (): void {
    $this->actingAs($this->vendor)
        ->get('/vendor/events')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('vendor/events/index'));
});

it('only shows the vendor their own events', function (): void {
    $ownEvent = Event::factory()->create(['user_id' => $this->vendor->id]);
    $otherEvent = Event::factory()->create(['user_id' => $this->other->id]);

    $this->actingAs($this->vendor)
        ->get('/vendor/events')
        ->assertInertia(fn ($page) => $page
            ->component('vendor/events/index')
            ->has('events', 1)
            ->where('events.0.id', $ownEvent->id)
        );
});

it('shows the create event form', function (): void {
    $this->actingAs($this->vendor)
        ->get('/vendor/events/create')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('vendor/events/create'));
});

it('creates a new event', function (): void {
    $this->actingAs($this->vendor)
        ->post('/vendor/events', [
            'title' => 'Test Event',
            'type' => 'offline',
            'status' => 'draft',
            'location' => 'Jakarta',
        ])
        ->assertRedirect();

    expect(Event::where('user_id', $this->vendor->id)->where('title', 'Test Event')->exists())->toBeTrue();
});

it('validates required fields on create', function (): void {
    $this->actingAs($this->vendor)
        ->post('/vendor/events', [])
        ->assertSessionHasErrors(['title', 'type', 'status']);
});

it('shows the edit form for own event', function (): void {
    $event = Event::factory()->create(['user_id' => $this->vendor->id]);

    $this->actingAs($this->vendor)
        ->get("/vendor/events/{$event->id}/edit")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('vendor/events/edit'));
});

it('denies access to other vendor events edit', function (): void {
    $event = Event::factory()->create(['user_id' => $this->other->id]);

    $this->actingAs($this->vendor)
        ->get("/vendor/events/{$event->id}/edit")
        ->assertForbidden();
});

it('updates an event', function (): void {
    $event = Event::factory()->create(['user_id' => $this->vendor->id]);

    $this->actingAs($this->vendor)
        ->put("/vendor/events/{$event->id}", [
            'title' => 'Updated Title',
            'type' => 'online',
            'status' => 'published',
            'online_platform' => 'Zoom',
            'online_url' => 'https://zoom.us/j/123456',
        ])
        ->assertRedirect();

    expect($event->fresh()->title)->toBe('Updated Title');
    expect($event->fresh()->status)->toBe('published');
});

it('denies updating another vendor event', function (): void {
    $event = Event::factory()->create(['user_id' => $this->other->id]);

    $this->actingAs($this->vendor)
        ->put("/vendor/events/{$event->id}", [
            'title' => 'Hack',
            'type' => 'offline',
            'status' => 'draft',
        ])
        ->assertForbidden();
});

it('deletes own event', function (): void {
    $event = Event::factory()->create(['user_id' => $this->vendor->id]);

    $this->actingAs($this->vendor)
        ->delete("/vendor/events/{$event->id}")
        ->assertRedirect('/vendor/events');

    expect(Event::find($event->id))->toBeNull();
});

it('denies deleting another vendor event', function (): void {
    $event = Event::factory()->create(['user_id' => $this->other->id]);

    $this->actingAs($this->vendor)
        ->delete("/vendor/events/{$event->id}")
        ->assertForbidden();
});

it('forbids non-vendor users from creating events', function (): void {
    $admin = User::factory()->create(['role' => 'admin', 'username' => 'adminuser', 'email_verified_at' => now()]);

    $this->actingAs($admin)
        ->post('/vendor/events', [
            'title' => 'Test',
            'type' => 'offline',
            'status' => 'draft',
        ])
        ->assertForbidden();
});

it('updates an event with agendas having H:i or H:i:s and existing speaker avatar and sponsor logo strings', function (): void {
    $event = Event::factory()->create(['user_id' => $this->vendor->id]);

    $this->actingAs($this->vendor)
        ->put("/vendor/events/{$event->id}", [
            'title' => 'Updated Event With Agendas & Speakers',
            'type' => 'offline',
            'status' => 'published',
            'agendas' => [
                [
                    'time' => '09:00:00',
                    'title' => 'Opening Keynote',
                    'description' => 'Welcome speech',
                    'speaker' => 'Jane Doe',
                ],
                [
                    'time' => '10:30',
                    'title' => 'Second Session',
                    'description' => 'Deep dive',
                    'speaker' => 'John Doe',
                ],
            ],
            'speakers' => [
                [
                    'name' => 'Jane Doe',
                    'title' => 'CTO',
                    'bio' => 'Speaker bio',
                    'avatar' => 'events/speakers/existing-avatar.jpg',
                ],
            ],
            'sponsors' => [
                [
                    'name' => 'Acme Corp',
                    'tier' => 'gold',
                    'website' => 'https://acme.test',
                    'logo' => 'events/sponsors/existing-logo.png',
                ],
            ],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('event_agendas', [
        'event_id' => $event->id,
        'title' => 'Opening Keynote',
    ]);

    $this->assertDatabaseHas('event_speakers', [
        'event_id' => $event->id,
        'name' => 'Jane Doe',
    ]);

    $this->assertDatabaseHas('event_sponsors', [
        'event_id' => $event->id,
        'name' => 'Acme Corp',
    ]);
});
