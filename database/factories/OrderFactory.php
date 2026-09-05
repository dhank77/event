<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_number' => 'ORD-'.strtoupper(Str::random(12)),
            'event_id' => Event::factory(),
            'user_id' => null,
            'buyer_name' => fake()->name(),
            'buyer_email' => fake()->safeEmail(),
            'buyer_phone' => '08'.fake()->numerify('##########'),
            'total_price' => fake()->numberBetween(0, 500000),
            'status' => 'pending',
            'snap_token' => null,
            'snap_redirect_url' => null,
            'payment_type' => null,
        ];
    }

    public function paid(): static
    {
        return $this->state(['status' => 'paid']);
    }

    public function free(): static
    {
        return $this->state(['total_price' => 0, 'status' => 'paid']);
    }
}
