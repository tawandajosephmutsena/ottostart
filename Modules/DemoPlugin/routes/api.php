<?php

use Illuminate\Support\Facades\Route;
use Modules\DemoPlugin\Http\Controllers\DemoPluginController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('demoplugins', DemoPluginController::class)->names('demoplugin');
});
