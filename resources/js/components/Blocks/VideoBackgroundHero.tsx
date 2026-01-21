import React, { useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { InfiniteSlider } from '@/components/motion-primitives/infinite-slider';
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur';
import { ChevronRight } from 'lucide-react';


interface VideoBackgroundHeroProps {
    title?: string;
    subtitle?: string;
    ctaText1?: string;
    ctaLink1?: string;
    ctaText2?: string;
    ctaLink2?: string;
    videoUrl?: string;
    logos?: Array<{ name: string; url: string }>;
    trustedByText?: string;
}

const DEFAULT_LOGOS = [
    { name: "Nvidia", url: "https://html.tailus.io/blocks/customers/nvidia.svg" },
    { name: "Column", url: "https://html.tailus.io/blocks/customers/column.svg" },
    { name: "GitHub", url: "https://html.tailus.io/blocks/customers/github.svg" },
    { name: "Nike", url: "https://html.tailus.io/blocks/customers/nike.svg" },
    { name: "LemonSqueezy", url: "https://html.tailus.io/blocks/customers/lemonsqueezy.svg" },
    { name: "Laravel", url: "https://html.tailus.io/blocks/customers/laravel.svg" },
    { name: "Lilly", url: "https://html.tailus.io/blocks/customers/lilly.svg" },
    { name: "OpenAI", url: "https://html.tailus.io/blocks/customers/openai.svg" }
];

const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let videoId = "";
        if (url.includes("youtu.be")) {
            videoId = url.split("youtu.be/")[1]?.split("?")[0];
        } else {
            videoId = url.split("v=")[1]?.split("&")[0];
        }
        // YouTube background params: autoplay, mute, loop, controls=0, disablekb=1, playlist (required for loop)
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&disablekb=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1`;
    } else if (url.includes("vimeo.com")) {
        const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
        // Vimeo background params: autoplay, background=1, loop, muted, byline=0, portrait=0, title=0
        return `https://player.vimeo.com/video/${videoId}?autoplay=1&background=1&loop=1&muted=1&byline=0&portrait=0&title=0`;
    }
    return url;
};

const getVideoType = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("vimeo.com")) return "vimeo";
    return "direct";
};

export default function VideoBackgroundHero({
    title = "Build 10x Faster with NS",
    subtitle = "Highly customizable components for building modern websites and applications you mean it.",
    ctaText1 = "Start Building",
    ctaLink1 = "#",
    ctaText2 = "Request a demo",
    ctaLink2 = "#",
    videoUrl = "https://videos.pexels.com/video-files/30333849/13003128_2560_1440_25fps.mp4",
    logos = [],
    trustedByText = "Trusted by industry leaders"
}: VideoBackgroundHeroProps) {
    const activeLogos = logos && logos.length > 0 ? logos : DEFAULT_LOGOS;
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoType = getVideoType(videoUrl);
    const embedUrl = getEmbedUrl(videoUrl);

    useEffect(() => {
        console.log(`[VideoHero] Type: ${videoType}, URL: ${videoUrl}`);
        if (videoType === "direct" && videoRef.current) {
            videoRef.current.play().catch(err => console.error("[VideoHero] Play failed:", err));
        }
    }, [videoUrl, videoType]);

    return (
        <section className="relative w-full min-h-screen overflow-hidden flex flex-col justify-between bg-black">
            {/* Background Layer */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
                {videoType === "direct" ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-60"
                        src={videoUrl}
                        onError={(e) => console.error("[VideoHero] Source error:", e)}
                    />
                ) : (
                    <div className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2">
                        <iframe
                            src={embedUrl}
                            title="Background video"
                            className="w-full h-full pointer-events-none opacity-60 border-none"
                            allow="autoplay; fullscreen; picture-in-picture"
                        />
                    </div>
                )}
                {/* Gradient Overlay for better readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 z-10" />
            </div>

            {/* Content Layer */}
            <div className="relative z-20 flex-grow flex items-center px-6 md:px-12">
                <div className="max-w-7xl mx-auto w-full pt-20">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {title}
                        </h1>
                        <p className="text-xl md:text-2xl text-white/70 max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-8 delay-150 duration-700">
                            {subtitle}
                        </p>
                        <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-8 delay-300 duration-700">
                            <Button
                                asChild
                                size="lg"
                                className="h-14 px-8 rounded-full text-lg font-bold group bg-primary hover:bg-primary/90 text-primary-foreground border-none"
                            >
                                <Link href={ctaLink1}>
                                    {ctaText1}
                                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="h-14 px-8 rounded-full text-lg font-bold border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-black hover:border-white transition-all"
                            >
                                <Link href={ctaLink2}>
                                    {ctaText2}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Logo Cloud */}
            <div className="relative z-30 bg-black/40 backdrop-blur-md border-t border-white/10 py-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center gap-8">
                    <div className="shrink-0 px-4">
                        <p className="text-white/40 text-sm font-medium uppercase tracking-widest whitespace-nowrap">
                            {trustedByText}
                        </p>
                    </div>
                    <div className="flex-grow overflow-hidden relative">
                        <InfiniteSlider duration={25} gap={100}>
                            {activeLogos.map((logo, idx) => (
                                <img
                                    key={`${logo.name}-${idx}`}
                                    src={logo.url}
                                    alt={logo.name}
                                    className="h-6 md:h-8 w-auto invert opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                                />
                            ))}
                        </InfiniteSlider>
                        <ProgressiveBlur
                            className="pointer-events-none absolute left-0 top-0 h-full w-32 z-10"
                            direction="left"
                            blurIntensity={1.5}
                        />
                        <ProgressiveBlur
                            className="pointer-events-none absolute right-0 top-0 h-full w-32 z-10"
                            direction="right"
                            blurIntensity={1.5}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
