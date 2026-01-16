<?php
/**
 * OttoStart cPanel Deployment Helper
 * 
 * This script helps run Laravel artisan commands on cPanel shared hosting
 * where SSH access may be limited or unavailable.
 * 
 * SECURITY WARNING: Delete this file immediately after use!
 * 
 * Usage:
 * 1. Upload to public_html/cpanel-helper.php
 * 2. Visit: https://your-domain.com/cpanel-helper.php?key=YOUR_SECRET_KEY
 * 3. Run the commands you need
 * 4. DELETE THIS FILE when done!
 */

// ============================================
// SECURITY CONFIGURATION
// ============================================
// CHANGE THIS KEY! Use a random string.
$secretKey = 'ottostart-deploy-2026-change-me-immediately';

// Verify access key
if (!isset($_GET['key']) || $_GET['key'] !== $secretKey) {
    http_response_code(403);
    die('Access Denied. Invalid or missing key.');
}

// Timeout for long operations
set_time_limit(300);
ini_set('memory_limit', '256M');

// ============================================
// HELPER FUNCTIONS
// ============================================

function runCommand($command): array {
    $output = [];
    $returnCode = 0;
    
    $fullCommand = 'cd ' . dirname(__DIR__) . ' && php artisan ' . $command . ' 2>&1';
    exec($fullCommand, $output, $returnCode);
    
    return [
        'command' => 'php artisan ' . $command,
        'success' => $returnCode === 0,
        'output' => implode("\n", $output),
    ];
}

function showResult(array $result): void {
    $status = $result['success'] ? '✅' : '❌';
    echo "<div class='result " . ($result['success'] ? 'success' : 'error') . "'>";
    echo "<h4>{$status} {$result['command']}</h4>";
    echo "<pre>" . htmlspecialchars($result['output']) . "</pre>";
    echo "</div>";
}

// ============================================
// PROCESS ACTIONS
// ============================================

