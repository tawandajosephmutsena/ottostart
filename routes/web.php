<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\HomeController;

// Frontend routes
Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::get('/services', function () {
    return Inertia::render('Services');
})->name('services');

Route::get('/portfolio', function () {
    return Inertia::render('Portfolio');
})->name('portfolio');

Route::get('/team', function () {
    return Inertia::render('Team');
})->name('team');

Route::get('/blog', function () {
    return Inertia::render('Blog');
})->name('blog');

Route::get('/contact', function () {
    return Inertia::render('Contact');
})->name('contact');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Admin routes - require admin role
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [App\Http\Controllers\Admin\AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/quick-actions', [App\Http\Controllers\Admin\AdminController::class, 'quickActions'])->name('quick-actions');
    
    Route::get('/users', function () {
        return Inertia::render('admin/users');
    })->name('users');
    
    Route::get('/settings', function () {
        return Inertia::render('admin/settings');
    })->name('settings');

    // Portfolio management
    Route::resource('portfolio', App\Http\Controllers\Admin\PortfolioController::class);
    Route::post('portfolio/{portfolioItem}/toggle-featured', [App\Http\Controllers\Admin\PortfolioController::class, 'toggleFeatured'])->name('portfolio.toggle-featured');
    Route::post('portfolio/{portfolioItem}/toggle-published', [App\Http\Controllers\Admin\PortfolioController::class, 'togglePublished'])->name('portfolio.toggle-published');
    Route::post('portfolio/bulk-action', [App\Http\Controllers\Admin\PortfolioController::class, 'bulkAction'])->name('portfolio.bulk-action');

    // Services management
    Route::resource('services', App\Http\Controllers\Admin\ServiceController::class);
    Route::post('services/{service}/toggle-featured', [App\Http\Controllers\Admin\ServiceController::class, 'toggleFeatured'])->name('services.toggle-featured');
    Route::post('services/{service}/toggle-published', [App\Http\Controllers\Admin\ServiceController::class, 'togglePublished'])->name('services.toggle-published');
    Route::post('services/bulk-action', [App\Http\Controllers\Admin\ServiceController::class, 'bulkAction'])->name('services.bulk-action');

    // Insights management
    Route::resource('insights', App\Http\Controllers\Admin\InsightController::class);
    Route::post('insights/{insight}/toggle-featured', [App\Http\Controllers\Admin\InsightController::class, 'toggleFeatured'])->name('insights.toggle-featured');
    Route::post('insights/{insight}/toggle-published', [App\Http\Controllers\Admin\InsightController::class, 'togglePublished'])->name('insights.toggle-published');
    Route::post('insights/bulk-action', [App\Http\Controllers\Admin\InsightController::class, 'bulkAction'])->name('insights.bulk-action');

    // Team management
    Route::resource('team', App\Http\Controllers\Admin\TeamMemberController::class);
    Route::post('team/{teamMember}/toggle-featured', [App\Http\Controllers\Admin\TeamMemberController::class, 'toggleFeatured'])->name('team.toggle-featured');
    Route::post('team/{teamMember}/toggle-active', [App\Http\Controllers\Admin\TeamMemberController::class, 'toggleActive'])->name('team.toggle-active');
    Route::post('team/bulk-action', [App\Http\Controllers\Admin\TeamMemberController::class, 'bulkAction'])->name('team.bulk-action');
    Route::post('team/update-order', [App\Http\Controllers\Admin\TeamMemberController::class, 'updateOrder'])->name('team.update-order');

    // Media management
    Route::resource('media', App\Http\Controllers\Admin\MediaController::class);
    Route::get('media-search', [App\Http\Controllers\Admin\MediaController::class, 'search'])->name('media.search');
    Route::get('media/{mediaAsset}/embed', [App\Http\Controllers\Admin\MediaController::class, 'embed'])->name('media.embed');
    Route::post('media/bulk-action', [App\Http\Controllers\Admin\MediaController::class, 'bulkAction'])->name('media.bulk-action');
});

require __DIR__.'/settings.php';
