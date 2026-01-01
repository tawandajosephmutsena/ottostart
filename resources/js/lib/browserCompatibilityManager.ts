/**
 * Browser Compatibility Manager
 * Handles fallback animations and progressive enhancement for older browsers
 */
export class BrowserCompatibilityManager {
    private static instance: BrowserCompatibilityManager;
    private browserInfo: BrowserInfo;
    private supportedFeatures: SupportedFeatures;
    private fallbackStyles: HTMLStyleElement | null = null;

    private constructor() {
        this.browserInfo = this.detectBrowser();
        this.supportedFeatures = this.detectFeatureSupport();
        this.setupFallbacks();
    }

    public static getInstance(): BrowserCompatibilityManager {
        if (!BrowserCompatibilityManager.instance) {
            BrowserCompatibilityManager.instance = new BrowserCompatibilityManager();
        }
        return BrowserCompatibilityManager.instance;
    }

    /**
     * Detect browser information
     */
    private detectBrowser(): BrowserInfo {
        if (typeof navigator === 'undefined') {
            return {
                name: 'unknown',
                version: 0,
                isModern: true,
                supportsES6: true,
            };
        }

        const userAgent = navigator.userAgent;
        let browserName = 'unknown';
        let version = 0;

        // Detect browser
        if (userAgent.includes('Chrome')) {
            browserName = 'chrome';
            const match = userAgent.match(/Chrome\/(\d+)/);
            version = match ? parseInt(match[1]) : 0;
        } else if (userAgent.includes('Firefox')) {
            browserName = 'firefox';
            const match = userAgent.match(/Firefox\/(\d+)/);
            version = match ? parseInt(match[1]) : 0;
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browserName = 'safari';
            const match = userAgent.match(/Version\/(\d+)/);
            version = match ? parseInt(match[1]) : 0;
        } else if (userAgent.includes('Edge')) {
            browserName = 'edge';
            const match = userAgent.match(/Edge\/(\d+)/);
            version = match ? parseInt(match[1]) : 0;
        } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
            browserName = 'ie';
            const match = userAgent.match(/(?:MSIE |rv:)(\d+)/);
            version = match ? parseInt(match[1]) : 0;
        }

        const isModern = this.isModernBrowser(browserName, version);
        const supportsES6 = this.supportsES6Features();

