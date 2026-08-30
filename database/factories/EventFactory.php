<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(4);

        return [
            'user_id' => User::factory()->state(['role' => 'vendor', 'username' => fake()->unique()->userName()]),
            'title' => $title,
            'slug' => Str::slug($title).'-'.Str::random(6),
            'description' => fake()->paragraph(),
            'category' => fake()->randomElement(['Konferensi', 'Workshop', 'Webinar', 'Seminar']),
            'type' => fake()->randomElement(['online', 'offline', 'hybrid']),
            'status' => 'draft',
            'location' => fake()->address(),
            'maps_url' => null,
            'online_platform' => null,
            'online_url' => null,
            'banner' => null,
            'starts_at' => now()->addDays(7),
            'ends_at' => now()->addDays(7)->addHours(3),
            'max_attendees' => fake()->numberBetween(50, 500),
        ];
    }

    /**
     * Mark event as published.
     */
    public function published(): static
    {
        return $this->state(['status' => 'published']);
    }

    /**
     * Mark event as online.
     */
    public function online(): static
    {
        return $this->state([
            'type' => 'online',
            'online_platform' => 'Zoom',
            'online_url' => 'https://zoom.us/j/'.fake()->randomNumber(9),
        ]);
    }
}
