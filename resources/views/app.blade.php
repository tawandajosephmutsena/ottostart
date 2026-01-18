<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Web Core Vitals: Preconnect to external domains for better LCP --}}
        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
        <link rel="dns-prefetch" href="https://fonts.bunny.net">

        {{-- Web Core Vitals: Critical CSS inlined to prevent render blocking --}}
        <style>
            /* Critical CSS for LCP optimization */
            html {
                background-color: oklch(0.9818 0.0054 95.0986);
                font-family: 'Instrument Sans', 'Inter', ui-sans-serif, system-ui, sans-serif;
            }

            html.dark {
                background-color: oklch(0.2679 0.0036 106.6427);
            }

            body {
                margin: 0;
                padding: 0;
                font-family: inherit;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            /* Prevent layout shift during font loading */
            .font-loading {
                font-display: swap;
                size-adjust: 100%;
            }

            /* Critical navigation styles to prevent CLS */
            nav {
                height: 64px; /* Fixed height to prevent layout shift */
            }

            /* Loading shimmer matching the app components */
            .loading-skeleton {
                position: relative;
                overflow: hidden;
                background-color: oklch(0.9341 0.0153 90.239 / 0.5);
            }

            .loading-skeleton::after {
                position: absolute;
                inset: 0;
                transform: translateX(-100%);
                background-image: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                animation: shimmer 2s infinite;
                content: '';
            }

            @keyframes shimmer {
                100% { transform: translateX(100%); }
            }

            /* Prevent layout shift for images */
            img {
                max-width: 100%;
                height: auto;
            }
        </style>

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script nonce="{{ Vite::cspNonce() }}">
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }

                // Web Core Vitals: Performance monitoring initialization
                if ('performance' in window && 'PerformanceObserver' in window) {
                    // Mark critical timing points
                    performance.mark('app-start');
                    
                    // Monitor LCP
                    try {
                        const lcpObserver = new PerformanceObserver((list) => {
                            const entries = list.getEntries();
                            const lastEntry = entries[entries.length - 1];
                            if (lastEntry) {
                                performance.mark('lcp-detected');
                                console.log('LCP:', lastEntry.startTime);
                            }
                        });
                        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
                    } catch (e) {
                        // LCP observer not supported
                    }

                    // Monitor CLS
                    try {
                        let clsValue = 0;
                        const clsObserver = new PerformanceObserver((list) => {
                            for (const entry of list.getEntries()) {
                                if (!entry.hadRecentInput) {
                                    clsValue += entry.value;
                                }
                            }
                            console.log('CLS:', clsValue);
                        });
                        clsObserver.observe({ type: 'layout-shift', buffered: true });
                    } catch (e) {
                        // CLS observer not supported
                    }
                }
            })();
        </script>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        {{-- Web Core Vitals: Optimized favicon loading --}}
        <link rel="icon" href="/favicon.ico" sizes="32x32">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        {{-- Web Core Vitals: Font loading optimization --}}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        {{-- Web Core Vitals: Loading indicator to prevent CLS --}}
        <div id="app-loading" class="loading-skeleton" style="position: fixed; top: 0; left: 0; width: 100%; height: 4px; z-index: 9999;"></div>
        
        @inertia

        {{-- Web Core Vitals: Remove loading indicator when app is ready --}}
        <script nonce="{{ Vite::cspNonce() }}">
            document.addEventListener('DOMContentLoaded', function() {
                const loadingIndicator = document.getElementById('app-loading');
                if (loadingIndicator) {
                    setTimeout(() => {
                        loadingIndicator.style.opacity = '0';
                        setTimeout(() => loadingIndicator.remove(), 300);
                    }, 100);
                }
                performance.mark('app-ready');
            });
        </script>
    </body>
</html>
