<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $order_number
 * @property int $event_id
 * @property int|null $user_id
 * @property string $buyer_name
 * @property string $buyer_email
 * @property string $buyer_phone
 * @property int $total_price
 * @property string $status pending|paid|cancelled|expired
 * @property string|null $snap_token
 * @property string|null $snap_redirect_url
 * @property string|null $payment_type
 */
#[Fillable([
    'order_number', 'event_id', 'user_id', 'buyer_name', 'buyer_email',
    'buyer_phone', 'total_price', 'status', 'snap_token', 'snap_redirect_url', 'payment_type',
])]
class Order extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'total_price' => 'integer',
        ];
    }

    /** @return BelongsTo<Event, $this> */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<OrderItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
