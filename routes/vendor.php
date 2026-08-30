<?php

use App\Http\Controllers\Vendor\EventController;
use App\Http\Controllers\Vendor\EventCouponController;
use App\Http\Controllers\Vendor\EventTicketController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('vendor')->name('vendor.')->group(function () {
    Route::resource('events', EventController::class)->except(['show']);

    Route::resource('events.tickets', EventTicketController::class)
        ->except(['create', 'edit', 'show']);

    Route::resource('events.coupons', EventCouponController::class)
        ->except(['create', 'edit', 'show']);
});
