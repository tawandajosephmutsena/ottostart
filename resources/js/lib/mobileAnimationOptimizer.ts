/**
 * Mobile Animation Optimizer
 * Optimizes animations for mobile devices and touch interactions
 */
export class MobileAnimationOptimizer {
    private static instance: MobileAnimationOptimizer;
    private isMobile: boolean = false;
    private isLowPowered: boolean = false;
    private touchSupported: boolean = false;
    private devicePixelRatio: number = 1;
    private connectionSpeed: string = 'unknown';
    private batteryLevel: number = 1;
    private optimizationLevel: 'high' | 'medium' | 'low' = 'high';

    private constructor() {
        this.detectDeviceCapabilities();
        this.setupTouchOptimizations();
        this.monitorBatteryStatus();
        this.monitorNetworkConditions();
    }

    public static getInstance(): MobileAnimationOptimizer {
        if (!MobileAnimationOptimizer.instance) {
            MobileAnimationOptimizer.instance = new MobileAnimationOptimizer();
        }
        return MobileAnimationOptimizer.instance;
    }

    /**
     * Detect device capabilities and limitations
     */
    private detectDeviceCapabilities(): void {
        if (typeof window === 'undefined') return;

        // Detect mobile device
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );

        // Detect touch support
        this.touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Get device pixel ratio
        this.devicePixelRatio = window.devicePixelRatio || 1;

        // Detect low-powered device
        this.isLowPowered = this.detectLowPoweredDevice();

