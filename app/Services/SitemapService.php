<?php

namespace App\Services;

use App\Models\Insight;
use App\Models\Page;
use App\Models\PortfolioItem;
use App\Models\Service;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class SitemapService
{
    private const CACHE_KEY = 'sitemap_xml';
    private const CACHE_DURATION = 3600; // 1 hour

    /**
     * Generate complete sitemap XML
     */
    public function generateSitemap(): string
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_DURATION, function () {
            $urls = $this->collectAllUrls();
            return $this->buildSitemapXml($urls);
        });
    }

    /**
     * Generate and save sitemap to public directory
     */
    public function generateAndSaveSitemap(): bool
    {
        try {
            $sitemapXml = $this->generateSitemap();
            
            // Save to public directory
            $publicPath = public_path('sitemap.xml');
            file_put_contents($publicPath, $sitemapXml);
            
            // Also save to storage for backup
            Storage::disk('public')->put('sitemap.xml', $sitemapXml);
            
            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to generate sitemap: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Collect all URLs for the sitemap
     */
    private function collectAllUrls(): array
    {
        $urls = [];

        // Static pages
        $urls = array_merge($urls, $this->getStaticPageUrls());

        // Dynamic content pages
        $urls = array_merge($urls, $this->getPageUrls());
        $urls = array_merge($urls, $this->getPortfolioUrls());
        $urls = array_merge($urls, $this->getServiceUrls());
        $urls = array_merge($urls, $this->getInsightUrls());

        // Category and listing pages
        $urls = array_merge($urls, $this->getListingPageUrls());

        return $urls;
    }

    /**
     * Get static page URLs
     */
    private function getStaticPageUrls(): array
    {
        $staticPages = [
            [
                'url' => URL::to('/'),
                'lastmod' => now()->toISOString(),
                'changefreq' => 'daily',
                'priority' => '1.0',
            ],
            [
                'url' => URL::to('/about'),
                'lastmod' => now()->toISOString(),
                'changefreq' => 'monthly',
                'priority' => '0.8',
            ],
            [
                'url' => URL::to('/contact'),
                'lastmod' => now()->toISOString(),
                'changefreq' => 'monthly',
                'priority' => '0.7',
            ],
            [
                'url' => URL::to('/team'),
                'lastmod' => now()->toISOString(),
                'changefreq' => 'monthly',
                'priority' => '0.6',
            ],
        ];

        return $staticPages;
    }

    /**
     * Get CMS page URLs
     */
    private function getPageUrls(): array
    {
        return Page::where('is_published', true)
            ->get()
            ->map(function ($page) {
                return [
                    'url' => URL::to('/' . $page->slug),
                    'lastmod' => $page->updated_at->toISOString(),
                    'changefreq' => 'monthly',
                    'priority' => '0.7',
                ];
            })
            ->toArray();
    }

    /**
     * Get portfolio URLs
     */
    private function getPortfolioUrls(): array
    {
        $portfolioUrls = [];

        // Portfolio listing page
        $portfolioUrls[] = [
            'url' => URL::to('/portfolio'),
            'lastmod' => PortfolioItem::where('is_published', true)
                ->latest('updated_at')
                ->first()
                ?->updated_at
                ?->toISOString() ?? now()->toISOString(),
            'changefreq' => 'weekly',
            'priority' => '0.8',
        ];

        // Individual portfolio items
        $portfolioItems = PortfolioItem::where('is_published', true)
            ->get()
            ->map(function ($item) {
                return [
                    'url' => URL::to('/portfolio/' . $item->slug),
                    'lastmod' => $item->updated_at->toISOString(),
                    'changefreq' => 'monthly',
                    'priority' => $item->is_featured ? '0.9' : '0.7',
                    'images' => $this->getPortfolioImages($item),
                ];
            })
            ->toArray();

        return array_merge($portfolioUrls, $portfolioItems);
    }

    /**
     * Get service URLs
     */
    private function getServiceUrls(): array
    {
        $serviceUrls = [];

        // Services listing page
        $serviceUrls[] = [
            'url' => URL::to('/services'),
            'lastmod' => Service::where('is_published', true)
                ->latest('updated_at')
                ->first()
                ?->updated_at
                ?->toISOString() ?? now()->toISOString(),
            'changefreq' => 'weekly',
            'priority' => '0.8',
        ];

        // Individual services
        $services = Service::where('is_published', true)
            ->get()
            ->map(function ($service) {
                return [
                    'url' => URL::to('/services/' . $service->slug),
                    'lastmod' => $service->updated_at->toISOString(),
                    'changefreq' => 'monthly',
                    'priority' => $service->is_featured ? '0.8' : '0.6',
                    'images' => $this->getServiceImages($service),
                ];
            })
            ->toArray();

        return array_merge($serviceUrls, $services);
    }

    /**
     * Get insight/blog URLs
     */
    private function getInsightUrls(): array
    {
        $insightUrls = [];

        // Blog listing page
        $insightUrls[] = [
            'url' => URL::to('/blog'),
            'lastmod' => Insight::where('is_published', true)
                ->latest('published_at')
                ->first()
                ?->published_at
                ?->toISOString() ?? now()->toISOString(),
            'changefreq' => 'daily',
            'priority' => '0.8',
        ];

        // Individual insights
        $insights = Insight::where('is_published', true)
            ->whereNotNull('published_at')
            ->get()
            ->map(function ($insight) {
                return [
                    'url' => URL::to('/blog/' . $insight->slug),
                    'lastmod' => $insight->updated_at->toISOString(),
                    'changefreq' => 'monthly',
                    'priority' => $insight->is_featured ? '0.8' : '0.6',
                    'images' => $this->getInsightImages($insight),
                ];
            })
            ->toArray();

        return array_merge($insightUrls, $insights);
    }

    /**
     * Get listing page URLs
     */
    private function getListingPageUrls(): array
    {
        // Add category pages, tag pages, etc. if they exist
        return [];
    }

    /**
     * Get images for portfolio items
     */
    private function getPortfolioImages(PortfolioItem $item): array
    {
        $images = [];

        if ($item->featured_image) {
            $images[] = [
                'url' => asset($item->featured_image),
                'caption' => $item->title,
                'title' => $item->title,
            ];
        }

        if ($item->gallery) {
            foreach ($item->gallery as $image) {
                $images[] = [
                    'url' => asset($image),
                    'caption' => $item->title . ' - Gallery Image',
                    'title' => $item->title,
                ];
            }
        }

        return $images;
    }

    /**
     * Get images for services
     */
    private function getServiceImages(Service $service): array
    {
        $images = [];

        if ($service->featured_image) {
            $images[] = [
                'url' => asset($service->featured_image),
                'caption' => $service->title,
                'title' => $service->title,
            ];
        }

        return $images;
    }

    /**
     * Get images for insights
     */
    private function getInsightImages(Insight $insight): array
    {
        $images = [];

        if ($insight->featured_image) {
            $images[] = [
                'url' => asset($insight->featured_image),
                'caption' => $insight->title,
                'title' => $insight->title,
            ];
        }

        return $images;
    }

    /**
     * Build the sitemap XML
     */
    private function buildSitemapXml(array $urls): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
        
        // Add image namespace if any URLs have images
        $hasImages = collect($urls)->some(fn($url) => !empty($url['images']));
        if ($hasImages) {
            $xml .= ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
        }
        
        $xml .= '>' . PHP_EOL;

        foreach ($urls as $urlData) {
            $xml .= $this->buildUrlXml($urlData);
        }

        $xml .= '</urlset>';

        return $xml;
    }

    /**
     * Build XML for a single URL
     */
    private function buildUrlXml(array $urlData): string
    {
        $xml = '  <url>' . PHP_EOL;
        $xml .= '    <loc>' . htmlspecialchars($urlData['url']) . '</loc>' . PHP_EOL;
        
        if (isset($urlData['lastmod'])) {
            $xml .= '    <lastmod>' . $urlData['lastmod'] . '</lastmod>' . PHP_EOL;
        }
        
        if (isset($urlData['changefreq'])) {
            $xml .= '    <changefreq>' . $urlData['changefreq'] . '</changefreq>' . PHP_EOL;
        }
        
        if (isset($urlData['priority'])) {
            $xml .= '    <priority>' . $urlData['priority'] . '</priority>' . PHP_EOL;
        }

        // Add images if present
        if (!empty($urlData['images'])) {
            foreach ($urlData['images'] as $image) {
                $xml .= '    <image:image>' . PHP_EOL;
                $xml .= '      <image:loc>' . htmlspecialchars($image['url']) . '</image:loc>' . PHP_EOL;
                
                if (!empty($image['caption'])) {
                    $xml .= '      <image:caption>' . htmlspecialchars($image['caption']) . '</image:caption>' . PHP_EOL;
                }
                
                if (!empty($image['title'])) {
                    $xml .= '      <image:title>' . htmlspecialchars($image['title']) . '</image:title>' . PHP_EOL;
                }
                
                $xml .= '    </image:image>' . PHP_EOL;
            }
        }

        $xml .= '  </url>' . PHP_EOL;

        return $xml;
    }

    /**
     * Clear sitemap cache
     */
    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Get sitemap statistics
     */
    public function getSitemapStats(): array
    {
        $urls = $this->collectAllUrls();
        
        return [
            'total_urls' => count($urls),
            'static_pages' => count($this->getStaticPageUrls()),
            'portfolio_items' => PortfolioItem::where('is_published', true)->count() + 1, // +1 for listing page
            'services' => Service::where('is_published', true)->count() + 1, // +1 for listing page
            'insights' => Insight::where('is_published', true)->whereNotNull('published_at')->count() + 1, // +1 for listing page
            'cms_pages' => Page::where('is_published', true)->count(),
            'last_generated' => Cache::get(self::CACHE_KEY . '_timestamp'),
            'cache_expires_at' => now()->addSeconds(self::CACHE_DURATION),
        ];
    }

    /**
     * Submit sitemap to search engines
     */
    public function submitToSearchEngines(): array
    {
        $sitemapUrl = URL::to('/sitemap.xml');
        $results = [];

        // Submit to Google
        try {
            $googleUrl = "https://www.google.com/ping?sitemap=" . urlencode($sitemapUrl);
            $response = file_get_contents($googleUrl);
            $results['google'] = ['success' => true, 'response' => $response];
        } catch (\Exception $e) {
            $results['google'] = ['success' => false, 'error' => $e->getMessage()];
        }

        // Submit to Bing
        try {
            $bingUrl = "https://www.bing.com/ping?sitemap=" . urlencode($sitemapUrl);
            $response = file_get_contents($bingUrl);
            $results['bing'] = ['success' => true, 'response' => $response];
        } catch (\Exception $e) {
            $results['bing'] = ['success' => false, 'error' => $e->getMessage()];
        }

        return $results;
    }
}