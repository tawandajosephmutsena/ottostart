<?php

namespace App\Services;

use App\Models\Insight;
use App\Models\PortfolioItem;
use App\Models\Service;
use App\Models\TeamMember;
use App\Models\Page;
use Illuminate\Support\Facades\URL;

class StructuredDataService
{
    /**
     * Generate organization structured data
     */
    public function generateOrganizationData(): array
    {
        $config = config('seo.organization');
        
        $data = [
            '@context' => 'https://schema.org',
            '@type' => $config['type'] ?? 'Organization',
            'name' => $config['name'],
            'url' => $config['url'],
            'logo' => [
                '@type' => 'ImageObject',
                'url' => asset($config['logo']),
            ],
        ];

        // Add contact information if available
        if (!empty($config['phone']) || !empty($config['email'])) {
            $contactPoint = [
                '@type' => 'ContactPoint',
                'contactType' => 'customer service',
            ];
            
            if (!empty($config['phone'])) {
                $contactPoint['telephone'] = $config['phone'];
            }
            
            if (!empty($config['email'])) {
                $contactPoint['email'] = $config['email'];
            }
            
            $data['contactPoint'] = $contactPoint;
        }

        // Add address if available
        $address = array_filter($config['address'] ?? []);
        if (!empty($address)) {
            $data['address'] = [
                '@type' => 'PostalAddress',
                'streetAddress' => $address['street'] ?? '',
                'addressLocality' => $address['city'] ?? '',
                'addressRegion' => $address['state'] ?? '',
                'postalCode' => $address['postal_code'] ?? '',
                'addressCountry' => $address['country'] ?? '',
            ];
        }

        // Add social media links
        $socialLinks = array_filter($config['social_links'] ?? []);
        if (!empty($socialLinks)) {
            $data['sameAs'] = array_values($socialLinks);
        }

        return $data;
    }

