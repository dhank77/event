<?php

namespace Database\Factories;

use App\Models\EventTicket;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'event_ticket_id' => EventTicket::factory(),
            'ticket_name' => fake()->words(3, true),
            'ticket_tier' => fake()->randomElement(['regular', 'early_bird', 'vip', 'group']),
            'price' => fake()->numberBetween(0, 500000),
            'quantity' => fake()->numberBetween(1, 5),
        ];
    }
}
