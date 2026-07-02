<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FatteningBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'number_of_heads',
    ];

    public function feeds(): HasMany
    {
        return $this->hasMany(FatteningFeed::class);
    }

    public function getTotalCostAttribute(): float
    {
        if ($this->relationLoaded('feeds')) {
            return (float) $this->feeds->sum('amount');
        }

        return (float) $this->feeds()->sum('amount');
    }
}