        return {
            name: browserName,
            version,
            isModern,
            supportsES6,
        };
    }

    /**
     * Check if browser is modern
     */
    private isModernBrowser(name: string, version: number): boolean {
        const modernVersions: Record<string, number> = {
            chrome: 60,
            firefox: 55,
            safari: 12,
            edge: 79,
            ie: 0, // IE is never considered modern
        };

        return version >= (modernVersions[name] || 0);
    }

    /**
     * Check ES6 support
     */
    private supportsES6Features(): boolean {
        try {
            // Test for basic ES6 features
            eval('const test = () => {}; class Test {}');
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Detect feature support
     */
    private detectFeatureSupport(): SupportedFeatures {
        if (typeof window === 'undefined') {
            return {
                transforms3d: false,
                transitions: false,
                animations: false,
                flexbox: false,
                grid: false,
                willChange: false,
                intersectionObserver: false,
                requestAnimationFrame: false,
                webGL: false,
            };
        }

        const testElement = document.createElement('div');
        const style = testElement.style;

        return {
            transforms3d: this.supportsTransforms3D(),
            transitions: 'transition' in style,
            animations: 'animation' in style,
            flexbox: 'flex' in style || 'webkitFlex' in style,
            grid: 'grid' in style,
            willChange: 'willChange' in style,
            intersectionObserver: 'IntersectionObserver' in window,
            requestAnimationFrame: 'requestAnimationFrame' in window,
            webGL: this.supportsWebGL(),
        };
    }

    /**
     * Check 3D transforms support
     */
    private supportsTransforms3D(): boolean {
        const testElement = document.createElement('div');
        testElement.style.transform = 'translateZ(0)';
        return testElement.style.transform !== '';
    }

    /**
     * Check WebGL support
     */
    private supportsWebGL(): boolean {
        try {
            const canvas = document.createElement('canvas');
            return !!(
                window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
            );
        } catch {
            return false;
        }
    }

    /**
     * Setup fallback styles and polyfills
     */
    private setupFallbacks(): void {
        this.addFallbackStyles();
        this.setupPolyfills();
        this.addBrowserClasses();
    }

    /**
     * Add fallback CSS styles
     */
    private addFallbackStyles(): void {
        const styleId = 'browser-compatibility-fallbacks';
        if (document.getElementById(styleId)) return;

        this.fallbackStyles = document.createElement('style');
        this.fallbackStyles.id = styleId;
        
        let css = `
            /* Base fallback styles */
            .fallback-animation {
                transition: all 0.3s ease;
            }
            
            .fallback-fade {
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .fallback-fade.active {
                opacity: 1;
            }
            
            .fallback-slide {
                transform: translateY(20px);
                transition: transform 0.3s ease;
            }
            
            .fallback-slide.active {
                transform: translateY(0);
            }
            
            .fallback-scale {
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .fallback-scale.active {
                transform: scale(1);
            }
        `;

        // Add browser-specific fallbacks
        if (!this.supportedFeatures.transforms3d) {
            css += `
                /* 2D transform fallbacks */
                .gpu-accelerated {
                    position: relative;
                }
                
                .parallax-fallback {
                    position: relative;
                    top: 0;
                    transition: top 0.1s linear;
                }
            `;
        }

        if (!this.supportedFeatures.transitions) {
            css += `
                /* No transition support - instant changes */
                .fallback-animation,
                .fallback-fade,
                .fallback-slide,
                .fallback-scale {
                    transition: none !important;
                }
            `;
        }

        if (!this.supportedFeatures.flexbox) {
            css += `
                /* Flexbox fallbacks */
                .flex-fallback {
                    display: block;
                }
                
                .flex-fallback > * {
                    display: inline-block;
                    vertical-align: top;
                }
            `;
        }

        if (this.browserInfo.name === 'ie') {
            css += `
                /* Internet Explorer specific fixes */
                .ie-fix {
                    zoom: 1;
                }
                
                .ie-opacity {
                    filter: alpha(opacity=100);
                }
                
                .ie-opacity.fade-out {
                    filter: alpha(opacity=0);
                }
            `;
        }

        this.fallbackStyles.textContent = css;
        document.head.appendChild(this.fallbackStyles);
    }

    /**
     * Setup polyfills for missing features
     */
    private setupPolyfills(): void {
        // RequestAnimationFrame polyfill
        if (!this.supportedFeatures.requestAnimationFrame) {
            this.polyfillRequestAnimationFrame();
        }

        // IntersectionObserver polyfill (simplified)
        if (!this.supportedFeatures.intersectionObserver) {
            this.polyfillIntersectionObserver();
        }
    }

    /**
     * RequestAnimationFrame polyfill
     */
    private polyfillRequestAnimationFrame(): void {
        let lastTime = 0;
        
        (window as any).requestAnimationFrame = (callback: FrameRequestCallback) => {
            const currTime = new Date().getTime();
            const timeToCall = Math.max(0, 16 - (currTime - lastTime));
            const id = window.setTimeout(() => {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

        (window as any).cancelAnimationFrame = (id: number) => {
            clearTimeout(id);
        };
    }

    /**
     * Simple IntersectionObserver polyfill
     */
    private polyfillIntersectionObserver(): void {
        if (typeof window === 'undefined') return;

        class IntersectionObserverPolyfill {
            private callback: IntersectionObserverCallback;
            private elements: Set<Element> = new Set();
            private checkInterval: number | null = null;

            constructor(callback: IntersectionObserverCallback) {
                this.callback = callback;
            }

            observe(element: Element): void {
                this.elements.add(element);
                if (!this.checkInterval) {
                    this.startChecking();
                }
            }

            unobserve(element: Element): void {
                this.elements.delete(element);
                if (this.elements.size === 0 && this.checkInterval) {
                    clearInterval(this.checkInterval);
                    this.checkInterval = null;
                }
            }

            disconnect(): void {
                this.elements.clear();
                if (this.checkInterval) {
                    clearInterval(this.checkInterval);
                    this.checkInterval = null;
                }
            }

            private startChecking(): void {
                this.checkInterval = window.setInterval(() => {
                    const entries: IntersectionObserverEntry[] = [];
                    
                    this.elements.forEach((element) => {
                        const rect = element.getBoundingClientRect();
                        const isIntersecting = rect.top < window.innerHeight && rect.bottom > 0;
                        
                        entries.push({
                            target: element,
                            isIntersecting,
                            intersectionRatio: isIntersecting ? 1 : 0,
                            boundingClientRect: rect,
                            intersectionRect: rect,
                            rootBounds: null,
                            time: Date.now(),
                        } as IntersectionObserverEntry);
                    });

                    if (entries.length > 0) {
                        this.callback(entries, this as any);
                    }
                }, 100);
            }
        }

        (window as any).IntersectionObserver = IntersectionObserverPolyfill;
    }

    /**
     * Add browser-specific CSS classes
     */
    private addBrowserClasses(): void {
        const classes = [
            `browser-${this.browserInfo.name}`,
            `browser-version-${this.browserInfo.version}`,
        ];

        if (!this.browserInfo.isModern) {
            classes.push('browser-legacy');
        }

        if (!this.supportedFeatures.transforms3d) {
            classes.push('no-transforms3d');
        }

        if (!this.supportedFeatures.transitions) {
            classes.push('no-transitions');
        }

        if (!this.supportedFeatures.animations) {
            classes.push('no-animations');
        }

        document.documentElement.classList.add(...classes);
    }

    /**
     * Create fallback animation
     */
    public createFallbackAnimation(
        element: HTMLElement,
        animationType: 'fade' | 'slide' | 'scale',
        options: FallbackAnimationOptions = {}
    ): FallbackAnimation {
        const {
            duration = 300,
            delay = 0,
            easing = 'ease',
            useTransitions = this.supportedFeatures.transitions,
        } = options;

        const animation: FallbackAnimation = {
            element,
            type: animationType,
            isActive: false,
            start: () => {
                if (animation.isActive) return;
                
                animation.isActive = true;
                
                if (useTransitions) {
                    element.style.transition = `all ${duration}ms ${easing}`;
                    if (delay > 0) {
                        element.style.transitionDelay = `${delay}ms`;
                    }
                }

                element.classList.add(`fallback-${animationType}`);
                
                // Trigger animation
                requestAnimationFrame(() => {
                    element.classList.add('active');
                });

                // Cleanup after animation
                setTimeout(() => {
                    if (useTransitions) {
                        element.style.transition = '';
                        element.style.transitionDelay = '';
                    }
                    animation.isActive = false;
                }, duration + delay);
            },
            stop: () => {
                element.classList.remove(`fallback-${animationType}`, 'active');
                element.style.transition = '';
                element.style.transitionDelay = '';
                animation.isActive = false;
            },
        };

        return animation;
    }

    /**
     * Create progressive enhancement animation
     */
    public createProgressiveAnimation(
        element: HTMLElement,
        modernAnimation: () => void,
        fallbackAnimation: () => void
    ): void {
        if (this.browserInfo.isModern && this.supportedFeatures.transforms3d) {
            modernAnimation();
        } else {
            fallbackAnimation();
        }
    }

    /**
     * Get animation configuration based on browser capabilities
     */
    public getAnimationConfig(): AnimationConfig {
        if (!this.browserInfo.isModern) {
            return {
                duration: 200,
                easing: 'linear',
                useTransforms: false,
                useOpacity: this.supportedFeatures.transitions,
                complexity: 'low',
            };
        }

        if (!this.supportedFeatures.transforms3d) {
            return {
                duration: 300,
                easing: 'ease',
                useTransforms: false,
                useOpacity: true,
                complexity: 'medium',
            };
        }

        return {
            duration: 600,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            useTransforms: true,
            useOpacity: true,
            complexity: 'high',
        };
    }

    /**
     * Check if feature is supported
     */
    public isSupported(feature: keyof SupportedFeatures): boolean {
        return this.supportedFeatures[feature];
    }

    /**
     * Get browser information
     */
    public getBrowserInfo(): BrowserInfo {
        return { ...this.browserInfo };
    }

    /**
     * Get supported features
     */
    public getSupportedFeatures(): SupportedFeatures {
        return { ...this.supportedFeatures };
    }

    /**
     * Apply fallback for specific element
     */
    public applyFallback(element: HTMLElement, fallbackType: string): void {
        switch (fallbackType) {
            case 'flexbox':
                if (!this.supportedFeatures.flexbox) {
                    element.classList.add('flex-fallback');
                }
                break;
            case 'transforms':
                if (!this.supportedFeatures.transforms3d) {
                    element.classList.add('no-transforms3d');
                }
                break;
            case 'animations':
                if (!this.supportedFeatures.animations) {
                    element.classList.add('no-animations');
                }
                break;
        }
    }

    /**
     * Cleanup fallbacks
     */
    public cleanup(): void {
        if (this.fallbackStyles) {
            this.fallbackStyles.remove();
            this.fallbackStyles = null;
        }

        // Remove browser classes
        const classes = document.documentElement.classList;
        Array.from(classes).forEach((className) => {
            if (className.startsWith('browser-') || className.startsWith('no-')) {
                classes.remove(className);
            }
        });
    }
}

// Type definitions
interface BrowserInfo {
    name: string;
    version: number;
    isModern: boolean;
    supportsES6: boolean;
}

interface SupportedFeatures {
    transforms3d: boolean;
    transitions: boolean;
    animations: boolean;
    flexbox: boolean;
    grid: boolean;
    willChange: boolean;
    intersectionObserver: boolean;
    requestAnimationFrame: boolean;
    webGL: boolean;
}

interface FallbackAnimationOptions {
    duration?: number;
    delay?: number;
    easing?: string;
    useTransitions?: boolean;
}

interface FallbackAnimation {
    element: HTMLElement;
    type: string;
    isActive: boolean;
    start: () => void;
    stop: () => void;
}

interface AnimationConfig {
    duration: number;
    easing: string;
    useTransforms: boolean;
    useOpacity: boolean;
    complexity: 'low' | 'medium' | 'high';
}

// Export singleton instance
export const browserCompatibilityManager = BrowserCompatibilityManager.getInstance();

// Auto-initialize
if (typeof window !== 'undefined') {
    // Add compatibility information to window for debugging
    (window as any).__browserCompatibility = {
        info: browserCompatibilityManager.getBrowserInfo(),
        features: browserCompatibilityManager.getSupportedFeatures(),
    };
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        browserCompatibilityManager.cleanup();
    });
}