<?php
/**
 * OttoStart Deployment Debugger
 * Upload to public_html and visit it to diagnose 500 errors
 * DELETE THIS FILE AFTER DEBUGGING!
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<pre style='font-family: monospace; background: #1a1a2e; color: #eee; padding: 20px; margin: 0; min-height: 100vh;'>";
echo "===========================================\n";
echo "   OttoStart Deployment Debugger\n";
echo "===========================================\n\n";

// 1. PHP Version
echo "<span style='color: #4ade80;'>[1] PHP Version</span>\n";
echo "    Version: " . PHP_VERSION . "\n";
$minVersion = '8.2.0';
if (version_compare(PHP_VERSION, $minVersion, '>=')) {
    echo "    Status: ✅ OK (>= $minVersion required)\n";
} else {
    echo "    Status: ❌ FAIL (>= $minVersion required)\n";
}
echo "\n";

// 2. Required Extensions
echo "<span style='color: #4ade80;'>[2] PHP Extensions</span>\n";
$required = ['ctype', 'curl', 'dom', 'fileinfo', 'filter', 'hash', 'mbstring', 'openssl', 'pcre', 'pdo', 'pdo_sqlite', 'session', 'tokenizer', 'xml'];
$missing = [];
foreach ($required as $ext) {
    if (extension_loaded($ext)) {
        echo "    $ext: ✅\n";
    } else {
        echo "    $ext: ❌ MISSING\n";
        $missing[] = $ext;
    }
}
if (empty($missing)) {
    echo "    Status: ✅ All required extensions loaded\n";
} else {
    echo "    Status: ❌ MISSING: " . implode(', ', $missing) . "\n";
}
echo "\n";

// 3. Important Paths
echo "<span style='color: #4ade80;'>[3] Important Paths</span>\n";
echo "    Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "    Script Path: " . __FILE__ . "\n";
echo "    Current Dir: " . getcwd() . "\n";
echo "\n";

// 4. Laravel Files Check
echo "<span style='color: #4ade80;'>[4] Laravel Files Check</span>\n";

// Determine base path (try multiple locations)
$basePaths = [
    dirname(__DIR__),           // One level up from public_html
    __DIR__,                    // Same directory (if app is in public_html)
    dirname(__DIR__) . '/ottostart',  // Separate folder
];

$laravelBase = null;
foreach ($basePaths as $path) {
    if (file_exists($path . '/artisan') && file_exists($path . '/bootstrap/app.php')) {
        $laravelBase = $path;
        break;
    }
}

if ($laravelBase) {
    echo "    Laravel Base: ✅ Found at $laravelBase\n";
} else {
    echo "    Laravel Base: ❌ NOT FOUND\n";
    echo "    Searched in:\n";
    foreach ($basePaths as $path) {
        echo "      - $path\n";
    }
    echo "\n    Check if you extracted the files in the correct location.\n";
}

if ($laravelBase) {
    $checks = [
        'artisan' => $laravelBase . '/artisan',
        'bootstrap/app.php' => $laravelBase . '/bootstrap/app.php',
        'vendor/autoload.php' => $laravelBase . '/vendor/autoload.php',
        '.env' => $laravelBase . '/.env',
        'storage/logs' => $laravelBase . '/storage/logs',
        'bootstrap/cache' => $laravelBase . '/bootstrap/cache',
        'database/database.sqlite' => $laravelBase . '/database/database.sqlite',
        'public/build/manifest.json' => (is_dir($laravelBase . '/public') ? $laravelBase . '/public' : __DIR__) . '/build/manifest.json',
    ];

    foreach ($checks as $name => $path) {
        if (file_exists($path)) {
            if (is_writable($path)) {
                echo "    $name: ✅ (writable)\n";
            } else {
                echo "    $name: ⚠️ EXISTS but NOT writable\n";
            }
        } else {
            echo "    $name: ❌ NOT FOUND\n";
        }
    }
}
echo "\n";

// 5. .env File Contents (sanitized)
echo "<span style='color: #4ade80;'>[5] Environment Configuration</span>\n";
if ($laravelBase && file_exists($laravelBase . '/.env')) {
    $env = file_get_contents($laravelBase . '/.env');
    $lines = explode("\n", $env);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        
        // Show key=value but mask sensitive values
        if (preg_match('/^([A-Z_]+)=(.*)$/', $line, $matches)) {
            $key = $matches[1];
            $value = $matches[2];
            
            // Mask sensitive values
            if (in_array($key, ['APP_KEY', 'DB_PASSWORD', 'MAIL_PASSWORD', 'REDIS_PASSWORD'])) {
                $value = '***HIDDEN***';
            }
            
            echo "    $key=$value\n";
        }
    }
} else {
    echo "    ❌ .env FILE NOT FOUND!\n";
    echo "    Make sure you renamed .env.production to .env\n";
}
echo "\n";

// 6. Database Check
echo "<span style='color: #4ade80;'>[6] Database Check</span>\n";
if ($laravelBase) {
    // Get DB path from .env
    $dbPath = null;
    if (file_exists($laravelBase . '/.env')) {
        $env = file_get_contents($laravelBase . '/.env');
        if (preg_match('/DB_DATABASE=(.+)/', $env, $matches)) {
            $dbPath = trim($matches[1]);
        }
    }
    
    if ($dbPath) {
        echo "    Configured Path: $dbPath\n";
        if (file_exists($dbPath)) {
            echo "    Status: ✅ Database file exists\n";
            echo "    Size: " . round(filesize($dbPath) / 1024 / 1024, 2) . " MB\n";
            if (is_readable($dbPath)) {
                echo "    Readable: ✅ Yes\n";
            } else {
                echo "    Readable: ❌ No - Check permissions!\n";
            }
            if (is_writable($dbPath)) {
                echo "    Writable: ✅ Yes\n";
            } else {
                echo "    Writable: ❌ No - Run: chmod 644 $dbPath\n";
            }
        } else {
            echo "    Status: ❌ Database file NOT FOUND at configured path!\n";
            echo "    \n";
            echo "    Try these paths instead:\n";
            $altPaths = [
                $laravelBase . '/database/database.sqlite',
                __DIR__ . '/database/database.sqlite',
                dirname(__DIR__) . '/database/database.sqlite',
            ];
            foreach ($altPaths as $alt) {
                if (file_exists($alt)) {
                    echo "    FOUND: $alt\n";
                    echo "    Update your .env: DB_DATABASE=$alt\n";
                }
            }
        }
    } else {
        echo "    ❌ DB_DATABASE not set in .env\n";
    }
}
echo "\n";

// 7. Storage Permissions
echo "<span style='color: #4ade80;'>[7] Storage Permissions</span>\n";
if ($laravelBase) {
    $storageDirs = [
        'storage' => $laravelBase . '/storage',
        'storage/logs' => $laravelBase . '/storage/logs',
        'storage/framework' => $laravelBase . '/storage/framework',
        'storage/framework/cache' => $laravelBase . '/storage/framework/cache',
        'storage/framework/sessions' => $laravelBase . '/storage/framework/sessions',
        'storage/framework/views' => $laravelBase . '/storage/framework/views',
        'bootstrap/cache' => $laravelBase . '/bootstrap/cache',
    ];
    
    foreach ($storageDirs as $name => $path) {
        if (is_dir($path)) {
            if (is_writable($path)) {
                echo "    $name: ✅ writable\n";
            } else {
                echo "    $name: ❌ NOT writable - Run: chmod -R 755 $path\n";
            }
        } else {
            echo "    $name: ❌ Directory missing - Run: mkdir -p $path\n";
        }
    }
}
echo "\n";

// 8. Try to boot Laravel
echo "<span style='color: #4ade80;'>[8] Laravel Boot Test</span>\n";
if ($laravelBase && file_exists($laravelBase . '/vendor/autoload.php')) {
    try {
        // Change to Laravel directory
        chdir($laravelBase);
        
        // Try to load autoloader
        require $laravelBase . '/vendor/autoload.php';
        echo "    Autoloader: ✅ Loaded\n";
        
        // Try to boot the app
        $app = require_once $laravelBase . '/bootstrap/app.php';
        echo "    Bootstrap: ✅ Loaded\n";
        
        // Try to get the kernel
        $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
        echo "    Kernel: ✅ Created\n";
        
        echo "\n    🎉 Laravel boots successfully!\n";
        echo "    The 500 error might be in a specific route.\n";
        
    } catch (Throwable $e) {
        echo "    ❌ BOOT FAILED!\n\n";
        echo "    <span style='color: #f87171;'>Error: " . get_class($e) . "</span>\n";
        echo "    <span style='color: #f87171;'>Message: " . $e->getMessage() . "</span>\n";
        echo "    <span style='color: #fbbf24;'>File: " . $e->getFile() . "</span>\n";
        echo "    <span style='color: #fbbf24;'>Line: " . $e->getLine() . "</span>\n";
        echo "\n    Stack Trace:\n";
        echo "    " . str_replace("\n", "\n    ", $e->getTraceAsString()) . "\n";
    }
} else {
    echo "    ❌ Cannot test - vendor/autoload.php not found\n";
}
echo "\n";

// 9. Error Log
echo "<span style='color: #4ade80;'>[9] Recent Error Log</span>\n";
if ($laravelBase && file_exists($laravelBase . '/storage/logs/laravel.log')) {
    $log = file_get_contents($laravelBase . '/storage/logs/laravel.log');
    $lines = explode("\n", $log);
    $lastLines = array_slice($lines, -30);
    echo "    (Last 30 lines of laravel.log)\n\n";
    foreach ($lastLines as $line) {
        echo "    " . htmlspecialchars(substr($line, 0, 200)) . "\n";
    }
} else {
    echo "    ❌ No laravel.log found\n";
    echo "    Check if storage/logs directory exists and is writable\n";
}
echo "\n";

echo "===========================================\n";
echo "   DELETE THIS FILE AFTER DEBUGGING!\n";
echo "===========================================\n";
echo "</pre>";
