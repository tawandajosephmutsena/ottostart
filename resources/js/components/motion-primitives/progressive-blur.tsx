import { cn } from '@/lib/utils';

type ProgressiveBlurProps = {
  className?: string;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  blurIntensity?: number;
};

export function ProgressiveBlur({
  className,
  direction = 'left',
  blurIntensity = 1,
}: ProgressiveBlurProps) {
  const getGradient = () => {
    switch (direction) {
      case 'left':
        return 'linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)';
      case 'right':
        return 'linear-gradient(to left, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)';
      case 'top':
        return 'linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)';
      case 'bottom':
        return 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)';
      default:
        return 'none';
    }
  };

  // Simplification: CSS mask-image is often used for this. 
  // But strictly for a "progressive blur" it might be more complex with multiple layers.
  // For now, based on the usage in the prompt (masking edges), a gradient mask is likely what is intended 
  // OR a backdrop-filter mask.
  // Given "ProgressiveBlur", it often implies multiple layers of blur.
  // However, looking at the user code, it's overlaying divs with "bg-linear-to-r".
  // The user code HAS `bg-linear-to-r` divs AND `ProgressiveBlur`.
  // `ProgressiveBlur` might be adding the blur itself.
  
  // Let's implement a simple version that uses backdrop-filter with a mask.
  
  return (
    <div
      className={cn('absolute z-10', className)}
       
      style={{
        backdropFilter: `blur(${blurIntensity * 8}px)`,
        maskImage: getGradient(),
        WebkitMaskImage: getGradient(),
      }}
    />
  );
}
