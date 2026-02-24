<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ModuleController;
use Illuminate\Support\Facades\Route;

Route::group(['domain' => env('API_DOMAIN')], function () {

    // Autenticação — público
    Route::prefix('valsul/auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
    });

    // Rotas protegidas por Sanctum
    Route::middleware('auth:sanctum')->group(function () {

        // Auth — protegido
        Route::prefix('valsul/auth')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me',     [AuthController::class, 'me']);
        });

        // Módulos genéricos
        Route::prefix('valsul/{module}')->group(function () {
            Route::get('/',              [ModuleController::class, 'index']);
            Route::post('/',             [ModuleController::class, 'store']);
            Route::get('{id}',           [ModuleController::class, 'show']);
            Route::put('{id}',           [ModuleController::class, 'update']);
            Route::patch('{id}',         [ModuleController::class, 'update']);
            Route::delete('{id}',        [ModuleController::class, 'destroy']);
            Route::patch('{id}/restore', [ModuleController::class, 'restore']);
        });

    });

});
