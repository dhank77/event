<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $event_id
 * @property string $name
 * @property string|null $logo
 * @property string|null $website
 * @property string $tier gold|silver|bronze|media
 * @property int $order
 */
#[Fillable(['event_id', 'name', 'logo', 'website', 'tier', 'order'])]
class EventSponsor extends Model
{
    use HasFactory;

    /** @return BelongsTo<Event, $this> */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
