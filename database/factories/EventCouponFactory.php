<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventCoupon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EventCoupon>
 */
class EventCouponFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'code' => strtoupper(fake()->unique()->bothify('????##')),
            'type' => 'percentage',
            'value' => fake()->numberBetween(5, 50),
            'max_uses' => null,
            'used_count' => 0,
            'min_purchase' => 0,
            'valid_from' => null,
            'valid_until' => null,
            'is_active' => true,
        ];
    }
}
