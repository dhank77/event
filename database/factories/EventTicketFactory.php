<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventTicket;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EventTicket>
 */
class EventTicketFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'name' => fake()->words(3, true),
            'type' => 'free',
            'tier' => 'regular',
            'price' => 0,
            'quota' => 100,
            'max_per_order' => 1,
            'sales_start' => null,
            'sales_end' => null,
            'description' => null,
            'is_active' => true,
        ];
    }
}
