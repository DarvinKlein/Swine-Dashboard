<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FatteningBatch;
use Illuminate\Http\Request;

class FatteningBatchController extends Controller
{
    public function index()
    {
        return FatteningBatch::with('feeds')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (FatteningBatch $batch) {
                return [
                    'id' => $batch->id,
                    'number_of_heads' => $batch->number_of_heads,
                    'total_cost' => $batch->total_cost,
                    'feeds' => $batch->feeds->map(fn ($feed) => [
                        'id' => $feed->id,
                        'feed_name' => $feed->feed_name,
                        'amount' => $feed->amount,
                    ]),
                    'created_at' => $batch->created_at,
                ];
            });
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'number_of_heads' => ['required', 'integer', 'min:1'],
        ]);

        $batch = FatteningBatch::create($validated);

        return response()->json([
            'id' => $batch->id,
            'number_of_heads' => $batch->number_of_heads,
            'total_cost' => 0,
            'feeds' => [],
            'created_at' => $batch->created_at,
        ], 201);
    }
}
