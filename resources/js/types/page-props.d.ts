import { Page, PortfolioItem, Service, Insight } from './index';
import { PageContent } from './page-blocks';

/**
 * Type definitions for page component props
 */

export interface SiteSettings {
    name: string;
    tagline?: string;
    description?: string;
    url?: string;
    logo?: string;
    social?: {
        github?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
    };
    contact?: {
        address?: string;
        phone?: string;
        email?: string;
    };
}

export interface StatsData {
    projects_completed: number;
    services_offered: number;
    insights_published: number;
    years_experience: number;
}

export interface HomePageProps {
    page: Page & {
        content?: PageContent;
    };
    featuredProjects: PortfolioItem[];
    featuredServices: Service[];
    recentInsights: Insight[];
    stats: StatsData;
    structuredData: Record<string, unknown>;
    site: SiteSettings;
    canRegister?: boolean;
}
