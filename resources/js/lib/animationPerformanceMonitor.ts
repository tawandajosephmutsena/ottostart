/**
 * Animation Performance Monitor
 * Tracks frame rates, memory usage, and animation performance metrics
 */
export class AnimationPerformanceMonitor {
    private static instance: AnimationPerformanceMonitor;
    private isMonitoring: boolean = false;
    private frameCount: number = 0;
    private lastFrameTime: number = 0;
    private frameRates: number[] = [];
    private animationMetrics: Map<string, AnimationMetric[]> = new Map();
    private memoryUsage: MemoryUsage[] = [];
    private performanceObserver: PerformanceObserver | null = null;
    private rafId: number | null = null;

    private constructor() {
        this.initializePerformanceObserver();
    }

    public static getInstance(): AnimationPerformanceMonitor {
        if (!AnimationPerformanceMonitor.instance) {
            AnimationPerformanceMonitor.instance = new AnimationPerformanceMonitor();
        }
        return AnimationPerformanceMonitor.instance;
    }

    /**
     * Initialize Performance Observer for detailed metrics
     */
    private initializePerformanceObserver(): void {
        if (typeof window === 'undefined' || !window.PerformanceObserver) return;

        try {
            this.performanceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.entryType === 'measure' && entry.name.startsWith('animation-')) {
                        this.recordAnimationMetric(entry.name, entry.duration);
                    }
                });
            });

            this.performanceObserver.observe({ entryTypes: ['measure'] });
        } catch (error) {
            console.warn('Performance Observer not supported:', error);
        }
    }

    /**
     * Start monitoring animation performance
     */
    public startMonitoring(): void {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.frameRates = [];

        this.rafId = requestAnimationFrame(this.measureFrameRate.bind(this));
        this.startMemoryMonitoring();
    }

    /**
     * Stop monitoring animation performance
     */
    public stopMonitoring(): void {
        this.isMonitoring = false;
        
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    /**
     * Measure frame rate continuously
     */
    private measureFrameRate(): void {
        if (!this.isMonitoring) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        
        this.frameCount++;

        // Calculate FPS every second
        if (deltaTime >= 1000) {
            const fps = Math.round((this.frameCount * 1000) / deltaTime);
            this.frameRates.push(fps);
            
            // Keep only last 60 seconds of data
            if (this.frameRates.length > 60) {
                this.frameRates.shift();
            }

            this.frameCount = 0;
            this.lastFrameTime = currentTime;

            // Log performance warnings
            if (fps < 20) { // Reduced threshold from 30 to 20 for fewer warnings
                console.warn(`Critical low frame rate: ${fps} FPS`);
            }
        }

        this.rafId = requestAnimationFrame(this.measureFrameRate.bind(this));
    }

    /**
     * Start memory usage monitoring
     */
    private startMemoryMonitoring(): void {
        if (typeof window === 'undefined' || !(performance as any).memory) return;

        const measureMemory = () => {
            if (!this.isMonitoring) return;

            const memory = (performance as any).memory;
            this.memoryUsage.push({
                timestamp: Date.now(),
                usedJSHeapSize: memory.usedJSHeapSize,
                totalJSHeapSize: memory.totalJSHeapSize,
                jsHeapSizeLimit: memory.jsHeapSizeLimit,
            });

            // Keep only last 100 measurements
            if (this.memoryUsage.length > 100) {
                this.memoryUsage.shift();
            }

            // Check for memory leaks
            this.detectMemoryLeaks();

            setTimeout(measureMemory, 5000); // Every 5 seconds
        };

        measureMemory();
    }

    /**
     * Detect potential memory leaks
     */
    private detectMemoryLeaks(): void {
        if (this.memoryUsage.length < 10) return;

        const recent = this.memoryUsage.slice(-10);
        const trend = this.calculateMemoryTrend(recent);

        // If memory usage is consistently increasing
        if (trend > 1024 * 1024) { // 1MB increase trend
            console.warn('Potential memory leak detected in animations');
            this.logMemoryWarning(recent);
        }
    }

    /**
     * Calculate memory usage trend
     */
    private calculateMemoryTrend(samples: MemoryUsage[]): number {
        if (samples.length < 2) return 0;

        const first = samples[0].usedJSHeapSize;
        const last = samples[samples.length - 1].usedJSHeapSize;
        
        return last - first;
    }

    /**
     * Log memory warning with details
     */
    private logMemoryWarning(samples: MemoryUsage[]): void {
        const latest = samples[samples.length - 1];
        const usedMB = Math.round(latest.usedJSHeapSize / 1024 / 1024);
        const totalMB = Math.round(latest.totalJSHeapSize / 1024 / 1024);
        
        console.warn(`Memory usage: ${usedMB}MB / ${totalMB}MB`);
        console.warn('Consider checking for animation cleanup issues');
    }

    /**
     * Record animation performance metric
     */
    public recordAnimationMetric(name: string, duration: number, metadata?: any): void {
        if (!this.animationMetrics.has(name)) {
            this.animationMetrics.set(name, []);
        }

        const metrics = this.animationMetrics.get(name)!;
        metrics.push({
            timestamp: Date.now(),
            duration,
            metadata,
        });

        // Keep only last 100 measurements per animation
        if (metrics.length > 100) {
            metrics.shift();
        }
    }

    /**
     * Start measuring animation performance
     */
    public startAnimationMeasure(name: string): void {
        if (typeof performance === 'undefined') return;
        performance.mark(`${name}-start`);
    }

    /**
     * End measuring animation performance
     */
    public endAnimationMeasure(name: string, metadata?: any): void {
        if (typeof performance === 'undefined') return;
        
        const endMark = `${name}-end`;
        const measureName = `animation-${name}`;
        
        performance.mark(endMark);
        performance.measure(measureName, `${name}-start`, endMark);
        
        // Get the measurement
        const entries = performance.getEntriesByName(measureName);
        if (entries.length > 0) {
            const entry = entries[entries.length - 1];
            this.recordAnimationMetric(name, entry.duration, metadata);
        }

        // Clean up marks
        performance.clearMarks(`${name}-start`);
        performance.clearMarks(endMark);
        performance.clearMeasures(measureName);
    }

    /**
     * Get current frame rate statistics
     */
    public getFrameRateStats(): FrameRateStats {
        if (this.frameRates.length === 0) {
            return { current: 0, average: 0, min: 0, max: 0, samples: 0 };
        }

        const current = this.frameRates[this.frameRates.length - 1] || 0;
        const average = Math.round(
            this.frameRates.reduce((sum, fps) => sum + fps, 0) / this.frameRates.length
        );
        const min = Math.min(...this.frameRates);
        const max = Math.max(...this.frameRates);

        return {
            current,
            average,
            min,
            max,
            samples: this.frameRates.length,
        };
    }

    /**
     * Get animation performance statistics
     */
    public getAnimationStats(): Record<string, AnimationStats> {
        const stats: Record<string, AnimationStats> = {};

        this.animationMetrics.forEach((metrics, name) => {
            if (metrics.length === 0) return;

            const durations = metrics.map(m => m.duration);
            const average = durations.reduce((sum, d) => sum + d, 0) / durations.length;
            const min = Math.min(...durations);
            const max = Math.max(...durations);
            const recent = metrics.slice(-10);

            stats[name] = {
                count: metrics.length,
                averageDuration: Math.round(average * 100) / 100,
                minDuration: Math.round(min * 100) / 100,
                maxDuration: Math.round(max * 100) / 100,
                recentAverage: recent.length > 0 
                    ? Math.round((recent.reduce((sum, m) => sum + m.duration, 0) / recent.length) * 100) / 100
                    : 0,
            };
        });

        return stats;
    }

    /**
     * Get memory usage statistics
     */
    public getMemoryStats(): MemoryStats | null {
        if (typeof window === 'undefined' || !(performance as any).memory) {
            return null;
        }

        const memory = (performance as any).memory;
        const current = {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
        };

        let trend = 0;
        if (this.memoryUsage.length >= 2) {
            const recent = this.memoryUsage.slice(-10);
            trend = this.calculateMemoryTrend(recent);
        }

        return {
            current,
            trend,
            samples: this.memoryUsage.length,
            usedMB: Math.round(current.usedJSHeapSize / 1024 / 1024),
            totalMB: Math.round(current.totalJSHeapSize / 1024 / 1024),
            limitMB: Math.round(current.jsHeapSizeLimit / 1024 / 1024),
        };
    }

    /**
     * Get comprehensive performance report
     */
    public getPerformanceReport(): PerformanceReport {
        return {
            frameRate: this.getFrameRateStats(),
            animations: this.getAnimationStats(),
            memory: this.getMemoryStats(),
            isMonitoring: this.isMonitoring,
            timestamp: Date.now(),
        };
    }

    /**
     * Check if performance is acceptable
     */
    public isPerformanceAcceptable(): boolean {
        const frameStats = this.getFrameRateStats();
        const memoryStats = this.getMemoryStats();

        // Check frame rate
        if (frameStats.average < 30) {
            return false;
        }

        // Check memory trend
        if (memoryStats && memoryStats.trend > 5 * 1024 * 1024) { // 5MB increase
            return false;
        }

        return true;
    }

    /**
     * Get performance recommendations
     */
    public getPerformanceRecommendations(): string[] {
        const recommendations: string[] = [];
        const frameStats = this.getFrameRateStats();
        const memoryStats = this.getMemoryStats();
        const animationStats = this.getAnimationStats();

        // Frame rate recommendations
        if (frameStats.average < 30) {
            recommendations.push('Frame rate is below 30 FPS. Consider reducing animation complexity.');
        }

        if (frameStats.average < 50) {
            recommendations.push('Frame rate could be improved. Consider optimizing animations.');
        }

        // Memory recommendations
        if (memoryStats && memoryStats.trend > 1024 * 1024) {
            recommendations.push('Memory usage is increasing. Check for animation cleanup issues.');
        }

        // Animation duration recommendations
        Object.entries(animationStats).forEach(([name, stats]) => {
            if (stats.averageDuration > 100) {
                recommendations.push(`Animation "${name}" is taking too long (${stats.averageDuration}ms). Consider optimization.`);
            }
        });

        if (recommendations.length === 0) {
            recommendations.push('Performance looks good! No issues detected.');
        }

        return recommendations;
    }

    /**
     * Export performance data for analysis
     */
    public exportPerformanceData(): string {
        const data = {
            report: this.getPerformanceReport(),
            frameRateHistory: this.frameRates,
            memoryHistory: this.memoryUsage,
            animationMetrics: Object.fromEntries(this.animationMetrics),
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * Clear all performance data
     */
    public clearData(): void {
        this.frameRates = [];
        this.memoryUsage = [];
        this.animationMetrics.clear();
    }

    /**
     * Cleanup and stop monitoring
     */
    public cleanup(): void {
        this.stopMonitoring();
        
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
            this.performanceObserver = null;
        }

        this.clearData();
    }
}

// Type definitions
interface AnimationMetric {
    timestamp: number;
    duration: number;
    metadata?: any;
}

interface MemoryUsage {
    timestamp: number;
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
}

interface FrameRateStats {
    current: number;
    average: number;
    min: number;
    max: number;
    samples: number;
}

interface AnimationStats {
    count: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    recentAverage: number;
}

interface MemoryStats {
    current: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
    };
    trend: number;
    samples: number;
    usedMB: number;
    totalMB: number;
    limitMB: number;
}

interface PerformanceReport {
    frameRate: FrameRateStats;
    animations: Record<string, AnimationStats>;
    memory: MemoryStats | null;
    isMonitoring: boolean;
    timestamp: number;
}

// Export singleton instance
export const animationPerformanceMonitor = AnimationPerformanceMonitor.getInstance();

// Only start monitoring if explicitly enabled via console or debug flag to reduce noise
if (typeof window !== 'undefined' && (window as any).ENABLE_PERFORMANCE_MONITOR) {
    animationPerformanceMonitor.startMonitoring();
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        animationPerformanceMonitor.cleanup();
    });
}