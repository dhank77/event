<?php

use App\Http\Controllers\Vendor\EventController;
use App\Http\Controllers\Vendor\EventCouponController;
use App\Http\Controllers\Vendor\EventTicketController;
use App\Http\Controllers\Vendor\WithdrawalController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('vendor')->name('vendor.')->group(function () {
    Route::resource('events', EventController::class)->except(['show']);

    Route::resource('events.tickets', EventTicketController::class)
        ->except(['create', 'edit', 'show']);

    Route::resource('events.coupons', EventCouponController::class)
        ->except(['create', 'edit', 'show']);

    Route::get('withdrawals', [WithdrawalController::class, 'index'])->name('withdrawals.index');
    Route::post('withdrawals', [WithdrawalController::class, 'store'])->name('withdrawals.store');
    Route::patch('withdrawals/{withdrawal}', [WithdrawalController::class, 'update'])->name('withdrawals.update');
});
