<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LabController;
use App\Http\Controllers\Api\TestRequestController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/labs', [LabController::class, 'index']);
Route::get('/labs/{id}', [LabController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/requests', [TestRequestController::class, 'index']);
    Route::post('/requests', [TestRequestController::class, 'store']);
    Route::get('/requests/{id}', [TestRequestController::class, 'show']);
    Route::put('/requests/{id}/status', [TestRequestController::class, 'updateStatus']);
});
