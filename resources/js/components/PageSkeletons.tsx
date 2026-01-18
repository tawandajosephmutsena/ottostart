import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Card Skeleton - Represents a portfolio or blog card
 */
export const CardSkeleton = ({ className }: { className?: string }) => (
    <div className={cn("space-y-3", className)}>
        <Skeleton className="aspect-video w-full" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
        </div>
    </div>
);

/**
 * Hero Skeleton - Represents a section header or hero
 */
export const HeroSkeleton = () => (
    <div className="space-y-6 py-12">
        <Skeleton className="h-12 w-[60%] mx-auto" />
        <Skeleton className="h-6 w-[40%] mx-auto" />
        <div className="flex justify-center gap-4 pt-4">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
        </div>
    </div>
);

/**
 * Section Skeleton - A generic section with title and grid
 */
export const SectionSkeleton = ({ items = 3 }: { items?: number }) => (
    <div className="space-y-12 py-16">
        <div className="space-y-4 px-4 text-center">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {Array.from({ length: items }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    </div>
);

/**
 * Content Skeleton - Generic text content area
 */
export const ContentSkeleton = () => (
    <div className="max-w-3xl mx-auto space-y-8 py-12 px-4">
        <Skeleton className="h-10 w-[80%]" />
        <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[85%]" />
        </div>
        <Skeleton className="aspect-video w-full" />
        <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[95%]" />
        </div>
    </div>
);

/**
 * Portfolio Grid Skeleton
 */
export const PortfolioGridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full rounded-none" />
        ))}
    </div>
);
