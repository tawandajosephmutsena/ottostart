/**
 * Image optimization utilities for frontend
 */

export interface ImageSizes {
  [key: string]: string;
}

export interface OptimizedImage {
  src: string;
  sizes: ImageSizes;
  webpSizes: ImageSizes;
  placeholder?: string;
  alt: string;
}

/**
 * Check if browser supports WebP format
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Get the best image source based on browser support and screen size
 */
export const getBestImageSrc = (
  image: OptimizedImage,
  preferredSize: string = 'medium'
): string => {
  // Try WebP first if available
  if (image.webpSizes && image.webpSizes[preferredSize]) {
    return image.webpSizes[preferredSize];
  }
  
  // Fallback to regular sizes
  if (image.sizes && image.sizes[preferredSize]) {
    return image.sizes[preferredSize];
  }
  
  // Final fallback to src
  return image.src;
};

/**
 * Generate srcset string for responsive images
 */
export const generateSrcSet = (sizes: ImageSizes): string => {
  const sizeWidths: { [key: string]: number } = {
    thumbnail: 300,
    small: 600,
    medium: 1200,
    large: 1920,
    hero: 2560,
  };

  return Object.entries(sizes)
    .map(([size, url]) => {
      const width = sizeWidths[size] || 1200;
      return `${url} ${width}w`;
    })
    .join(', ');
};

/**
 * Get responsive sizes attribute
 */
export const getResponsiveSizes = (breakpoints?: string[]): string => {
  if (breakpoints) {
    return breakpoints.join(', ');
  }
  
  return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
};

/**
 * Preload critical images
 */
export const preloadImage = (src: string, as: string = 'image'): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = src;
  document.head.appendChild(link);
};

/**
 * Lazy load image with intersection observer
 */
export const lazyLoadImage = (
  img: HTMLImageElement,
  src: string,
  options: IntersectionObserverInit = {}
): void => {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLImageElement;
        target.src = src;
        target.classList.remove('lazy');
        observer.unobserve(target);
      }
    });
  }, defaultOptions);

  observer.observe(img);
};

/**
 * Create a blurred placeholder from base64 data
 */
export const createBlurredPlaceholder = (
  base64: string,
  blur: number = 5
): string => {
  return `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 1 1'%3E%3Cdefs%3E%3Cfilter id='blur'%3E%3CfeGaussianBlur stdDeviation='${blur}'/%3E%3C/filter%3E%3C/defs%3E%3Cimage width='1' height='1' href='${base64}' filter='url(%23blur)'/%3E%3C/svg%3E")`;
};

/**
 * Optimize image loading performance
 */
export class ImageOptimizer {
  private static instance: ImageOptimizer;
  private loadedImages: Set<string> = new Set();
  private preloadQueue: string[] = [];

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  /**
   * Mark image as loaded to avoid duplicate loading
   */
  markAsLoaded(src: string): void {
    this.loadedImages.add(src);
  }

  /**
   * Check if image is already loaded
   */
  isLoaded(src: string): boolean {
    return this.loadedImages.has(src);
  }

  /**
   * Add image to preload queue
   */
  addToPreloadQueue(src: string): void {
    if (!this.isLoaded(src) && !this.preloadQueue.includes(src)) {
      this.preloadQueue.push(src);
    }
  }

  /**
   * Process preload queue
   */
  processPreloadQueue(maxConcurrent: number = 3): void {
    const toPreload = this.preloadQueue.splice(0, maxConcurrent);
    
    toPreload.forEach((src) => {
      const img = new Image();
      img.onload = () => this.markAsLoaded(src);
      img.onerror = () => console.warn(`Failed to preload image: ${src}`);
      img.src = src;
    });

    // Continue processing if there are more images
    if (this.preloadQueue.length > 0) {
      setTimeout(() => this.processPreloadQueue(maxConcurrent), 100);
    }
  }

  /**
   * Get optimal image size based on container dimensions
   */
  getOptimalSize(
    containerWidth: number,
    containerHeight: number,
    devicePixelRatio: number = window.devicePixelRatio || 1
  ): string {
    const targetWidth = containerWidth * devicePixelRatio;
    const targetHeight = containerHeight * devicePixelRatio;

    // Size thresholds
    if (targetWidth <= 300 && targetHeight <= 300) return 'thumbnail';
    if (targetWidth <= 600 && targetHeight <= 400) return 'small';
    if (targetWidth <= 1200 && targetHeight <= 800) return 'medium';
    if (targetWidth <= 1920 && targetHeight <= 1280) return 'large';
    
    return 'hero';
  }

  /**
   * Create responsive image element
   */
  createResponsiveImage(
    image: OptimizedImage,
    container: HTMLElement,
    className: string = ''
  ): HTMLPictureElement {
    const picture = document.createElement('picture');
    
    // WebP source
    if (image.webpSizes && Object.keys(image.webpSizes).length > 0) {
      const webpSource = document.createElement('source');
      webpSource.type = 'image/webp';
      webpSource.srcset = generateSrcSet(image.webpSizes);
      webpSource.sizes = getResponsiveSizes();
      picture.appendChild(webpSource);
    }
    
    // Fallback img
    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.alt;
    img.className = className;
    img.loading = 'lazy';
    
    if (image.sizes && Object.keys(image.sizes).length > 0) {
      img.srcset = generateSrcSet(image.sizes);
      img.sizes = getResponsiveSizes();
    }
    
    if (image.placeholder) {
      img.style.backgroundImage = `url(${image.placeholder})`;
      img.style.backgroundSize = 'cover';
      img.style.backgroundPosition = 'center';
    }
    
    picture.appendChild(img);
    
    return picture;
  }
}

/**
 * Hook for React components to use image optimization
 */
export const useImageOptimization = () => {
  const optimizer = ImageOptimizer.getInstance();
  
  return {
    getBestImageSrc,
    generateSrcSet,
    getResponsiveSizes,
    preloadImage,
    supportsWebP,
    optimizer,
  };
};