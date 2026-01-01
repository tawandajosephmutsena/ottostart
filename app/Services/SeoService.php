<?php

namespace App\Services;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\URL;

class SeoService
{
    /**
     * Generate comprehensive SEO data for a given content item
     */
    public function generateSeoData(array $data): array
    {
        $siteConfig = config('seo', []);
        
        return [
            'title' => $this->generateTitle($data['title'] ?? null, $siteConfig),
            'description' => $this->generateDescription($data['description'] ?? null, $siteConfig),
            'keywords' => $this->generateKeywords($data['keywords'] ?? [], $data['content'] ?? ''),
            'canonical_url' => $this->generateCanonicalUrl($data['url'] ?? null),
            'og_data' => $this->generateOpenGraphData($data, $siteConfig),
            'twitter_data' => $this->generateTwitterCardData($data, $siteConfig),
            'structured_data' => $this->generateStructuredData($data),
            'robots' => $this->generateRobotsDirective($data),
            'hreflang' => $this->generateHreflangData($data),
        ];
    }

    /**
     * Generate optimized page title
     */
    private function generateTitle(?string $title, array $siteConfig): string
    {
        $siteName = $siteConfig['site_name'] ?? config('app.name', 'Avant-Garde CMS');
        $separator = $siteConfig['title_separator'] ?? ' | ';
        
        if (!$title) {
            return $siteName;
        }

        // Optimize title length (50-60 characters is ideal)
        $maxLength = 60 - strlen($separator . $siteName);
        if (strlen($title) > $maxLength) {
            $title = Str::limit($title, $maxLength - 3, '...');
        }

        return $title . $separator . $siteName;
    }

    /**
     * Generate optimized meta description
     */
    private function generateDescription(?string $description, array $siteConfig): string
    {
        $defaultDescription = $siteConfig['default_description'] ?? 'Digital Innovation Redefined';
        
        if (!$description) {
            return $defaultDescription;
        }

        // Optimize description length (150-160 characters is ideal)
        return Str::limit($description, 160);
    }

    /**
     * Generate keywords from content and provided keywords
     */
    private function generateKeywords(array $keywords, string $content): array
    {
        // Combine provided keywords with extracted keywords from content
        $extractedKeywords = $this->extractKeywordsFromContent($content);
        
        return array_unique(array_merge($keywords, $extractedKeywords));
    }

    /**
     * Extract keywords from content using simple text analysis
     */
    private function extractKeywordsFromContent(string $content): array
    {
        if (empty($content)) {
            return [];
        }

        // Remove HTML tags and normalize text
        $text = strip_tags($content);
        $text = strtolower($text);
        
        // Remove common stop words
        $stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
        
        // Extract words and filter
        preg_match_all('/\b\w{4,}\b/', $text, $matches);
        $words = array_diff($matches[0], $stopWords);
        
        // Get word frequency and return top keywords
        $wordCount = array_count_values($words);
        arsort($wordCount);
        
        return array_slice(array_keys($wordCount), 0, 10);
    }

    /**
     * Generate canonical URL
     */
    private function generateCanonicalUrl(?string $url): string
    {
        if ($url) {
            return $url;
        }

        return URL::current();
    }

    /**
     * Generate Open Graph data
     */
    private function generateOpenGraphData(array $data, array $siteConfig): array
    {
        $siteName = $siteConfig['site_name'] ?? config('app.name');
        $defaultImage = $siteConfig['default_og_image'] ?? asset('images/og-default.jpg');

        return [
            'site_name' => $siteName,
            'title' => $data['title'] ?? $siteName,
            'description' => $data['description'] ?? $siteConfig['default_description'] ?? '',
            'type' => $data['type'] ?? 'website',
            'url' => $this->generateCanonicalUrl($data['url'] ?? null),
            'image' => $data['image'] ?? $defaultImage,
            'image_alt' => $data['image_alt'] ?? $data['title'] ?? '',
            'locale' => $data['locale'] ?? 'en_US',
            'published_time' => $data['published_time'] ?? null,
            'modified_time' => $data['modified_time'] ?? null,
            'author' => $data['author'] ?? null,
        ];
    }

    /**
     * Generate Twitter Card data
     */
    private function generateTwitterCardData(array $data, array $siteConfig): array
    {
        $twitterHandle = $siteConfig['twitter_handle'] ?? null;

        return [
            'card' => $data['twitter_card'] ?? 'summary_large_image',
            'site' => $twitterHandle,
            'creator' => $data['twitter_creator'] ?? $twitterHandle,
            'title' => $data['title'] ?? $siteConfig['site_name'] ?? '',
            'description' => $data['description'] ?? $siteConfig['default_description'] ?? '',
            'image' => $data['image'] ?? $siteConfig['default_og_image'] ?? '',
        ];
    }

    /**
     * Generate structured data (JSON-LD)
     */
    private function generateStructuredData(array $data): array
    {
        $structuredData = [
            '@context' => 'https://schema.org',
        ];

        // Determine the type of structured data based on content type
        switch ($data['type'] ?? 'webpage') {
            case 'article':
                $structuredData = array_merge($structuredData, $this->generateArticleStructuredData($data));
                break;
            case 'organization':
                $structuredData = array_merge($structuredData, $this->generateOrganizationStructuredData($data));
                break;
            case 'service':
                $structuredData = array_merge($structuredData, $this->generateServiceStructuredData($data));
                break;
            case 'portfolio':
                $structuredData = array_merge($structuredData, $this->generateCreativeWorkStructuredData($data));
                break;
            default:
                $structuredData = array_merge($structuredData, $this->generateWebPageStructuredData($data));
        }

        return $structuredData;
    }

