<?php

namespace App\Console\Commands;

use App\Models\Insight;
use App\Models\Page;
use App\Models\PortfolioItem;
use App\Models\Service;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class GenerateSitemap extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sitemap:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate the sitemap.xml file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating sitemap...');

        $baseUrl = config('app.url');
        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Static Pages
        $this->addUrl($xml, $baseUrl, '', 'daily', '1.0');
        $this->addUrl($xml, $baseUrl, '/about', 'monthly', '0.8');
        $this->addUrl($xml, $baseUrl, '/contact', 'monthly', '0.8');
        $this->addUrl($xml, $baseUrl, '/portfolio', 'weekly', '0.9');
        $this->addUrl($xml, $baseUrl, '/services', 'monthly', '0.9');
        $this->addUrl($xml, $baseUrl, '/blog', 'weekly', '0.9');
        $this->addUrl($xml, $baseUrl, '/team', 'monthly', '0.7');

        // Dynamic Pages
        Page::where('is_published', true)->each(function ($page) use (&$xml, $baseUrl) {
            $slug = $page->slug === 'home' ? '' : '/' . $page->slug;
            $this->addUrl($xml, $baseUrl, $slug, 'weekly', '0.8', $page->updated_at);
        });

        // Portfolio
        PortfolioItem::published()->each(function ($item) use (&$xml, $baseUrl) {
            $this->addUrl($xml, $baseUrl, '/portfolio/' . $item->slug, 'monthly', '0.8', $item->updated_at);
        });

        // Services
        Service::published()->each(function ($item) use (&$xml, $baseUrl) {
            $this->addUrl($xml, $baseUrl, '/services/' . $item->slug, 'monthly', '0.8', $item->updated_at);
        });

        // Insights
        Insight::published()->each(function ($item) use (&$xml, $baseUrl) {
            $this->addUrl($xml, $baseUrl, '/blog/' . $item->slug, 'weekly', '0.7', $item->updated_at);
        });

        $xml .= '</urlset>';

        File::put(public_path('sitemap.xml'), $xml);

        $this->info('Sitemap generated successfully at public/sitemap.xml');
    }

    private function addUrl(string &$xml, string $baseUrl, string $path, string $freq, string $priority, $date = null)
    {
        $url = rtrim($baseUrl, '/') . $path;
        $lastmod = $date ? $date->toAtomString() : now()->toAtomString();

        $xml .= '<url>';
        $xml .= "<loc>{$url}</loc>";
        $xml .= "<lastmod>{$lastmod}</lastmod>";
        $xml .= "<changefreq>{$freq}</changefreq>";
        $xml .= "<priority>{$priority}</priority>";
        $xml .= '</url>';
    }
}
