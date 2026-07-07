<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FatteningBatch;
use App\Models\FatteningFeed;
use Illuminate\Http\Request;

class FatteningFeedController extends Controller
{
    public function store(Request $request, FatteningBatch $batch)
    {
        $validated = $request->validate([
            'feed_name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
        ]);

        $batch->feeds()->create($validated);

        return $this->batchResponse($batch);
    }

    public function update(Request $request, FatteningFeed $feed)
    {
        $validated = $request->validate([
            'feed_name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
        ]);

        $feed->update($validated);

        return $this->batchResponse($feed->batch);
    }

    private function batchResponse(FatteningBatch $batch)
    {
        $batch->refresh()->load('feeds');

        return response()->json([
            'id' => $batch->id,
            'number_of_heads' => $batch->number_of_heads,
            'total_cost' => $batch->total_cost,
            'feeds' => $batch->feeds->map(fn ($feed) => [
                'id' => $feed->id,
                'feed_name' => $feed->feed_name,
                'amount' => $feed->amount,
            ]),
            'created_at' => $batch->created_at,
        ], 201);
    }
}
