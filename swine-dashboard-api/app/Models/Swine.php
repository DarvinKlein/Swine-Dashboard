<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Swine extends Model
{
    use HasFactory;

    protected $fillable = [
        'swine_name',
        'breeding_date',
        'pregnant_date',
        'iron_date',
        'labor_date_start',
        'labor_date_end',
    ];

    protected $casts = [
        'breeding_date' => 'date',
        'pregnant_date' => 'date',
        'iron_date' => 'date',
        'labor_date_start' => 'date',
        'labor_date_end' => 'date',
    ];
}
