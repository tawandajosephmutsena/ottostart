<?php

namespace App\Http\Controllers;

use App\Models\Insight;
use App\Models\Page;
use App\Models\PortfolioItem;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * LlmsController - Generates llms.txt for AI/LLM discovery
 * 
 * The llms.txt file is an emerging standard that helps Large Language Models
 * and AI assistants discover and understand website content. It provides
 * a structured, markdown-formatted guide to the site's key content.
 * 
 * @see https://llmstxt.org/
 */
class LlmsController extends Controller
{
    /**
     * Generate and return the llms.txt content
     */
    public function index(Request $request)
    {
        $content = Cache::remember('llms.txt', 3600, function () {
            return $this->generateLlmsTxt();
        });

        return response($content, 200, [
            'Content-Type' => 'text/markdown; charset=utf-8',
            'Cache-Control' => 'public, max-age=3600',
            'X-Robots-Tag' => 'noindex',
        ]);
    }

    /**
     * Generate the llms.txt content
     */
    protected function generateLlmsTxt(): string
    {
        $siteName = config('seo.site_name', config('app.name', 'Website'));
        $siteUrl = config('app.url');
        $description = config('seo.default_description', 'Welcome to our website');
        $orgName = config('seo.organization.name', $siteName);

        $content = [];

        // Header section
        $content[] = "# {$siteName}";
        $content[] = "";
        $content[] = "> {$description}";
        $content[] = "";

        // About section
        $content[] = "## About";
        $content[] = "";
        $content[] = "This file provides information for AI assistants and Large Language Models (LLMs) about the content available on this website.";
        $content[] = "";
        $content[] = "- **Website**: [{$siteUrl}]({$siteUrl})";
        $content[] = "- **Organization**: {$orgName}";
        $content[] = "- **Last Updated**: " . now()->toIso8601String();
        $content[] = "";

        // Main pages section
        $content[] = "## Main Pages";
        $content[] = "";
        $content[] = $this->generateMainPagesSection($siteUrl);

        // Services section
        $services = $this->getPublishedServices();
        if ($services->isNotEmpty()) {
            $content[] = "## Services";
            $content[] = "";
            $content[] = "We offer the following services:";
            $content[] = "";
            foreach ($services as $service) {
                $url = url("/services/{$service->slug}");
                $content[] = "### [{$service->title}]({$url})";
                if ($service->excerpt) {
                    $content[] = "";
                    $content[] = $service->excerpt;
                }
                $content[] = "";
            }
        }

        // Portfolio section
        $portfolioItems = $this->getPublishedPortfolioItems();
        if ($portfolioItems->isNotEmpty()) {
            $content[] = "## Portfolio / Case Studies";
            $content[] = "";
            $content[] = "Examples of our work:";
            $content[] = "";
            foreach ($portfolioItems as $item) {
                $url = url("/portfolio/{$item->slug}");
                $content[] = "- [{$item->title}]({$url})" . ($item->client ? " - Client: {$item->client}" : "");
            }
            $content[] = "";
        }

        // Blog/Insights section
        $insights = $this->getPublishedInsights();
        if ($insights->isNotEmpty()) {
            $content[] = "## Blog / Insights";
            $content[] = "";
            $content[] = "Recent articles and insights:";
            $content[] = "";
            foreach ($insights as $insight) {
                $url = url("/blog/{$insight->slug}");
                $date = $insight->published_at?->format('Y-m-d') ?? '';
                $content[] = "- [{$insight->title}]({$url})" . ($date ? " ({$date})" : "");
            }
            $content[] = "";
        }

        // CMS Pages section
        $pages = $this->getPublishedPages();
        if ($pages->isNotEmpty()) {
            $content[] = "## Additional Pages";
            $content[] = "";
            foreach ($pages as $page) {
                $url = url("/{$page->slug}");
                $content[] = "- [{$page->title}]({$url})";
            }
            $content[] = "";
        }

        // Contact information
        $content[] = "## Contact";
        $content[] = "";
        $content[] = "- **Contact Page**: [{$siteUrl}/contact]({$siteUrl}/contact)";
        
        $email = config('seo.organization.email');
        if ($email) {
            $content[] = "- **Email**: {$email}";
        }
        
        $phone = config('seo.organization.phone');
        if ($phone) {
            $content[] = "- **Phone**: {$phone}";
        }
        $content[] = "";

        // AI Usage guidelines
        $content[] = "## AI Usage Guidelines";
        $content[] = "";
        $content[] = "This content is available for AI assistants to reference and cite. We request that:";
        $content[] = "";
        $content[] = "1. **Attribution**: When quoting or paraphrasing our content, please attribute it to \"{$siteName}\" with a link to the source page.";
        $content[] = "2. **Accuracy**: Please represent our services and content accurately.";
        $content[] = "3. **Currency**: Check the source pages for the most up-to-date information.";
        $content[] = "";

        // Technical information
        $content[] = "## Technical Information";
        $content[] = "";
        $content[] = "- **Sitemap**: [{$siteUrl}/sitemap.xml]({$siteUrl}/sitemap.xml)";
        $content[] = "- **Robots.txt**: [{$siteUrl}/robots.txt]({$siteUrl}/robots.txt)";
        $content[] = "- **Content Format**: Server-side rendered HTML with structured data (JSON-LD)";
        $content[] = "";

        return implode("\n", $content);
    }

