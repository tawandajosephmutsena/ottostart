import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}
export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}
export interface PortfolioItem {
    id: number;
    title: string;
    slug: string;
    description: string;
    content: {
        overview?: string;
        challenge?: string;
        solution?: string;
        results?: string;
    } | null;
    featured_image: string | null;
    gallery: string[] | null;
    client: string | null;
    project_date: string | null;
    project_url: string | null;
    technologies: string[] | null;
    is_featured: boolean;
    is_published: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface Service {
    id: number;
    title: string;
    slug: string;
    description: string;
    content: Record<string, unknown> | null;
    icon: string | null;
    featured_image: string | null;
    price_range: string | null;
    is_featured: boolean;
    is_published: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface Insight {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: Record<string, unknown> | null;
    featured_image: string | null;
    author_id: number;
    category_id: number | null;
    tags: string[] | null;
    reading_time: number | null;
    is_featured: boolean;
    is_published: boolean;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    author?: User;
    category?: Category;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
}

export interface TeamMember {
    id: number;
    name: string;
    position: string;
    bio: string;
    avatar: string | null;
    email: string | null;
    social_links: {
        twitter?: string;
        linkedin?: string;
        github?: string;
        website?: string;
    } | null;
    is_featured: boolean;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}
export interface MediaAsset {
    id: number;
    filename: string;
    original_name: string;
    mime_type: string;
    size: number;
    path: string;
    url: string;
    alt_text: string | null;
    caption: string | null;
    folder: string;
    tags: string[] | null;
    is_image: boolean;
    is_video: boolean;
    created_at: string;
    updated_at: string;
}
