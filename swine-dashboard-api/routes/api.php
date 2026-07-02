<?php

use App\Http\Controllers\Api\FatteningBatchController;
use App\Http\Controllers\Api\FatteningFeedController;
use App\Http\Controllers\Api\SwineController;
use Illuminate\Support\Facades\Route;

Route::get('/swines', [SwineController::class, 'index']);
Route::post('/swines', [SwineController::class, 'store']);

Route::get('/fattening-batches', [FatteningBatchController::class, 'index']);
Route::post('/fattening-batches', [FatteningBatchController::class, 'store']);
Route::post('/fattening-batches/{batch}/feeds', [FatteningFeedController::class, 'store']);
