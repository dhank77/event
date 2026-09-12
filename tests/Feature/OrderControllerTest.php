<?php

use App\Models\Event;
use App\Models\Order;
use App\Models\User;

test('guests are redirected to login', function () {
    $this->get(route('orders.index'))->assertRedirect(route('login'));
});

test('authenticated user with no role gets 403', function () {
    $user = User::factory()->create(['role' => 'user']);
    $this->actingAs($user)->get(route('orders.index'))->assertForbidden();
});

test('vendor can access orders index and only sees own event orders', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);
    $otherVendor = User::factory()->create(['role' => 'vendor']);

    $ownEvent = Event::factory()->create(['user_id' => $vendor->id]);
    $otherEvent = Event::factory()->create(['user_id' => $otherVendor->id]);

    $ownOrder = Order::factory()->create(['event_id' => $ownEvent->id]);
    $otherOrder = Order::factory()->create(['event_id' => $otherEvent->id]);

    $response = $this->actingAs($vendor)->get(route('orders.index'));

    $response->assertOk()->assertInertia(
        fn ($page) => $page
            ->component('orders/index')
            ->where('is_admin', false)
            ->has('orders.data', 1)
            ->where('orders.data.0.id', $ownOrder->id)
            ->missing('orders.data.0.fee')
    );
});

test('admin can access orders index and sees all orders with fee', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $vendor = User::factory()->create(['role' => 'vendor']);

    $event = Event::factory()->create(['user_id' => $vendor->id]);
    $order = Order::factory()->create(['event_id' => $event->id, 'total_price' => 100000, 'status' => 'paid']);

    $response = $this->actingAs($admin)->get(route('orders.index'));

    $response->assertOk()->assertInertia(
        fn ($page) => $page
            ->component('orders/index')
            ->where('is_admin', true)
            ->has('orders.data', 1)
            ->where('orders.data.0.fee', 3000)
            ->where('summary.total_fee', 3000)
    );
});

test('orders can be filtered by status', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);
    $event = Event::factory()->create(['user_id' => $vendor->id]);

    Order::factory()->create(['event_id' => $event->id, 'status' => 'paid']);
    Order::factory()->create(['event_id' => $event->id, 'status' => 'pending']);

    $response = $this->actingAs($vendor)->get(route('orders.index', ['status' => 'paid']));

    $response->assertOk()->assertInertia(
        fn ($page) => $page->has('orders.data', 1)->where('orders.data.0.status', 'paid')
    );
});

test('orders can be filtered by search term', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);
    $event = Event::factory()->create(['user_id' => $vendor->id]);

    Order::factory()->create(['event_id' => $event->id, 'buyer_name' => 'Budi Santoso']);
    Order::factory()->create(['event_id' => $event->id, 'buyer_name' => 'Siti Rahayu']);

    $response = $this->actingAs($vendor)->get(route('orders.index', ['search' => 'Budi']));

    $response->assertOk()->assertInertia(
        fn ($page) => $page->has('orders.data', 1)->where('orders.data.0.buyer_name', 'Budi Santoso')
    );
});
