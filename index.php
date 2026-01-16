<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

/**
 * OttoStart - Production Root Bridge
 * This file allows Laravel to run from the root directory when /public cannot be set as document root.
 */

define('LARAVEL_START', microtime(true));

// 1. Load the Composer autoloader
require __DIR__.'/vendor/autoload.php';

// 2. Bootstrap Laravel
/** @var Application $app */
$app = require_once __DIR__.'/bootstrap/app.php';

// 3. Set the public path to /public
$app->usePublicPath(__DIR__.'/public');

// 4. Handle the request
$app->handleRequest(Request::capture());
