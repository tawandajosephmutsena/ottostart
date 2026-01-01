<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Site Configuration
    |--------------------------------------------------------------------------
    */
    'site_name' => env('SEO_SITE_NAME', config('app.name', 'Avant-Garde CMS')),
    'default_description' => env('SEO_DEFAULT_DESCRIPTION', 'Digital Innovation Redefined - Premium web development and design solutions'),
    'title_separator' => env('SEO_TITLE_SEPARATOR', ' | '),
    
    /*
    |--------------------------------------------------------------------------
    | Default Images
    |--------------------------------------------------------------------------
    */
    'default_og_image' => env('SEO_DEFAULT_OG_IMAGE', '/images/og-default.jpg'),
    'logo_url' => env('SEO_LOGO_URL', '/images/logo.png'),
    
    /*
    |--------------------------------------------------------------------------
    | Social Media
    |--------------------------------------------------------------------------
    */
    'twitter_handle' => env('SEO_TWITTER_HANDLE', '@avantgardecms'),
    'facebook_app_id' => env('SEO_FACEBOOK_APP_ID'),
    
    /*
    |--------------------------------------------------------------------------
    | Organization Information
    |--------------------------------------------------------------------------
    */
    'organization' => [
        'name' => env('SEO_ORG_NAME', config('app.name')),
        'type' => env('SEO_ORG_TYPE', 'Organization'),
        'url' => env('SEO_ORG_URL', config('app.url')),
        'logo' => env('SEO_ORG_LOGO', '/images/logo.png'),
        'phone' => env('SEO_ORG_PHONE'),
        'email' => env('SEO_ORG_EMAIL'),
        'address' => [
            'street' => env('SEO_ORG_STREET'),
            'city' => env('SEO_ORG_CITY'),
            'state' => env('SEO_ORG_STATE'),
            'postal_code' => env('SEO_ORG_POSTAL_CODE'),
            'country' => env('SEO_ORG_COUNTRY'),
        ],
        'social_links' => [
            'facebook' => env('SEO_FACEBOOK_URL'),
            'twitter' => env('SEO_TWITTER_URL'),
            'linkedin' => env('SEO_LINKEDIN_URL'),
            'instagram' => env('SEO_INSTAGRAM_URL'),
            'youtube' => env('SEO_YOUTUBE_URL'),
        ],
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Canonical URL Configuration
    |--------------------------------------------------------------------------
    */
    'force_https' => env('SEO_FORCE_HTTPS', true),
    'force_www' => env('SEO_FORCE_WWW', false),
    'remove_www' => env('SEO_REMOVE_WWW', true),
    'trailing_slash' => env('SEO_TRAILING_SLASH', false),
    
    /*
    |--------------------------------------------------------------------------
    | Default Robots Settings
    |--------------------------------------------------------------------------
    */
    'robots' => [
        'index' => env('SEO_ROBOTS_INDEX', true),
        'follow' => env('SEO_ROBOTS_FOLLOW', true),
        'archive' => env('SEO_ROBOTS_ARCHIVE', true),
        'snippet' => env('SEO_ROBOTS_SNIPPET', true),
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Sitemap Configuration
    |--------------------------------------------------------------------------
    */
    'sitemap' => [
        'enabled' => env('SEO_SITEMAP_ENABLED', true),
        'cache_duration' => env('SEO_SITEMAP_CACHE_DURATION', 3600), // 1 hour
        'max_urls_per_sitemap' => env('SEO_SITEMAP_MAX_URLS', 50000),
        'include_images' => env('SEO_SITEMAP_INCLUDE_IMAGES', true),
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Analytics
    |--------------------------------------------------------------------------
    */
    'analytics' => [
        'google_analytics_id' => env('GOOGLE_ANALYTICS_ID'),
        'google_tag_manager_id' => env('GOOGLE_TAG_MANAGER_ID'),
        'facebook_pixel_id' => env('FACEBOOK_PIXEL_ID'),
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Verification Codes
    |--------------------------------------------------------------------------
    */
    'verification' => [
        'google' => env('SEO_GOOGLE_VERIFICATION'),
        'bing' => env('SEO_BING_VERIFICATION'),
        'yandex' => env('SEO_YANDEX_VERIFICATION'),
        'pinterest' => env('SEO_PINTEREST_VERIFICATION'),
    ],
];