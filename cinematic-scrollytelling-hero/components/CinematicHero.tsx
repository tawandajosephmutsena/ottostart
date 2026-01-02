
import React, { useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { SLIDES } from '../constants';

gsap.registerPlugin(ScrollTrigger);

const MotionH1 = motion.h1 as any;
const MotionDiv = motion.div as any;
const MotionSpan = motion.span as any;

const CinematicHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const topTextRef = useRef<HTMLDivElement>(null);
  const bottomTextRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Split title into words/characters for high-impact entry
  const titleWords = useMemo(() => 
    SLIDES[activeIndex].title.split(' '), 
  [activeIndex]);

  useGSAP(() => {
    if (!containerRef.current || !stickyRef.current) return;

    const images = gsap.utils.toArray<HTMLElement>('.slide-image');
    
    // Total scrub distance and smoothing
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 4.5, // Smooth cinematic response
        pin: stickyRef.current,
        pinSpacing: false,
        onUpdate: (self) => {
          const p = self.progress;
          /**
           * Sychronizing Index Swapping with Crossfades:
           * We switch the text content at the midpoint of the crossfade transitions.
           */
          let nextIndex = 0;
          if (p >= 0.33 && p < 0.66) nextIndex = 1;
          else if (p >= 0.66) nextIndex = 2;
          
          if (nextIndex !== activeIndex) {
            setActiveIndex(nextIndex);
          }
        }
      },
    });

    // Intense Parallax Drift for UI layers
    tl.to(topTextRef.current, { y: -160, ease: 'none' }, 0);
    tl.to(bottomTextRef.current, { y: 100, ease: 'none' }, 0);

    // Timeline Configuration for Crossfades
    // We use a normalized 0-1 scale for the timeline labels to map easily to ScrollTrigger progress.
    const transitionWidth = 0.15; // The width of the crossfade (e.g., 15% of scroll)

    images.forEach((img, i) => {
      // Independent Continuous "Breathing" for Depth
      gsap.to(img, {
        scale: 1.25,
        y: '4%',
        rotation: 0.8,
        duration: 45 + (i * 15),
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });

      if (i === 0) {
        // First image starts at 1
        gsap.set(img, { opacity: 1 });
        // Fades out exactly when the next one fades in
        tl.to(img, { opacity: 0, duration: transitionWidth, ease: 'power1.inOut' }, 0.33 - (transitionWidth / 2));
      } else {
        // Other images start at 0
        gsap.set(img, { opacity: 0 });
        
        const center = i === 1 ? 0.33 : 0.66;
        const start = center - (transitionWidth / 2);
        const end = center + (transitionWidth / 2);

        // Fade In
        tl.to(img, { opacity: 1, duration: transitionWidth, ease: 'power1.inOut' }, start);
        
        // Fade Out (if not the last slide)
        if (i < images.length - 1) {
          const nextCenter = 0.66;
          const nextStart = nextCenter - (transitionWidth / 2);
          tl.to(img, { opacity: 0, duration: transitionWidth, ease: 'power1.inOut' }, nextStart);
        }
      }
    });

  }, { scope: containerRef, dependencies: [activeIndex] });

  return (
    <div ref={containerRef} className="relative w-full h-[650vh] bg-black">
      <div 
        ref={stickyRef} 
        className="sticky top-0 w-full h-screen overflow-hidden flex flex-col"
      >
        {/* Cinematic Background Images */}
        <div className="absolute inset-0 z-0 bg-black">
          {SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className="slide-image absolute inset-0 w-full h-full grayscale-[0.05] contrast-[1.1] brightness-[0.9]"
              style={{ 
                backgroundImage: `url('${slide.image}')`, 
                backgroundSize: 'cover',
                backgroundPosition: 'center 40%',
                backgroundRepeat: 'no-repeat',
                opacity: idx === 0 ? 1 : 0 
              }}
            >
              {/* Dynamic shadow mapping */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
              <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/40" />
            </div>
          ))}
        </div>

        {/* Cinematic UI Layer */}
        <div className="relative z-10 h-full w-full max-w-[1920px] mx-auto p-8 md:p-24 flex flex-col justify-between pointer-events-none">
          
          {/* Top Section: Staggered Title + Tagline */}
          <div ref={topTextRef} className="flex flex-col md:flex-row justify-between items-start w-full">
            <div className="overflow-visible">
              <AnimatePresence mode="wait">
                <MotionH1
                  key={`title-${activeIndex}`}
                  className="font-din font-bold text-7xl md:text-[10rem] text-primary leading-[0.82] tracking-tighter uppercase max-w-5xl drop-shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-wrap gap-x-6"
                >
                  {titleWords.map((word: string, i: number) => (
                    <MotionSpan
                      key={i}
                      initial={{ opacity: 0, y: 100, rotateX: -90 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      exit={{ opacity: 0, y: -100, rotateX: 90 }}
                      transition={{ 
                        duration: 1.4, 
                        delay: i * 0.08, 
                        ease: [0.19, 1, 0.22, 1] 
                      }}
                    >
                      {word}
                    </MotionSpan>
                  ))}
                </MotionH1>
              </AnimatePresence>
            </div>

            <div className="overflow-hidden mt-8 md:mt-16">
              <AnimatePresence mode="wait">
                <MotionDiv
                  key={`tag-${activeIndex}`}
                  initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                  animate={{ opacity: 0.9, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="font-inter font-bold text-2xl md:text-3xl text-white tracking-[0.2em] border-l-4 border-primary pl-6 py-1"
                >
                  {SLIDES[activeIndex].tagline.toUpperCase()}
                </MotionDiv>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Section: Progress + Narrative */}
          <div ref={bottomTextRef} className="flex flex-col md:flex-row justify-between items-end w-full">
            {/* Visual Narrative Progress */}
            <div className="hidden md:flex items-center gap-12 mb-16">
              <div className="flex flex-col gap-4">
                {SLIDES.map((_, idx) => (
                  <div key={idx} className="flex items-center gap-6 group">
                    <span className={`font-din text-sm tracking-widest transition-all duration-1000 ${idx === activeIndex ? 'text-primary' : 'text-white/20'}`}>
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <div className="h-[40px] w-[1px] bg-white/10 relative overflow-hidden">
                      <MotionDiv 
                        initial={false}
                        animate={{ height: idx === activeIndex ? '100%' : '0%' }}
                        className="absolute top-0 left-0 w-full bg-primary transition-all duration-1000"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-[1px] h-[150px] bg-white/5" />
            </div>

            <div className="overflow-visible mb-4">
              <AnimatePresence mode="wait">
                <MotionDiv
                  key={`sub-${activeIndex}`}
                  initial={{ opacity: 0, y: 40, letterSpacing: '0.1em' }}
                  animate={{ opacity: 1, y: 0, letterSpacing: '-0.01em' }}
                  exit={{ opacity: 0, y: -40, letterSpacing: '0.1em' }}
                  transition={{ duration: 2, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
                  className="max-w-2xl text-right"
                >
                  <p className="font-inter text-2xl md:text-4xl text-white font-light leading-[1.25] tracking-tight text-gray-200">
                    {SLIDES[activeIndex].subtitle}
                  </p>
                  <MotionDiv 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, delay: 0.8 }}
                    className="h-[1px] bg-primary/30 mt-8 ml-auto"
                  />
                </MotionDiv>
              </AnimatePresence>
            </div>
          </div>

          {/* Subtle Interaction Hint */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-5 group opacity-30 hover:opacity-100 transition-all duration-1000 cursor-pointer">
            <MotionDiv
              animate={{ height: [40, 60, 40] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-[1px] bg-primary"
            />
            <span className="font-din text-white uppercase tracking-[0.6em] text-[9px]">Scroll to Witness</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CinematicHero;
