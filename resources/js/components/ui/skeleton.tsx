import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/50",
        // Shimmer effect
        "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:content-['']",
        "dark:after:via-white/5",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
