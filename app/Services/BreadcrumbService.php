<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

class BreadcrumbService
{
    /**
     * Generate breadcrumbs for the current request
     */
    public function generateBreadcrumbs(Request $request, array $customBreadcrumbs = []): array
    {
        // If custom breadcrumbs are provided, use them
        if (!empty($customBreadcrumbs)) {
            return $this->normalizeBreadcrumbs($customBreadcrumbs);
        }

        // Generate breadcrumbs based on current route
        $routeName = $request->route()?->getName();
        $parameters = $request->route()?->parameters() ?? [];

        return $this->generateRouteBasedBreadcrumbs($routeName, $parameters);
    }

    /**
     * Generate breadcrumbs based on route name and parameters
     */
    private function generateRouteBasedBreadcrumbs(?string $routeName, array $parameters): array
    {
        $breadcrumbs = [
            [
                'title' => 'Home',
                'url' => route('home'),
                'active' => false,
            ]
        ];

        if (!$routeName) {
            return $breadcrumbs;
        }

        // Define breadcrumb patterns for different routes
        $patterns = [
            // Blog routes
            'blog' => [
                ['title' => 'Blog', 'url' => route('blog'), 'active' => true],
            ],
            'blog.show' => [
                ['title' => 'Blog', 'url' => route('blog'), 'active' => false],
                ['title' => $this->getModelTitle('insight', $parameters), 'url' => null, 'active' => true],
            ],

            // Portfolio routes
            'portfolio' => [
                ['title' => 'Portfolio', 'url' => route('portfolio'), 'active' => true],
            ],
            'portfolio.show' => [
                ['title' => 'Portfolio', 'url' => route('portfolio'), 'active' => false],
                ['title' => $this->getModelTitle('portfolio', $parameters), 'url' => null, 'active' => true],
            ],

            // Services routes
            'services' => [
                ['title' => 'Services', 'url' => route('services'), 'active' => true],
            ],
            'services.show' => [
                ['title' => 'Services', 'url' => route('services'), 'active' => false],
                ['title' => $this->getModelTitle('service', $parameters), 'url' => null, 'active' => true],
            ],

            // Team routes
            'team' => [
                ['title' => 'Team', 'url' => route('team'), 'active' => true],
            ],

            // Dynamic Page routes
            'pages.show' => [
                ['title' => $this->getModelTitle('page', $parameters), 'url' => null, 'active' => true],
            ],

            // Admin routes
            'admin.dashboard' => [
                ['title' => 'Admin', 'url' => route('admin.dashboard'), 'active' => true],
            ],
            'admin.portfolio.index' => [
                ['title' => 'Admin', 'url' => route('admin.dashboard'), 'active' => false],
                ['title' => 'Portfolio', 'url' => route('admin.portfolio.index'), 'active' => true],
            ],
            'admin.portfolio.create' => [
                ['title' => 'Admin', 'url' => route('admin.dashboard'), 'active' => false],
                ['title' => 'Portfolio', 'url' => route('admin.portfolio.index'), 'active' => false],
                ['title' => 'Create', 'url' => null, 'active' => true],
            ],
            'admin.portfolio.edit' => [
                ['title' => 'Admin', 'url' => route('admin.dashboard'), 'active' => false],
                ['title' => 'Portfolio', 'url' => route('admin.portfolio.index'), 'active' => false],
                ['title' => $this->getModelTitle('portfolio', $parameters), 'url' => null, 'active' => true],
            ],
            'admin.services.index' => [
                ['title' => 'Admin', 'url' => route('admin.dashboard'), 'active' => false],
                ['title' => 'Services', 'url' => route('admin.services.index'), 'active' => true],
            ],
            'admin.services.create' => [
                ['title' => 'Admin', 'url' => route('admin.dashboard'), 'active' => false],
                ['title' => 'Services', 'url' => route('admin.services.index'), 'active' => false],
                ['title' => 'Create', 'url' => null, 'active' => true],
            ],
            'admin.services.edit' => [
                ['title' => 'Admin', 'url' => route('admin.dashboard'), 'active' => false],
                ['title' => 'Services', 'url' => route('admin.services.index'), 'active' => false],
                ['title' => $this->getModelTitle('service', $parameters), 'url' => null, 'active' => true],
            ],
            'admin.insights.index' => [
                ['title' => 'Admin', 'url' => route('admin.dashboard'), 'active' => false],
                ['title' => 'Insights', 'url' => route('admin.insights.index'), 'active' => true],
            ],
            'admin.insights.create' => [
                ['title' => 'Admin', 'url' => route('admin.dashboard'), 'active' => false],
                ['title' => 'Insights', 'url' => route('admin.insights.index'), 'active' => false],
                ['title' => 'Create', 'url' => null, 'active' => true],
            ],
            'admin.insights.edit' => [
                ['title' => 'Admin', 'url' => route('admin.dashboard'), 'active' => false],
                ['title' => 'Insights', 'url' => route('admin.insights.index'), 'active' => false],
                ['title' => $this->getModelTitle('insight', $parameters), 'url' => null, 'active' => true],
            ],
        ];

        // Get pattern for current route
        $pattern = $patterns[$routeName] ?? [];

        // Merge with home breadcrumb
        return array_merge($breadcrumbs, $pattern);
    }

