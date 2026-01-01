import React from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useAccessibility';

interface SkeletonLoaderProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    lines?: number;
    animation?: 'pulse' | 'wave' | 'none';
    children?: React.ReactNode;
}

/**
 * Skeleton Loader Component
 * Provides loading placeholders with smooth animations
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    className,
    variant = 'text',
    width,
    height,
    lines = 1,
    animation = 'pulse',
    children,
}) => {
    const prefersReducedMotion = useReducedMotion();
    const effectiveAnimation = prefersReducedMotion ? 'none' : animation;

    const baseClasses = cn(
        'bg-gray-200 dark:bg-gray-700',
        {
            'animate-pulse': effectiveAnimation === 'pulse',
            'animate-wave': effectiveAnimation === 'wave',
            'rounded-full': variant === 'circular',
            'rounded-md': variant === 'rounded',
            'rounded': variant === 'rectangular',
            'rounded-sm': variant === 'text',
        },
        className
    );

    const getDefaultDimensions = () => {
        switch (variant) {
            case 'circular':
                return { width: '40px', height: '40px' };
            case 'text':
                return { width: '100%', height: '1rem' };
            case 'rectangular':
            case 'rounded':
            default:
                return { width: '100%', height: '200px' };
        }
    };

    const dimensions = {
        width: width || getDefaultDimensions().width,
        height: height || getDefaultDimensions().height,
    };

    if (children) {
        return (
            <div className={cn('relative overflow-hidden', className)}>
                <div className="opacity-0">{children}</div>
                <div className="absolute inset-0 flex flex-col space-y-2">
                    {Array.from({ length: lines }).map((_, index) => (
                        <div
                            key={index}
                            className={baseClasses}
                            style={dimensions}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (variant === 'text' && lines > 1) {
        return (
            <div className={cn('space-y-2', className)}>
                {Array.from({ length: lines }).map((_, index) => (
                    <div
                        key={index}
                        className={baseClasses}
                        style={{
                            ...dimensions,
                            width: index === lines - 1 ? '75%' : dimensions.width,
                        }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={baseClasses}
            style={dimensions}
            role="status"
            aria-label="Loading content"
        />
    );
};

/**
 * Card Skeleton Component
 */
export const CardSkeleton: React.FC<{
    className?: string;
    showImage?: boolean;
    showTitle?: boolean;
    showDescription?: boolean;
    showActions?: boolean;
}> = ({
    className,
    showImage = true,
    showTitle = true,
    showDescription = true,
    showActions = false,
}) => {
    return (
        <div className={cn('p-4 border rounded-lg space-y-4', className)}>
            {showImage && (
                <SkeletonLoader
                    variant="rectangular"
                    height="200px"
                    className="w-full"
                />
            )}
            
            <div className="space-y-2">
                {showTitle && (
                    <SkeletonLoader
                        variant="text"
                        height="1.5rem"
                        width="75%"
                    />
                )}
                
                {showDescription && (
                    <SkeletonLoader
                        variant="text"
                        lines={3}
                        height="1rem"
                    />
                )}
            </div>
            
            {showActions && (
                <div className="flex space-x-2">
                    <SkeletonLoader
                        variant="rounded"
                        width="80px"
                        height="32px"
                    />
                    <SkeletonLoader
                        variant="rounded"
                        width="80px"
                        height="32px"
                    />
                </div>
            )}
        </div>
    );
};

/**
 * List Skeleton Component
 */
export const ListSkeleton: React.FC<{
    className?: string;
    items?: number;
    showAvatar?: boolean;
    showSecondaryText?: boolean;
}> = ({
    className,
    items = 5,
    showAvatar = false,
    showSecondaryText = false,
}) => {
    return (
        <div className={cn('space-y-4', className)}>
            {Array.from({ length: items }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                    {showAvatar && (
                        <SkeletonLoader
                            variant="circular"
                            width="40px"
                            height="40px"
                        />
                    )}
                    
                    <div className="flex-1 space-y-1">
                        <SkeletonLoader
                            variant="text"
                            height="1rem"
                            width="60%"
                        />
                        
                        {showSecondaryText && (
                            <SkeletonLoader
                                variant="text"
                                height="0.875rem"
                                width="40%"
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Table Skeleton Component
 */
export const TableSkeleton: React.FC<{
    className?: string;
    rows?: number;
    columns?: number;
    showHeader?: boolean;
}> = ({
    className,
    rows = 5,
    columns = 4,
    showHeader = true,
}) => {
    return (
        <div className={cn('w-full', className)}>
            {showHeader && (
                <div className="grid gap-4 p-4 border-b" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {Array.from({ length: columns }).map((_, index) => (
                        <SkeletonLoader
                            key={index}
                            variant="text"
                            height="1rem"
                            width="80%"
                        />
                    ))}
                </div>
            )}
            
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="grid gap-4 p-4 border-b"
                    style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                >
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <SkeletonLoader
                            key={colIndex}
                            variant="text"
                            height="1rem"
                            width={colIndex === 0 ? '90%' : '70%'}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default SkeletonLoader;