        // Set optimization level based on device capabilities
        this.optimizationLevel = this.determineOptimizationLevel();
    }

    /**
     * Detect if device is low-powered
     */
    private detectLowPoweredDevice(): boolean {
        // Check hardware concurrency (CPU cores)
        const cores = navigator.hardwareConcurrency || 4;
        if (cores <= 2) return true;

        // Check device memory (if available)
        const memory = (navigator as any).deviceMemory;
        if (memory && memory <= 2) return true;

        // Check for specific low-powered devices
        const userAgent = navigator.userAgent.toLowerCase();
        const lowPoweredPatterns = [
            'android 4',
            'android 5',
            'iphone 5',
            'iphone 6',
            'ipad 2',
            'ipad 3',
        ];

        return lowPoweredPatterns.some(pattern => userAgent.includes(pattern));
    }

    /**
     * Determine optimization level based on device capabilities
     */
    private determineOptimizationLevel(): 'high' | 'medium' | 'low' {
        if (this.isLowPowered || this.batteryLevel < 0.2) {
            return 'low';
        }

        if (this.isMobile || this.devicePixelRatio > 2) {
            return 'medium';
        }

        return 'high';
    }

    /**
     * Setup touch-specific optimizations
     */
    private setupTouchOptimizations(): void {
        if (!this.touchSupported) return;

        // Add CSS for touch optimizations
        this.addTouchOptimizationStyles();

        // Setup touch event optimizations
        this.setupTouchEventOptimizations();
    }

    /**
     * Add CSS styles for touch optimization
     */
    private addTouchOptimizationStyles(): void {
        const styleId = 'mobile-animation-optimizations';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Touch optimization styles */
            .touch-optimized {
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
                touch-action: manipulation;
            }
            
            /* Hardware acceleration for mobile */
            .mobile-accelerated {
                transform: translateZ(0);
                -webkit-transform: translateZ(0);
                will-change: transform;
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
            }
            
            /* Reduce motion on low-powered devices */
            @media (max-width: 768px) and (prefers-reduced-motion: no-preference) {
                .mobile-reduced-motion {
                    animation-duration: 0.3s !important;
                    transition-duration: 0.3s !important;
                }
            }
            
            /* Battery saving mode */
            .battery-saving * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
                animation-iteration-count: 1 !important;
            }
            
            /* Touch feedback */
            .touch-feedback {
                transition: transform 0.1s ease-out;
            }
            
            .touch-feedback:active {
                transform: scale(0.95);
            }
            
            /* Smooth scrolling optimization for mobile */
            @media (max-width: 768px) {
                * {
                    -webkit-overflow-scrolling: touch;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Setup touch event optimizations
     */
    private setupTouchEventOptimizations(): void {
        // Use passive event listeners for better scroll performance
        const passiveSupported = this.supportsPassiveEvents();

        if (passiveSupported) {
            // Add passive touch event listeners to improve scroll performance
            document.addEventListener('touchstart', () => {}, { passive: true });
            document.addEventListener('touchmove', () => {}, { passive: true });
        }
    }

    /**
     * Check if passive events are supported
     */
    private supportsPassiveEvents(): boolean {
        let passiveSupported = false;
        try {
            const options = Object.defineProperty({}, 'passive', {
                get: function() {
                    passiveSupported = true;
                    return true;
                }
            });
            const noop = () => {};
            window.addEventListener('testPassive', noop, options as EventListenerOptions);
            window.removeEventListener('testPassive', noop, options as EventListenerOptions);
        } catch (err) {
            passiveSupported = false;
        }
        return passiveSupported;
    }

    /**
     * Monitor battery status for power-saving optimizations
     */
    private monitorBatteryStatus(): void {
        if (typeof navigator === 'undefined' || !(navigator as any).getBattery) return;

        (navigator as any).getBattery().then((battery: any) => {
            this.batteryLevel = battery.level;

            const updateBatteryOptimizations = () => {
                this.batteryLevel = battery.level;
                this.optimizationLevel = this.determineOptimizationLevel();
                this.applyBatteryOptimizations();
            };

            battery.addEventListener('levelchange', updateBatteryOptimizations);
            battery.addEventListener('chargingchange', updateBatteryOptimizations);
        }).catch(() => {
            // Battery API not supported
        });
    }

    /**
     * Apply battery-saving optimizations
     */
    private applyBatteryOptimizations(): void {
        const body = document.body;
        
        if (this.batteryLevel < 0.2) {
            body.classList.add('battery-saving');
        } else {
            body.classList.remove('battery-saving');
        }
    }

    /**
     * Monitor network conditions for adaptive optimizations
     */
    private monitorNetworkConditions(): void {
        if (typeof navigator === 'undefined' || !(navigator as any).connection) return;

        const connection = (navigator as any).connection;
        this.connectionSpeed = connection.effectiveType || 'unknown';

        const updateNetworkOptimizations = () => {
            this.connectionSpeed = connection.effectiveType || 'unknown';
            this.optimizationLevel = this.determineOptimizationLevel();
        };

        connection.addEventListener('change', updateNetworkOptimizations);
    }

    /**
     * Get optimized animation settings for mobile
     */
    public getMobileOptimizedSettings(): {
        duration: number;
        ease: string;
        stagger: number;
        quality: 'high' | 'medium' | 'low';
        useHardwareAcceleration: boolean;
        reducedComplexity: boolean;
    } {
        switch (this.optimizationLevel) {
            case 'low':
                return {
                    duration: 0.2,
                    ease: 'power1.out',
                    stagger: 0.02,
                    quality: 'low',
                    useHardwareAcceleration: true,
                    reducedComplexity: true,
                };
            case 'medium':
                return {
                    duration: 0.4,
                    ease: 'power2.out',
                    stagger: 0.05,
                    quality: 'medium',
                    useHardwareAcceleration: true,
                    reducedComplexity: false,
                };
            case 'high':
            default:
                return {
                    duration: 0.6,
                    ease: 'power2.out',
                    stagger: 0.08,
                    quality: 'high',
                    useHardwareAcceleration: false,
                    reducedComplexity: false,
                };
        }
    }

    /**
     * Optimize element for mobile animations
     */
    public optimizeElementForMobile(element: HTMLElement): void {
        const settings = this.getMobileOptimizedSettings();

        // Add mobile optimization classes
        element.classList.add('touch-optimized');
        
        if (settings.useHardwareAcceleration) {
            element.classList.add('mobile-accelerated');
        }

        if (this.isLowPowered) {
            element.classList.add('mobile-reduced-motion');
        }

        // Add touch feedback for interactive elements
        if (this.isInteractiveElement(element)) {
            element.classList.add('touch-feedback');
        }
    }

    /**
     * Check if element is interactive
     */
    private isInteractiveElement(element: HTMLElement): boolean {
        const interactiveTags = ['button', 'a', 'input', 'textarea', 'select'];
        const hasClickHandler = element.onclick !== null;
        const hasRole = element.getAttribute('role') === 'button';
        
        return interactiveTags.includes(element.tagName.toLowerCase()) || hasClickHandler || hasRole;
    }

    /**
     * Create touch-optimized animation
     */
    public createTouchOptimizedAnimation(
        element: HTMLElement,
        animation: any,
        options: {
            touchFeedback?: boolean;
            preventScrolling?: boolean;
        } = {}
    ): any {
        const { touchFeedback = false, preventScrolling = false } = options;
        const settings = this.getMobileOptimizedSettings();

        // Optimize element
        this.optimizeElementForMobile(element);

        // Apply mobile-optimized animation settings
        const optimizedAnimation = {
            ...animation,
            duration: settings.duration,
            ease: settings.ease,
            force3D: settings.useHardwareAcceleration,
        };

        // Add touch feedback if requested
        if (touchFeedback && this.touchSupported) {
            this.addTouchFeedback(element);
        }

        // Prevent scrolling during animation if requested
        if (preventScrolling && this.touchSupported) {
            this.preventScrollDuringAnimation(element);
        }

        return optimizedAnimation;
    }

    /**
     * Add touch feedback to element
     */
    private addTouchFeedback(element: HTMLElement): void {
        let isPressed = false;

        const handleTouchStart = (e: TouchEvent) => {
            if (!isPressed) {
                isPressed = true;
                element.style.transform = 'scale(0.95)';
                element.style.transition = 'transform 0.1s ease-out';
            }
        };

        const handleTouchEnd = () => {
            if (isPressed) {
                isPressed = false;
                element.style.transform = '';
                setTimeout(() => {
                    element.style.transition = '';
                }, 100);
            }
        };

        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });
        element.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    }

    /**
     * Prevent scrolling during animation
     */
    private preventScrollDuringAnimation(element: HTMLElement): void {
        const handleTouchMove = (e: TouchEvent) => {
            e.preventDefault();
        };

        element.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    /**
     * Get device information
     */
    public getDeviceInfo(): {
        isMobile: boolean;
        isLowPowered: boolean;
        touchSupported: boolean;
        devicePixelRatio: number;
        connectionSpeed: string;
        batteryLevel: number;
        optimizationLevel: string;
    } {
        return {
            isMobile: this.isMobile,
            isLowPowered: this.isLowPowered,
            touchSupported: this.touchSupported,
            devicePixelRatio: this.devicePixelRatio,
            connectionSpeed: this.connectionSpeed,
            batteryLevel: this.batteryLevel,
            optimizationLevel: this.optimizationLevel,
        };
    }

    /**
     * Check if device should use reduced animations
     */
    public shouldUseReducedAnimations(): boolean {
        return this.isLowPowered || this.batteryLevel < 0.3 || this.connectionSpeed === 'slow-2g';
    }

    /**
     * Optimize scroll performance for mobile
     */
    public optimizeScrollPerformance(): void {
        if (!this.isMobile) return;

        // Add momentum scrolling for iOS
        (document.body.style as unknown as Record<string, string>).webkitOverflowScrolling = 'touch';

        // Optimize scroll events
        let ticking = false;

        const optimizedScrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Handle scroll optimizations
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    }

    /**
     * Cleanup mobile optimizations
     */
    public cleanup(): void {
        // Remove added styles
        const style = document.getElementById('mobile-animation-optimizations');
        if (style) {
            style.remove();
        }

        // Remove classes from body
        document.body.classList.remove('battery-saving');
    }
}

// Export singleton instance
export const mobileAnimationOptimizer = MobileAnimationOptimizer.getInstance();

// Auto-initialize on mobile devices
if (typeof window !== 'undefined') {
    mobileAnimationOptimizer.optimizeScrollPerformance();
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        mobileAnimationOptimizer.cleanup();
    });
}