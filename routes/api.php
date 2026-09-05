<?php

use App\Http\Controllers\CheckoutController;
use Illuminate\Support\Facades\Route;

Route::post('/midtrans/notification', [CheckoutController::class, 'notification']);
