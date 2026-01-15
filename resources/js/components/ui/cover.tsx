"use client";
import React, { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { SparklesCore } from "@/components/ui/sparkles";

export const Cover = ({
  children,
  className,
  beamDuration,
  beamDelay,
  sparkleCount = 500,
  sparkleColor = "#FFFFFF",
}: {
  children?: React.ReactNode;
  className?: string;
  beamDuration?: number;
  beamDelay?: number;
  sparkleCount?: number;
  sparkleColor?: string;
}) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [beamPositions, setBeamPositions] = useState<number[]>([]);
  const [beamData, setBeamData] = useState<Array<{ duration: number; delay: number }>>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const updateDimensions = () => {
      const width = el.clientWidth ?? 0;
      const height = el.clientHeight ?? 0;
      setContainerWidth(width);

      const numberOfBeams = Math.floor(height / 10);
      const positions = Array.from(
        { length: numberOfBeams },
        (_, i) => (i + 1) * (height / (numberOfBeams + 1))
      );
      setBeamPositions(positions);

      setBeamData(positions.map(() => ({
        duration: beamDuration || Math.random() * 2 + 1,
        delay: beamDelay || Math.random() * 2 + 1,
      })));
    };

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(el);
    updateDimensions();

    return () => observer.disconnect();
  }, [beamDuration, beamDelay]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={ref}
      className="relative hover:bg-primary/10  group/cover inline-block bg-accent/20 px-2 py-2  transition duration-200 rounded-sm"
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: {
                duration: 0.2,
              },
            }}
            className="h-full w-full overflow-hidden absolute inset-0"
          >
            <motion.div
              animate={{
                translateX: ["-50%", "0%"],
              }}
              transition={{
                translateX: {
                  duration: 10,
                  ease: "linear",
                  repeat: Infinity,
                },
              }}
              className="w-[200%] h-full flex"
            >
              <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={sparkleCount}
                className="w-full h-full"
                particleColor={sparkleColor}
              />
              <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={sparkleCount}
                className="w-full h-full"
                particleColor={sparkleColor}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {beamPositions.map((position, index) => (
        <Beam
          key={index}
          hovered={hovered}
          duration={beamData[index]?.duration}
          delay={beamData[index]?.delay}
          width={containerWidth}
          style={{
            top: `${position}px`,
          }}
        />
      ))}
      <motion.span
        key={String(hovered)}
        animate={{
          scale: hovered ? 0.8 : 1,
          x: hovered ? [0, -30, 30, -30, 30, 0] : 0,
          y: hovered ? [0, 30, -30, 30, -30, 0] : 0,
        }}
        exit={{
          filter: "none",
          scale: 1,
          x: 0,
          y: 0,
        }}
        transition={{
          duration: 0.2,
          x: {
            duration: 0.2,
            repeat: Infinity,
            repeatType: "loop",
          },
          y: {
            duration: 0.2,
            repeat: Infinity,
            repeatType: "loop",
          },
          scale: {
            duration: 0.2,
          },
          filter: {
            duration: 0.2,
          },
        }}
        className={cn(
          "text-foreground inline-block relative z-20 group-hover/cover:text-primary transition duration-200",
          className
        )}
      >
        {children}
      </motion.span>
      <CircleIcon className="absolute -right-[2px] -top-[2px] bg-primary" />
      <CircleIcon className="absolute -bottom-[2px] -right-[2px] bg-primary" />
      <CircleIcon className="absolute -left-[2px] -top-[2px] bg-primary" />
      <CircleIcon className="absolute -bottom-[2px] -left-[2px] bg-primary" />
    </div>
  );
};

export const Beam = ({
  className,
  delay,
  duration,
  hovered,
  width = 600,
  ...svgProps
}: {
  className?: string;
  delay?: number;
  duration?: number;
  hovered?: boolean;
  width?: number;
} & React.ComponentProps<typeof motion.svg>) => {
  const id = useId();
  const [randomValues] = useState(() => ({
    delay: Math.random() * (1 - 0.2) + 0.2,
    repeatDelay: Math.random() * (2 - 1) + 1,
  }));

  return (
    <motion.svg
      width={width ?? "600"}
      height="1"
      viewBox={`0 0 ${width ?? "600"} 1`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("absolute inset-x-0 w-full", className)}
      {...svgProps}
    >
      <motion.path
        d={`M0 0.5H${width ?? "600"}`}
        stroke={`url(#svgGradient-${id})`}
      />

      <defs>
        <motion.linearGradient
          id={`svgGradient-${id}`}
          key={String(hovered)}
          gradientUnits="userSpaceOnUse"
          initial={{
            x1: "0%",
            x2: hovered ? "-10%" : "-5%",
            y1: 0,
            y2: 0,
          }}
          animate={{
            x1: "110%",
            x2: hovered ? "100%" : "105%",
            y1: 0,
            y2: 0,
          }}
          transition={{
            duration: hovered ? 0.5 : duration ?? 2,
            ease: "linear",
            repeat: Infinity,
            delay: hovered ? randomValues.delay : 0,
            repeatDelay: hovered ? randomValues.repeatDelay : delay ?? 1,
          }}
        >
          <stop stopColor="var(--primary)" stopOpacity="0" />
          <stop stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </motion.svg>
  );
};

export const CircleIcon = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <div
      className={cn(
        `pointer-events-none animate-pulse group-hover/cover:hidden group-hover/cover:opacity-100 group h-2 w-2 rounded-full opacity-20 group-hover/cover:bg-primary`,
        className
      )}
    ></div>
  );
};
