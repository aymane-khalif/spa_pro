<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Models\Service;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\MessageController;
Route::get('/services', fn () => Service::all());
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/inscription', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/contact', [MessageController::class, 'store'])->middleware('throttle:5,1');
Route::get('/availability', [AppointmentController::class, 'availableSlots'])->middleware('throttle:120,1');
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => response()->json($request->user()));
    Route::put('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/appointments', [AppointmentController::class, 'store'])->middleware('throttle:10,1');
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::apiResource('clients', ClientController::class);
        Route::get('/appointments', [AppointmentController::class, 'index']);
        Route::post('/appointments', [AppointmentController::class, 'adminStore']);
        Route::get('/appointments/{appointment}', [AppointmentController::class, 'show']);
        Route::put('/appointments/{appointment}', [AppointmentController::class, 'update']);
        Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'status']);
        Route::delete('/appointments/{appointment}', [AppointmentController::class, 'destroy']);
        Route::get('/messages', [MessageController::class, 'index']);
    });
});
