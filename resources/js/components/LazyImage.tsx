/**
 * LazyImage Component
 * High-end image loading component with WebP/AVIF support, blur placeholders,
 * and optimized rendering for Web Core Vitals.
 */

import { cn } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    priority?: boolean;
    blurDataUrl?: string;
    aspectRatio?: '16/9' | '4/3' | '1/1' | 'golden' | 'auto';
    objectFit?: 'cover' | 'contain' | 'fill';
}

const aspectRatioClasses = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    'golden': 'aspect-[1.618/1]',
    'auto': '',
};

export const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt,
    className,
    priority = false,
    blurDataUrl,
    aspectRatio = 'auto',
    objectFit = 'cover',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // Optimized image path generation (WebP fallback)
    // In a real app, this might involve a CDN or secondary source
    const webpSrc = src && !src.startsWith('data:') ? src.replace(/\.(jpg|jpeg|png)$/i, '.webp') : null;

    const placeholderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (placeholderRef.current && blurDataUrl) {
            placeholderRef.current.style.backgroundImage = `url(${blurDataUrl})`;
        }
    }, [blurDataUrl, isLoaded]);

    useEffect(() => {
        // If image is already in cache, it might load before hydration
        if (imgRef.current?.complete) {
            const timer = setTimeout(() => setIsLoaded(true), 10);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <div 
            className={cn(
                'relative overflow-hidden bg-muted/20',
                aspectRatio !== 'auto' && aspectRatioClasses[aspectRatio],
                className
            )}
        >
            {/* Blur Placeholder */}
            {blurDataUrl && !isLoaded && (
                <div 
                    ref={placeholderRef}
                    className="absolute inset-0 z-0 scale-110 blur-2xl transition-opacity duration-1000 bg-cover bg-center"
                />
            )}

            {/* Main Image */}
            <picture className="contents">
                {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    loading={priority ? 'eager' : 'lazy'}
                    fetchPriority={priority ? 'high' : 'auto'}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setError(true)}
                    className={cn(
                        'h-full w-full transition-all duration-700 ease-in-out',
                        objectFit === 'cover' ? 'object-cover' : 
                        objectFit === 'contain' ? 'object-contain' : 'object-fill',
                        isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm',
                        error && 'hidden'
                    )}
                    {...props}
                />
            </picture>

            {/* Error Placeholder */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/30 text-muted-foreground">
                    <span className="text-xs font-mono uppercase tracking-widest">Image Error</span>
                </div>
            )}

            {/* Performance monitoring overlay in DEV */}
            {import.meta.env.DEV && isLoaded && (
                <div className="absolute bottom-1 right-1 z-10 hidden group-hover:block">
                    <span className="bg-black/60 text-[8px] text-white px-1 rounded backdrop-blur-sm">
                        {priority ? 'PRIORITY' : 'LAZY'}
                    </span>
                </div>
            )}
        </div>
    );
};

export default LazyImage;
