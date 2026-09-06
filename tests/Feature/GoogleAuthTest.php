<?php

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

test('google redirect route redirects to google oauth', function () {
    $response = $this->get(route('auth.google'));

    $response->assertRedirect();
    expect($response->headers->get('Location'))->toContain('accounts.google.com');
});

test('google callback creates a new user and logs them in', function () {
    $socialiteUser = mock(SocialiteUser::class);
    $socialiteUser->allows('getId')->andReturn('google-id-123');
    $socialiteUser->allows('getName')->andReturn('Budi Santoso');
    $socialiteUser->allows('getEmail')->andReturn('budi@gmail.com');
    $socialiteUser->allows('getAvatar')->andReturn('https://lh3.googleusercontent.com/photo.jpg');
    $socialiteUser->allows('getNickname')->andReturn(null);

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    $response = $this->get(route('auth.google.callback'));

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard'));

    $this->assertDatabaseHas('users', [
        'email' => 'budi@gmail.com',
        'google_id' => 'google-id-123',
    ]);
});

test('google callback logs in existing google user without creating a duplicate', function () {
    $existingUser = User::factory()->create([
        'google_id' => 'google-id-456',
        'email' => 'existing@gmail.com',
        'password' => null,
    ]);

    $socialiteUser = mock(SocialiteUser::class);
    $socialiteUser->allows('getId')->andReturn('google-id-456');
    $socialiteUser->allows('getName')->andReturn($existingUser->name);
    $socialiteUser->allows('getEmail')->andReturn($existingUser->email);
    $socialiteUser->allows('getAvatar')->andReturn(null);
    $socialiteUser->allows('getNickname')->andReturn(null);

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    $response = $this->get(route('auth.google.callback'));

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard'));
    expect(User::where('google_id', 'google-id-456')->count())->toBe(1);
});
