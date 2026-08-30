<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $event_id
 * @property string|null $time
 * @property string $title
 * @property string|null $description
 * @property string|null $speaker
 * @property int $order
 */
#[Fillable(['event_id', 'time', 'title', 'description', 'speaker', 'order'])]
class EventAgenda extends Model
{
    use HasFactory;

    /** @return BelongsTo<Event, $this> */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
