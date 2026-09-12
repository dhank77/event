<?php

use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Carbon;

test('guests are redirected to login', function () {
    $this->get(route('check-in.index'))->assertRedirect(route('login'));
    $this->postJson(route('check-in.scan'), ['order_number' => 'ORD-TEST'])->assertUnauthorized();
});

test('user with role "user" gets 403 forbidden', function () {
    $user = User::factory()->create(['role' => 'user']);

    $this->actingAs($user)->get(route('check-in.index'))->assertForbidden();
    $this->actingAs($user)->postJson(route('check-in.scan'), ['order_number' => 'ORD-TEST'])->assertForbidden();
});

test('vendor can view check-in page and only sees their own events', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);
    $otherVendor = User::factory()->create(['role' => 'vendor']);

    $ownEvent = Event::factory()->create(['user_id' => $vendor->id, 'title' => 'My Event']);
    $otherEvent = Event::factory()->create(['user_id' => $otherVendor->id, 'title' => 'Other Event']);

    $response = $this->actingAs($vendor)->get(route('check-in.index'));

    $response->assertOk()->assertInertia(
        fn ($page) => $page
            ->component('check-in/index')
            ->where('is_admin', false)
            ->has('events', 1)
            ->where('events.0.id', $ownEvent->id)
    );
});

test('admin can view check-in page and sees all events', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $vendor1 = User::factory()->create(['role' => 'vendor']);
    $vendor2 = User::factory()->create(['role' => 'vendor']);

    Event::factory()->create(['user_id' => $vendor1->id]);
    Event::factory()->create(['user_id' => $vendor2->id]);

    $response = $this->actingAs($admin)->get(route('check-in.index'));

    $response->assertOk()->assertInertia(
        fn ($page) => $page
            ->component('check-in/index')
            ->where('is_admin', true)
            ->has('events', 2)
    );
});

test('scan returns 404 when order number does not exist', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);

    $response = $this->actingAs($vendor)->postJson(route('check-in.scan'), [
        'order_number' => 'NON-EXISTENT',
    ]);

    $response->assertStatus(404)
        ->assertJson([
            'status' => 'not_found',
        ]);
});

test('vendor cannot scan order from another vendor\'s event', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);
    $otherVendor = User::factory()->create(['role' => 'vendor']);

    $otherEvent = Event::factory()->create(['user_id' => $otherVendor->id]);
    $order = Order::factory()->paid()->create(['event_id' => $otherEvent->id]);

    $response = $this->actingAs($vendor)->postJson(route('check-in.scan'), [
        'order_number' => $order->order_number,
    ]);

    $response->assertStatus(403)
        ->assertJson([
            'status' => 'forbidden',
        ]);
});

test('scan returns 422 when order is not paid', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);
    $event = Event::factory()->create(['user_id' => $vendor->id]);
    $order = Order::factory()->create([
        'event_id' => $event->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($vendor)->postJson(route('check-in.scan'), [
        'order_number' => $order->order_number,
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'status' => 'not_paid',
        ]);
});

test('scan returns 409 when order is already checked in', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);
    $event = Event::factory()->create(['user_id' => $vendor->id]);
    $order = Order::factory()->paid()->create([
        'event_id' => $event->id,
        'checked_in_at' => Carbon::now()->subHour(),
    ]);

    $response = $this->actingAs($vendor)->postJson(route('check-in.scan'), [
        'order_number' => $order->order_number,
    ]);

    $response->assertStatus(409)
        ->assertJson([
            'status' => 'already_checked_in',
        ]);
});

test('successful scan checks in the attendee and returns 200', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);
    $event = Event::factory()->create(['user_id' => $vendor->id]);
    $order = Order::factory()->paid()->create([
        'event_id' => $event->id,
        'checked_in_at' => null,
    ]);
    OrderItem::factory()->create([
        'order_id' => $order->id,
        'quantity' => 2,
    ]);

    $response = $this->actingAs($vendor)->postJson(route('check-in.scan'), [
        'order_number' => $order->order_number,
    ]);

    $response->assertOk()
        ->assertJson([
            'status' => 'success',
            'message' => 'Check-in berhasil!',
            'order' => [
                'order_number' => $order->order_number,
                'buyer_name' => $order->buyer_name,
                'items_count' => 2,
            ],
        ]);

    expect($order->fresh()->checked_in_at)->not->toBeNull();
});

test('admin can check in any vendor\'s order', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $vendor = User::factory()->create(['role' => 'vendor']);
    $event = Event::factory()->create(['user_id' => $vendor->id]);
    $order = Order::factory()->paid()->create([
        'event_id' => $event->id,
        'checked_in_at' => null,
    ]);

    $response = $this->actingAs($admin)->postJson(route('check-in.scan'), [
        'order_number' => $order->order_number,
    ]);

    $response->assertOk()
        ->assertJson([
            'status' => 'success',
            'order' => [
                'vendor_name' => $vendor->name,
            ],
        ]);

    expect($order->fresh()->checked_in_at)->not->toBeNull();
});

test('scan returns 422 when order belongs to a different event than selected', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);
    $eventA = Event::factory()->create(['user_id' => $vendor->id, 'title' => 'Concert A']);
    $eventB = Event::factory()->create(['user_id' => $vendor->id, 'title' => 'Concert B']);

    $order = Order::factory()->paid()->create([
        'event_id' => $eventA->id,
        'checked_in_at' => null,
    ]);

    // Scanning with selected event B while ticket is for event A
    $response = $this->actingAs($vendor)->postJson(route('check-in.scan'), [
        'order_number' => $order->order_number,
        'event_id' => $eventB->id,
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'status' => 'wrong_event',
            'message' => 'Tiket ini terdaftar untuk event "Concert A", bukan event yang sedang dipilih.',
        ]);

    expect($order->fresh()->checked_in_at)->toBeNull();
});
