import { cn } from '@/lib/utils';
import { useMotionValue, animate } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const translation = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [contentSize, setContentSize] = useState(0);

  const currentDuration = (isHovered && durationOnHover) ? durationOnHover : duration;

  useEffect(() => {
    let controls: any;
    const element = ref.current;
    if (!element) return;

    const measureContent = () => {
      if (direction === 'horizontal') {
        setContentSize(element.scrollWidth / 2);
      } else {
        setContentSize(element.scrollHeight / 2);
      }
    };

    measureContent();

    const observer = new ResizeObserver(() => {
      measureContent();
    });

    observer.observe(element);
    
    // Force measurement after a small delay to handle image loading/layout shifts
    const timeoutId = setTimeout(measureContent, 100);

    if (contentSize > 0) {
        controls = animate(translation, reverse ? [-contentSize, 0] : [0, -contentSize], {
            ease: 'linear',
            duration: currentDuration,
            repeat: Infinity,
            repeatType: 'loop',
            repeatDelay: 0,
            onUpdate: (latest) => {
              if (direction === 'horizontal') {
                element.style.transform = `translateX(${latest}px)`;
              } else {
                element.style.transform = `translateY(${latest}px)`;
              }
            },
        });
    }

    return () => {
      controls?.stop();
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [translation, currentDuration, contentSize, direction, reverse]);

  return (
    <div
      className={cn('overflow-hidden', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={ref}
        className={cn('flex w-max', direction === 'vertical' && 'flex-col h-max')}
         
        style={{ gap: gap }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
