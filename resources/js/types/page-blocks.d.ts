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
    | FaqBlock;

export interface PageContent {
    blocks: PageBlock[];
}
