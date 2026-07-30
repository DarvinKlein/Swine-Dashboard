<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Swine;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SwineController extends Controller
{
    public function index()
    {
        return Swine::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'swine_name' => ['required', 'string', 'max:255'],
            'breeding_date' => ['required', 'date'],
        ]);

        $breedingDate = Carbon::parse($validated['breeding_date']);

        $swine = Swine::create([
            'swine_name' => $validated['swine_name'],
            'breeding_date' => $breedingDate->toDateString(),
            'pregnant_date' => $breedingDate->copy()->addDays(20)->toDateString(),
            'iron_date' => $breedingDate->copy()->addDays(100)->toDateString(),
            'labor_date_start' => $breedingDate->copy()->addDays(114)->toDateString(),
            'labor_date_end' => $breedingDate->copy()->addDays(118)->toDateString(),
        ]);

        return response()->json($swine, 201);
    }
}
