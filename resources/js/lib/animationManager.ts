import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { accessibilityManager } from './accessibilityManager';
import { animationPerformanceMonitor } from './animationPerformanceMonitor';
import { mobileAnimationOptimizer } from './mobileAnimationOptimizer';
import { hardwareAccelerationOptimizer } from './hardwareAccelerationOptimizer';
import { browserCompatibilityManager } from './browserCompatibilityManager';

/**
 * Animation Manager for optimized GSAP performance and memory management
 * Handles proper cleanup, intersection observers, and performance monitoring
 */
export class AnimationManager {
    private static instance: AnimationManager;
    private activeTimelines: Set<gsap.core.Timeline> = new Set();
    private activeScrollTriggers: Set<ScrollTrigger> = new Set();
    private intersectionObservers: Set<IntersectionObserver> = new Set();
    private performanceMetrics: Map<string, number[]> = new Map();
    private isReducedMotion: boolean = false;

    private constructor() {
        this.initializeReducedMotionDetection();
        this.setupPerformanceMonitoring();
    }

    public static getInstance(): AnimationManager {
        if (!AnimationManager.instance) {
            AnimationManager.instance = new AnimationManager();
        }
        return AnimationManager.instance;
    }

    /**
     * Initialize reduced motion detection
     */
    private initializeReducedMotionDetection(): void {
        if (typeof window === 'undefined') return;

        // Use accessibility manager for reduced motion detection
        this.isReducedMotion = accessibilityManager.prefersReducedMotion();

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addEventListener('change', (e) => {
            this.isReducedMotion = e.matches;
            if (this.isReducedMotion) {
                this.disableAllAnimations();
            }
        });
    }

