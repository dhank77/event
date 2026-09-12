<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $amount
 * @property string $bank_name
 * @property string $account_number
 * @property string $account_holder_name
 * @property string $status pending|approved|rejected
 * @property string|null $notes
 * @property Carbon|null $approved_at
 * @property Carbon|null $rejected_at
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read User $user
 */
#[Fillable([
    'user_id',
    'amount',
    'bank_name',
    'account_number',
    'account_holder_name',
    'status',
    'notes',
    'approved_at',
    'rejected_at',
])]
class Withdrawal extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
