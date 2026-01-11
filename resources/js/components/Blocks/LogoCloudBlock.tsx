import React from 'react';
import { InfiniteSlider } from '@/components/motion-primitives/infinite-slider';
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur';
import { cn } from '@/lib/utils';

interface LogoCloudBlockProps {
    title?: string;
    items?: {
        name: string;
        url: string;
        className?: string;
    }[];
    speed?: number;
    speedOnHover?: number;
    gap?: number;
}

const LogoCloudBlock: React.FC<LogoCloudBlockProps> = ({ 
    title = "Powering the best teams", 
    items = [], 
    speed = 40,
    speedOnHover = 20,
    gap = 112
}) => {
    if (!items || items.length === 0) {
        return (
            <section className="bg-background py-16 text-center border-dashed border-2 m-4 rounded-lg">
                <p className="text-muted-foreground">Logo Cloud Block: No logos added. Please edit this block to add logos.</p>
            </section>
        );
    }

    return (
        <section className="bg-background overflow-hidden py-16">
            <div className="group relative m-auto max-w-7xl px-6">
                <div className="flex flex-col items-center md:flex-row">
                    <div className="md:max-w-44 md:border-r md:pr-6">
                        <p className="text-end text-sm text-muted-foreground font-semibold uppercase tracking-wider">{title}</p>
                    </div>
                    <div className="relative py-6 md:w-[calc(100%-11rem)]">
                        <InfiniteSlider
                            duration={(100 - speed) / 2} // Convert arbitrary speed (0-100) to duration (higher speed = lower duration)
                            durationOnHover={(100 - speedOnHover) / 2}
                            gap={gap}
                            className="flex items-center w-full"
                        >
                            {items.map((item, idx) => (
                                <div key={idx} className="flex px-8">
                                    <img
                                        className={cn("mx-auto h-8 w-auto opacity-70 hover:opacity-100 transition-opacity dark:brightness-0 dark:invert", item.className)}
                                        src={item.url}
                                        alt={item.name}
                                        height="32"
                                        width="auto"
                                    />
                                </div>
                            ))}
                        </InfiniteSlider>

                        <div className="bg-gradient-to-r from-background to-transparent absolute inset-y-0 left-0 w-20 z-10"></div>
                        <div className="bg-gradient-to-l from-background to-transparent absolute inset-y-0 right-0 w-20 z-10"></div>
                        <ProgressiveBlur
                            className="pointer-events-none absolute left-0 top-0 h-full w-20"
                            direction="left"
                            blurIntensity={1}
                        />
                        <ProgressiveBlur
                            className="pointer-events-none absolute right-0 top-0 h-full w-20"
                            direction="right"
                            blurIntensity={1}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LogoCloudBlock;
