<?php
/**
 * DIAGNOSTIC SCRIPT - Delete this file after debugging!
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>OttoStart Diagnostic</h1>";
echo "<hr>";

// 1. PHP Version
echo "<h2>1. PHP Version</h2>";
echo "PHP: " . PHP_VERSION . "<br>";
echo "Required: 8.2+<br>";
echo (version_compare(PHP_VERSION, '8.2.0', '>=')) ? "✅ OK" : "❌ FAIL";

// 2. Required Extensions
echo "<h2>2. Required Extensions</h2>";
$extensions = ['pdo', 'pdo_sqlite', 'mbstring', 'openssl', 'tokenizer', 'xml', 'ctype', 'json'];
foreach ($extensions as $ext) {
    $status = extension_loaded($ext) ? "✅" : "❌";
    echo "$status $ext<br>";
}

// 3. File Paths
echo "<h2>3. File Paths</h2>";
$files = [
    'vendor/autoload.php',
    'bootstrap/app.php',
    'database/database.sqlite',
    '.env',
    'index.php',
    '.htaccess',
];
foreach ($files as $file) {
    $path = __DIR__ . '/' . $file;
    $exists = file_exists($path) ? "✅ exists" : "❌ MISSING";
    echo "$exists: $file<br>";
}

// 4. Folder Permissions
echo "<h2>4. Folder Permissions</h2>";
$folders = ['storage', 'bootstrap/cache', 'database'];
foreach ($folders as $folder) {
    $path = __DIR__ . '/' . $folder;
    if (is_dir($path)) {
        $writable = is_writable($path) ? "✅ writable" : "❌ NOT WRITABLE";
        echo "$writable: $folder<br>";
    } else {
        echo "❌ MISSING: $folder<br>";
    }
}

// 5. SQLite Database
echo "<h2>5. SQLite Database</h2>";
$dbPath = __DIR__ . '/database/database.sqlite';
if (file_exists($dbPath)) {
    echo "✅ File exists<br>";
    echo "Size: " . round(filesize($dbPath) / 1024 / 1024, 2) . " MB<br>";
    $writable = is_writable($dbPath) ? "✅ writable" : "❌ NOT WRITABLE";
    echo "$writable<br>";
    
    // Try to open it
    try {
        $pdo = new PDO('sqlite:' . $dbPath);
        echo "✅ Can connect to SQLite<br>";
    } catch (Exception $e) {
        echo "❌ SQLite Error: " . $e->getMessage() . "<br>";
    }
} else {
    echo "❌ database.sqlite MISSING<br>";
}

// 6. .env Contents
echo "<h2>6. .env File (first 10 lines)</h2>";
$envPath = __DIR__ . '/.env';
if (file_exists($envPath)) {
    $lines = file($envPath);
    echo "<pre>";
    for ($i = 0; $i < min(10, count($lines)); $i++) {
        // Hide sensitive values
        $line = $lines[$i];
        if (strpos($line, 'KEY=') !== false || strpos($line, 'PASSWORD') !== false) {
            echo preg_replace('/=.+/', '=***HIDDEN***', $line);
        } else {
            echo htmlspecialchars($line);
        }
    }
    echo "</pre>";
} else {
    echo "❌ .env file MISSING<br>";
}

// 7. Try to load Laravel
echo "<h2>7. Laravel Bootstrap Test</h2>";
try {
    require __DIR__.'/vendor/autoload.php';
    echo "✅ Autoload OK<br>";
    
    $app = require_once __DIR__.'/bootstrap/app.php';
    echo "✅ App Bootstrap OK<br>";
    
    $app->usePublicPath(__DIR__.'/public');
    echo "✅ Public Path Set<br>";
    
} catch (Throwable $e) {
    echo "❌ ERROR: " . $e->getMessage() . "<br>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}

echo "<hr>";
echo "<p><strong>Delete this file after debugging!</strong></p>";
