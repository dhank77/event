<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property string $slug
 * @property string|null $description
 * @property string|null $category
 * @property string $type online|offline|hybrid
 * @property string $status draft|published|cancelled
 * @property string|null $location
 * @property string|null $maps_url
 * @property string|null $online_platform
 * @property string|null $online_url
 * @property string|null $banner
 * @property Carbon|null $starts_at
 * @property Carbon|null $ends_at
 * @property int|null $max_attendees
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'user_id', 'title', 'slug', 'description', 'category', 'type', 'status',
    'location', 'maps_url', 'online_platform', 'online_url', 'banner',
    'starts_at', 'ends_at', 'max_attendees',
])]
class Event extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    /**
     * Auto-generate slug from title before saving.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $event): void {
            if (empty($event->slug)) {
                $event->slug = Str::slug($event->title).'-'.Str::random(6);
            }
        });
    }

    /** @return BelongsTo<User, $this> */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** @return HasMany<EventAgenda, $this> */
    public function agendas(): HasMany
    {
        return $this->hasMany(EventAgenda::class)->orderBy('order');
    }

    /** @return HasMany<EventSpeaker, $this> */
    public function speakers(): HasMany
    {
        return $this->hasMany(EventSpeaker::class)->orderBy('order');
    }

    /** @return HasMany<EventSponsor, $this> */
    public function sponsors(): HasMany
    {
        return $this->hasMany(EventSponsor::class)->orderBy('order');
    }

    /** @return HasMany<EventTicket, $this> */
    public function tickets(): HasMany
    {
        return $this->hasMany(EventTicket::class);
    }

    /** @return HasMany<EventCoupon, $this> */
    public function coupons(): HasMany
    {
        return $this->hasMany(EventCoupon::class);
    }
}
