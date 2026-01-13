<?php

use Illuminate\Support\Facades\Route;
use Modules\DemoPlugin\Http\Controllers\DemoPluginController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('demoplugins', DemoPluginController::class)->names('demoplugin');
});
