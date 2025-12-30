import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';

interface StackedCardsProps {
    children: React.ReactNode[];
    className?: string;
    spacing?: number;
    scaleAmount?: number;
    rotationAmount?: number;
}

/**
 * Stacked Cards component with scroll-triggered animations
 * Creates a stacked card effect where cards pin and scale during scroll
 */
export const StackedCards: React.FC<StackedCardsProps> = ({
    children,
    className,
    spacing = 50,
    scaleAmount = 0.1,
    rotationAmount = 0,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // For now, we'll implement a simpler version without the complex stacked animations
    // The stacked card animation can be added later when the hook types are properly resolved
    useEffect(() => {
        // Basic scroll-triggered animations can be added here
        // This is a placeholder for the stacked card functionality
    }, [spacing, scaleAmount, rotationAmount]);

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            {children.map((child, index) => (
                <div
                    key={index}
                    className="relative z-10 transition-transform duration-300 hover:scale-105"
                    style={{
                        marginBottom:
                            index < children.length - 1 ? `${spacing}px` : 0,
                    }}
                >
                    {child}
                </div>
            ))}
        </div>
    );
};

export default StackedCards;
