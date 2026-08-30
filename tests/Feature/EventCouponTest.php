<?php

use App\Models\Event;
use App\Models\EventCoupon;
use App\Models\User;

beforeEach(function (): void {
    $this->vendor = User::factory()->create([
        'role' => 'vendor',
        'username' => 'couponvendor',
        'email_verified_at' => now(),
    ]);

    $this->event = Event::factory()->create(['user_id' => $this->vendor->id]);
});

it('creates a percentage coupon', function (): void {
    $this->actingAs($this->vendor)
        ->post("/vendor/events/{$this->event->id}/coupons", [
            'code' => 'DISKON50',
            'type' => 'percentage',
            'value' => 50,
            'is_active' => true,
        ])
        ->assertRedirect();

    $coupon = $this->event->coupons()->first();
    expect($coupon->code)->toBe('DISKON50');
    expect($coupon->type)->toBe('percentage');
    expect($coupon->value)->toBe(50);
});

it('creates a fixed discount coupon', function (): void {
    $this->actingAs($this->vendor)
        ->post("/vendor/events/{$this->event->id}/coupons", [
            'code' => 'HEMAT100K',
            'type' => 'fixed',
            'value' => 100000,
            'min_purchase' => 200000,
            'is_active' => true,
        ])
        ->assertRedirect();

    $coupon = $this->event->coupons()->first();
    expect($coupon->value)->toBe(100000);
    expect($coupon->min_purchase)->toBe(200000);
});

it('uppercases coupon codes automatically', function (): void {
    $this->actingAs($this->vendor)
        ->post("/vendor/events/{$this->event->id}/coupons", [
            'code' => 'diskon10',
            'type' => 'percentage',
            'value' => 10,
            'is_active' => true,
        ])
        ->assertRedirect();

    expect($this->event->coupons()->first()->code)->toBe('DISKON10');
});

it('prevents duplicate coupon codes in same event', function (): void {
    EventCoupon::factory()->create([
        'event_id' => $this->event->id,
        'code' => 'DUPLICATE',
        'type' => 'percentage',
        'value' => 10,
    ]);

    $this->actingAs($this->vendor)
        ->post("/vendor/events/{$this->event->id}/coupons", [
            'code' => 'DUPLICATE',
            'type' => 'percentage',
            'value' => 20,
            'is_active' => true,
        ])
        ->assertSessionHasErrors('code');
});

it('updates a coupon', function (): void {
    $coupon = EventCoupon::factory()->create([
        'event_id' => $this->event->id,
        'code' => 'OLD',
        'type' => 'percentage',
        'value' => 10,
    ]);

    $this->actingAs($this->vendor)
        ->put("/vendor/events/{$this->event->id}/coupons/{$coupon->id}", [
            'code' => 'NEW',
            'type' => 'fixed',
            'value' => 50000,
            'is_active' => false,
        ])
        ->assertRedirect();

    expect($coupon->fresh()->code)->toBe('NEW');
    expect($coupon->fresh()->type)->toBe('fixed');
    expect($coupon->fresh()->is_active)->toBeFalse();
});

it('deletes a coupon', function (): void {
    $coupon = EventCoupon::factory()->create([
        'event_id' => $this->event->id,
        'code' => 'DEL',
        'type' => 'percentage',
        'value' => 5,
    ]);

    $this->actingAs($this->vendor)
        ->delete("/vendor/events/{$this->event->id}/coupons/{$coupon->id}")
        ->assertRedirect();

    expect(EventCoupon::find($coupon->id))->toBeNull();
});

it('denies coupon creation on another vendor event', function (): void {
    $other = User::factory()->create(['role' => 'vendor', 'username' => 'other3', 'email_verified_at' => now()]);
    $otherEvent = Event::factory()->create(['user_id' => $other->id]);

    $this->actingAs($this->vendor)
        ->post("/vendor/events/{$otherEvent->id}/coupons", [
            'code' => 'HACK',
            'type' => 'percentage',
            'value' => 100,
            'is_active' => true,
        ])
        ->assertForbidden();
});
