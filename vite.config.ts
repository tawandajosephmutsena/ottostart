import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
        drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
        // Web Core Vitals optimization: Tree shaking and dead code elimination
        treeShaking: true,
        legalComments: 'none',
    },
    optimizeDeps: {
        include: ['gsap', 'lenis', 'react', 'react-dom'],
        exclude: ['@vite/client', '@vite/env'],
    },
    build: {
        target: 'es2020',
        minify: 'esbuild',
        cssMinify: true,
        sourcemap: process.env.NODE_ENV !== 'production',
        // Web Core Vitals: Optimize chunk sizes for better LCP
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Critical path chunks for better LCP
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom')) {
                            return 'react-vendor';
                        }
                        if (id.includes('gsap') || id.includes('lenis')) {
                            return 'animation-vendor';
                        }
                        if (id.includes('@headlessui') || id.includes('lucide-react')) {
                            return 'ui-vendor';
                        }
                        // Split other vendor code into smaller chunks
                        return 'vendor';
                    }
                    // Split pages into separate chunks for better code splitting
                    if (id.includes('pages/')) {
                        const pageName = id.split('pages/')[1].split('.')[0];
                        return `page-${pageName}`;
                    }
                    // Split components into logical chunks
                    if (id.includes('components/admin/')) {
                        return 'admin-components';
                    }
                    if (id.includes('components/')) {
                        return 'components';
                    }
                },
                // Optimize chunk file names for caching
                chunkFileNames: 'js/[name]-[hash].js',
                entryFileNames: 'js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name?.split('.') || [];
                    const ext = info[info.length - 1];
                    if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
                        return `images/[name]-[hash][extname]`;
                    }
                    if (/css/i.test(ext || '')) {
                        return `css/[name]-[hash][extname]`;
                    }
                    if (/woff2?|eot|ttf|otf/i.test(ext || '')) {
                        return `fonts/[name]-[hash][extname]`;
                    }
                    return `assets/[name]-[hash][extname]`;
                },
            },
        },
        // Web Core Vitals: Reduce chunk size for better performance
        chunkSizeWarningLimit: 500, // Reduced from 1000 to encourage smaller chunks
    },
    server: {
        hmr: {
            overlay: false,
        },
    },
    // CSS optimization for better LCP
    css: {
        devSourcemap: true,
        // Note: CSS optimization is handled by Tailwind CSS and esbuild minification
        // Additional PostCSS plugins can be added in postcss.config.js if needed
    },
});
