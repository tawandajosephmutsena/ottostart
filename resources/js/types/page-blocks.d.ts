import { FormField } from './index';

/**
 * Type definitions for page builder blocks
 */

export interface BaseBlock {
    id: string;
    type: string;
    is_enabled: boolean;
    order?: number;
}

export interface HeroBlock extends BaseBlock {
    type: 'hero';
    content: {
        title: string;
        subtitle: string;
        description: string;
        ctaText: string;
        ctaHref: string;
        marqueeText?: string;
        backgroundImages?: string[];
        showFloatingImages?: boolean;
        secondaryCtaText?: string;
        secondaryCtaHref?: string;
    };
}

export interface StatsBlock extends BaseBlock {
    type: 'stats';
    content: {
        items: Array<{
            value: string;
            label: string;
            suffix?: string;
        }>;
    };
}

export interface ServicesBlock extends BaseBlock {
    type: 'services';
    content: {
        title: string;
        limit?: number;
        useStackedCards?: boolean;
    };
}

export interface PortfolioBlock extends BaseBlock {
    type: 'portfolio';
    content: {
        title: string;
        limit?: number;
    };
}

export interface InsightsBlock extends BaseBlock {
    type: 'insights';
    content: {
        title: string;
        limit?: number;
    };
}

export interface CtaBlock extends BaseBlock {
    type: 'cta';
    content: {
        title: string;
        subtitle: string;
        ctaText: string;
        ctaHref: string;
        email: string;
    };
}

export interface TextBlock extends BaseBlock {
    type: 'text';
    content: {
        title?: string;
        body: string;
        layout?: string;
        textSize?: string;
        textAlign?: string;
        columns?: Array<{
            id: string;
            type: 'text' | 'image' | 'video' | 'button';
            content: Record<string, unknown>; // Using Record for flexibility
        }>;
    };
}

export interface ImageBlock extends BaseBlock {
    type: 'image';
    content: {
        url: string;
        alt: string;
        caption?: string;
    };
}

export interface CinematicHeroBlock extends BaseBlock {
    type: 'cinematic_hero';
    content: {
        slides: Array<{
            title: string;
            subtitle: string;
            tagline: string;
            image: string;
        }>;
    };
}

export interface FormBlock extends BaseBlock {
    type: 'form';
    content: {
        title: string;
        description: string;
        steps: Array<{
            id: string;
            title?: string;
            fields: FormField[];
        }>;
        submitText: string;
    };
}

export interface StoryBlock extends BaseBlock {
    type: 'story';
    content: {
        title: string;
        subtitle: string;
        body: string;
        items: Array<{
            value: string;
            label: string;
        }>;
    };
}

export interface ManifestoBlock extends BaseBlock {
    type: 'manifesto';
    content: {
        title: string;
        subtitle: string;
        items: Array<{
            emoji: string;
            title: string;
            desc: string;
        }>;
    };
}

export interface ProcessBlock extends BaseBlock {
    type: 'process';
    content: {
        title: string;
        subtitle: string;
        items: Array<{
            step: string;
            title: string;
            desc: string;
        }>;
    };
}

export interface ContactInfoBlock extends BaseBlock {
    type: 'contact_info';
    content: {
        title: string;
        subtitle: string;
        items: Array<{
            label: string;
            value: string;
            href?: string;
        }>;
        office_hours: string[];
        show_map?: boolean;
        google_maps_url?: string;
    };
}

export interface FaqBlock extends BaseBlock {
    type: 'faq';
    content: {
        title: string;
        subtitle: string;
        items: Array<{
            q: string;
            a: string;
        }>;
    };
}

export interface VideoBlock extends BaseBlock {
    type: 'video';
    content: {
        url: string;
    };
}

export interface AnimatedShaderHeroBlock extends BaseBlock {
    type: 'animated_shader_hero';
    content: {
        trustBadge?: { text: string; icons?: string[] };
        headline: { line1: string; line2: string };
        subtitle: string;
        buttons?: {
            primary?: { text: string; url?: string };
            secondary?: { text: string; url?: string };
        };
    };
}

export interface FeaturesBlock extends BaseBlock {
    type: 'features';
    content: {
        title: string;
        items: Array<{
            title: string;
            desc: string;
        }>;
    };
}

export type PageBlock =
    | HeroBlock
    | StatsBlock
    | ServicesBlock
    | PortfolioBlock
    | InsightsBlock
    | CtaBlock
    | TextBlock
    | ImageBlock
    | CinematicHeroBlock
    | FormBlock
    | StoryBlock
    | ManifestoBlock
    | ProcessBlock
    | ContactInfoBlock
    | FaqBlock
    | VideoBlock
    | FeaturesBlock
    | AnimatedShaderHeroBlock
    | TestimonialBlock
    | LogoCloudBlock
    | CoverDemoBlock
    | AppleCardsCarouselBlock
    | VideoBackgroundHeroBlock
    | ParallaxFeaturesBlock
    | GSAPHorizontalScrollBlock;

export interface TestimonialBlock extends BaseBlock {
    type: 'testimonials';
    content: {
        title?: string;
        subtitle?: string;
        description?: string;
        items?: Array<{
            text: string;
            image: string;
            name: string;
            role: string;
        }>;
    };
}

export interface LogoCloudBlock extends BaseBlock {
    type: 'logo_cloud';
    content: {
        title?: string;
        items?: Array<{
            name: string;
            url: string;
        }>;
    };
}

export interface CoverDemoBlock extends BaseBlock {
    type: 'cover_demo';
    content: {
        titleOne?: string;
        titleTwo?: string;
        coverText?: string;
        fontSize?: string;
        fontWeight?: string;
    };
}

export interface AppleCardsCarouselBlock extends BaseBlock {
    type: 'apple_cards_carousel';
    content: {
        title?: string;
        items?: Array<{
            image: string;
            title: string;
            category: string;
            content: string;
            link?: string;
        }>;
    };
}

export interface VideoBackgroundHeroBlock extends BaseBlock {
    type: 'video_background_hero';
    content: {
        title?: string;
        subtitle?: string;
        ctaText1?: string;
        ctaLink1?: string;
        ctaText2?: string;
        ctaLink2?: string;
        videoUrl?: string;
    };
}

export interface PageContent {
    blocks: PageBlock[];
}

export interface ParallaxFeaturesBlock extends BaseBlock {
    type: 'parallax_features';
    content: {
        title?: string;
        subtitle?: string;
        items?: Array<{
            title: string;
            description: string;
            image?: string;
            icon?: string;
        }>;
    };
}

export interface GSAPHorizontalScrollBlock extends BaseBlock {
    type: 'gsap_horizontal_scroll';
    content: {
        title?: string;
        subtitle?: string;
        items?: Array<{
            title: string;
            description: string;
            image?: string;
            tag?: string;
            link?: string;
        }>;
        backgroundColor?: string;
    };
}