    /**
     * Get model title for breadcrumb
     */
    private function getModelTitle(string $type, array $parameters): string
    {
        $slug = $parameters['slug'] ?? $parameters[$type] ?? null;
        
        if (!$slug) {
            return 'Unknown';
        }

        // Try to get the actual model title
        try {
            switch ($type) {
                case 'insight':
                    $model = \App\Models\Insight::where('slug', $slug)->first();
                    return $model?->title ?? 'Insight';
                    
                case 'portfolio':
                    $model = \App\Models\PortfolioItem::where('slug', $slug)->first();
                    return $model?->title ?? 'Portfolio Item';
                    
                case 'service':
                    $model = \App\Models\Service::where('slug', $slug)->first();
                    return $model?->title ?? 'Service';
                    
                case 'page':
                    $model = \App\Models\Page::where('slug', $slug)->first();
                    return $model?->title ?? 'Page';
                    
                default:
                    return ucfirst($type);
            }
        } catch (\Exception $e) {
            return ucfirst($type);
        }
    }

    /**
     * Normalize breadcrumb array structure
     */
    private function normalizeBreadcrumbs(array $breadcrumbs): array
    {
        return array_map(function ($breadcrumb) {
            return [
                'title' => $breadcrumb['title'] ?? $breadcrumb['name'] ?? 'Unknown',
                'url' => $breadcrumb['url'] ?? $breadcrumb['href'] ?? null,
                'active' => $breadcrumb['active'] ?? false,
            ];
        }, $breadcrumbs);
    }

    /**
     * Generate breadcrumbs for a specific model
     */
    public function generateModelBreadcrumbs($model): array
    {
        $breadcrumbs = [
            [
                'title' => 'Home',
                'url' => route('home'),
                'active' => false,
            ]
        ];

        $modelClass = get_class($model);
        
        switch ($modelClass) {
            case 'App\Models\Insight':
                $breadcrumbs[] = [
                    'title' => 'Blog',
                    'url' => route('blog'),
                    'active' => false,
                ];
                if ($model->category) {
                    $breadcrumbs[] = [
                        'title' => $model->category->name,
                        'url' => route('blog') . '?category=' . $model->category->slug,
                        'active' => false,
                    ];
                }
                $breadcrumbs[] = [
                    'title' => $model->title,
                    'url' => null,
                    'active' => true,
                ];
                break;

            case 'App\Models\PortfolioItem':
                $breadcrumbs[] = [
                    'title' => 'Portfolio',
                    'url' => route('portfolio'),
                    'active' => false,
                ];
                $breadcrumbs[] = [
                    'title' => $model->title,
                    'url' => null,
                    'active' => true,
                ];
                break;

            case 'App\Models\Service':
                $breadcrumbs[] = [
                    'title' => 'Services',
                    'url' => route('services'),
                    'active' => false,
                ];
                $breadcrumbs[] = [
                    'title' => $model->title,
                    'url' => null,
                    'active' => true,
                ];
                break;

            default:
                $breadcrumbs[] = [
                    'title' => $model->title ?? 'Unknown',
                    'url' => null,
                    'active' => true,
                ];
        }

        return $breadcrumbs;
    }

    /**
     * Generate structured data for breadcrumbs
     */
    public function generateBreadcrumbStructuredData(array $breadcrumbs): array
    {
        $listItems = [];
        
        foreach ($breadcrumbs as $index => $breadcrumb) {
            // Skip items without URLs (except the last one)
            if (!$breadcrumb['url'] && !$breadcrumb['active']) {
                continue;
            }

            $listItems[] = [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $breadcrumb['title'],
                'item' => $breadcrumb['url'] ?: url()->current(),
            ];
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => $listItems,
        ];
    }

    /**
     * Generate breadcrumbs for admin pages
     */
    public function generateAdminBreadcrumbs(string $section, ?string $action = null, ?string $itemTitle = null): array
    {
        $breadcrumbs = [
            [
                'title' => 'Home',
                'url' => route('home'),
                'active' => false,
            ],
            [
                'title' => 'Admin',
                'url' => route('admin.dashboard'),
                'active' => false,
            ],
        ];

        // Add section breadcrumb
        $sectionRoutes = [
            'portfolio' => 'admin.portfolio.index',
            'services' => 'admin.services.index',
            'insights' => 'admin.insights.index',
            'team' => 'admin.team.index',
            'media' => 'admin.media.index',
        ];

        if (isset($sectionRoutes[$section])) {
            $breadcrumbs[] = [
                'title' => ucfirst($section),
                'url' => route($sectionRoutes[$section]),
                'active' => !$action,
            ];
        }

        // Add action breadcrumb
        if ($action) {
            $actionTitle = match($action) {
                'create' => 'Create',
                'edit' => $itemTitle ?? 'Edit',
                'show' => $itemTitle ?? 'View',
                default => ucfirst($action),
            };

            $breadcrumbs[] = [
                'title' => $actionTitle,
                'url' => null,
                'active' => true,
            ];
        }

        return $breadcrumbs;
    }
}