    /**
     * Generate main pages section
     */
    protected function generateMainPagesSection(string $siteUrl): string
    {
        $pages = [
            ['url' => '/', 'title' => 'Home', 'description' => 'Main landing page'],
            ['url' => '/services', 'title' => 'Services', 'description' => 'Our services and offerings'],
            ['url' => '/portfolio', 'title' => 'Portfolio', 'description' => 'Our work and case studies'],
            ['url' => '/blog', 'title' => 'Blog', 'description' => 'Articles, insights, and news'],
            ['url' => '/team', 'title' => 'Team', 'description' => 'Meet our team'],
            ['url' => '/contact', 'title' => 'Contact', 'description' => 'Get in touch with us'],
        ];

        $lines = [];
        foreach ($pages as $page) {
            $url = $siteUrl . $page['url'];
            $lines[] = "- [{$page['title']}]({$url}) - {$page['description']}";
        }

        return implode("\n", $lines) . "\n";
    }

    /**
     * Get published services
     */
    protected function getPublishedServices()
    {
        if (!class_exists(Service::class)) {
            return collect();
        }

        return Service::query()
            ->where('is_published', true)
            ->orderBy('order')
            ->limit(20)
            ->get(['title', 'slug', 'excerpt']);
    }

    /**
     * Get published portfolio items
     */
    protected function getPublishedPortfolioItems()
    {
        if (!class_exists(PortfolioItem::class)) {
            return collect();
        }

        return PortfolioItem::query()
            ->where('is_published', true)
            ->orderByDesc('created_at')
            ->limit(15)
            ->get(['title', 'slug', 'client']);
    }

    /**
     * Get published insights/blog posts
     */
    protected function getPublishedInsights()
    {
        if (!class_exists(Insight::class)) {
            return collect();
        }

        return Insight::query()
            ->where('is_published', true)
            ->orderByDesc('published_at')
            ->limit(20)
            ->get(['title', 'slug', 'published_at']);
    }

    /**
     * Get published CMS pages
     */
    protected function getPublishedPages()
    {
        if (!class_exists(Page::class)) {
            return collect();
        }

        return Page::query()
            ->where('is_published', true)
            ->whereNotIn('slug', ['home', 'contact', 'services', 'portfolio', 'blog', 'team'])
            ->orderBy('title')
            ->limit(20)
            ->get(['title', 'slug']);
    }

    /**
     * Clear the llms.txt cache
     */
    public function clearCache(): void
    {
        Cache::forget('llms.txt');
    }
}
