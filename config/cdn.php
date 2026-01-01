<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CDN Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Content Delivery Network integration
    |
    */

    'enabled' => env('CDN_ENABLED', false),

    'url' => env('CDN_URL', ''),

    'zone' => env('CDN_ZONE', ''),

    /*
    |--------------------------------------------------------------------------
    | CDN Provider Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for specific CDN providers
    |
    */

    'provider' => env('CDN_PROVIDER', 'cloudflare'), // cloudflare, aws, custom

    'providers' => [
        'cloudflare' => [
            'api_token' => env('CLOUDFLARE_API_TOKEN'),
            'zone_id' => env('CLOUDFLARE_ZONE_ID'),
            'account_id' => env('CLOUDFLARE_ACCOUNT_ID'),
        ],
        
        'aws' => [
            'distribution_id' => env('AWS_CLOUDFRONT_DISTRIBUTION_ID'),
            'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Image Optimization Settings
    |--------------------------------------------------------------------------
    |
    | Settings for CDN-based image optimization
    |
    */

    'image_optimization' => [
        'enabled' => env('CDN_IMAGE_OPTIMIZATION', true),
        'quality' => env('CDN_IMAGE_QUALITY', 85),
        'formats' => ['webp', 'jpeg', 'png'],
        'auto_format' => env('CDN_AUTO_FORMAT', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Settings
    |--------------------------------------------------------------------------
    |
    | CDN cache configuration
    |
    */

    'cache' => [
        'default_ttl' => env('CDN_CACHE_TTL', 2592000), // 30 days
        'image_ttl' => env('CDN_IMAGE_CACHE_TTL', 2592000), // 30 days
        'static_ttl' => env('CDN_STATIC_CACHE_TTL', 31536000), // 1 year
    ],

    /*
    |--------------------------------------------------------------------------
    | Asset Types
    |--------------------------------------------------------------------------
    |
    | Configuration for different asset types
    |
    */

    'asset_types' => [
        'images' => [
            'extensions' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
            'cache_ttl' => 2592000, // 30 days
        ],
        'styles' => [
            'extensions' => ['css'],
            'cache_ttl' => 31536000, // 1 year
        ],
        'scripts' => [
            'extensions' => ['js'],
            'cache_ttl' => 31536000, // 1 year
        ],
        'fonts' => [
            'extensions' => ['woff', 'woff2', 'ttf', 'eot'],
            'cache_ttl' => 31536000, // 1 year
        ],
    ],

];