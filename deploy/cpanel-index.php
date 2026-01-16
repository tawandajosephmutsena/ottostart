<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

/**
 * OttoStart - cPanel Production Entry Point
 * 
 * This file allows Laravel to run when the app is in a separate folder
 * from public_html.
 * 
 * Structure:
 * - Laravel App: /home/ottomate/ottomate/
 * - Public:      /home/ottomate/public_html/
 */

define('LARAVEL_START', microtime(true));

// Path to your Laravel application (one level up, then into ottomate folder)
$laravelPath = dirname(__DIR__) . '/ottomate';

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $laravelPath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $laravelPath . '/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once $laravelPath . '/bootstrap/app.php';

// Set the public path to THIS directory (public_html)
$app->usePublicPath(__DIR__);

// Handle the request
$app->handleRequest(Request::capture());
