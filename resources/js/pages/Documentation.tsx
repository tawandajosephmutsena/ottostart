import MainLayout from '@/layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    BookOpen, 
    Layout, 
    Image, 
    Settings, 
    Code, 
    Rocket,
    Search,
    FileText,
    Users,
    Shield,
    Zap,
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface DocSection {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    subsections: {
        id: string;
        title: string;
        content: React.ReactNode;
    }[];
}

export default function Documentation() {
    const [activeSection, setActiveSection] = useState('getting-started');
    const [activeSubsection, setActiveSubsection] = useState('overview');

    const sections: DocSection[] = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            icon: Rocket,
            subsections: [
                {
                    id: 'overview',
                    title: 'Overview',
                    content: (
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                                Welcome to Your CMS
                            </h2>
                            <p className="text-lg text-agency-primary/70 dark:text-white/70 leading-relaxed">
                                This comprehensive guide will help you master every aspect of your content management system,
                                from creating your first page to advanced customizations.
                            </p>
                            <div className="grid md:grid-cols-2 gap-6 mt-8">
                                <div className="p-6 rounded-2xl bg-agency-secondary dark:bg-white/5 border border-agency-primary/10 dark:border-white/10">
                                    <BookOpen className="size-8 text-agency-accent mb-4" />
                                    <h3 className="font-bold text-xl mb-2">For Content Creators</h3>
                                    <p className="text-sm text-agency-primary/60 dark:text-white/60">
                                        Learn how to create, edit, and publish content using our intuitive page builder.
                                    </p>
                                </div>
                                <div className="p-6 rounded-2xl bg-agency-secondary dark:bg-white/5 border border-agency-primary/10 dark:border-white/10">
                                    <Code className="size-8 text-agency-accent mb-4" />
                                    <h3 className="font-bold text-xl mb-2">For Developers</h3>
                                    <p className="text-sm text-agency-primary/60 dark:text-white/60">
                                        Deep dive into the architecture, components, and customization options.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ),
                },
                {
                    id: 'login',
                    title: 'Logging In',
                    content: (
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                                Accessing the Admin Panel
                            </h2>
                            <div className="space-y-4">
                                <div className="p-6 rounded-2xl bg-agency-accent/10 border border-agency-accent/20">
                                    <p className="font-mono text-sm mb-2">Step 1:</p>
                                    <p>Navigate to <code className="px-2 py-1 bg-black/10 dark:bg-white/10 rounded">/login</code> in your browser</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-agency-accent/10 border border-agency-accent/20">
                                    <p className="font-mono text-sm mb-2">Step 2:</p>
                                    <p>Enter your email and password credentials</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-agency-accent/10 border border-agency-accent/20">
                                    <p className="font-mono text-sm mb-2">Step 3:</p>
                                    <p>You'll be redirected to the admin dashboard at <code className="px-2 py-1 bg-black/10 dark:bg-white/10 rounded">/admin</code></p>
                                </div>
                            </div>
                        </div>
                    ),
                },
                {
                    id: 'dashboard',
                    title: 'Dashboard Overview',
                    content: (
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                                Your Admin Dashboard
                            </h2>
                            <p className="text-lg text-agency-primary/70 dark:text-white/70">
                                The dashboard provides a comprehensive overview of your site's content and activity.
                            </p>
                            <div className="space-y-4">
                                <div className="border-l-4 border-agency-accent pl-6">
                                    <h4 className="font-bold text-lg mb-2">Statistics Cards</h4>
                                    <p className="text-agency-primary/60 dark:text-white/60">
                                        View totals for portfolio items, services, insights, and inquiries with published/featured counts.
                                    </p>
                                </div>
                                <div className="border-l-4 border-blue-400 pl-6">
                                    <h4 className="font-bold text-lg mb-2">Activity Overview</h4>
                                    <p className="text-agency-primary/60 dark:text-white/60">
                                        Visual chart showing site engagement trends over the past 12 days.
                                    </p>
                                </div>
                                <div className="border-l-4 border-purple-400 pl-6">
                                    <h4 className="font-bold text-lg mb-2">Quick Actions</h4>
                                    <p className="text-agency-primary/60 dark:text-white/60">
                                        One-click access to create new content, upload media, or manage settings.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ),
                },
            ],
        },
        {
            id: 'content-creation',
            title: 'Content Creation',
            icon: FileText,
            subsections: [
                {
                    id: 'portfolio',
                    title: 'Portfolio Items',
                    content: (
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                                Managing Portfolio Items
                            </h2>
                            <p className="text-lg text-agency-primary/70 dark:text-white/70">
                                Showcase your projects and work with rich portfolio entries.
                            </p>
                            <div className="bg-agency-secondary dark:bg-white/5 p-6 rounded-2xl space-y-4">
                                <h4 className="font-bold text-xl">Creating a Portfolio Item</h4>
                                <ol className="list-decimal list-inside space-y-3">
                                    <li>Navigate to <strong>Portfolio</strong> in the sidebar</li>
                                    <li>Click <strong>Create Portfolio Item</strong></li>
                                    <li>Fill in the required fields:
                                        <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm text-agency-primary/60 dark:text-white/60">
                                            <li><strong>Title:</strong> Project name</li>
                                            <li><strong>Slug:</strong> URL-friendly identifier (auto-generated)</li>
                                            <li><strong>Client:</strong> Client name (optional)</li>
                                            <li><strong>Description:</strong> Brief overview</li>
                                            <li><strong>Content:</strong> Full project details</li>
                                            <li><strong>Featured Image:</strong> Main project image</li>
                                            <li><strong>Technologies:</strong> Stack used (comma-separated)</li>
                                            <li><strong>Project URL:</strong> Live project link (optional)</li>
                                        </ul>
                                    </li>
                                    <li>Toggle <strong>Published</strong> to make it live</li>
                                    <li>Toggle <strong>Featured</strong> to highlight it</li>
                                    <li>Click <strong>Save Portfolio Item</strong></li>
                                </ol>
                            </div>
                        </div>
                    ),
                },
                {
                    id: 'services',
                    title: 'Services',
                    content: (
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                                Managing Services
                            </h2>
                            <p className="text-lg text-agency-primary/70 dark:text-white/70">
                                Define and showcase the services you offer.
                            </p>
                            <div className="bg-agency-secondary dark:bg-white/5 p-6 rounded-2xl space-y-4">
                                <h4 className="font-bold text-xl">Service Fields</h4>
                                <div className="grid gap-4">
                                    <div className="p-4 border border-agency-primary/10 dark:border-white/10 rounded-xl">
                                        <h5 className="font-bold mb-2">Icon</h5>
                                        <p className="text-sm text-agency-primary/60 dark:text-white/60">
                                            Choose from: palette, layout, code, cpu, shield, rocket, globe, zap
                                        </p>
                                    </div>
                                    <div className="p-4 border border-agency-primary/10 dark:border-white/10 rounded-xl">
                                        <h5 className="font-bold mb-2">Price Range</h5>
                                        <p className="text-sm text-agency-primary/60 dark:text-white/60">
                                            Example: "$2,000 - $5,000" or "Starting at $1,000"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ),
                },
                {
                    id: 'blog',
                    title: 'Blog Posts (Insights)',
                    content: (
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                                Writing Blog Posts
                            </h2>
                            <p className="text-lg text-agency-primary/70 dark:text-white/70">
                                Share insights, articles, and thought leadership content.
                            </p>
                            <div className="space-y-4">
                                <div className="p-6 bg-gradient-to-br from-agency-accent/10 to-transparent border border-agency-accent/20 rounded-2xl">
                                    <h4 className="font-bold text-xl mb-4">SEO Best Practices</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="size-4 mt-0.5 text-agency-accent flex-shrink-0" />
                                            <span>Use descriptive, keyword-rich titles (50-60 characters)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="size-4 mt-0.5 text-agency-accent flex-shrink-0" />
                                            <span>Write compelling excerpts (150-160 characters)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="size-4 mt-0.5 text-agency-accent flex-shrink-0" />
                                            <span>Choose relevant categories for better organization</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="size-4 mt-0.5 text-agency-accent flex-shrink-0" />
                                            <span>Add high-quality featured images (1200x630px recommended)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="size-4 mt-0.5 text-agency-accent flex-shrink-0" />
                                            <span>Set accurate reading time estimates</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ),
                },
            ],
        },
        {
            id: 'page-builder',
            title: 'Page Builder',
            icon: Layout,
            subsections: [
                {
                    id: 'blocks-overview',
                    title: 'Block System Overview',
                    content: (
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                                Building Dynamic Pages
                            </h2>
                            <p className="text-lg text-agency-primary/70 dark:text-white/70">
                                The page builder allows you to create custom layouts using reusable content blocks.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    { name: 'Hero Block', desc: 'Large header with background image and CTA' },
                                    { name: 'Cinematic Hero', desc: 'Immersive scrolling hero with slides' },
                                    { name: 'Services Block', desc: 'Display your services in a grid' },
                                    { name: 'Portfolio Grid', desc: 'Showcase portfolio items' },
                                    { name: 'Stats Section', desc: 'Highlight key metrics and numbers' },
                                    { name: 'Team Grid', desc: 'Display team members' },
                                    { name: 'Contact Form', desc: 'Multi-step contact form' },
                                    { name: 'FAQ Block', desc: 'Frequently asked questions accordion' },
                                    { name: 'CTA Block', desc: 'Call-to-action section' },
                                    { name: 'Video Player', desc: 'Embedded video player' },
                                    { name: 'Manifesto Block', desc: 'Mission statement and values' },
                                    { name: 'Contact Info', desc: 'Business contact details' },
                                ].map((block) => (
                                    <div key={block.name} className="p-4 border border-agency-primary/10 dark:border-white/10 rounded-xl hover:border-agency-accent/50 transition-colors">
                                        <h5 className="font-bold mb-1">{block.name}</h5>
                                        <p className="text-xs text-agency-primary/60 dark:text-white/60">{block.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ),
                },
                {
                    id: 'adding-blocks',
                    title: 'Adding & Configuring Blocks',
                    content: (
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                                Working with Blocks
                            </h2>
                            <div className="space-y-4">
                                <div className="p-6 bg-agency-secondary dark:bg-white/5 rounded-2xl">
                                    <h4 className="font-bold text-xl mb-4">Step-by-Step Guide</h4>
                                    <ol className="space-y-4">
                                        <li className="flex gap-4">
                                            <span className="flex-shrink-0 size-8 rounded-full bg-agency-accent text-agency-primary font-black flex items-center justify-center text-sm">1</span>
                                            <div>
                                                <p className="font-semibold">Navigate to Pages</p>
                                                <p className="text-sm text-agency-primary/60 dark:text-white/60">Go to <strong>Pages</strong> in the sidebar and select or create a page</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-4">
                                            <span className="flex-shrink-0 size-8 rounded-full bg-agency-accent text-agency-primary font-black flex items-center justify-center text-sm">2</span>
                                            <div>
                                                <p className="font-semibold">Add a Block</p>
                                                <p className="text-sm text-agency-primary/60 dark:text-white/60">Click <strong>Add Block</strong> and select the desired block type</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-4">
                                            <span className="flex-shrink-0 size-8 rounded-full bg-agency-accent text-agency-primary font-black flex items-center justify-center text-sm">3</span>
                                            <div>
                                                <p className="font-semibold">Configure Content</p>
                                                <p className="text-sm text-agency-primary/60 dark:text-white/60">Fill in text fields, upload images, and adjust settings</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-4">
                                            <span className="flex-shrink-0 size-8 rounded-full bg-agency-accent text-agency-primary font-black flex items-center justify-center text-sm">4</span>
                                            <div>
                                                <p className="font-semibold">Reorder Blocks</p>
                                                <p className="text-sm text-agency-primary/60 dark:text-white/60">Drag and drop blocks to change their order</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-4">
                                            <span className="flex-shrink-0 size-8 rounded-full bg-agency-accent text-agency-primary font-black flex items-center justify-center text-sm">5</span>
                                            <div>
                                                <p className="font-semibold">Save & Publish</p>
                                                <p className="text-sm text-agency-primary/60 dark:text-white/60">Click <strong>Save Page</strong> and toggle <strong>Published</strong> to make it live</p>
                                            </div>
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    ),
                },
            ],
        },
        {
            id: 'media-library',
            title: 'Media Library',
            icon: Image,
            subsections: [
                {
                    id: 'uploading',
                    title: 'Uploading Files',
                    content: (
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                                Media Management
                            </h2>
                            <div className="p-6 bg-gradient-to-br from-agency-accent/10 to-purple-500/5 border border-agency-accent/20 rounded-2xl">
                                <h4 className="font-bold text-xl mb-4">Supported File Types</h4>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="font-semibold mb-2">Images</p>
                                        <ul className="text-sm space-y-1 text-agency-primary/60 dark:text-white/60">
                                            <li>JPG / JPEG</li>
                                            <li>PNG</li>
                                            <li>WebP</li>
                                            <li>SVG</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-2">Videos</p>
                                        <ul className="text-sm space-y-1 text-agency-primary/60 dark:text-white/60">
                                            <li>MP4</li>
                                            <li>WebM</li>
                                            <li>MOV</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-2">Documents</p>
                                        <ul className="text-sm space-y-1 text-agency-primary/60 dark:text-white/60">
                                            <li>PDF</li>
                                            <li>DOC / DOCX</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-bold text-xl">Upload Methods</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 border border-agency-primary/10 dark:border-white/10 rounded-xl">
                                        <h5 className="font-bold mb-2">Drag & Drop</h5>
                                        <p className="text-sm text-agency-primary/60 dark:text-white/60">
                                            Drag files directly into the upload area for quick uploads
                                        </p>
                                    </div>
                                    <div className="p-4 border border-agency-primary/10 dark:border-white/10 rounded-xl">
                                        <h5 className="font-bold mb-2">File Browser</h5>
                                        <p className="text-sm text-agency-primary/60 dark:text-white/60">
                                            Click to browse and select multiple files from your device
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ),
                },
                {
                    id: 'organizing',
                    title: 'Organizing Media',
                    content: (
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                                Media Organization
                            </h2>
                            <p className="text-lg text-agency-primary/70 dark:text-white/70">
                                Keep your media library organized with metadata and search features.
                            </p>
                            <div className="space-y-4">
                                <div className="border-l-4 border-agency-accent pl-6">
                                    <h4 className="font-bold text-lg mb-2">Alt Text</h4>
                                    <p className="text-agency-primary/60 dark:text-white/60">
                                        Add descriptive alt text for accessibility and SEO. Describe the image concisely.
                                    </p>
                                </div>
                                <div className="border-l-4 border-blue-400 pl-6">
                                    <h4 className="font-bold text-lg mb-2">Tags & Categories</h4>
                                    <p className="text-agency-primary/60 dark:text-white/60">
                                        Use tags like "portfolio", "blog", "team" to categorize media for easy finding.
                                    </p>
                                </div>
                                <div className="border-l-4 border-purple-400 pl-6">
                                    <h4 className="font-bold text-lg mb-2">Search & Filter</h4>
                                    <p className="text-agency-primary/60 dark:text-white/60">
                                        Use the search bar to find media by name, alt text, or tags.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ),
                },
            ],
        },
        {
            id: 'settings',
            title: 'Settings',
            icon: Settings,
            subsections: [
                {
                    id: 'site-settings',
                    title: 'General Settings',
                    content: (
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                                Site Configuration
                            </h2>
                            <div className="grid gap-4">
                                <div className="p-6 bg-agency-secondary dark:bg-white/5 rounded-2xl">
                                    <h4 className="font-bold text-xl mb-4">Key Settings</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="font-semibold">Site Name</p>
                                            <p className="text-sm text-agency-primary/60 dark:text-white/60">Your website's title</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Site Description</p>
                                            <p className="text-sm text-agency-primary/60 dark:text-white/60">Brief description for SEO</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Logo</p>
                                            <p className="text-sm text-agency-primary/60 dark:text-white/60">Upload your brand logo</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Contact Email</p>
                                            <p className="text-sm text-agency-primary/60 dark:text-white/60">Email for form submissions</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ),
                },
                {
                    id: 'seo',
                    title: 'SEO Settings',
                    content: (
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                                Search Engine Optimization
                            </h2>
                            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-400/20 rounded-2xl">
                                <h4 className="font-bold text-xl mb-4">SEO Dashboard Features</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <Search className="size-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold">Keyword Analysis</p>
                                            <p className="text-sm text-agency-primary/60 dark:text-white/60">Analyze content for keyword density and relevance</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Zap className="size-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold">Core Web Vitals</p>
                                            <p className="text-sm text-agency-primary/60 dark:text-white/60">Monitor page performance metrics</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Image className="size-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold">Image SEO</p>
                                            <p className="text-sm text-agency-primary/60 dark:text-white/60">Optimize alt text and file names</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    ),
                },
            ],
        },
        {
            id: 'developers',
            title: 'Developer Guide',
            icon: Code,
            subsections: [
                {
                    id: 'architecture',
                    title: 'Architecture Overview',
                    content: (
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                                Technical Architecture
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 bg-gray-900 text-white rounded-2xl">
                                    <h4 className="font-bold text-xl mb-4 text-agency-accent">Backend Stack</h4>
                                    <ul className="space-y-2 text-sm font-mono">
                                        <li>→ Laravel 11</li>
                                        <li>→ PHP 8.3+</li>
                                        <li>→ MySQL/PostgreSQL</li>
                                        <li>→ Redis (caching)</li>
                                        <li>→ Inertia.js (SSR)</li>
                                    </ul>
                                </div>
                                <div className="p-6 bg-gray-900 text-white rounded-2xl">
                                    <h4 className="font-bold text-xl mb-4 text-agency-accent">Frontend Stack</h4>
                                    <ul className="space-y-2 text-sm font-mono">
                                        <li>→ React 18</li>
                                        <li>→ TypeScript</li>
                                        <li>→ Tailwind CSS</li>
                                        <li>→ shadcn/ui</li>
                                        <li>→ GSAP (animations)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ),
                },
                {
                    id: 'custom-blocks',
                    title: 'Creating Custom Blocks',
                    content: (
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                                Custom Block Development
                            </h2>
                            <div className="p-6 bg-gray-900 text-white rounded-2xl">
                                <h4 className="font-bold text-xl mb-4">Step 1: Create Block Component</h4>
                                <pre className="text-xs overflow-x-auto p-4 bg-black/50 rounded-lg">
{`// resources/js/components/Blocks/CustomBlock.tsx
import React from 'react';

interface CustomBlockProps {
  data: {
    title: string;
    content: string;
  };
}

export default function CustomBlock({ data }: CustomBlockProps) {
  return (
    <section className="py-20">
      <h2>{data.title}</h2>
      <div>{data.content}</div>
    </section>
  );
}`}
                                </pre>
                            </div>
                            <div className="p-6 bg-gray-900 text-white rounded-2xl">
                                <h4 className="font-bold text-xl mb-4">Step 2: Register in BlockRenderer</h4>
                                <pre className="text-xs overflow-x-auto p-4 bg-black/50 rounded-lg">
{`// Add to BlockRenderer.tsx
import CustomBlock from './CustomBlock';

const blockComponents = {
  // ... other blocks
  custom: CustomBlock,
};`}
                                </pre>
                            </div>
                        </div>
                    ),
                },
                {
                    id: 'deployment',
                    title: 'Deployment',
                    content: (
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                                Deployment Guide
                            </h2>
                            <div className="space-y-4">
                                <div className="p-6 bg-gray-900 text-white rounded-2xl">
                                    <h4 className="font-bold text-xl mb-4">Production Build</h4>
                                    <pre className="text-xs overflow-x-auto p-4 bg-black/50 rounded-lg font-mono">
{`# Install dependencies
composer install --optimize-autoloader --no-dev
npm ci

# Build assets
npm run build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force`}
                                    </pre>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-green-500/10 to-transparent border border-green-400/20 rounded-2xl">
                                    <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                                        <Shield className="size-6 text-green-400" />
                                        Security Checklist
                                    </h4>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-400">✓</span>
                                            <span>Set <code className="px-2 py-0.5 bg-black/20 rounded">APP_ENV=production</code></span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-400">✓</span>
                                            <span>Set <code className="px-2 py-0.5 bg-black/20 rounded">APP_DEBUG=false</code></span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-400">✓</span>
                                            <span>Generate strong <code className="px-2 py-0.5 bg-black/20 rounded">APP_KEY</code></span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-400">✓</span>
                                            <span>Configure HTTPS/SSL</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-400">✓</span>
                                            <span>Set up automated backups</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ),
                },
            ],
        },
    ];

    const currentSection = sections.find(s => s.id === activeSection);
    const currentSubsection = currentSection?.subsections.find(ss => ss.id === activeSubsection);

    return (
        <MainLayout title="Documentation - Avant-Garde">
            <Head title="Documentation" />

            <div className="min-h-screen bg-white dark:bg-agency-dark pt-24 pb-20">
                {/* Hero */}
                <div className="bg-gradient-to-br from-agency-accent/10 via-purple-500/5 to-transparent border-b border-agency-primary/10 dark:border-white/10 py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl">
                            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-agency-primary dark:text-white mb-6">
                                Documentation
                            </h1>
                            <p className="text-xl text-agency-primary/70 dark:text-white/70 leading-relaxed">
                                Everything you need to master your content management system and create stunning websites.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Sidebar Navigation */}
                        <aside className="lg:col-span-3">
                            <div className="sticky top-28 space-y-1">
                                {sections.map((section) => (
                                    <div key={section.id} className="space-y-1">
                                        <button
                                            onClick={() => {
                                                setActiveSection(section.id);
                                                setActiveSubsection(section.subsections[0].id);
                                            }}
                                            className={cn(
                                                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                                                activeSection === section.id
                                                    ? 'bg-agency-accent text-agency-primary font-bold'
                                                    : 'text-agency-primary/60 dark:text-white/60 hover:bg-agency-accent/10 hover:text-agency-accent'
                                            )}
                                        >
                                            <section.icon className="size-5 flex-shrink-0" />
                                            <span className="text-sm">{section.title}</span>
                                        </button>
                                        {activeSection === section.id && (
                                            <div className="ml-8 space-y-1 border-l-2 border-agency-accent/20 pl-4">
                                                {section.subsections.map((sub) => (
                                                    <button
                                                        key={sub.id}
                                                        onClick={() => setActiveSubsection(sub.id)}
                                                        className={cn(
                                                            'w-full text-left px-3 py-2 text-xs rounded-lg transition-colors',
                                                            activeSubsection === sub.id
                                                                ? 'bg-agency-accent/10 text-agency-accent font-semibold'
                                                                : 'text-agency-primary/50 dark:text-white/50 hover:text-agency-accent'
                                                        )}
                                                    >
                                                        {sub.title}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Quick Links */}
                                <div className="pt-6 mt-6 border-t border-agency-primary/10 dark:border-white/10">
                                    <p className="text-xs font-bold uppercase tracking-wider text-agency-primary/40 dark:text-white/40 mb-3 px-4">
                                        Quick Links
                                    </p>
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-agency-primary/60 dark:text-white/60 hover:text-agency-accent transition-colors"
                                    >
                                        <ExternalLink className="size-4" />
                                        Admin Dashboard
                                    </Link>
                                    <Link
                                        href="/"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-agency-primary/60 dark:text-white/60 hover:text-agency-accent transition-colors"
                                    >
                                        <ExternalLink className="size-4" />
                                        View Site
                                    </Link>
                                </div>
                            </div>
                        </aside>

                        {/* Content Area */}
                        <main className="lg:col-span-9">
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                {currentSubsection?.content}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between items-center mt-12 pt-8 border-t border-agency-primary/10 dark:border-white/10">
                                <button
                                    onClick={() => {
                                        const currentSectionIndex = sections.findIndex(s => s.id === activeSection);
                                        const currentSubIndex = currentSection!.subsections.findIndex(ss => ss.id === activeSubsection);
                                        
                                        if (currentSubIndex > 0) {
                                            setActiveSubsection(currentSection!.subsections[currentSubIndex - 1].id);
                                        } else if (currentSectionIndex > 0) {
                                            const prevSection = sections[currentSectionIndex - 1];
                                            setActiveSection(prevSection.id);
                                            setActiveSubsection(prevSection.subsections[prevSection.subsections.length - 1].id);
                                        }
                                    }}
                                    disabled={activeSection === sections[0].id && activeSubsection === sections[0].subsections[0].id}
                                    className="flex items-center gap-2 px-6 py-3 rounded-full border border-agency-primary/10 dark:border-white/10 text-sm font-semibold hover:border-agency-accent hover:text-agency-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="size-4 rotate-180" />
                                    Previous
                                </button>
                                
                                <button
                                    onClick={() => {
                                        const currentSectionIndex = sections.findIndex(s => s.id === activeSection);
                                        const currentSubIndex = currentSection!.subsections.findIndex(ss => ss.id === activeSubsection);
                                        
                                        if (currentSubIndex < currentSection!.subsections.length - 1) {
                                            setActiveSubsection(currentSection!.subsections[currentSubIndex + 1].id);
                                        } else if (currentSectionIndex < sections.length - 1) {
                                            const nextSection = sections[currentSectionIndex + 1];
                                            setActiveSection(nextSection.id);
                                            setActiveSubsection(nextSection.subsections[0].id);
                                        }
                                    }}
                                    disabled={
                                        activeSection === sections[sections.length - 1].id && 
                                        activeSubsection === sections[sections.length - 1].subsections[sections[sections.length - 1].subsections.length - 1].id
                                    }
                                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-agency-accent text-agency-primary text-sm font-semibold hover:scale-105 transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    Next
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