    /**
     * Setup performance monitoring
     */
    private setupPerformanceMonitoring(): void {
        if (typeof window === 'undefined') return;

        // Monitor frame rate
        let frameCount = 0;
        let lastTime = performance.now();

        const measureFrameRate = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                this.recordMetric('fps', fps);
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFrameRate);
        };

        requestAnimationFrame(measureFrameRate);
    }

    /**
     * Record performance metric
     */
    private recordMetric(name: string, value: number): void {
        if (!this.performanceMetrics.has(name)) {
            this.performanceMetrics.set(name, []);
        }
        
        const metrics = this.performanceMetrics.get(name)!;
        metrics.push(value);
        
        // Keep only last 100 measurements
        if (metrics.length > 100) {
            metrics.shift();
        }
    }

    /**
     * Get performance metrics
     */
    public getPerformanceMetrics(): Record<string, { avg: number; min: number; max: number }> {
        const result: Record<string, { avg: number; min: number; max: number }> = {};
        
        this.performanceMetrics.forEach((values, name) => {
            if (values.length > 0) {
                const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
                const min = Math.min(...values);
                const max = Math.max(...values);
                result[name] = { avg: Math.round(avg), min, max };
            }
        });
        
        return result;
    }

    /**
     * Register a timeline for cleanup tracking
     */
    public registerTimeline(timeline: gsap.core.Timeline): void {
        this.activeTimelines.add(timeline);
        
        // Auto-cleanup when timeline completes
        timeline.eventCallback('onComplete', () => {
            this.activeTimelines.delete(timeline);
        });
    }

    /**
     * Register a ScrollTrigger for cleanup tracking
     */
    public registerScrollTrigger(trigger: ScrollTrigger): void {
        this.activeScrollTriggers.add(trigger);
    }

    /**
     * Create optimized intersection observer
     */
    public createIntersectionObserver(
        callback: IntersectionObserverCallback,
        options: IntersectionObserverInit = {}
    ): IntersectionObserver {
        const defaultOptions: IntersectionObserverInit = {
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px',
            ...options,
        };

        const observer = new IntersectionObserver(callback, defaultOptions);
        this.intersectionObservers.add(observer);
        
        return observer;
    }

    /**
     * Create optimized ScrollTrigger with automatic cleanup
     */
    public createScrollTrigger(config: ScrollTrigger.Vars): ScrollTrigger {
        if (this.isReducedMotion) {
            // Return a dummy ScrollTrigger for reduced motion
            return {
                kill: () => {},
                refresh: () => {},
            } as ScrollTrigger;
        }

        const trigger = ScrollTrigger.create({
            ...config,
            onRefresh: (self) => {
                this.recordMetric('scrolltrigger_refresh', performance.now());
                config.onRefresh?.(self);
            },
        });

        this.registerScrollTrigger(trigger);
        return trigger;
    }

    /**
     * Create performance-optimized animation with intersection observer
     */
    public createOptimizedAnimation(
        element: HTMLElement,
        animation: gsap.TweenVars,
        options: {
            trigger?: HTMLElement | string;
            threshold?: number;
            rootMargin?: string;
            once?: boolean;
        } = {}
    ): { cleanup: () => void } {
        if (this.isReducedMotion) {
            // Apply final state immediately for reduced motion
            gsap.set(element, {
                opacity: animation.opacity ?? 1,
                x: 0,
                y: 0,
                scale: animation.scale ?? 1,
            });
            return { cleanup: () => {} };
        }

        const {
            trigger = element,
            threshold = 0.1,
            rootMargin = '0px 0px -10% 0px',
            once = true,
        } = options;

        let hasAnimated = false;
        let timeline: gsap.core.Timeline | null = null;
        const animationId = `animation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Optimize element for hardware acceleration
        const accelerationResult = hardwareAccelerationOptimizer.optimizeElement(element, {
            optimizeTransforms: true,
            optimizeOpacity: true,
            useWillChange: true,
        });

        const observer = this.createIntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && (!once || !hasAnimated)) {
                        // Start performance measurement
                        animationPerformanceMonitor.startAnimationMeasure(animationId);
                        
                        // Set will-change for animation properties
                        const animationProperties: string[] = [];
                        if (animation.x !== undefined || animation.y !== undefined) {
                            animationProperties.push('transform');
                        }
                        if (animation.opacity !== undefined) {
                            animationProperties.push('opacity');
                        }
                        
                        hardwareAccelerationOptimizer.setWillChange(element, animationProperties);
                        
                        timeline = gsap.timeline();
                        timeline.to(element, {
                            ...animation,
                            force3D: true, // Force hardware acceleration
                            onComplete: () => {
                                // End performance measurement
                                animationPerformanceMonitor.endAnimationMeasure(animationId, {
                                    element: element.tagName,
                                    className: element.className,
                                    animationType: 'intersection',
                                    hardwareAccelerated: accelerationResult.success,
                                });
                                
                                // Remove will-change after animation
                                hardwareAccelerationOptimizer.removeWillChange(element, animationProperties);
                                
                                animation.onComplete?.();
                            },
                        });
                        
                        this.registerTimeline(timeline);
                        hasAnimated = true;

                        if (once) {
                            observer.unobserve(entry.target);
                        }
                    }
                });
            },
            { threshold, rootMargin }
        );

        const targetElement = typeof trigger === 'string' 
            ? document.querySelector(trigger) as HTMLElement
            : trigger;

        if (targetElement) {
            observer.observe(targetElement);
        }

        return {
            cleanup: () => {
                observer.disconnect();
                this.intersectionObservers.delete(observer);
                if (timeline) {
                    timeline.kill();
                    this.activeTimelines.delete(timeline);
                }
                // Remove hardware acceleration optimizations
                if (accelerationResult.success) {
                    hardwareAccelerationOptimizer.removeAcceleration(element);
                }
            },
        };
    }

    /**
     * Batch DOM reads and writes for better performance
     */
    public batchDOMOperations(operations: Array<() => void>): void {
        // Use requestAnimationFrame to batch DOM operations
        requestAnimationFrame(() => {
            operations.forEach(operation => operation());
        });
    }

    /**
     * Disable all animations for reduced motion
     */
    private disableAllAnimations(): void {
        // Kill all active timelines
        this.activeTimelines.forEach(timeline => timeline.kill());
        this.activeTimelines.clear();

        // Kill all ScrollTriggers
        this.activeScrollTriggers.forEach(trigger => trigger.kill());
        this.activeScrollTriggers.clear();

        // Set GSAP to instant animations
        gsap.globalTimeline.timeScale(1000);
    }

    /**
     * Cleanup all animations and observers
     */
    public cleanup(): void {
        // Kill all active timelines
        this.activeTimelines.forEach(timeline => timeline.kill());
        this.activeTimelines.clear();

        // Kill all ScrollTriggers
        this.activeScrollTriggers.forEach(trigger => trigger.kill());
        this.activeScrollTriggers.clear();

        // Disconnect all intersection observers
        this.intersectionObservers.forEach(observer => observer.disconnect());
        this.intersectionObservers.clear();

        // Clear performance metrics
        this.performanceMetrics.clear();
    }

    /**
     * Get current animation statistics
     */
    public getStats(): {
        activeTimelines: number;
        activeScrollTriggers: number;
        activeObservers: number;
        isReducedMotion: boolean;
        performance: Record<string, { avg: number; min: number; max: number }>;
    } {
        return {
            activeTimelines: this.activeTimelines.size,
            activeScrollTriggers: this.activeScrollTriggers.size,
            activeObservers: this.intersectionObservers.size,
            isReducedMotion: this.isReducedMotion,
            performance: this.getPerformanceMetrics(),
        };
    }

    /**
     * Check if device is low-powered (mobile/tablet)
     */
    public isLowPoweredDevice(): boolean {
        if (typeof navigator === 'undefined') return false;
        
        // Check for mobile devices
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
        
        // Check for limited hardware concurrency
        const limitedCores = Boolean(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
        
        // Check for limited memory (if available) - deviceMemory is not in standard Navigator type
        const nav = navigator as Navigator & { deviceMemory?: number };
        const limitedMemory = Boolean(nav.deviceMemory && nav.deviceMemory <= 4);
        
        return isMobile || limitedCores || limitedMemory;
    }

    /**
     * Get optimized animation settings based on device capabilities
     */
    public getOptimizedSettings(): {
        duration: number;
        ease: string;
        stagger: number;
        quality: 'high' | 'medium' | 'low';
    } {
        const isLowPowered = this.isLowPoweredDevice();
        const avgFps = this.getPerformanceMetrics().fps?.avg || 60;
        const mobileSettings = mobileAnimationOptimizer.getMobileOptimizedSettings();
        const browserConfig = browserCompatibilityManager.getAnimationConfig();
        
        if (this.isReducedMotion) {
            return {
                duration: 0,
                ease: 'none',
                stagger: 0,
                quality: 'low',
            };
        }

        // Use browser-compatible settings for legacy browsers
        if (!browserCompatibilityManager.getBrowserInfo().isModern) {
            return {
                duration: browserConfig.duration / 1000, // Convert to seconds
                ease: browserConfig.easing === 'linear' ? 'none' : 'power1.out',
                stagger: 0.02,
                quality: 'low',
            };
        }

        // Use mobile-optimized settings if on mobile device
        if (mobileAnimationOptimizer.getDeviceInfo().isMobile) {
            return {
                duration: mobileSettings.duration,
                ease: mobileSettings.ease,
                stagger: mobileSettings.stagger,
                quality: mobileSettings.quality,
            };
        }
        
        if (isLowPowered || avgFps < 30) {
            return {
                duration: 0.3,
                ease: 'power1.out',
                stagger: 0.05,
                quality: 'low',
            };
        }
        
        if (avgFps < 50) {
            return {
                duration: 0.5,
                ease: 'power2.out',
                stagger: 0.08,
                quality: 'medium',
            };
        }
        
        return {
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.1,
            quality: 'high',
        };
    }
}

// Export singleton instance
export const animationManager = AnimationManager.getInstance();

// Cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        animationManager.cleanup();
    });
}