$results = [];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'storage_link':
        $results[] = runCommand('storage:link');
        break;
        
    case 'cache_clear':
        $results[] = runCommand('cache:clear');
        $results[] = runCommand('config:clear');
        $results[] = runCommand('route:clear');
        $results[] = runCommand('view:clear');
        break;
        
    case 'cache_build':
        $results[] = runCommand('config:cache');
        $results[] = runCommand('route:cache');
        $results[] = runCommand('view:cache');
        break;
        
    case 'migrate':
        $results[] = runCommand('migrate --force');
        break;
        
    case 'migrate_fresh':
        $results[] = runCommand('migrate:fresh --force --seed');
        break;
        
    case 'optimize':
        $results[] = runCommand('optimize:clear');
        $results[] = runCommand('optimize');
        break;
        
    case 'status':
        $results[] = runCommand('--version');
        $results[] = runCommand('env');
        break;
        
    case 'full_deploy':
        $results[] = runCommand('cache:clear');
        $results[] = runCommand('config:clear');
        $results[] = runCommand('route:clear');
        $results[] = runCommand('view:clear');
        $results[] = runCommand('storage:link');
        $results[] = runCommand('migrate --force');
        $results[] = runCommand('config:cache');
        $results[] = runCommand('route:cache');
        $results[] = runCommand('view:cache');
        break;
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OttoStart cPanel Deployment Helper</title>
    <style>
        :root {
            --bg: #0f172a;
            --surface: #1e293b;
            --text: #f8fafc;
            --text-muted: #94a3b8;
            --primary: #3b82f6;
            --success: #22c55e;
            --error: #ef4444;
            --warning: #f59e0b;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            padding: 2rem;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        h1 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: var(--primary);
        }
        
        .warning {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid var(--error);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 2rem;
        }
        
        .warning h3 {
            color: var(--error);
            margin-bottom: 0.5rem;
        }
        
        .actions {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .action-btn {
            display: block;
            background: var(--surface);
            border: 1px solid var(--primary);
            border-radius: 8px;
            padding: 1rem;
            color: var(--text);
            text-decoration: none;
            text-align: center;
            transition: all 0.2s;
        }
        
        .action-btn:hover {
            background: var(--primary);
            transform: translateY(-2px);
        }
        
        .action-btn.danger {
            border-color: var(--error);
        }
        
        .action-btn.danger:hover {
            background: var(--error);
        }
        
        .action-btn h4 {
            font-size: 1rem;
            margin-bottom: 0.25rem;
        }
        
        .action-btn p {
            font-size: 0.75rem;
            color: var(--text-muted);
        }
        
        .result {
            background: var(--surface);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            border-left: 4px solid var(--success);
        }
        
        .result.error {
            border-left-color: var(--error);
        }
        
        .result h4 {
            margin-bottom: 0.5rem;
        }
        
        .result pre {
            background: rgba(0,0,0,0.3);
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
            font-size: 0.875rem;
            color: var(--text-muted);
        }
        
        .info {
            background: var(--surface);
            border-radius: 8px;
            padding: 1rem;
            margin-top: 2rem;
        }
        
        .info h3 {
            color: var(--warning);
            margin-bottom: 0.5rem;
        }
        
        code {
            background: rgba(0,0,0,0.3);
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 OttoStart Deployment Helper</h1>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">cPanel Artisan Command Runner</p>
        
        <div class="warning">
            <h3>⚠️ Security Warning</h3>
            <p>This file provides direct access to Laravel artisan commands. <strong>Delete this file immediately after completing deployment!</strong></p>
        </div>
        
        <?php if (!empty($results)): ?>
            <h2 style="margin-bottom: 1rem;">Command Results</h2>
            <?php foreach ($results as $result): ?>
                <?php showResult($result); ?>
            <?php endforeach; ?>
            <hr style="border-color: var(--surface); margin: 2rem 0;">
        <?php endif; ?>
        
        <h2 style="margin-bottom: 1rem;">Available Actions</h2>
        
        <div class="actions">
            <a href="?key=<?= htmlspecialchars($secretKey) ?>&action=status" class="action-btn">
                <h4>📊 Check Status</h4>
                <p>Laravel version & env</p>
            </a>
            
            <a href="?key=<?= htmlspecialchars($secretKey) ?>&action=storage_link" class="action-btn">
                <h4>🔗 Storage Link</h4>
                <p>Create storage symlink</p>
            </a>
            
            <a href="?key=<?= htmlspecialchars($secretKey) ?>&action=cache_clear" class="action-btn">
                <h4>🧹 Clear Caches</h4>
                <p>Clear all Laravel caches</p>
            </a>
            
            <a href="?key=<?= htmlspecialchars($secretKey) ?>&action=cache_build" class="action-btn">
                <h4>⚡ Build Caches</h4>
                <p>Cache config, routes, views</p>
            </a>
            
            <a href="?key=<?= htmlspecialchars($secretKey) ?>&action=migrate" class="action-btn">
                <h4>🗄️ Run Migrations</h4>
                <p>Execute pending migrations</p>
            </a>
            
            <a href="?key=<?= htmlspecialchars($secretKey) ?>&action=optimize" class="action-btn">
                <h4>🔧 Optimize</h4>
                <p>Optimize for production</p>
            </a>
            
            <a href="?key=<?= htmlspecialchars($secretKey) ?>&action=full_deploy" class="action-btn" style="grid-column: span 2;">
                <h4>🚀 Full Deployment</h4>
                <p>Clear caches → Storage link → Migrate → Build caches</p>
            </a>
            
            <a href="?key=<?= htmlspecialchars($secretKey) ?>&action=migrate_fresh" class="action-btn danger">
                <h4>💣 Fresh Migration</h4>
                <p>WARNING: Drops all tables!</p>
            </a>
        </div>
        
        <div class="info">
            <h3>📝 After Deployment</h3>
            <p>Once your site is working correctly:</p>
            <ol style="margin-top: 0.5rem; padding-left: 1.5rem;">
                <li>Delete this file: <code>cpanel-helper.php</code></li>
                <li>Verify <code>APP_DEBUG=false</code> in <code>.env</code></li>
                <li>Test all critical functionality</li>
                <li>Check <code>storage/logs/laravel.log</code> for errors</li>
            </ol>
        </div>
        
        <p style="margin-top: 2rem; text-align: center; color: var(--text-muted);">
            OttoStart Deployment Helper | Generated <?= date('Y-m-d H:i:s') ?>
        </p>
    </div>
</body>
</html>
