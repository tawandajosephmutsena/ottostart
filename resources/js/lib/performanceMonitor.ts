/**
 * Frontend performance monitoring utilities with Web Core Vitals optimization
 */

// Extend global types
declare global {
  function gtag(...args: any[]): void;
  
  interface PerformanceEntry {
    processingStart?: number;
  }
  
  interface PerformanceNavigationTiming {
    navigationStart?: number;
  }

  interface HTMLImageElement {
    fetchPriority?: 'high' | 'low' | 'auto';
  }
}

export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  domContentLoaded?: number;
  windowLoad?: number;
  inp?: number; // Interaction to Next Paint (new Core Web Vital)
}

export interface NavigationTiming {
  dns: number;
  tcp: number;
  request: number;
  response: number;
  processing: number;
  onLoad: number;
  total: number;
}

export interface WebCoreVitalsThresholds {
  lcp: { good: number; needsImprovement: number };
  fid: { good: number; needsImprovement: number };
  cls: { good: number; needsImprovement: number };
  fcp: { good: number; needsImprovement: number };
  inp: { good: number; needsImprovement: number };
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;
  private clsValue = 0;
  private lcpEntries: PerformanceEntry[] = [];
  private fidEntries: PerformanceEntry[] = [];

  // Web Core Vitals thresholds (Google's official thresholds)
  private readonly thresholds: WebCoreVitalsThresholds = {
    lcp: { good: 2500, needsImprovement: 4000 },
    fid: { good: 100, needsImprovement: 300 },
    cls: { good: 0.1, needsImprovement: 0.25 },
    fcp: { good: 1800, needsImprovement: 3000 },
    inp: { good: 200, needsImprovement: 500 },
  };

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start performance monitoring with Web Core Vitals focus
   */
  startMonitoring(): void {
    if (this.isMonitoring || typeof window === 'undefined') return;
    
    this.isMonitoring = true;
    this.setupWebVitalsObservers();
    this.setupNavigationTimingObserver();
    this.setupResourceTimingObserver();
    this.setupLongTaskObserver();
    this.setupUserInteractionObserver();
    
    // Web Core Vitals: Set up page visibility change handler
    this.setupVisibilityChangeHandler();
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Setup Web Vitals observers with enhanced accuracy
   */
  private setupWebVitalsObservers(): void {
    // First Contentful Paint
    this.observePerformanceEntries('paint', (entries) => {
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime;
        this.reportMetric('FCP', fcpEntry.startTime);
      }
    });

    // Largest Contentful Paint with enhanced tracking
    this.observePerformanceEntries('largest-contentful-paint', (entries) => {
      // Store all LCP entries for better analysis
      this.lcpEntries.push(...entries);
      const lcpEntry = entries[entries.length - 1];
      if (lcpEntry) {
        this.metrics.lcp = lcpEntry.startTime;
        this.reportMetric('LCP', lcpEntry.startTime);
        
        // Web Core Vitals: Track LCP element details
        const lcpElement = (lcpEntry as any).element;
        if (lcpElement) {
          this.trackLCPElement(lcpElement, lcpEntry.startTime);
        }
      }
    });

    // First Input Delay with enhanced tracking
    this.observePerformanceEntries('first-input', (entries) => {
      this.fidEntries.push(...entries);
      const fidEntry = entries[0] as any;
      if (fidEntry && fidEntry.processingStart) {
        this.metrics.fid = fidEntry.processingStart - fidEntry.startTime;
        this.reportMetric('FID', this.metrics.fid);
        
        // Web Core Vitals: Track input type and target
        this.trackInputDetails(fidEntry);
      }
    });

    // Cumulative Layout Shift with enhanced tracking
    this.observePerformanceEntries('layout-shift', (entries) => {
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          this.clsValue += entry.value;
          
          // Web Core Vitals: Track layout shift sources
          this.trackLayoutShiftSources(entry);
        }
      });
      this.metrics.cls = this.clsValue;
      this.reportMetric('CLS', this.clsValue);
    });

    // Interaction to Next Paint (INP) - New Core Web Vital
    this.observePerformanceEntries('event', (entries) => {
      entries.forEach((entry: any) => {
        if (entry.name === 'keydown' || entry.name === 'pointerdown' || entry.name === 'click') {
          const duration = entry.processingEnd - entry.startTime;
          if (!this.metrics.inp || duration > this.metrics.inp) {
            this.metrics.inp = duration;
            this.reportMetric('INP', duration);
          }
        }
      });
    });
  }

  /**
   * Track LCP element details for optimization insights
   */
  private trackLCPElement(element: Element, lcpTime: number): void {
    const elementInfo = {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      src: (element as HTMLImageElement).src || null,
      lcpTime,
      isImage: element.tagName === 'IMG',
      hasExplicitDimensions: element.hasAttribute('width') && element.hasAttribute('height'),
      loadingAttribute: (element as HTMLImageElement).loading || null,
      fetchPriority: (element as HTMLImageElement).fetchPriority || null,
    };

    console.log('LCP Element Details:', elementInfo);
    
    // Web Core Vitals: Report LCP optimization opportunities
    this.analyzeLCPOptimizations(elementInfo);
  }

  /**
   * Analyze LCP optimization opportunities
   */
  private analyzeLCPOptimizations(elementInfo: any): void {
    const optimizations: string[] = [];

    if (elementInfo.isImage) {
      if (!elementInfo.hasExplicitDimensions) {
        optimizations.push('Add explicit width and height attributes to prevent layout shift');
      }
      if (elementInfo.loadingAttribute === 'lazy') {
        optimizations.push('Consider using loading="eager" for above-the-fold images');
      }
      if (elementInfo.fetchPriority !== 'high') {
        optimizations.push('Consider adding fetchpriority="high" for LCP images');
      }
    }

    if (elementInfo.lcpTime > this.thresholds.lcp.good) {
      optimizations.push('LCP time exceeds good threshold - consider image optimization or preloading');
    }

    if (optimizations.length > 0) {
      console.warn('LCP Optimization Opportunities:', optimizations);
    }
  }

  /**
   * Track input details for FID analysis
   */
  private trackInputDetails(fidEntry: any): void {
    const inputInfo = {
      name: fidEntry.name,
      startTime: fidEntry.startTime,
      processingStart: fidEntry.processingStart,
      processingEnd: fidEntry.processingEnd,
      duration: fidEntry.processingStart - fidEntry.startTime,
      target: fidEntry.target?.tagName || 'unknown',
    };

    console.log('FID Input Details:', inputInfo);

    // Web Core Vitals: Analyze FID issues
    if (inputInfo.duration > this.thresholds.fid.good) {
      console.warn('FID exceeds good threshold. Consider:', [
        'Reducing JavaScript execution time',
        'Breaking up long tasks',
        'Using code splitting',
        'Deferring non-critical JavaScript',
      ]);
    }
  }

  /**
   * Track layout shift sources for CLS analysis
   */
  private trackLayoutShiftSources(entry: any): void {
    const shiftInfo = {
      value: entry.value,
      sources: entry.sources?.map((source: any) => ({
        node: source.node?.tagName || 'unknown',
        previousRect: source.previousRect,
        currentRect: source.currentRect,
      })) || [],
    };

    console.log('Layout Shift Details:', shiftInfo);

    // Web Core Vitals: Analyze CLS issues
    if (entry.value > 0.05) { // Significant layout shift
      console.warn('Significant layout shift detected. Consider:', [
        'Setting explicit dimensions for images and videos',
        'Reserving space for dynamic content',
        'Using CSS aspect-ratio property',
        'Avoiding inserting content above existing content',
      ]);
    }
  }

  /**
   * Setup navigation timing observer
   */
  private setupNavigationTimingObserver(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        
        this.metrics.ttfb = nav.responseStart - nav.requestStart;
        this.metrics.domContentLoaded = nav.domContentLoadedEventEnd - (nav.navigationStart || nav.fetchStart);
        this.metrics.windowLoad = nav.loadEventEnd - (nav.navigationStart || nav.fetchStart);
        
        this.reportNavigationTiming(nav);
        
        // Web Core Vitals: Analyze TTFB
        this.analyzeTTFB(this.metrics.ttfb);
      }
    }
  }

  /**
   * Analyze TTFB for optimization opportunities
   */
  private analyzeTTFB(ttfb: number): void {
    if (ttfb > 600) { // Google's TTFB threshold
      console.warn('TTFB exceeds recommended threshold. Consider:', [
        'Optimizing server response time',
        'Using a CDN',
        'Implementing server-side caching',
        'Optimizing database queries',
        'Using HTTP/2 or HTTP/3',
      ]);
    }
  }

  /**
   * Setup resource timing observer with Web Core Vitals focus
   */
  private setupResourceTimingObserver(): void {
    this.observePerformanceEntries('resource', (entries) => {
      entries.forEach((entry) => {
        if (entry.entryType === 'resource') {
          this.analyzeResourceTiming(entry as PerformanceResourceTiming);
        }
      });
    });
  }

  /**
   * Setup long task observer for FID optimization
   */
  private setupLongTaskObserver(): void {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.warn('Long Task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name,
          });
          
          // Web Core Vitals: Long tasks impact FID and INP
          if (entry.duration > 50) {
            console.warn('Long task may impact FID/INP. Consider code splitting or web workers.');
          }
        });
      });
      
      longTaskObserver.observe({ type: 'longtask', buffered: true });
      this.observers.push(longTaskObserver);
    } catch (error) {
      console.warn('Long task observer not supported:', error);
    }
  }

  /**
   * Setup user interaction observer for INP tracking
   */
  private setupUserInteractionObserver(): void {
    // Track user interactions for INP measurement
    const interactionTypes = ['click', 'keydown', 'pointerdown'];
    
    interactionTypes.forEach(type => {
      document.addEventListener(type, (event) => {
        const startTime = performance.now();
        
        // Use requestIdleCallback to measure interaction response time
        requestIdleCallback(() => {
          const duration = performance.now() - startTime;
          if (duration > 40) { // Threshold for noticeable delay
            console.log(`${type} interaction took ${duration.toFixed(2)}ms`);
          }
        });
      }, { passive: true });
    });
  }

  /**
   * Setup visibility change handler for accurate Web Core Vitals measurement
   */
  private setupVisibilityChangeHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // Web Core Vitals: Report final metrics when page becomes hidden
        this.reportFinalMetrics();
      }
    });
  }

  /**
   * Report final metrics when page becomes hidden
   */
  private reportFinalMetrics(): void {
    const finalMetrics = this.getWebCoreVitalsScore();
    console.log('Final Web Core Vitals:', finalMetrics);
    
    // Send to analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals_final', {
        event_category: 'Performance',
        lcp: this.metrics.lcp,
        fid: this.metrics.fid,
        cls: this.metrics.cls,
        fcp: this.metrics.fcp,
        inp: this.metrics.inp,
        overall_score: finalMetrics.score,
      });
    }
  }

  /**
   * Analyze resource timing with Web Core Vitals focus
   */
  private analyzeResourceTiming(entry: PerformanceResourceTiming): void {
    const duration = entry.responseEnd - entry.startTime;
    const size = entry.transferSize || 0;
    const resourceType = this.getResourceType(entry.name);
    
    // Web Core Vitals: Focus on resources that impact LCP
    const isLCPCandidate = resourceType === 'image' || resourceType === 'font';
    
    // Log slow resources that might impact LCP
    if (duration > 1000 && isLCPCandidate) {
      console.warn('Slow LCP candidate resource:', {
        name: entry.name,
        duration: Math.round(duration),
        size: size,
        type: resourceType,
        optimization: this.getResourceOptimizationSuggestions(resourceType, duration, size),
      });
    }
    
    // Track large resources that might impact performance
    if (size > 500 * 1024) { // 500KB threshold
      console.warn('Large resource detected:', {
        name: entry.name,
        size: Math.round(size / 1024) + 'KB',
        duration: Math.round(duration),
        type: resourceType,
      });
    }
  }

  /**
   * Get resource optimization suggestions
   */
  private getResourceOptimizationSuggestions(type: string, duration: number, size: number): string[] {
    const suggestions: string[] = [];
    
    switch (type) {
      case 'image':
        suggestions.push('Use WebP format');
        suggestions.push('Implement responsive images with srcset');
        suggestions.push('Add preload for critical images');
        if (size > 100 * 1024) suggestions.push('Compress image further');
        break;
      case 'font':
        suggestions.push('Use font-display: swap');
        suggestions.push('Preload critical fonts');
        suggestions.push('Use WOFF2 format');
        break;
      case 'script':
        suggestions.push('Use code splitting');
        suggestions.push('Defer non-critical scripts');
        if (size > 250 * 1024) suggestions.push('Consider lazy loading');
        break;
      case 'stylesheet':
        suggestions.push('Inline critical CSS');
        suggestions.push('Use media queries for non-critical CSS');
        break;
    }
    
    return suggestions;
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.match(/\.(css)$/i)) return 'stylesheet';
    if (url.match(/\.(js)$/i)) return 'script';
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/i)) return 'font';
    return 'other';
  }

  /**
   * Generic performance observer setup
   */
  private observePerformanceEntries(
    type: string,
    callback: (entries: PerformanceEntry[]) => void
  ): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Performance observer for ${type} not supported:`, error);
    }
  }

  /**
   * Report metric to analytics or logging service
   */
  private reportMetric(name: string, value: number): void {
    // In a real application, you would send this to your analytics service
    console.log(`Performance Metric - ${name}:`, Math.round(value));
    
    // Example: Send to Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(value),
        non_interaction: true,
      });
    }
  }

  /**
   * Report navigation timing breakdown
   */
  private reportNavigationTiming(nav: PerformanceNavigationTiming): void {
    const timing: NavigationTiming = {
      dns: nav.domainLookupEnd - nav.domainLookupStart,
      tcp: nav.connectEnd - nav.connectStart,
      request: nav.responseStart - nav.requestStart,
      response: nav.responseEnd - nav.responseStart,
      processing: nav.domContentLoadedEventStart - nav.responseEnd,
      onLoad: nav.loadEventEnd - nav.loadEventStart,
      total: nav.loadEventEnd - (nav.navigationStart || nav.fetchStart),
    };

    console.log('Navigation Timing:', timing);
  }

  /**
   * Get Core Web Vitals score with enhanced analysis
   */
  getCoreWebVitalsScore(): { score: number; details: any; grade: string; recommendations: string[] } {
    const { fcp, lcp, fid, cls, inp } = this.metrics;
    
    let score = 0;
    let maxScore = 0;
    const details: any = {};
    const recommendations: string[] = [];

    // FCP scoring (0-20 points)
    if (fcp !== undefined) {
      maxScore += 20;
      if (fcp <= this.thresholds.fcp.good) {
        score += 20;
        details.fcp = { value: fcp, status: 'good' };
      } else if (fcp <= this.thresholds.fcp.needsImprovement) {
        score += 12;
        details.fcp = { value: fcp, status: 'needs-improvement' };
        recommendations.push('Optimize FCP by reducing render-blocking resources');
      } else {
        score += 4;
        details.fcp = { value: fcp, status: 'poor' };
        recommendations.push('FCP is poor - prioritize critical resource optimization');
      }
    }

    // LCP scoring (0-30 points) - Higher weight as it's most important
    if (lcp !== undefined) {
      maxScore += 30;
      if (lcp <= this.thresholds.lcp.good) {
        score += 30;
        details.lcp = { value: lcp, status: 'good' };
      } else if (lcp <= this.thresholds.lcp.needsImprovement) {
        score += 18;
        details.lcp = { value: lcp, status: 'needs-improvement' };
        recommendations.push('Optimize LCP by preloading critical images and reducing server response time');
      } else {
        score += 6;
        details.lcp = { value: lcp, status: 'poor' };
        recommendations.push('LCP is poor - focus on image optimization and server performance');
      }
    }

    // FID scoring (0-25 points)
    if (fid !== undefined) {
      maxScore += 25;
      if (fid <= this.thresholds.fid.good) {
        score += 25;
        details.fid = { value: fid, status: 'good' };
      } else if (fid <= this.thresholds.fid.needsImprovement) {
        score += 15;
        details.fid = { value: fid, status: 'needs-improvement' };
        recommendations.push('Improve FID by reducing JavaScript execution time');
      } else {
        score += 5;
        details.fid = { value: fid, status: 'poor' };
        recommendations.push('FID is poor - implement code splitting and defer non-critical JavaScript');
      }
    }

    // CLS scoring (0-25 points)
    if (cls !== undefined) {
      maxScore += 25;
      if (cls <= this.thresholds.cls.good) {
        score += 25;
        details.cls = { value: cls, status: 'good' };
      } else if (cls <= this.thresholds.cls.needsImprovement) {
        score += 15;
        details.cls = { value: cls, status: 'needs-improvement' };
        recommendations.push('Reduce CLS by setting explicit dimensions for images and reserving space for dynamic content');
      } else {
        score += 5;
        details.cls = { value: cls, status: 'poor' };
        recommendations.push('CLS is poor - fix layout shifts by setting image dimensions and avoiding content insertion');
      }
    }

    const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const grade = this.getPerformanceGrade(finalScore);
    
    return { score: finalScore, details, grade, recommendations };
  }

  /**
   * Get performance grade based on score
   */
  private getPerformanceGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Track custom performance mark
   */
  mark(name: string): void {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name);
    }
  }

  /**
   * Measure time between two marks
   */
  measure(name: string, startMark: string, endMark?: string): number | null {
    if ('performance' in window && 'measure' in performance) {
      try {
        if (endMark) {
          performance.measure(name, startMark, endMark);
        } else {
          performance.measure(name, startMark);
        }
        
        const measures = performance.getEntriesByName(name, 'measure');
        return measures.length > 0 ? measures[measures.length - 1].duration : null;
      } catch (error) {
        console.warn('Performance measure failed:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Get performance budget status with Web Core Vitals focus
   */
  getPerformanceBudgetStatus(): { passed: boolean; violations: string[]; score: number } {
    const violations: string[] = [];
    const { fcp, lcp, fid, cls, inp } = this.metrics;

    // Web Core Vitals budget thresholds (stricter than Google's "needs improvement")
    if (fcp && fcp > 1800) violations.push(`FCP too slow: ${Math.round(fcp)}ms (budget: 1800ms)`);
    if (lcp && lcp > 2500) violations.push(`LCP too slow: ${Math.round(lcp)}ms (budget: 2500ms)`);
    if (fid && fid > 100) violations.push(`FID too slow: ${Math.round(fid)}ms (budget: 100ms)`);
    if (cls && cls > 0.1) violations.push(`CLS too high: ${cls.toFixed(3)} (budget: 0.1)`);
    if (inp && inp > 200) violations.push(`INP too slow: ${Math.round(inp)}ms (budget: 200ms)`);

    const score = this.getCoreWebVitalsScore().score;

    return {
      passed: violations.length === 0,
      violations,
      score,
    };
  }

  /**
   * Get Web Core Vitals optimization recommendations
   */
  getOptimizationRecommendations(): { priority: string; recommendations: string[] }[] {
    const { score, recommendations } = this.getCoreWebVitalsScore();
    
    const prioritizedRecommendations = [
      {
        priority: 'High',
        recommendations: recommendations.filter(r => r.includes('poor')),
      },
      {
        priority: 'Medium', 
        recommendations: recommendations.filter(r => r.includes('needs-improvement')),
      },
      {
        priority: 'Low',
        recommendations: score > 80 ? ['Consider advanced optimizations like HTTP/3, service workers'] : [],
      },
    ].filter(group => group.recommendations.length > 0);

    return prioritizedRecommendations;
  }
}

/**
 * Initialize performance monitoring with Web Core Vitals focus
 */
export const initPerformanceMonitoring = (): PerformanceMonitor => {
  const monitor = PerformanceMonitor.getInstance();
  
  // Start monitoring when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => monitor.startMonitoring());
  } else {
    monitor.startMonitoring();
  }
  
  return monitor;
};

/**
 * React hook for performance monitoring with Web Core Vitals
 */
export const usePerformanceMonitoring = () => {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    startMonitoring: () => monitor.startMonitoring(),
    stopMonitoring: () => monitor.stopMonitoring(),
    getMetrics: () => monitor.getMetrics(),
    getCoreWebVitalsScore: () => monitor.getCoreWebVitalsScore(),
    getPerformanceBudgetStatus: () => monitor.getPerformanceBudgetStatus(),
    getOptimizationRecommendations: () => monitor.getOptimizationRecommendations(),
    mark: (name: string) => monitor.mark(name),
    measure: (name: string, startMark: string, endMark?: string) => monitor.measure(name, startMark, endMark),
  };
};