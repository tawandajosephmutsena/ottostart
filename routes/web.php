<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\HomeController;

// Frontend routes with caching
Route::middleware(['cache.headers:public'])->group(function () {
    Route::get('/', [HomeController::class, 'index'])->name('home');

    Route::get('/about', function () {
        return Inertia::render('About');
    })->name('about');

    Route::get('/services', [App\Http\Controllers\ServiceController::class, 'index'])->name('services');
    Route::get('/services/{slug}', [App\Http\Controllers\ServiceController::class, 'show'])->name('services.show');

    Route::get('/portfolio', [App\Http\Controllers\PortfolioController::class, 'index'])->name('portfolio');
    Route::get('/portfolio/{slug}', [App\Http\Controllers\PortfolioController::class, 'show'])->name('portfolio.show');

    Route::get('/team', [App\Http\Controllers\TeamController::class, 'index'])->name('team');

    Route::get('/blog', [App\Http\Controllers\BlogController::class, 'index'])->name('blog');
    Route::get('/blog/{slug}', [App\Http\Controllers\BlogController::class, 'show'])->name('blog.show');

    Route::get('/contact', function () {
        return Inertia::render('Contact');
    })->name('contact');
});

// Contact form (no caching for POST)
Route::post('/contact', [App\Http\Controllers\ContactController::class, 'store'])
    ->middleware('throttle:5,1') // 5 requests per minute
    ->name('contact.store');

// SEO and Sitemap routes
Route::get('/sitemap.xml', [App\Http\Controllers\SitemapController::class, 'index'])->name('sitemap');
Route::get('/robots.txt', function () {
    $robotsTxt = "User-agent: *\n";
    $robotsTxt .= "Allow: /\n";
    $robotsTxt .= "Disallow: /admin/\n";
    $robotsTxt .= "Disallow: /cms/\n";
    $robotsTxt .= "Disallow: /preview/\n";
    $robotsTxt .= "\n";
    $robotsTxt .= "Sitemap: " . url('/sitemap.xml') . "\n";
    
    return response($robotsTxt, 200, ['Content-Type' => 'text/plain']);
})->name('robots');

// Preview links (public access)
Route::get('/preview/{token}', [App\Http\Controllers\Admin\PreviewLinkController::class, 'show'])->name('preview.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user();
        
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        } elseif ($user->isEditor()) {
            // For now, editors also go to admin dashboard, but this could be changed
            return redirect()->route('admin.dashboard');
        } else {
            // For viewers and other roles, show a simple dashboard
            return Inertia::render('Dashboard');
        }
    })->name('dashboard');
});

// CMS routes - require editor role or higher (no caching)
Route::middleware(['auth', 'verified', 'cache.headers:no-cache'])->prefix('cms')->name('cms.')->group(function () {
    Route::get('/', function () {
        $user = auth()->user();
        
        if (!$user->isEditor()) {
            abort(403, 'Unauthorized. Editor access required.');
        }
        
        return Inertia::render('cms/Dashboard');
    })->name('dashboard');
});

