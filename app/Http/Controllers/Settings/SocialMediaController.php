<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SocialMediaController extends Controller
{
    /**
     * Display the social media settings form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/social-media', [
            'social_media' => $request->user()->social_media ?? [],
        ]);
    }

    /**
     * Update the user's social media settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'instagram' => ['nullable', 'url', 'max:255'],
            'twitter' => ['nullable', 'url', 'max:255'],
            'facebook' => ['nullable', 'url', 'max:255'],
            'linkedin' => ['nullable', 'url', 'max:255'],
            'youtube' => ['nullable', 'url', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
        ]);

        $request->user()->update([
            'social_media' => array_filter($validated, fn ($value) => ! is_null($value)),
        ]);

        return back();
    }
}
