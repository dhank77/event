<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class VendorProfileController extends Controller
{
    /**
     * Display the vendor's public profile page.
     */
    public function show(User $user): Response
    {
        return Inertia::render('vendor/show', [
            'vendor' => [
                'name' => $user->name,
                'username' => $user->username,
                'role' => $user->role,
                'joined' => $user->created_at?->format('F Y'),
            ],
        ]);
    }
}
