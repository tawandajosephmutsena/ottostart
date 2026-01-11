import { Cover } from "@/components/ui/cover";
import { cn } from "@/lib/utils";

interface CoverDemoProps {
  titleOne?: string;
  titleTwo?: string;
  coverText?: string;
  className?: string;
  titleClassName?: string;
}

export default function CoverDemo({
  titleOne = "Build amazing websites",
  titleTwo = "at",
  coverText = "warp speed",
  className,
  titleClassName,
}: CoverDemoProps) {
  return (
    <div className={className}>
      <h1 className={cn("text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white", titleClassName)}>
        {titleOne} <br /> {titleTwo} <Cover>{coverText}</Cover>
      </h1>
    </div>
  );
}
