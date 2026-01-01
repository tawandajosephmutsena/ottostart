/**
 * Hardware Acceleration Optimizer
 * Optimizes CSS transforms and animations for GPU acceleration
 */
export class HardwareAccelerationOptimizer {
    private static instance: HardwareAccelerationOptimizer;
    private acceleratedElements: Set<HTMLElement> = new Set();
    private compositeLayerElements: Set<HTMLElement> = new Set();
    private willChangeElements: Map<HTMLElement, string[]> = new Map();
    private performanceObserver: PerformanceObserver | null = null;
    private layerCount: number = 0;
    private maxLayers: number = 50; // Reasonable limit to prevent memory issues

    private constructor() {
        this.initializePerformanceMonitoring();
        this.setupGlobalOptimizations();
    }

    public static getInstance(): HardwareAccelerationOptimizer {
        if (!HardwareAccelerationOptimizer.instance) {
            HardwareAccelerationOptimizer.instance = new HardwareAccelerationOptimizer();
        }
        return HardwareAccelerationOptimizer.instance;
    }

    /**
     * Initialize performance monitoring for layer tracking
     */
    private initializePerformanceMonitoring(): void {
        if (typeof window === 'undefined' || !window.PerformanceObserver) return;

        try {
            this.performanceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.entryType === 'paint' || entry.entryType === 'layout-shift') {
                        this.analyzeRenderingPerformance(entry);
                    }
                });
            });

            this.performanceObserver.observe({ 
                entryTypes: ['paint', 'layout-shift', 'largest-contentful-paint'] 
            });
        } catch (error) {
            console.warn('Performance Observer not supported for hardware acceleration monitoring:', error);
        }
    }

    /**
     * Setup global CSS optimizations
     */
    private setupGlobalOptimizations(): void {
        this.addGlobalOptimizationStyles();
    }

    /**
     * Add global CSS optimization styles
     */
    private addGlobalOptimizationStyles(): void {
        const styleId = 'hardware-acceleration-optimizations';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Hardware acceleration base classes */
            .gpu-accelerated {
                transform: translateZ(0);
                -webkit-transform: translateZ(0);
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
                perspective: 1000px;
                -webkit-perspective: 1000px;
            }
            
            .composite-layer {
                will-change: transform;
                transform: translateZ(0);
                isolation: isolate;
            }
            
            .optimized-transform {
                transform: translate3d(0, 0, 0);
                -webkit-transform: translate3d(0, 0, 0);
            }
            
            /* Smooth scrolling optimization */
            .smooth-scroll {
                -webkit-overflow-scrolling: touch;
                scroll-behavior: smooth;
            }
            
            /* Animation optimization classes */
            .animate-optimized {
                will-change: transform, opacity;
                transform: translateZ(0);
                backface-visibility: hidden;
            }
            
            .animate-optimized.animating {
                will-change: transform, opacity;
            }
            
            .animate-optimized:not(.animating) {
                will-change: auto;
            }
            
            /* Prevent layout thrashing */
            .no-layout-shift {
                contain: layout style paint;
            }
            
            /* GPU layer promotion for specific elements */
            .force-layer {
                transform: translateZ(0);
                will-change: transform;
                isolation: isolate;
            }
            
            /* Optimized opacity changes */
            .opacity-optimized {
                will-change: opacity;
                backface-visibility: hidden;
            }
            
            /* 3D context optimization */
            .preserve-3d {
                transform-style: preserve-3d;
                -webkit-transform-style: preserve-3d;
            }
            
            /* Subpixel rendering optimization */
            .subpixel-optimized {
                -webkit-font-smoothing: subpixel-antialiased;
                -moz-osx-font-smoothing: auto;
                text-rendering: optimizeSpeed;
            }
            
            /* Reduce paint complexity */
            .paint-optimized {
                contain: paint;
                will-change: contents;
            }
            
            /* Mobile-specific optimizations */
            @media (max-width: 768px) {
                .mobile-gpu-optimized {
                    transform: translate3d(0, 0, 0);
                    -webkit-transform: translate3d(0, 0, 0);
                    will-change: transform;
                }
            }
            
            /* Reduced motion fallbacks */
            @media (prefers-reduced-motion: reduce) {
                .animate-optimized {
                    will-change: auto;
                    transform: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Analyze rendering performance
     */
    private analyzeRenderingPerformance(entry: PerformanceEntry): void {
        // Track performance metrics for optimization decisions
        if (entry.entryType === 'layout-shift') {
            const layoutShift = entry as any;
            if (layoutShift.value > 0.1) {
                console.warn('High layout shift detected:', layoutShift.value);
                this.optimizeLayoutStability();
            }
        }
    }

    /**
     * Optimize element for hardware acceleration
     */
    public optimizeElement(
        element: HTMLElement,
        options: AccelerationOptions = {}
    ): AccelerationResult {
        const {
            forceLayer = false,
            optimizeTransforms = true,
            optimizeOpacity = true,
            preventLayoutShift = true,
            useWillChange = true,
        } = options;

        if (this.layerCount >= this.maxLayers && forceLayer) {
            console.warn('Maximum composite layers reached. Skipping layer promotion.');
            return { success: false, reason: 'max_layers_reached' };
        }

        const optimizations: string[] = [];

        // Add base GPU acceleration
        if (optimizeTransforms) {
            element.classList.add('gpu-accelerated');
            optimizations.push('gpu-acceleration');
        }

        // Force composite layer if requested
        if (forceLayer) {
            element.classList.add('composite-layer');
            this.compositeLayerElements.add(element);
            this.layerCount++;
            optimizations.push('composite-layer');
        }

        // Optimize transforms
        if (optimizeTransforms) {
            element.classList.add('optimized-transform');
            optimizations.push('transform-optimization');
        }

        // Optimize opacity changes
        if (optimizeOpacity) {
            element.classList.add('opacity-optimized');
            optimizations.push('opacity-optimization');
        }

        // Prevent layout shifts
        if (preventLayoutShift) {
            element.classList.add('no-layout-shift');
            optimizations.push('layout-stability');
        }

        // Set will-change property
        if (useWillChange) {
            this.setWillChange(element, ['transform', 'opacity']);
            optimizations.push('will-change');
        }

        this.acceleratedElements.add(element);

        return {
            success: true,
            optimizations,
            layerPromoted: forceLayer,
        };
    }

    /**
     * Set will-change property intelligently
     */
    public setWillChange(element: HTMLElement, properties: string[]): void {
        const existingProperties = this.willChangeElements.get(element) || [];
        const newProperties = [...new Set([...existingProperties, ...properties])];
        
        this.willChangeElements.set(element, newProperties);
        element.style.willChange = newProperties.join(', ');
    }

    /**
     * Remove will-change property
     */
    public removeWillChange(element: HTMLElement, properties?: string[]): void {
        if (!properties) {
            // Remove all will-change properties
            element.style.willChange = 'auto';
            this.willChangeElements.delete(element);
            return;
        }

        const existingProperties = this.willChangeElements.get(element) || [];
        const remainingProperties = existingProperties.filter(prop => !properties.includes(prop));
        
        if (remainingProperties.length === 0) {
            element.style.willChange = 'auto';
            this.willChangeElements.delete(element);
        } else {
            this.willChangeElements.set(element, remainingProperties);
            element.style.willChange = remainingProperties.join(', ');
        }
    }

    /**
     * Optimize animation for hardware acceleration
     */
    public optimizeAnimation(
        element: HTMLElement,
        animationConfig: AnimationConfig
    ): OptimizedAnimationConfig {
        const {
            properties,
            duration,
            easing,
            useGPU = true,
            forceLayer = false,
        } = animationConfig;

        // Optimize element for animation
        if (useGPU) {
            this.optimizeElement(element, {
                forceLayer,
                optimizeTransforms: properties.includes('transform'),
                optimizeOpacity: properties.includes('opacity'),
            });
        }

        // Set will-change for animation properties
        element.classList.add('animate-optimized', 'animating');
        this.setWillChange(element, properties);

        // Return optimized configuration
        const optimizedConfig: OptimizedAnimationConfig = {
            ...animationConfig,
            force3D: useGPU,
            onStart: () => {
                element.classList.add('animating');
                animationConfig.onStart?.();
            },
            onComplete: () => {
                element.classList.remove('animating');
                this.removeWillChange(element, properties);
                animationConfig.onComplete?.();
            },
        };

        return optimizedConfig;
    }

    /**
     * Optimize scroll performance
     */
    public optimizeScrollPerformance(container: HTMLElement): void {
        container.classList.add('smooth-scroll');
        
        // Use passive event listeners for better scroll performance
        const passiveSupported = this.supportsPassiveEvents();
        
        if (passiveSupported) {
            container.addEventListener('scroll', () => {
                // Throttled scroll handler
                this.throttledScrollHandler(container);
            }, { passive: true });
        }

        // Optimize scroll children
        const scrollChildren = container.querySelectorAll('*');
        scrollChildren.forEach((child) => {
            if (child instanceof HTMLElement) {
                child.classList.add('paint-optimized');
            }
        });
    }

    /**
     * Throttled scroll handler
     */
    private throttledScrollHandler = this.throttle((container: HTMLElement) => {
        // Handle scroll optimizations
        this.updateScrollOptimizations(container);
    }, 16); // ~60fps

    /**
     * Update scroll-based optimizations
     */
    private updateScrollOptimizations(container: HTMLElement): void {
        // Implement scroll-based optimizations like viewport culling
        const rect = container.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Optimize elements based on viewport visibility
        const children = container.querySelectorAll('.gpu-accelerated');
        children.forEach((child) => {
            if (child instanceof HTMLElement) {
                const childRect = child.getBoundingClientRect();
                const isVisible = childRect.bottom >= 0 && childRect.top <= viewportHeight;
                
                if (!isVisible) {
                    // Remove expensive properties for off-screen elements
                    this.removeWillChange(child);
                } else {
                    // Re-add optimizations for visible elements
                    this.setWillChange(child, ['transform']);
                }
            }
        });
    }

    /**
     * Check if passive events are supported
     */
    private supportsPassiveEvents(): boolean {
        let passiveSupported = false;
        try {
            const options = {
                get passive() {
                    passiveSupported = true;
                    return false;
                },
            };
            window.addEventListener('test', () => {}, options);
            window.removeEventListener('test', () => {}, options);
        } catch (err) {
            passiveSupported = false;
        }
        return passiveSupported;
    }

    /**
     * Throttle function
     */
    private throttle<T extends (...args: any[]) => any>(
        func: T,
        limit: number
    ): (...args: Parameters<T>) => void {
        let inThrottle: boolean;
        return function (this: any, ...args: Parameters<T>) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }

    /**
     * Optimize layout stability
     */
    private optimizeLayoutStability(): void {
        // Add layout stability optimizations to problematic elements
        const elements = document.querySelectorAll('img, video, iframe');
        elements.forEach((element) => {
            if (element instanceof HTMLElement) {
                element.classList.add('no-layout-shift');
            }
        });
    }

    /**
     * Get GPU layer information
     */
    public getLayerInfo(): LayerInfo {
        return {
            totalLayers: this.layerCount,
            maxLayers: this.maxLayers,
            acceleratedElements: this.acceleratedElements.size,
            compositeElements: this.compositeLayerElements.size,
            willChangeElements: this.willChangeElements.size,
        };
    }

    /**
     * Check if element is hardware accelerated
     */
    public isAccelerated(element: HTMLElement): boolean {
        return this.acceleratedElements.has(element);
    }

    /**
     * Remove hardware acceleration from element
     */
    public removeAcceleration(element: HTMLElement): void {
        element.classList.remove(
            'gpu-accelerated',
            'composite-layer',
            'optimized-transform',
            'opacity-optimized',
            'no-layout-shift',
            'animate-optimized'
        );

        this.removeWillChange(element);
        this.acceleratedElements.delete(element);
        
        if (this.compositeLayerElements.has(element)) {
            this.compositeLayerElements.delete(element);
            this.layerCount--;
        }
    }

    /**
     * Optimize for mobile devices
     */
    public optimizeForMobile(): void {
        // Add mobile-specific optimizations
        document.body.classList.add('mobile-gpu-optimized');
        
        // Reduce layer count for mobile
        this.maxLayers = 25;
        
        // Optimize existing elements for mobile
        this.acceleratedElements.forEach((element) => {
            element.classList.add('mobile-gpu-optimized');
        });
    }

    /**
     * Get optimization recommendations
     */
    public getOptimizationRecommendations(): string[] {
        const recommendations: string[] = [];
        
        if (this.layerCount > this.maxLayers * 0.8) {
            recommendations.push('Consider reducing the number of composite layers to improve memory usage.');
        }
        
        if (this.willChangeElements.size > 20) {
            recommendations.push('Too many elements with will-change property. Consider removing will-change from inactive elements.');
        }
        
        if (this.acceleratedElements.size === 0) {
            recommendations.push('No elements are hardware accelerated. Consider optimizing key interactive elements.');
        }
        
        return recommendations;
    }

    /**
     * Cleanup all optimizations
     */
    public cleanup(): void {
        // Remove all acceleration classes
        this.acceleratedElements.forEach((element) => {
            this.removeAcceleration(element);
        });

        // Clear collections
        this.acceleratedElements.clear();
        this.compositeLayerElements.clear();
        this.willChangeElements.clear();

        // Disconnect performance observer
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
            this.performanceObserver = null;
        }

        // Remove global styles
        const style = document.getElementById('hardware-acceleration-optimizations');
        if (style) {
            style.remove();
        }

        this.layerCount = 0;
    }
}

// Type definitions
interface AccelerationOptions {
    forceLayer?: boolean;
    optimizeTransforms?: boolean;
    optimizeOpacity?: boolean;
    preventLayoutShift?: boolean;
    useWillChange?: boolean;
}

interface AccelerationResult {
    success: boolean;
    optimizations?: string[];
    layerPromoted?: boolean;
    reason?: string;
}

interface AnimationConfig {
    properties: string[];
    duration: number;
    easing: string;
    useGPU?: boolean;
    forceLayer?: boolean;
    onStart?: () => void;
    onComplete?: () => void;
}

interface OptimizedAnimationConfig extends AnimationConfig {
    force3D: boolean;
}

interface LayerInfo {
    totalLayers: number;
    maxLayers: number;
    acceleratedElements: number;
    compositeElements: number;
    willChangeElements: number;
}

// Export singleton instance
export const hardwareAccelerationOptimizer = HardwareAccelerationOptimizer.getInstance();

// Auto-optimize for mobile devices
if (typeof window !== 'undefined') {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
    
    if (isMobile) {
        hardwareAccelerationOptimizer.optimizeForMobile();
    }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        hardwareAccelerationOptimizer.cleanup();
    });
}