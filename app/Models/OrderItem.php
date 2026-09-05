<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $order_id
 * @property int $event_ticket_id
 * @property string $ticket_name
 * @property string $ticket_tier
 * @property int $price
 * @property int $quantity
 */
#[Fillable([
    'order_id', 'event_ticket_id', 'ticket_name', 'ticket_tier', 'price', 'quantity',
])]
class OrderItem extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'quantity' => 'integer',
        ];
    }

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** @return BelongsTo<EventTicket, $this> */
    public function ticket(): BelongsTo
    {
        return $this->belongsTo(EventTicket::class, 'event_ticket_id');
    }
}
