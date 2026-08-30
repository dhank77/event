<?php

use App\Models\Event;
use App\Models\EventTicket;
use App\Models\User;

beforeEach(function (): void {
    $this->vendor = User::factory()->create([
        'role' => 'vendor',
        'username' => 'ticketvendor',
        'email_verified_at' => now(),
    ]);

    $this->event = Event::factory()->create(['user_id' => $this->vendor->id]);
});

it('creates a free ticket', function (): void {
    $this->actingAs($this->vendor)
        ->post("/vendor/events/{$this->event->id}/tickets", [
            'name' => 'Tiket Gratis',
            'type' => 'free',
            'tier' => 'regular',
            'max_per_order' => 1,
            'is_active' => true,
        ])
        ->assertRedirect();

    expect($this->event->tickets()->where('name', 'Tiket Gratis')->exists())->toBeTrue();
    expect($this->event->tickets()->first()->price)->toBe(0);
});

it('creates a paid ticket with price', function (): void {
    $this->actingAs($this->vendor)
        ->post("/vendor/events/{$this->event->id}/tickets", [
            'name' => 'Tiket VIP',
            'type' => 'paid',
            'tier' => 'vip',
            'price' => 500000,
            'max_per_order' => 2,
            'is_active' => true,
        ])
        ->assertRedirect();

    $ticket = $this->event->tickets()->first();
    expect($ticket->price)->toBe(500000);
    expect($ticket->tier)->toBe('vip');
});

it('updates a ticket', function (): void {
    $ticket = EventTicket::factory()->create([
        'event_id' => $this->event->id,
        'name' => 'Old Name',
        'type' => 'free',
        'tier' => 'regular',
        'max_per_order' => 1,
        'is_active' => true,
    ]);

    $this->actingAs($this->vendor)
        ->put("/vendor/events/{$this->event->id}/tickets/{$ticket->id}", [
            'name' => 'New Name',
            'type' => 'free',
            'tier' => 'early_bird',
            'max_per_order' => 1,
            'is_active' => true,
        ])
        ->assertRedirect();

    expect($ticket->fresh()->name)->toBe('New Name');
    expect($ticket->fresh()->tier)->toBe('early_bird');
});

it('deletes a ticket', function (): void {
    $ticket = EventTicket::factory()->create([
        'event_id' => $this->event->id,
        'type' => 'free',
        'tier' => 'regular',
        'max_per_order' => 1,
    ]);

    $this->actingAs($this->vendor)
        ->delete("/vendor/events/{$this->event->id}/tickets/{$ticket->id}")
        ->assertRedirect();

    expect(EventTicket::find($ticket->id))->toBeNull();
});

it('denies ticket creation on another vendor event', function (): void {
    $other = User::factory()->create(['role' => 'vendor', 'username' => 'other2', 'email_verified_at' => now()]);
    $otherEvent = Event::factory()->create(['user_id' => $other->id]);

    $this->actingAs($this->vendor)
        ->post("/vendor/events/{$otherEvent->id}/tickets", [
            'name' => 'Hack',
            'type' => 'free',
            'tier' => 'regular',
            'max_per_order' => 1,
        ])
        ->assertForbidden();
});
