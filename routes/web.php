<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\VendorProfileController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/vendor.php';

use App\Http\Controllers\PublicEventController;

// Vendor profile and public event page — must be last to avoid catching other routes
Route::get('{user:username}/events/{event:slug}', [PublicEventController::class, 'show'])->name('events.show');
Route::get('{user:username}', [VendorProfileController::class, 'show'])->name('vendor.show');
