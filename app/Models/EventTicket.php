<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $event_id
 * @property string $name
 * @property string $type free|paid
 * @property string $tier regular|early_bird|vip|group
 * @property int $price
 * @property int|null $quota
 * @property int $max_per_order
 * @property Carbon|null $sales_start
 * @property Carbon|null $sales_end
 * @property string|null $description
 * @property bool $is_active
 */
#[Fillable([
    'event_id', 'name', 'type', 'tier', 'price', 'quota',
    'max_per_order', 'sales_start', 'sales_end', 'description', 'is_active',
])]
class EventTicket extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'quota' => 'integer',
            'max_per_order' => 'integer',
            'sales_start' => 'datetime',
            'sales_end' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /** @return BelongsTo<Event, $this> */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
