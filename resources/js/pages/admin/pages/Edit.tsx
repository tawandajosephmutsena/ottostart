import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Page } from '@/types';
import { useForm, Link } from '@inertiajs/react';
import { ChevronLeft, Save, Eye } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import PageBuilder from '@/components/admin/PageBuilder/PageBuilder';

interface Props {
    page: Page;
}

// Define the structure of our blocks
export type BlockType = 'hero' | 'text' | 'image' | 'features' | 'stats' | 'services' | 'portfolio' | 'insights' | 'cta' | 'cinematic_hero' | 'form' | 'video' | 'story' | 'manifesto' | 'process' | 'contact_info' | 'faq' | 'animated_shader_hero' | 'testimonials' | 'logo_cloud' | 'apple_cards_carousel' | 'cover_demo' | 'video_background_hero';

export interface Block {
    id: string;
    type: BlockType;
    content: Record<string, unknown>;
    is_enabled: boolean;
}

const getDefaultContentForType = (type: BlockType) => {
    switch (type) {
        case 'hero': return { 
            title: 'Digital Innovation Redefined', 
            subtitle: 'Avant-Garde Agency', 
            description: 'We create avant-garde digital experiences.', 
            ctaText: 'View Our Work', 
            ctaHref: '/portfolio', 
            image: '/images/hero-bg.jpg',
            marqueeText: 'Innovate Create Elevate Innovate Create Elevate',
            backgroundImages: [
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop'
            ]
        };
        case 'text': return { 
            title: '', 
            layout: '1',
            columns: [
                {
                    id: 'col-' + Date.now(),
                    type: 'text',
                    content: {
                        body: '',
                        textSize: 'base',
                        textAlign: 'left',
                    }
                }
            ],
            body: '' // Legacy field for backward compatibility
        };
        case 'image': return { url: '', alt: '', caption: '' };
        case 'features': return { title: 'Our Features', items: [{ title: 'Feature 1', desc: 'Description' }] };
        case 'stats': return { items: [{ value: '10', label: 'Projects', suffix: '+' }] };
        case 'services': return { title: 'Our Services', limit: 3, useStackedCards: true };
        case 'portfolio': return { title: 'Selected Works', limit: 3 };
        case 'insights': return { title: 'Recent Insights', limit: 3 };
        case 'cinematic_hero': return { slides: [
            { title: 'This is not Compassion', subtitle: 'Compassion would have been a law that protected her before she was forced to give birth.', tagline: '#letherlive', image: '/images/hero-1.jpg' },
            { title: 'A Childhood Stolen', subtitle: 'When laws fail to protect the vulnerable, they actively participate in the cycle of neglect.', tagline: '#protectourgirls', image: '/images/hero-2.jpg' },
            { title: 'Break the Cycle', subtitle: 'Justice is the only path to a world where childhood is a non-negotiable right.', tagline: '#changethelaw', image: '/images/hero-3.jpg' }
        ] };
        case 'animated_shader_hero': return {
            trustBadge: { text: "Trusted by visionaries", icons: ["✨", "🚀"] },
            headline: { line1: "Launch Your", line2: "Next Big Idea" },
            subtitle: "Create stunning digital experiences with our AI-powered platform.",
            buttons: {
                primary: { text: "Get Started", url: "#" },
                secondary: { text: "Learn More", url: "#" }
            }
        };
        case 'form': return {
            title: 'Onboarding',
            description: 'Tell us about your project',
            submitText: 'Submit enquiry',
            successMessage: 'Form submitted successfully!',
            steps: [
                {
                    id: 'personal',
                    title: 'Personal Info',
                    description: 'Let\'s start with some basic information',
                    fields: [
                        { label: 'Full Name', type: 'text', required: true, name: 'name', placeholder: 'John Doe' },
                        { label: 'Email Address', type: 'email', required: true, name: 'email', placeholder: 'john@example.com' },
                        { label: 'Company/Organization (Optional)', type: 'text', required: false, name: 'company', placeholder: 'Your Company' }
                    ]
                },
                {
                    id: 'professional',
                    title: 'Professional',
                    description: 'Tell us about your professional background',
                    fields: [
                        { label: 'What\'s your profession?', type: 'text', required: true, name: 'profession', placeholder: 'e.g. Designer, Developer, Marketer' },
                        { label: 'What industry do you work in?', type: 'select', required: true, name: 'industry', options: ['Technology', 'Healthcare', 'Education', 'Finance', 'Retail', 'Creative Arts', 'Other'] }
                    ]
                },
                {
                    id: 'goals',
                    title: 'Website Goals',
                    description: 'What are you trying to achieve?',
                    fields: [
                        { label: 'What\'s the primary goal of your website?', type: 'radio', required: true, name: 'primaryGoal', options: ['Showcase portfolio/work', 'Sell products/services', 'Generate leads/inquiries', 'Provide information', 'Blog/content publishing'] },
                        { label: 'Who is your target audience?', type: 'textarea', required: false, name: 'targetAudience', placeholder: 'Describe your ideal visitors/customers' }
                    ]
                },
                {
                    id: 'design',
                    title: 'Design',
                    description: 'Tell us about your aesthetic preferences',
                    fields: [
                        { label: 'What style do you prefer for your website?', type: 'radio', required: true, name: 'stylePreference', options: ['Modern & Sleek', 'Minimalist', 'Bold & Creative', 'Corporate & Professional'] },
                        { label: 'Any websites you like for inspiration?', type: 'textarea', required: false, name: 'inspirations', placeholder: 'List websites you admire or want to emulate' }
                    ]
                },
                {
                    id: 'budget',
                    title: 'Budget',
                    description: 'Let\'s talk about your investment',
                    fields: [
                        { label: 'What\'s your budget range? (USD)', type: 'select', required: true, name: 'budget', options: ['Under $1,000', '$1,000 - $3,000', '$3,000 - $5,000', '$5,000 - $10,000', 'Over $10,000'] },
                        { label: 'What\'s your expected timeline?', type: 'radio', required: true, name: 'timeline', options: ['ASAP', 'Within 1 month', '1-3 months', 'Flexible'] }
                    ]
                },
                {
                    id: 'requirements',
                    title: 'Requirements',
                    description: 'Any other specific needs?',
                    fields: [
                        { label: 'Which features do you need?', type: 'checkbox', required: false, name: 'features', options: ['Contact Form', 'Blog/News', 'E-commerce', 'User Accounts', 'Search Functionality', 'Social Media Integration', 'Newsletter Signup', 'Analytics'] },
                        { label: 'Anything else we should know?', type: 'textarea', required: false, name: 'additionalInfo', placeholder: 'Any additional requirements or information' }
                    ]
                }
            ]
        };
        case 'video': return { url: 'https://videos.pexels.com/video-files/30333849/13003128_2560_1440_25fps.mp4' };
        case 'story': return { 
            title: 'A journey of obsession.', 
            subtitle: 'Story',
            body: 'Founded in 2019, Avant-Garde emerged from a singular conviction...', 
            items: [
                { value: '5+', label: 'Years of Craft' },
                { value: '50+', label: 'Successes' }
            ]
        };
        case 'manifesto': return { 
            title: 'Our Core Pillars', 
            subtitle: 'Manifesto',
            items: [
                { title: 'Radical Innovation', desc: 'We don\'t follow trends; we set them.', emoji: '🚀' },
                { title: 'Obsessive Detail', desc: 'Every pixel is scrutinized for perfection.', emoji: '🎯' },
                { title: 'Transparent Partnership', desc: 'We integrate with your team as partners.', emoji: '🤝' }
            ]
        };
        case 'process': return { 
            title: 'From Vision to Reality.', 
            subtitle: 'Our Process',
            items: [
                { step: '01', title: 'Discovery', desc: 'In-depth research and strategy.' },
                { step: '02', title: 'Ideation', desc: 'Creative brainstorming and conceptual design.' },
                { step: '03', title: 'Realization', desc: 'Technical execution and design refinement.' },
                { step: '04', title: 'Infinity', desc: 'Launch and continuous optimization.' }
            ]
        };
        case 'contact_info': return { 
            title: 'We\'re Listening.', 
            subtitle: 'Inquiries',
            items: [
                { label: 'Email', value: 'hello@avant-garde.com', href: 'mailto:hello@avant-garde.com' },
                { label: 'Phone', value: '+1 (555) 123-4567', href: 'tel:+15551234567' },
                { label: 'Address', value: 'San Francisco, CA', href: '' }
            ],
            office_hours: [
                'Mon — Fri: 09:00 — 18:00',
                'Sat: 10:00 — 14:00',
                'Sun: Closed'
            ]
        };
        case 'faq': return { 
            title: 'Common Queries.', 
            subtitle: 'Quick Answers',
            items: [
                { q: 'How long does a typical project take?', a: 'Most boutique projects take 4-12 weeks.' },
                { q: 'Do you work with global clients?', a: 'Absolutely. We have clients across 4 continents.' }
            ]
        };
        case 'testimonials': return {
            title: 'What our users say',
            subtitle: 'Testimonials',
            description: 'Discover how thousands of teams streamline their operations with our platform.',
            items: [
                {
                    text: "The aesthetic of this platform is simply unmatched. It makes every interaction feel premium.",
                    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop",
                    name: "Alex Morgan",
                    role: "Design Director"
                },
                {
                    text: "I've never seen a tool that combines functionality with such a beautiful interface.",
                    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
                    name: "David Chen",
                    role: "Product Manager"
                },
                {
                    text: "It's not just a tool; it's an experience. The attention to detail is evident in every pixel.",
                    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop",
                    name: "Sarah Jenkins",
                    role: "Frontend Developer"
                },
                {
                    text: "Our team productivity has skyrocketed since we started using this platform.",
                    image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop",
                    name: "Michael Ross",
                    role: "CTO"
                },
                {
                    text: "The customer support is incredible. They went above and beyond to help us get set up.",
                    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
                    name: "Emily Watson",
                    role: "Operations Manager"
                },
                {
                    text: "A game changer for our business logic and daily operations management.",
                    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
                    name: "James Wilson",
                    role: "CEO"
                }
            ]
        };
        case 'logo_cloud': return {
            title: 'Powering the best teams',
            items: [
                { name: 'Partner 1', url: 'https://placehold.co/200x80?text=Partner+1' },
                { name: 'Partner 2', url: 'https://placehold.co/200x80?text=Partner+2' },
                { name: 'Partner 3', url: 'https://placehold.co/200x80?text=Partner+3' },
                { name: 'Partner 4', url: 'https://placehold.co/200x80?text=Partner+4' },
                { name: 'Partner 5', url: 'https://placehold.co/200x80?text=Partner+5' },
                { name: 'Partner 6', url: 'https://placehold.co/200x80?text=Partner+6' }
            ]
        };
        case 'apple_cards_carousel': return {
            title: 'Featured Works',
            feedSource: 'manual',
            maxItems: 6,
            sourceCategory: 'all',
            items: [
                 { category: 'Artificial Intelligence', title: 'You can do more with AI.', src: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop', content: '<p>Content goes here</p>', link: '' },
                 { category: 'Productivity', title: 'Enhance your productivity.', src: 'https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop', content: '<p>Content goes here</p>', link: '' },
                 { category: 'Product', title: 'Launching the new Apple Vision Pro.', src: 'https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80&w=2333&auto=format&fit=crop', content: '<p>Content goes here</p>', link: '' },
                 { category: 'Product', title: 'Macbook Pro M4.', src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2626&auto=format&fit=crop', content: '<p>Content goes here</p>', link: '' },
                 { category: 'Hiring', title: 'Hiring for a Staff Software Engineer', src: 'https://images.unsplash.com/photo-1621237022370-3d707252064c?q=80&w=2670&auto=format&fit=crop', content: '<p>Content goes here</p>', link: '' }
            ]
        };
        case 'cover_demo': return {
            titleOne: 'Build amazing websites',
            titleTwo: 'at',
            coverText: 'warp speed',
            fontSize: 'text-4xl md:text-4xl lg:text-6xl',
            fontWeight: 'font-semibold',
            beamDuration: 10,
            beamDelay: 2
        };
        case 'video_background_hero': return {
            title: 'Build 10x Faster with NS',
            subtitle: 'Highly customizable components for building modern websites and applications you mean it.',
            ctaText1: 'Start Building',
            ctaLink1: '#',
            ctaText2: 'Request a demo',
            ctaLink2: '#',
            videoUrl: 'https://videos.pexels.com/video-files/30333849/13003128_2560_1440_25fps.mp4',
            logos: []
        };
        default: return {};
    }
};

export default function Edit({ page }: Props) {
    // @ts-expect-error - Inertia useForm has complex type inference with nested Block content
    const { data, setData, put, processing } = useForm({
        title: page.title,
        slug: page.slug,
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        template: page.template as 'default' | 'home' | 'contact',
        is_published: page.is_published,
        content: (page.content as { blocks?: Block[] }) || { blocks: [] },
    });

    const initialBlocks = (Array.isArray(data.content?.blocks) ? data.content.blocks : []) as Block[];
    const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

    // Update form data when blocks change
    React.useEffect(() => {
        // @ts-expect-error - Depth issue with useForm and blocks
        setData('content', { blocks });
    }, [blocks, setData]);

    const addBlock = React.useCallback((type: BlockType) => {
        const newBlock: Block = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            type,
            content: getDefaultContentForType(type),
            is_enabled: true,
        };
        setBlocks(current => [...current, newBlock]);
    }, []);

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const toggleBlock = (id: string) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, is_enabled: !b.is_enabled } : b));
    };

    const updateBlockContent = (id: string, content: Record<string, unknown>) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...content } } : b));
    };

    const duplicateBlock = (id: string) => {
        const blockToClone = blocks.find(b => b.id === id);
        if (!blockToClone) return;
        
        const newBlock: Block = {
            ...blockToClone,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            content: { ...blockToClone.content },
        };
        const blockIndex = blocks.findIndex(b => b.id === id);
        const newBlocks = [...blocks];
        newBlocks.splice(blockIndex + 1, 0, newBlock);
        setBlocks(newBlocks);
        toast.success('Block duplicated');
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        put(`/admin/pages/${page.slug}`, {
            onSuccess: () => toast.success('Page updated successfully'),
            onError: () => toast.error('Failed to update page'),
        });
    };

    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Pages', href: '/admin/pages' },
        { title: 'Edit', href: `/admin/pages/${page.slug}/edit` },
    ];

    return (
        <AdminLayout title={`Edit ${page.title}`} breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-6 h-full min-h-[calc(100vh-8rem)]">
                {/* Fixed Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/pages" className="p-2 rounded-full hover:bg-muted transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black uppercase tracking-tight">Edit Page</h1>
                                <span className="text-xs font-mono text-muted-foreground bg-muted ring-1 ring-border px-2 py-0.5 rounded leading-none">/{page.slug}</span>
                            </div>
                            <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-[0.2em]">Managing content for {page.title}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" asChild className="h-9">
                            <a href={page.slug === 'home' ? '/' : `/${page.slug}`} target="_blank" rel="noreferrer">
                                <Eye className="h-4 w-4 mr-2" /> Preview
                            </a>
                        </Button>
                        <Button type="button" onClick={() => handleSubmit()} disabled={processing} className="bg-agency-accent text-white hover:bg-agency-accent/90 h-9 font-bold px-6">
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                {/* Main Content: Real-time Visual Builder */}
                <div className="flex-1 min-h-0">
                    <Tabs defaultValue="content" className="h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <TabsList className="bg-muted/30 p-1">
                                <TabsTrigger value="content" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Visual Editor</TabsTrigger>
                                <TabsTrigger value="settings" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">SEO & Settings</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="content" className="flex-1 mt-0 h-full">
                            <PageBuilder 
                                blocks={blocks}
                                setBlocks={setBlocks}
                                onUpdateBlock={updateBlockContent}
                                onAddBlock={addBlock}
                                onRemoveBlock={removeBlock}
                                onDuplicateBlock={duplicateBlock}
                                onToggleBlock={toggleBlock}
                                pageTitle={page.title}
                                pageSlug={page.slug}
                            />
                        </TabsContent>

                        <TabsContent value="settings" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 overflow-y-auto max-h-[calc(100vh-20rem)] p-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold uppercase tracking-tight">Page Identity</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Page Title</Label>
                                            <Input id="title" value={data.title} onChange={e => setData('title', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="slug">Search Friendly URL (Slug)</Label>
                                            <Input id="slug" value={data.slug} onChange={e => setData('slug', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="template">Page Template</Label>
                                            <Select value={data.template} onValueChange={val => setData('template', val as 'default' | 'home' | 'contact')}>
                                                <SelectTrigger id="template">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="default">Default Page</SelectItem>
                                                    <SelectItem value="home">Home Page (No Header)</SelectItem>
                                                    <SelectItem value="contact">Contact Page</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <Label htmlFor="is_published">Published Status</Label>
                                            <Switch 
                                                id="is_published"
                                                checked={data.is_published}
                                                onCheckedChange={val => setData('is_published', val)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold uppercase tracking-tight">SEO Metadata</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="meta_title">Meta Title</Label>
                                            <Input id="meta_title" value={data.meta_title} onChange={e => setData('meta_title', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="meta_description">Meta Description</Label>
                                            <Textarea id="meta_description" value={data.meta_description} onChange={e => setData('meta_description', e.target.value)} className="min-h-[100px]" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AdminLayout>
    );
}