    /**
     * Generate Article structured data
     */
    private function generateArticleStructuredData(array $data): array
    {
        return [
            '@type' => 'Article',
            'headline' => $data['title'] ?? '',
            'description' => $data['description'] ?? '',
            'image' => $data['image'] ?? '',
            'author' => [
                '@type' => 'Person',
                'name' => $data['author'] ?? '',
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => config('app.name'),
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => asset('images/logo.png'),
                ],
            ],
            'datePublished' => $data['published_time'] ?? '',
            'dateModified' => $data['modified_time'] ?? $data['published_time'] ?? '',
        ];
    }

    /**
     * Generate Organization structured data
     */
    private function generateOrganizationStructuredData(array $data): array
    {
        return [
            '@type' => 'Organization',
            'name' => $data['name'] ?? config('app.name'),
            'description' => $data['description'] ?? '',
            'url' => $data['url'] ?? config('app.url'),
            'logo' => $data['logo'] ?? asset('images/logo.png'),
            'contactPoint' => [
                '@type' => 'ContactPoint',
                'telephone' => $data['phone'] ?? '',
                'contactType' => 'customer service',
            ],
            'sameAs' => $data['social_links'] ?? [],
        ];
    }

    /**
     * Generate Service structured data
     */
    private function generateServiceStructuredData(array $data): array
    {
        return [
            '@type' => 'Service',
            'name' => $data['title'] ?? '',
            'description' => $data['description'] ?? '',
            'provider' => [
                '@type' => 'Organization',
                'name' => config('app.name'),
            ],
            'serviceType' => $data['service_type'] ?? '',
            'offers' => [
                '@type' => 'Offer',
                'priceRange' => $data['price_range'] ?? '',
            ],
        ];
    }

    /**
     * Generate CreativeWork structured data for portfolio items
     */
    private function generateCreativeWorkStructuredData(array $data): array
    {
        return [
            '@type' => 'CreativeWork',
            'name' => $data['title'] ?? '',
            'description' => $data['description'] ?? '',
            'image' => $data['image'] ?? '',
            'creator' => [
                '@type' => 'Organization',
                'name' => config('app.name'),
            ],
            'dateCreated' => $data['created_at'] ?? '',
        ];
    }

    /**
     * Generate WebPage structured data
     */
    private function generateWebPageStructuredData(array $data): array
    {
        return [
            '@type' => 'WebPage',
            'name' => $data['title'] ?? '',
            'description' => $data['description'] ?? '',
            'url' => $this->generateCanonicalUrl($data['url'] ?? null),
        ];
    }

    /**
     * Generate robots directive
     */
    private function generateRobotsDirective(array $data): string
    {
        $robots = [];

        // Check if content should be indexed
        if (isset($data['no_index']) && $data['no_index']) {
            $robots[] = 'noindex';
        } else {
            $robots[] = 'index';
        }

        // Check if links should be followed
        if (isset($data['no_follow']) && $data['no_follow']) {
            $robots[] = 'nofollow';
        } else {
            $robots[] = 'follow';
        }

        // Additional directives
        if (isset($data['no_archive']) && $data['no_archive']) {
            $robots[] = 'noarchive';
        }

        if (isset($data['no_snippet']) && $data['no_snippet']) {
            $robots[] = 'nosnippet';
        }

        return implode(', ', $robots);
    }

    /**
     * Generate hreflang data for internationalization
     */
    private function generateHreflangData(array $data): array
    {
        // This would be expanded based on actual internationalization needs
        return $data['hreflang'] ?? [];
    }

    /**
     * Analyze content for SEO recommendations
     */
    public function analyzeSeoScore(array $data): array
    {
        $score = 100;
        $recommendations = [];

        // Title analysis
        $titleLength = strlen($data['title'] ?? '');
        if ($titleLength < 30) {
            $score -= 10;
            $recommendations[] = 'Title is too short. Aim for 30-60 characters.';
        } elseif ($titleLength > 60) {
            $score -= 5;
            $recommendations[] = 'Title is too long. Keep it under 60 characters.';
        }

        // Description analysis
        $descriptionLength = strlen($data['description'] ?? '');
        if ($descriptionLength < 120) {
            $score -= 10;
            $recommendations[] = 'Meta description is too short. Aim for 120-160 characters.';
        } elseif ($descriptionLength > 160) {
            $score -= 5;
            $recommendations[] = 'Meta description is too long. Keep it under 160 characters.';
        }

        // Image analysis
        if (empty($data['image'])) {
            $score -= 10;
            $recommendations[] = 'Add a featured image for better social media sharing.';
        }

        // Keywords analysis
        if (empty($data['keywords'])) {
            $score -= 5;
            $recommendations[] = 'Add relevant keywords to improve search visibility.';
        }

        // Content analysis
        $contentLength = strlen(strip_tags($data['content'] ?? ''));
        if ($contentLength < 300) {
            $score -= 15;
            $recommendations[] = 'Content is too short. Aim for at least 300 words.';
        }

        return [
            'score' => max(0, $score),
            'recommendations' => $recommendations,
            'grade' => $this->getScoreGrade($score),
        ];
    }

    /**
     * Get letter grade based on score
     */
    private function getScoreGrade(int $score): string
    {
        if ($score >= 90) return 'A';
        if ($score >= 80) return 'B';
        if ($score >= 70) return 'C';
        if ($score >= 60) return 'D';
        return 'F';
    }
}