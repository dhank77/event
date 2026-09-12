<?php

use App\Models\Event;
use App\Models\Order;
use App\Models\User;
use App\Models\Withdrawal;

test('guests are redirected to login when accessing withdrawals', function () {
    $this->get(route('vendor.withdrawals.index'))->assertRedirect(route('login'));
    $this->post(route('vendor.withdrawals.store'))->assertRedirect(route('login'));
});

test('user with regular role cannot access vendor withdrawals', function () {
    $user = User::factory()->create(['role' => 'user']);

    $this->actingAs($user)->get(route('vendor.withdrawals.index'))->assertForbidden();
    $this->actingAs($user)->post(route('vendor.withdrawals.store'), [])->assertForbidden();
});

test('vendor can view withdrawal page with correct balance calculation', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);
    $event = Event::factory()->create(['user_id' => $vendor->id]);

    // Create paid orders totaling Rp 1.000.000
    Order::factory()->create([
        'event_id' => $event->id,
        'status' => 'paid',
        'total_price' => 1000000,
    ]);

    // Gross = 1.000.000, Platform fee 3% = 30.000, Net = 970.000
    $response = $this->actingAs($vendor)->get(route('vendor.withdrawals.index'));

    $response->assertOk()->assertInertia(
        fn ($page) => $page
            ->component('vendor/withdrawals/index')
            ->where('summary.gross_revenue', 1000000)
            ->where('summary.platform_fee', 30000)
            ->where('summary.net_earnings', 970000)
            ->where('summary.available_balance', 970000)
            ->where('is_admin', false)
    );
});

test('vendor cannot withdraw amount below minimum of Rp 50.000', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);
    $event = Event::factory()->create(['user_id' => $vendor->id]);

    Order::factory()->create([
        'event_id' => $event->id,
        'status' => 'paid',
        'total_price' => 1000000,
    ]);

    $response = $this->actingAs($vendor)->post(route('vendor.withdrawals.store'), [
        'amount' => 30000,
        'bank_name' => 'BCA (Bank Central Asia)',
        'account_number' => '1234567890',
        'account_holder_name' => 'Budi Santoso',
    ]);

    $response->assertSessionHasErrors('amount');
    expect(Withdrawal::count())->toBe(0);
});

test('vendor cannot withdraw amount exceeding available balance', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);
    $event = Event::factory()->create(['user_id' => $vendor->id]);

    Order::factory()->create([
        'event_id' => $event->id,
        'status' => 'paid',
        'total_price' => 100000, // Net: 97.000
    ]);

    $response = $this->actingAs($vendor)->post(route('vendor.withdrawals.store'), [
        'amount' => 150000,
        'bank_name' => 'BCA (Bank Central Asia)',
        'account_number' => '1234567890',
        'account_holder_name' => 'Budi Santoso',
    ]);

    $response->assertSessionHasErrors('amount');
    expect(Withdrawal::count())->toBe(0);
});

test('vendor can successfully submit withdrawal request', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);
    $event = Event::factory()->create(['user_id' => $vendor->id]);

    Order::factory()->create([
        'event_id' => $event->id,
        'status' => 'paid',
        'total_price' => 1000000, // Net: 970.000
    ]);

    $response = $this->actingAs($vendor)->post(route('vendor.withdrawals.store'), [
        'amount' => 500000,
        'bank_name' => 'Bank Mandiri',
        'account_number' => '9876543210',
        'account_holder_name' => 'Ahmad Fauzi',
        'notes' => 'Tolong proses cepat ya min',
    ]);

    $response->assertRedirect()->assertSessionHas('success');

    $withdrawal = Withdrawal::first();
    expect($withdrawal)->not->toBeNull()
        ->and($withdrawal->user_id)->toBe($vendor->id)
        ->and($withdrawal->amount)->toBe(500000)
        ->and($withdrawal->bank_name)->toBe('Bank Mandiri')
        ->and($withdrawal->account_number)->toBe('9876543210')
        ->and($withdrawal->account_holder_name)->toBe('Ahmad Fauzi')
        ->and($withdrawal->status)->toBe('pending');

    // Subsequent balance should reflect pending withdrawal: 970.000 - 500.000 = 470.000
    $pageResponse = $this->actingAs($vendor)->get(route('vendor.withdrawals.index'));
    $pageResponse->assertInertia(
        fn ($page) => $page
            ->where('summary.total_pending', 500000)
            ->where('summary.available_balance', 470000)
    );
});

test('admin can approve vendor withdrawal request', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $vendor = User::factory()->create(['role' => 'vendor']);

    $withdrawal = Withdrawal::create([
        'user_id' => $vendor->id,
        'amount' => 250000,
        'bank_name' => 'BCA',
        'account_number' => '12345678',
        'account_holder_name' => 'Vendor Test',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)->patch(route('vendor.withdrawals.update', $withdrawal), [
        'status' => 'approved',
        'notes' => 'No. Ref: TRF-9921',
    ]);

    $response->assertRedirect()->assertSessionHas('success');

    $withdrawal->refresh();
    expect($withdrawal->status)->toBe('approved')
        ->and($withdrawal->notes)->toBe('No. Ref: TRF-9921')
        ->and($withdrawal->approved_at)->not->toBeNull();
});

test('admin can reject vendor withdrawal request', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $vendor = User::factory()->create(['role' => 'vendor']);

    $withdrawal = Withdrawal::create([
        'user_id' => $vendor->id,
        'amount' => 250000,
        'bank_name' => 'BCA',
        'account_number' => '12345678',
        'account_holder_name' => 'Vendor Test',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)->patch(route('vendor.withdrawals.update', $withdrawal), [
        'status' => 'rejected',
        'notes' => 'Nomor rekening tidak cocok dengan nama pemilik',
    ]);

    $response->assertRedirect()->assertSessionHas('success');

    $withdrawal->refresh();
    expect($withdrawal->status)->toBe('rejected')
        ->and($withdrawal->notes)->toBe('Nomor rekening tidak cocok dengan nama pemilik')
        ->and($withdrawal->rejected_at)->not->toBeNull();
});