// Admin routes - require admin role (no caching)
Route::middleware(['auth', 'verified', 'admin', 'cache.headers:no-cache'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [App\Http\Controllers\Admin\AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/quick-actions', [App\Http\Controllers\Admin\AdminController::class, 'quickActions'])->name('quick-actions');
    
    Route::get('/users', function () {
        return Inertia::render('admin/users');
    })->name('users');
    
    // Settings
    Route::get('/settings', [App\Http\Controllers\Admin\SettingsController::class, 'index'])->name('settings');
    Route::post('/settings', [App\Http\Controllers\Admin\SettingsController::class, 'update'])->name('settings.update');

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
    Route::post('media/bulk-delete', [App\Http\Controllers\Admin\MediaController::class, 'bulkDelete'])->name('media.bulk-delete');

    // Contact Inquiries management
    Route::resource('contact-inquiries', App\Http\Controllers\Admin\ContactInquiryController::class);

    // Page management
    Route::resource('pages', App\Http\Controllers\Admin\PageController::class);

    // Content Versioning
    Route::prefix('content-versions')->name('content-versions.')->group(function () {
        Route::get('{contentType}/{contentId}', [App\Http\Controllers\Admin\ContentVersionController::class, 'index'])->name('index');
        Route::get('{contentType}/{contentId}/{versionNumber}', [App\Http\Controllers\Admin\ContentVersionController::class, 'show'])->name('show');
        Route::post('{contentType}/{contentId}/restore', [App\Http\Controllers\Admin\ContentVersionController::class, 'restore'])->name('restore');
        Route::post('{contentType}/{contentId}/publish', [App\Http\Controllers\Admin\ContentVersionController::class, 'publish'])->name('publish');
        Route::get('{contentType}/{contentId}/compare', [App\Http\Controllers\Admin\ContentVersionController::class, 'compare'])->name('compare');
        Route::post('{contentType}/{contentId}/draft', [App\Http\Controllers\Admin\ContentVersionController::class, 'createDraft'])->name('draft');
    });

    // Preview Links
    Route::prefix('preview-links')->name('preview-links.')->group(function () {
        Route::get('{contentType}/{contentId}', [App\Http\Controllers\Admin\PreviewLinkController::class, 'index'])->name('index');
        Route::post('{contentType}/{contentId}', [App\Http\Controllers\Admin\PreviewLinkController::class, 'store'])->name('store');
        Route::delete('{linkId}', [App\Http\Controllers\Admin\PreviewLinkController::class, 'destroy'])->name('destroy');
    });

    // SEO and Sitemap Management
    Route::prefix('seo')->name('seo.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\SeoAnalysisController::class, 'index'])->name('dashboard');
        Route::post('/analyze', [App\Http\Controllers\Admin\SeoAnalysisController::class, 'analyze'])->name('analyze');
        Route::post('/bulk-analyze', [App\Http\Controllers\Admin\SeoAnalysisController::class, 'bulkAnalyze'])->name('bulk-analyze');
        Route::get('/suggestions', [App\Http\Controllers\Admin\SeoAnalysisController::class, 'suggestions'])->name('suggestions');
        Route::get('/recommendations', [App\Http\Controllers\Admin\SeoAnalysisController::class, 'siteRecommendations'])->name('recommendations');
        Route::get('/sitemap/stats', [App\Http\Controllers\SitemapController::class, 'stats'])->name('sitemap.stats');
        Route::post('/sitemap/clear-cache', [App\Http\Controllers\SitemapController::class, 'clearCache'])->name('sitemap.clear-cache');
        Route::post('/sitemap/submit', [App\Http\Controllers\SitemapController::class, 'submit'])->name('sitemap.submit');
        Route::post('/semantic-analysis', [App\Http\Controllers\Admin\SeoAnalysisController::class, 'semanticAnalysis'])->name('semantic-analysis');
    });

    // Image SEO Management
    Route::prefix('image-seo')->name('image-seo.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\ImageSeoController::class, 'index'])->name('dashboard');
        Route::post('/analyze', [App\Http\Controllers\Admin\ImageSeoController::class, 'analyzeImage'])->name('analyze');
        Route::post('/bulk-analyze', [App\Http\Controllers\Admin\ImageSeoController::class, 'bulkAnalyze'])->name('bulk-analyze');
        Route::post('/generate-alt-text', [App\Http\Controllers\Admin\ImageSeoController::class, 'generateAltText'])->name('generate-alt-text');
        Route::post('/generate-filename', [App\Http\Controllers\Admin\ImageSeoController::class, 'generateFilename'])->name('generate-filename');
        Route::get('/directories', [App\Http\Controllers\Admin\ImageSeoController::class, 'getDirectories'])->name('directories');
        Route::get('/content-models', [App\Http\Controllers\Admin\ImageSeoController::class, 'getContentModels'])->name('content-models');
        Route::post('/analyze-content-model', [App\Http\Controllers\Admin\ImageSeoController::class, 'analyzeContentModel'])->name('analyze-content-model');
        Route::post('/bulk-optimize-models', [App\Http\Controllers\Admin\ImageSeoController::class, 'bulkOptimizeModels'])->name('bulk-optimize-models');
        Route::post('/bulk-optimize-filenames', [App\Http\Controllers\Admin\ImageSeoController::class, 'bulkOptimizeFilenames'])->name('bulk-optimize-filenames');
        Route::post('/update-model-image-seo', [App\Http\Controllers\Admin\ImageSeoController::class, 'updateModelImageSeo'])->name('update-model-image-seo');
    });

    // Web Core Vitals Management
    Route::prefix('web-core-vitals')->name('web-core-vitals.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\WebCoreVitalsController::class, 'index'])->name('dashboard');
        Route::post('/analyze', [App\Http\Controllers\Admin\WebCoreVitalsController::class, 'analyze'])->name('analyze');
        Route::get('/optimization-report', [App\Http\Controllers\Admin\WebCoreVitalsController::class, 'getOptimizationReport'])->name('optimization-report');
        Route::post('/content-recommendations', [App\Http\Controllers\Admin\WebCoreVitalsController::class, 'getContentRecommendations'])->name('content-recommendations');
        Route::post('/analyze-content-model', [App\Http\Controllers\Admin\WebCoreVitalsController::class, 'analyzeContentModel'])->name('analyze-content-model');
        Route::post('/bulk-analyze', [App\Http\Controllers\Admin\WebCoreVitalsController::class, 'bulkAnalyze'])->name('bulk-analyze');
        Route::get('/dashboard', [App\Http\Controllers\Admin\WebCoreVitalsController::class, 'getDashboardData'])->name('dashboard-data');
    });
});

// Dynamic Pages (Catch-all)
Route::get('/{slug}', [App\Http\Controllers\PageController::class, 'show'])
    ->where('slug', '^[a-zA-Z0-9-_]+$')
    ->name('pages.show');

require __DIR__.'/settings.php';
