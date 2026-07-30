<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FatteningBatch;
use Illuminate\Http\Request;

class FatteningFeedController extends Controller
{
    public function store(Request $request, FatteningBatch $batch)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
        ]);

        $batch->feeds()->create($validated);

        $batch->refresh()->load('feeds');

        return response()->json([
            'id' => $batch->id,
            'number_of_heads' => $batch->number_of_heads,
            'total_cost' => $batch->total_cost,
            'created_at' => $batch->created_at,
        ], 201);
    }
}