    /**
     * Generate website structured data
     */
    public function generateWebsiteData(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => config('seo.site_name'),
            'url' => config('app.url'),
            'potentialAction' => [
                '@type' => 'SearchAction',
                'target' => [
                    '@type' => 'EntryPoint',
                    'urlTemplate' => config('app.url') . '/search?q={search_term_string}',
                ],
                'query-input' => 'required name=search_term_string',
            ],
        ];
    }

    /**
     * Generate breadcrumb structured data
     */
    public function generateBreadcrumbData(array $breadcrumbs): array
    {
        $listItems = [];
        
        foreach ($breadcrumbs as $index => $breadcrumb) {
            $listItems[] = [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $breadcrumb['title'],
                'item' => $breadcrumb['url'],
            ];
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => $listItems,
        ];
    }

    /**
     * Generate article structured data for insights/blog posts
     */
    public function generateArticleData(Insight $insight): array
    {
        $data = [
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => $insight->title,
            'description' => $insight->excerpt,
            'url' => route('blog.show', $insight->slug),
            'datePublished' => $insight->published_at?->toISOString(),
            'dateModified' => $insight->updated_at->toISOString(),
            'author' => [
                '@type' => 'Person',
                'name' => $insight->author->name,
            ],
            'publisher' => $this->getPublisherData(),
        ];

        // Add featured image if available
        if ($insight->featured_image) {
            $data['image'] = [
                '@type' => 'ImageObject',
                'url' => asset($insight->featured_image),
                'width' => 1200,
                'height' => 630,
            ];
        }

        // Add reading time if available
        if ($insight->reading_time) {
            $data['timeRequired'] = "PT{$insight->reading_time}M";
        }

        // Add category if available
        if ($insight->category) {
            $data['articleSection'] = $insight->category->name;
        }

        // Add tags as keywords
        if ($insight->tags) {
            $data['keywords'] = implode(', ', $insight->tags);
        }

        return $data;
    }

    /**
     * Generate service structured data
     */
    public function generateServiceData(Service $service): array
    {
        $data = [
            '@context' => 'https://schema.org',
            '@type' => 'Service',
            'name' => $service->title,
            'description' => $service->description,
            'url' => route('services.show', $service->slug),
            'provider' => $this->getPublisherData(),
        ];

        // Add service type based on title/description
        $data['serviceType'] = $this->determineServiceType($service);

        // Add price range if available
        if ($service->price_range) {
            $data['offers'] = [
                '@type' => 'Offer',
                'priceRange' => $service->price_range,
                'priceCurrency' => 'USD',
            ];
        }

        // Add featured image if available
        if ($service->featured_image) {
            $data['image'] = [
                '@type' => 'ImageObject',
                'url' => asset($service->featured_image),
            ];
        }

        return $data;
    }

    /**
     * Generate creative work structured data for portfolio items
     */
    public function generateCreativeWorkData(PortfolioItem $item): array
    {
        $data = [
            '@context' => 'https://schema.org',
            '@type' => 'CreativeWork',
            'name' => $item->title,
            'description' => $item->description,
            'url' => route('portfolio.show', $item->slug),
            'creator' => $this->getPublisherData(),
            'dateCreated' => $item->project_date ?? $item->created_at->toDateString(),
        ];

        // Add featured image if available
        if ($item->featured_image) {
            $data['image'] = [
                '@type' => 'ImageObject',
                'url' => asset($item->featured_image),
            ];
        }

        // Add client information if available
        if ($item->client) {
            $data['sponsor'] = [
                '@type' => 'Organization',
                'name' => $item->client,
            ];
        }

        // Add technologies as keywords
        if ($item->technologies) {
            $data['keywords'] = implode(', ', $item->technologies);
        }

        // Add project URL if available
        if ($item->project_url) {
            $data['mainEntityOfPage'] = $item->project_url;
        }

        return $data;
    }

    /**
     * Generate person structured data for team members
     */
    public function generatePersonData(TeamMember $member): array
    {
        $data = [
            '@context' => 'https://schema.org',
            '@type' => 'Person',
            'name' => $member->name,
            'jobTitle' => $member->position,
            'description' => $member->bio,
            'worksFor' => $this->getPublisherData(),
        ];

        // Add avatar if available
        if ($member->avatar) {
            $data['image'] = [
                '@type' => 'ImageObject',
                'url' => asset($member->avatar),
            ];
        }

        // Add email if available
        if ($member->email) {
            $data['email'] = $member->email;
        }

        // Add social media links
        if ($member->social_links) {
            $socialUrls = array_filter(array_values($member->social_links));
            if (!empty($socialUrls)) {
                $data['sameAs'] = $socialUrls;
            }
        }

        return $data;
    }

    /**
     * Generate FAQ structured data
     */
    public function generateFaqData(array $faqs): array
    {
        $mainEntity = [];
        
        foreach ($faqs as $faq) {
            $mainEntity[] = [
                '@type' => 'Question',
                'name' => $faq['question'],
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => $faq['answer'],
                ],
            ];
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => $mainEntity,
        ];
    }

    /**
     * Generate local business structured data
     */
    public function generateLocalBusinessData(): array
    {
        $config = config('seo.organization');
        
        $data = [
            '@context' => 'https://schema.org',
            '@type' => 'LocalBusiness',
            'name' => $config['name'],
            'url' => $config['url'],
            'telephone' => $config['phone'] ?? '',
            'email' => $config['email'] ?? '',
        ];

        // Add address if available
        $address = array_filter($config['address'] ?? []);
        if (!empty($address)) {
            $data['address'] = [
                '@type' => 'PostalAddress',
                'streetAddress' => $address['street'] ?? '',
                'addressLocality' => $address['city'] ?? '',
                'addressRegion' => $address['state'] ?? '',
                'postalCode' => $address['postal_code'] ?? '',
                'addressCountry' => $address['country'] ?? '',
            ];
        }

        return $data;
    }

    /**
     * Get publisher data for articles and creative works
     */
    private function getPublisherData(): array
    {
        $config = config('seo.organization');
        
        return [
            '@type' => 'Organization',
            'name' => $config['name'],
            'url' => $config['url'],
            'logo' => [
                '@type' => 'ImageObject',
                'url' => asset($config['logo']),
            ],
        ];
    }

    /**
     * Determine service type based on service data
     */
    private function determineServiceType(Service $service): string
    {
        $title = strtolower($service->title);
        $description = strtolower($service->description);
        
        // Map common service types
        $serviceTypes = [
            'web development' => 'WebDevelopment',
            'web design' => 'WebDesign',
            'seo' => 'SearchEngineOptimization',
            'marketing' => 'DigitalMarketing',
            'consulting' => 'BusinessConsulting',
            'branding' => 'BrandingService',
            'ecommerce' => 'EcommerceService',
        ];

        foreach ($serviceTypes as $keyword => $type) {
            if (str_contains($title, $keyword) || str_contains($description, $keyword)) {
                return $type;
            }
        }

        return 'Service';
    }

    /**
     * Generate multiple structured data items
     */
    public function generateMultipleStructuredData(array $items): array
    {
        return [
            '@context' => 'https://schema.org',
            '@graph' => $items,
        ];
    }
}