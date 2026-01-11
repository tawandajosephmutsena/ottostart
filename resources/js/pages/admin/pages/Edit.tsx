import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Page } from '@/types';
import { useForm, Link } from '@inertiajs/react';
import { ChevronLeft, Save, Plus, Trash, ArrowUp, ArrowDown, Image as ImageIcon, Type, Layout, Eye, List, EyeOff, BookOpen, HelpCircle, PhoneCall, AlertCircle, Video, AlignLeft, AlignCenter, AlignRight, Columns2, Columns3, Square, RectangleHorizontal, Link2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import MediaLibrary from '@/components/admin/MediaLibrary';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { MediaAsset } from '@/types';

interface Props {
    page: Page;
}

// Define the structure of our blocks
type BlockType = 'hero' | 'text' | 'image' | 'features' | 'stats' | 'services' | 'portfolio' | 'insights' | 'cta' | 'cinematic_hero' | 'form' | 'video' | 'story' | 'manifesto' | 'process' | 'contact_info' | 'faq' | 'animated_shader_hero' | 'testimonials' | 'logo_cloud' | 'apple_cards_carousel' | 'cover_demo';

interface Block {
    id: string;
    type: BlockType;
    content: Record<string, any>;
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
            title: 'Get to know your iSad.',
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
            fontWeight: 'font-semibold'
        };
        default: return {};
    }
};

export default function Edit({ page }: Props) {
    // Parse initial content or default to empty array
    const { data, setData, put, processing, errors } = useForm({
        title: page.title,
        slug: page.slug,
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        template: page.template as 'default' | 'home' | 'contact',
        is_published: page.is_published,
        content: (page.content as any) || { blocks: [] },
    } as any);

    const initialBlocks = (Array.isArray(data.content?.blocks) ? data.content.blocks : []) as Block[];
    const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

    // Update form data when blocks change
    React.useEffect(() => {
        // @ts-ignore - Depth issue with useForm and blocks
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

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    const updateBlockContent = (id: string, content: Record<string, any>) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...content } } : b));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/pages" className="p-2 rounded-full hover:bg-muted transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">Edit Page</h1>
                                <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">/{page.slug}</span>
                            </div>
                            <p className="text-muted-foreground text-sm">Managing content for {page.title}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" asChild>
                            <a href={page.slug === 'home' ? '/' : `/${page.slug}`} target="_blank" rel="noreferrer">
                                <Eye className="h-4 w-4 mr-2" /> View Live
                            </a>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area - The Page Builder */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-muted/30 border-dashed border-2">
                             <div className="p-4 flex flex-wrap gap-2 justify-center">
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('hero')}>
                                    <Layout className="h-4 w-4 mr-2" /> Hero
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('animated_shader_hero')}>
                                    <Layout className="h-4 w-4 mr-2" /> Shader Hero
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('cinematic_hero')}>
                                    <Layout className="h-4 w-4 mr-2" /> Cinematic Hero
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('stats')}>
                                    <Plus className="h-4 w-4 mr-2" /> Stats
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('services')}>
                                    <Layout className="h-4 w-4 mr-2" /> Services
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('portfolio')}>
                                    <Layout className="h-4 w-4 mr-2" /> Portfolio
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('insights')}>
                                    <Layout className="h-4 w-4 mr-2" /> Insights
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('cta')}>
                                    <Plus className="h-4 w-4 mr-2" /> CTA
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('text')}>
                                    <Type className="h-4 w-4 mr-2" /> Text
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('image')}>
                                    <ImageIcon className="h-4 w-4 mr-2" /> Image
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('form')}>
                                    <List className="h-4 w-4 mr-2" /> Form
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('video')}>
                                    <Eye className="h-4 w-4 mr-2" /> Video
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('story')}>
                                    <BookOpen className="h-4 w-4 mr-2" /> Story
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('manifesto')}>
                                    <AlertCircle className="h-4 w-4 mr-2" /> Manifesto
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('process')}>
                                    <List className="h-4 w-4 mr-2" /> Process
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('contact_info')}>
                                    <PhoneCall className="h-4 w-4 mr-2" /> Contact Info
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('faq')}>
                                    <HelpCircle className="h-4 w-4 mr-2" /> FAQ
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('testimonials')}>
                                    <Type className="h-4 w-4 mr-2" /> Testimonials
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('logo_cloud')}>
                                    <ImageIcon className="h-4 w-4 mr-2" /> Logo Cloud
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('apple_cards_carousel')}>
                                    <Layout className="h-4 w-4 mr-2" /> Cards Carousel
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => addBlock('cover_demo')}>
                                    <Type className="h-4 w-4 mr-2" /> Cover Demo
                                </Button>
                             </div>
                        </Card>

                        <div className="space-y-4">
                            {blocks.map((block, index) => (
                                <Card key={block.id} className={cn("relative group hover:border-agency-accent/50 transition-colors", !block.is_enabled && "opacity-60")}>
                                    <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => toggleBlock(block.id)}>
                                            {block.is_enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                        </Button>
                                        <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveBlock(index, 'up')} disabled={index === 0}>
                                            <ArrowUp className="h-3 w-3" />
                                        </Button>
                                        <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1}>
                                            <ArrowDown className="h-3 w-3" />
                                        </Button>
                                        <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeBlock(block.id)}>
                                            <Trash className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    <CardHeader className="py-3 px-6 bg-muted/20 border-b">
                                        <CardTitle className="text-xs uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                                            {!block.is_enabled && <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 rounded-full mr-2">HIDDEN</span>}
                                            {block.type} Block
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="p-6">
                                        {block.type === 'hero' && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="col-span-2">
                                                        <Label className="text-xs">Headline</Label>
                                                        <Input 
                                                            value={block.content.title} 
                                                            onChange={(e) => updateBlockContent(block.id, { title: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Subtitle</Label>
                                                        <Input 
                                                            value={block.content.subtitle} 
                                                            onChange={(e) => updateBlockContent(block.id, { subtitle: e.target.value })}
                                                        />
                                                    </div>
                                                     <div>
                                                        <Label className="text-xs">Feature Image</Label>
                                                        <div className="flex gap-2">
                                                            <MediaLibrary 
                                                                onSelect={(asset: MediaAsset) => updateBlockContent(block.id, { image: asset.url })}
                                                                trigger={
                                                                    <Button type="button" variant="outline" size="sm" className="h-10">
                                                                        <ImageIcon className="h-4 w-4 mr-2" /> Select
                                                                    </Button>
                                                                }
                                                            />
                                                            <Input 
                                                                className="flex-1"
                                                                value={block.content.image} 
                                                                onChange={(e) => updateBlockContent(block.id, { image: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label className="text-xs">Marquee Text (Background scrolling text)</Label>
                                                        <Input 
                                                            value={block.content.marqueeText} 
                                                            onChange={(e) => updateBlockContent(block.id, { marqueeText: e.target.value })}
                                                            placeholder="Slowly scrolling background text..."
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label className="text-xs">Floating Images</Label>
                                                        <div className="flex flex-col gap-2">
                                                            <MediaLibrary 
                                                                onSelect={(asset: MediaAsset) => {
                                                                    const current = block.content.backgroundImages || [];
                                                                    updateBlockContent(block.id, { backgroundImages: [...current, asset.url] });
                                                                }}
                                                                trigger={
                                                                    <Button type="button" variant="outline" size="sm" className="w-full">
                                                                        <Plus className="h-4 w-4 mr-2" /> Add Image from Gallery
                                                                    </Button>
                                                                }
                                                            />
                                                            <div className="grid grid-cols-4 gap-2 border p-2 rounded bg-muted/10">
                                                                {(block.content.backgroundImages || []).map((img: string, idx: number) => (
                                                                    <div key={idx} className="relative group aspect-video rounded overflow-hidden border">
                                                                        <img src={img} alt={`Background ${idx + 1}`} className="w-full h-full object-cover" />
                                                                        <button 
                                                                            type="button"
                                                                            title="Remove image"
                                                                            aria-label="Remove image"
                                                                            onClick={() => {
                                                                                const updated = block.content.backgroundImages.filter((_: unknown, i: number) => i !== idx);
                                                                                updateBlockContent(block.id, { backgroundImages: updated });
                                                                            }}
                                                                            className="absolute top-1 right-1 bg-destructive p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <Trash className="h-3 w-3" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                {(!block.content.backgroundImages || block.content.backgroundImages.length === 0) && (
                                                                    <p className="col-span-4 text-[10px] text-center text-muted-foreground py-2">No floating images added.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label className="text-xs">Description</Label>
                                                        <Textarea 
                                                            value={block.content.description} 
                                                            onChange={(e) => updateBlockContent(block.id, { description: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">CTA Text</Label>
                                                        <Input 
                                                            value={block.content.ctaText} 
                                                            onChange={(e) => updateBlockContent(block.id, { ctaText: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">CTA Link</Label>
                                                        <Input 
                                                            value={block.content.ctaHref} 
                                                            onChange={(e) => updateBlockContent(block.id, { ctaHref: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'animated_shader_hero' && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="col-span-2 space-y-2 border p-3 rounded bg-muted/10">
                                                        <Label className="text-xs font-bold uppercase tracking-wider">Trust Badge</Label>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <Label className="text-xs">Badge Text</Label>
                                                                <Input 
                                                                    value={block.content.trustBadge?.text || ''} 
                                                                    onChange={(e) => updateBlockContent(block.id, { trustBadge: { ...block.content.trustBadge, text: e.target.value } })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">Icons (Optional)</Label>
                                                                <div className="flex gap-2">
                                                                    {(block.content.trustBadge?.icons || []).map((icon: string, i: number) => (
                                                                        <Input 
                                                                            key={i}
                                                                            className="w-10 text-center px-0"
                                                                            value={icon}
                                                                            onChange={(e) => {
                                                                                const newIcons = [...(block.content.trustBadge?.icons || [])];
                                                                                newIcons[i] = e.target.value;
                                                                                updateBlockContent(block.id, { trustBadge: { ...block.content.trustBadge, icons: newIcons } });
                                                                            }}
                                                                        />
                                                                    ))}
                                                                    <Button size="sm" variant="outline" onClick={() => {
                                                                         const newIcons = [...(block.content.trustBadge?.icons || []), "✨"];
                                                                         updateBlockContent(block.id, { trustBadge: { ...block.content.trustBadge, icons: newIcons } });
                                                                    }}>+</Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-span-2 space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider">Headline</Label>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <Label className="text-xs">Line 1</Label>
                                                                <Input 
                                                                    value={block.content.headline?.line1 || ''} 
                                                                    onChange={(e) => updateBlockContent(block.id, { headline: { ...block.content.headline, line1: e.target.value } })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">Line 2 (Gradient)</Label>
                                                                <Input 
                                                                    value={block.content.headline?.line2 || ''} 
                                                                    onChange={(e) => updateBlockContent(block.id, { headline: { ...block.content.headline, line2: e.target.value } })}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-span-2">
                                                        <Label className="text-xs">Subtitle</Label>
                                                        <Textarea 
                                                            value={block.content.subtitle || ''} 
                                                            onChange={(e) => updateBlockContent(block.id, { subtitle: e.target.value })}
                                                            className="h-20"
                                                        />
                                                    </div>

                                                    <div className="col-span-2 grid grid-cols-2 gap-4">
                                                        <div className="p-3 border rounded bg-muted/5 space-y-2">
                                                            <Label className="text-xs font-bold">Primary Button</Label>
                                                            <div>
                                                                <Label className="text-[10px]">Text</Label>
                                                                <Input 
                                                                    value={block.content.buttons?.primary?.text || ''} 
                                                                    onChange={(e) => updateBlockContent(block.id, { buttons: { ...block.content.buttons, primary: { ...block.content.buttons?.primary, text: e.target.value } } })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-[10px]">URL</Label>
                                                                <Input 
                                                                    value={block.content.buttons?.primary?.url || ''} 
                                                                    onChange={(e) => updateBlockContent(block.id, { buttons: { ...block.content.buttons, primary: { ...block.content.buttons?.primary, url: e.target.value } } })}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="p-3 border rounded bg-muted/5 space-y-2">
                                                            <Label className="text-xs font-bold">Secondary Button</Label>
                                                            <div>
                                                                <Label className="text-[10px]">Text</Label>
                                                                <Input 
                                                                    value={block.content.buttons?.secondary?.text || ''} 
                                                                    onChange={(e) => updateBlockContent(block.id, { buttons: { ...block.content.buttons, secondary: { ...block.content.buttons?.secondary, text: e.target.value } } })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-[10px]">URL</Label>
                                                                <Input 
                                                                    value={block.content.buttons?.secondary?.url || ''} 
                                                                    onChange={(e) => updateBlockContent(block.id, { buttons: { ...block.content.buttons, secondary: { ...block.content.buttons?.secondary, url: e.target.value } } })}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'cta' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-xs">Headline</Label>
                                                    <Input 
                                                        value={block.content.title} 
                                                        onChange={(e) => updateBlockContent(block.id, { title: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                     <div>
                                                        <Label className="text-xs">Subtitle</Label>
                                                        <Input 
                                                            value={block.content.subtitle} 
                                                            onChange={(e) => updateBlockContent(block.id, { subtitle: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Contact Email</Label>
                                                        <Input 
                                                            value={block.content.email} 
                                                            onChange={(e) => updateBlockContent(block.id, { email: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">CTA Text</Label>
                                                        <Input 
                                                            value={block.content.ctaText} 
                                                            onChange={(e) => updateBlockContent(block.id, { ctaText: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">CTA Link</Label>
                                                        <Input 
                                                            value={block.content.ctaHref} 
                                                            onChange={(e) => updateBlockContent(block.id, { ctaHref: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'stats' && (
                                            <div className="space-y-4">
                                                <Label className="text-xs">Stats List</Label>
                                                {(block.content.items || []).map((item: any, i: number) => (
                                                    <div key={i} className="flex gap-2 items-end border p-3 rounded bg-muted/10">
                                                        <div className="flex-1">
                                                            <Label className="text-[10px]">Value</Label>
                                                            <Input 
                                                                value={item.value} 
                                                                onChange={(e) => {
                                                                    const newItems = [...block.content.items];
                                                                    newItems[i] = { ...item, value: e.target.value };
                                                                    updateBlockContent(block.id, { items: newItems });
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <Label className="text-[10px]">Label</Label>
                                                            <Input 
                                                                value={item.label} 
                                                                onChange={(e) => {
                                                                    const newItems = [...block.content.items];
                                                                    newItems[i] = { ...item, label: e.target.value };
                                                                    updateBlockContent(block.id, { items: newItems });
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="w-16">
                                                            <Label className="text-[10px]">Suffix</Label>
                                                            <Input 
                                                                value={item.suffix} 
                                                                onChange={(e) => {
                                                                    const newItems = [...block.content.items];
                                                                    newItems[i] = { ...item, suffix: e.target.value };
                                                                    updateBlockContent(block.id, { items: newItems });
                                                                }}
                                                            />
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                                                            const newItems = block.content.items.filter((_:any, idx:number) => idx !== i);
                                                            updateBlockContent(block.id, { items: newItems });
                                                        }}>
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    const newItems = [...(block.content.items || []), { value: '0', label: 'New Stat', suffix: '' }];
                                                    updateBlockContent(block.id, { items: newItems });
                                                }}>
                                                    <Plus className="h-3 w-3 mr-2" /> Add Stat
                                                </Button>
                                            </div>
                                        )}

                                        {block.type === 'logo_cloud' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-xs">Section Title</Label>
                                                    <Input 
                                                        value={block.content.title || ''} 
                                                        onChange={(e) => updateBlockContent(block.id, { title: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Logos</Label>
                                                    <div className="grid grid-cols-4 gap-4">
                                                        {(block.content.items || []).map((item: any, i: number) => (
                                                            <div key={i} className="relative group border p-2 rounded bg-muted/10">
                                                                <div className="aspect-video flex items-center justify-center p-2 bg-background rounded mb-2">
                                                                     <img src={item.url} alt={item.name} className="max-h-8 w-auto" />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Input 
                                                                        className="h-7 text-xs" 
                                                                        placeholder="Name"
                                                                        value={item.name} 
                                                                        onChange={(e) => {
                                                                            const newItems = [...block.content.items];
                                                                            newItems[i] = { ...item, name: e.target.value };
                                                                            updateBlockContent(block.id, { items: newItems });
                                                                        }}
                                                                    />
                                                                    <div className="flex gap-1">
                                                                        <Input 
                                                                            className="h-7 text-xs flex-1" 
                                                                            placeholder="URL"
                                                                            value={item.url} 
                                                                            onChange={(e) => {
                                                                                const newItems = [...block.content.items];
                                                                                newItems[i] = { ...item, url: e.target.value };
                                                                                updateBlockContent(block.id, { items: newItems });
                                                                            }}
                                                                        />
                                                                        <MediaLibrary 
                                                                             onSelect={(asset: MediaAsset) => {
                                                                                 const newItems = [...block.content.items];
                                                                                 newItems[i] = { ...item, url: asset.url };
                                                                                 updateBlockContent(block.id, { items: newItems });
                                                                             }}
                                                                             trigger={
                                                                                 <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="Select logo" aria-label="Select logo">
                                                                                     <ImageIcon className="h-3 w-3" />
                                                                                 </Button>
                                                                             }
                                                                         />
                                                                    </div>
                                                                </div>
                                                                <button 
                                                                    type="button"
                                                                    title="Remove logo"
                                                                    aria-label="Remove logo"
                                                                    onClick={() => {
                                                                        const newItems = block.content.items.filter((_: unknown, idx: number) => idx !== i);
                                                                        updateBlockContent(block.id, { items: newItems });
                                                                    }}
                                                                    className="absolute top-1 right-1 bg-destructive p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <Button 
                                                            variant="outline" 
                                                            className="h-full min-h-[140px] flex flex-col items-center justify-center gap-2 border-dashed"
                                                            onClick={() => {
                                                                const newItems = [...(block.content.items || []), { name: 'New Logo', url: 'https://placehold.co/200x80?text=Logo' }];
                                                                updateBlockContent(block.id, { items: newItems });
                                                            }}
                                                        >
                                                            <Plus className="h-6 w-6" />
                                                            <span>Add Logo</span>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'apple_cards_carousel' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-xs">Section Title</Label>
                                                    <Input 
                                                        value={block.content.title || ''} 
                                                        onChange={(e) => updateBlockContent(block.id, { title: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-4">
                                                    <Label className="text-xs">Cards</Label>
                                                    {(block.content.items || []).map((item: any, i: number) => (
                                                        <div key={i} className="border p-4 rounded bg-muted/10 space-y-3 relative group">
                                                            <div className="absolute top-2 right-2 flex gap-2">
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => {
                                                                    const newItems = block.content.items.filter((_: any, idx: number) => idx !== i);
                                                                    updateBlockContent(block.id, { items: newItems });
                                                                }}>
                                                                    <Trash className="h-3 w-3" />
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label className="text-[10px]">Category</Label>
                                                                    <Input 
                                                                        value={item.category}
                                                                        onChange={(e) => {
                                                                            const newItems = [...block.content.items];
                                                                            newItems[i] = { ...item, category: e.target.value };
                                                                            updateBlockContent(block.id, { items: newItems });
                                                                        }}
                                                                        className="h-8 text-xs"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label className="text-[10px]">Title</Label>
                                                                    <Input 
                                                                        value={item.title}
                                                                        onChange={(e) => {
                                                                            const newItems = [...block.content.items];
                                                                            newItems[i] = { ...item, title: e.target.value };
                                                                            updateBlockContent(block.id, { items: newItems });
                                                                        }}
                                                                        className="h-8 text-xs"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <Label className="text-[10px]">Image</Label>
                                                                <div className="flex gap-2">
                                                                     <Input 
                                                                        value={item.src}
                                                                        onChange={(e) => {
                                                                            const newItems = [...block.content.items];
                                                                            newItems[i] = { ...item, src: e.target.value };
                                                                            updateBlockContent(block.id, { items: newItems });
                                                                        }}
                                                                        className="h-8 text-xs flex-1"
                                                                    />
                                                                    <MediaLibrary 
                                                                         onSelect={(asset: MediaAsset) => {
                                                                             const newItems = [...block.content.items];
                                                                             newItems[i] = { ...item, src: asset.url };
                                                                             updateBlockContent(block.id, { items: newItems });
                                                                         }}
                                                                         trigger={
                                                                             <Button type="button" variant="outline" size="sm" className="h-8">
                                                                                 <ImageIcon className="h-3 w-3" />
                                                                             </Button>
                                                                         }
                                                                     />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <Label className="text-[10px]">Link (Optional - Click to navigate)</Label>
                                                                <Input 
                                                                    value={item.link || ''}
                                                                    onChange={(e) => {
                                                                        const newItems = [...block.content.items];
                                                                        newItems[i] = { ...item, link: e.target.value };
                                                                        updateBlockContent(block.id, { items: newItems });
                                                                    }}
                                                                    className="h-8 text-xs"
                                                                    placeholder="https://..."
                                                                />
                                                            </div>
                                                            
                                                             <div>
                                                                <Label className="text-[10px]">Content (Shown in Modal if no link)</Label>
                                                                <Textarea 
                                                                    value={item.content || ''}
                                                                    onChange={(e) => {
                                                                        const newItems = [...block.content.items];
                                                                        newItems[i] = { ...item, content: e.target.value };
                                                                        updateBlockContent(block.id, { items: newItems });
                                                                    }}
                                                                    className="h-20 text-xs"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <Button variant="outline" size="sm" onClick={() => {
                                                        const newItems = [...(block.content.items || []), { category: 'New', title: 'New Card', src: '', content: '', link: '' }];
                                                        updateBlockContent(block.id, { items: newItems });
                                                    }}>
                                                        <Plus className="h-3 w-3 mr-2" /> Add Card
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'services' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs">Title</Label>
                                                    <Input 
                                                        value={block.content.title} 
                                                        onChange={(e) => updateBlockContent(block.id, { title: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex items-center space-x-2 pt-6">
                                                    <Switch 
                                                        checked={block.content.useStackedCards} 
                                                        onCheckedChange={(val) => updateBlockContent(block.id, { useStackedCards: val })}
                                                    />
                                                    <Label>Use Stacked Cards</Label>
                                                </div>
                                            </div>
                                        )}

                                        {(block.type === 'portfolio' || block.type === 'insights') && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs">Section Title</Label>
                                                    <Input 
                                                        value={block.content.title} 
                                                        onChange={(e) => updateBlockContent(block.id, { title: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Show Limit</Label>
                                                    <Input 
                                                        type="number"
                                                        value={block.content.limit} 
                                                        onChange={(e) => updateBlockContent(block.id, { limit: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'text' && (
                                            <div className="space-y-6">
                                                {/* Section Title */}
                                                <div>
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Section Title (Optional)</Label>
                                                    <Input 
                                                        placeholder="Enter a section title..."
                                                        value={block.content.title || ''} 
                                                        onChange={(e) => updateBlockContent(block.id, { title: e.target.value })}
                                                    />
                                                </div>

                                                {/* Layout Selector */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Layout</Label>
                                                    <ToggleGroup 
                                                        type="single" 
                                                        value={block.content.layout || '1'}
                                                        onValueChange={(value) => {
                                                            if (!value) return;
                                                            const layoutColumnCount: Record<string, number> = { '1': 1, '1-1': 2, '1-1-1': 3, '2-1': 2, '1-2': 2 };
                                                            const targetCount = layoutColumnCount[value] || 1;
                                                            let newColumns = [...(block.content.columns || [])];
                                                            
                                                            // Add columns if needed
                                                            while (newColumns.length < targetCount) {
                                                                newColumns.push({
                                                                    id: 'col-' + Date.now() + '-' + newColumns.length,
                                                                    type: 'text',
                                                                    content: { body: '', textSize: 'base', textAlign: 'left' }
                                                                });
                                                            }
                                                            // Remove columns if needed (keep first N)
                                                            if (newColumns.length > targetCount) {
                                                                newColumns = newColumns.slice(0, targetCount);
                                                            }
                                                            
                                                            updateBlockContent(block.id, { layout: value, columns: newColumns });
                                                        }}
                                                        className="justify-start"
                                                        variant="outline"
                                                    >
                                                        <ToggleGroupItem value="1" aria-label="Single column" className="flex items-center gap-2 px-3">
                                                            <Square className="h-4 w-4" />
                                                            <span className="text-xs">1</span>
                                                        </ToggleGroupItem>
                                                        <ToggleGroupItem value="1-1" aria-label="Two equal columns" className="flex items-center gap-2 px-3">
                                                            <Columns2 className="h-4 w-4" />
                                                            <span className="text-xs">1:1</span>
                                                        </ToggleGroupItem>
                                                        <ToggleGroupItem value="1-1-1" aria-label="Three equal columns" className="flex items-center gap-2 px-3">
                                                            <Columns3 className="h-4 w-4" />
                                                            <span className="text-xs">1:1:1</span>
                                                        </ToggleGroupItem>
                                                        <ToggleGroupItem value="2-1" aria-label="Two-thirds / one-third" className="flex items-center gap-2 px-3">
                                                            <RectangleHorizontal className="h-4 w-4" />
                                                            <span className="text-xs">2:1</span>
                                                        </ToggleGroupItem>
                                                        <ToggleGroupItem value="1-2" aria-label="One-third / two-thirds" className="flex items-center gap-2 px-3">
                                                            <RectangleHorizontal className="h-4 w-4 rotate-180" />
                                                            <span className="text-xs">1:2</span>
                                                        </ToggleGroupItem>
                                                    </ToggleGroup>
                                                </div>

                                                {/* Column Tabs */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Columns</Label>
                                                    <Tabs defaultValue={(block.content.columns?.[0]?.id) || 'col-0'} className="w-full">
                                                        <TabsList className="w-full justify-start">
                                                            {(block.content.columns || []).map((col: any, colIdx: number) => (
                                                                <TabsTrigger key={col.id || colIdx} value={col.id || `col-${colIdx}`} className="flex items-center gap-2">
                                                                    {col.type === 'text' && <Type className="h-3 w-3" />}
                                                                    {col.type === 'image' && <ImageIcon className="h-3 w-3" />}
                                                                    {col.type === 'video' && <Video className="h-3 w-3" />}
                                                                    Column {colIdx + 1}
                                                                </TabsTrigger>
                                                            ))}
                                                        </TabsList>

                                                        {(block.content.columns || []).map((col: any, colIdx: number) => (
                                                            <TabsContent key={col.id || colIdx} value={col.id || `col-${colIdx}`} className="mt-4 space-y-4 border rounded-lg p-4 bg-muted/10">
                                                                {/* Content Type Selector */}
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-4">
                                                                        <Label className="text-xs">Content Type</Label>
                                                                        <Select 
                                                                            value={col.type} 
                                                                            onValueChange={(val) => {
                                                                                const newColumns = [...block.content.columns];
                                                                                const defaultContent: Record<string, any> = {
                                                                                    text: { body: '', textSize: 'base', textAlign: 'left' },
                                                                                    image: { url: '', alt: '', caption: '' },
                                                                                    video: { url: '' },
                                                                                    button: { text: 'Click Here', url: '', style: 'primary' }
                                                                                };
                                                                                newColumns[colIdx] = { ...col, type: val, content: defaultContent[val] };
                                                                                updateBlockContent(block.id, { columns: newColumns });
                                                                            }}
                                                                        >
                                                                            <SelectTrigger className="w-32 h-8">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="text"><div className="flex items-center gap-2"><Type className="h-3 w-3" /> Text</div></SelectItem>
                                                                                <SelectItem value="image"><div className="flex items-center gap-2"><ImageIcon className="h-3 w-3" /> Image</div></SelectItem>
                                                                                <SelectItem value="video"><div className="flex items-center gap-2"><Video className="h-3 w-3" /> Video</div></SelectItem>
                                                                                <SelectItem value="button"><div className="flex items-center gap-2"><Link2 className="h-3 w-3" /> Button</div></SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                </div>

                                                                {/* Text Content Editor */}
                                                                {col.type === 'text' && (
                                                                    <div className="space-y-4">
                                                                        <div className="flex items-center gap-4 flex-wrap">
                                                                            <div className="flex items-center gap-2">
                                                                                <Label className="text-xs">Size</Label>
                                                                                <Select 
                                                                                    value={col.content?.textSize || 'base'} 
                                                                                    onValueChange={(val) => {
                                                                                        const newColumns = [...block.content.columns];
                                                                                        newColumns[colIdx] = { ...col, content: { ...col.content, textSize: val } };
                                                                                        updateBlockContent(block.id, { columns: newColumns });
                                                                                    }}
                                                                                >
                                                                                    <SelectTrigger className="w-24 h-8">
                                                                                        <SelectValue />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="sm">Small</SelectItem>
                                                                                        <SelectItem value="base">Base</SelectItem>
                                                                                        <SelectItem value="lg">Large</SelectItem>
                                                                                        <SelectItem value="xl">XL</SelectItem>
                                                                                        <SelectItem value="2xl">2XL</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <Label className="text-xs">Align</Label>
                                                                                <ToggleGroup 
                                                                                    type="single" 
                                                                                    value={col.content?.textAlign || 'left'}
                                                                                    onValueChange={(val) => {
                                                                                        if (!val) return;
                                                                                        const newColumns = [...block.content.columns];
                                                                                        newColumns[colIdx] = { ...col, content: { ...col.content, textAlign: val } };
                                                                                        updateBlockContent(block.id, { columns: newColumns });
                                                                                    }}
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                >
                                                                                    <ToggleGroupItem value="left" aria-label="Align left">
                                                                                        <AlignLeft className="h-3 w-3" />
                                                                                    </ToggleGroupItem>
                                                                                    <ToggleGroupItem value="center" aria-label="Align center">
                                                                                        <AlignCenter className="h-3 w-3" />
                                                                                    </ToggleGroupItem>
                                                                                    <ToggleGroupItem value="right" aria-label="Align right">
                                                                                        <AlignRight className="h-3 w-3" />
                                                                                    </ToggleGroupItem>
                                                                                </ToggleGroup>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-xs">Content</Label>
                                                                            <div className="mt-1">
                                                                                <RichTextEditor
                                                                                    content={col.content?.body || ''}
                                                                                    onChange={(html) => {
                                                                                        const newColumns = [...block.content.columns];
                                                                                        newColumns[colIdx] = { ...col, content: { ...col.content, body: html } };
                                                                                        updateBlockContent(block.id, { columns: newColumns });
                                                                                    }}
                                                                                    placeholder="Write your content here..."
                                                                                    limit={50000}
                                                                                    showWordCount={true}
                                                                                    className="min-h-[200px]"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Image Content Editor */}
                                                                {col.type === 'image' && (
                                                                    <div className="space-y-4">
                                                                        <div>
                                                                            <Label className="text-xs">Image</Label>
                                                                            <div className="flex gap-2 mt-1">
                                                                                <MediaLibrary 
                                                                                    onSelect={(asset: MediaAsset) => {
                                                                                        const newColumns = [...block.content.columns];
                                                                                        newColumns[colIdx] = { ...col, content: { ...col.content, url: asset.url } };
                                                                                        updateBlockContent(block.id, { columns: newColumns });
                                                                                    }}
                                                                                    trigger={
                                                                                        <Button type="button" variant="outline" size="sm" className="h-10">
                                                                                            <ImageIcon className="h-4 w-4 mr-2" /> Select
                                                                                        </Button>
                                                                                    }
                                                                                />
                                                                                <Input 
                                                                                    className="flex-1"
                                                                                    placeholder="Or enter image URL..."
                                                                                    value={col.content?.url || ''} 
                                                                                    onChange={(e) => {
                                                                                        const newColumns = [...block.content.columns];
                                                                                        newColumns[colIdx] = { ...col, content: { ...col.content, url: e.target.value } };
                                                                                        updateBlockContent(block.id, { columns: newColumns });
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        {col.content?.url && (
                                                                            <div className="aspect-video rounded-lg overflow-hidden border bg-muted/20">
                                                                                <img src={col.content.url} alt={col.content?.alt || ''} className="w-full h-full object-cover" />
                                                                            </div>
                                                                        )}
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div>
                                                                                <Label className="text-xs">Alt Text</Label>
                                                                                <Input 
                                                                                    placeholder="Describe the image..."
                                                                                    value={col.content?.alt || ''} 
                                                                                    onChange={(e) => {
                                                                                        const newColumns = [...block.content.columns];
                                                                                        newColumns[colIdx] = { ...col, content: { ...col.content, alt: e.target.value } };
                                                                                        updateBlockContent(block.id, { columns: newColumns });
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <Label className="text-xs">Caption (Optional)</Label>
                                                                                <Input 
                                                                                    placeholder="Image caption..."
                                                                                    value={col.content?.caption || ''} 
                                                                                    onChange={(e) => {
                                                                                        const newColumns = [...block.content.columns];
                                                                                        newColumns[colIdx] = { ...col, content: { ...col.content, caption: e.target.value } };
                                                                                        updateBlockContent(block.id, { columns: newColumns });
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Video Content Editor */}
                                                                {col.type === 'video' && (
                                                                    <div className="space-y-4">
                                                                        <div>
                                                                            <Label className="text-xs">Video (YouTube, Vimeo, or direct URL)</Label>
                                                                            <div className="flex gap-2 mt-1">
                                                                                <MediaLibrary 
                                                                                    onSelect={(asset: MediaAsset) => {
                                                                                        const newColumns = [...block.content.columns];
                                                                                        newColumns[colIdx] = { ...col, content: { ...col.content, url: asset.url } };
                                                                                        updateBlockContent(block.id, { columns: newColumns });
                                                                                    }}
                                                                                    trigger={
                                                                                        <Button type="button" variant="outline" size="sm" className="h-10">
                                                                                            <Video className="h-4 w-4 mr-2" /> Select
                                                                                        </Button>
                                                                                    }
                                                                                />
                                                                                <Input 
                                                                                    className="flex-1"
                                                                                    placeholder="https://youtube.com/watch?v=... or video URL"
                                                                                    value={col.content?.url || ''} 
                                                                                    onChange={(e) => {
                                                                                        const newColumns = [...block.content.columns];
                                                                                        newColumns[colIdx] = { ...col, content: { ...col.content, url: e.target.value } };
                                                                                        updateBlockContent(block.id, { columns: newColumns });
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        {col.content?.url && (
                                                                            <div className="aspect-video rounded-lg overflow-hidden border bg-black/5 flex items-center justify-center">
                                                                                <video src={col.content.url} className="max-h-full max-w-full" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Button Content Editor */}
                                                                {col.type === 'button' && (
                                                                    <div className="space-y-4">
                                                                        <div>
                                                                            <Label className="text-xs">Button Text</Label>
                                                                            <Input 
                                                                                className="mt-1"
                                                                                placeholder="Enter button text..."
                                                                                value={col.content?.text || ''} 
                                                                                onChange={(e) => {
                                                                                    const newColumns = [...block.content.columns];
                                                                                    newColumns[colIdx] = { ...col, content: { ...col.content, text: e.target.value } };
                                                                                    updateBlockContent(block.id, { columns: newColumns });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-xs">Link URL</Label>
                                                                            <Input 
                                                                                className="mt-1"
                                                                                placeholder="https://example.com or /page-slug"
                                                                                value={col.content?.url || ''} 
                                                                                onChange={(e) => {
                                                                                    const newColumns = [...block.content.columns];
                                                                                    newColumns[colIdx] = { ...col, content: { ...col.content, url: e.target.value } };
                                                                                    updateBlockContent(block.id, { columns: newColumns });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-xs">Button Style</Label>
                                                                            <Select 
                                                                                value={col.content?.style || 'primary'} 
                                                                                onValueChange={(val) => {
                                                                                    const newColumns = [...block.content.columns];
                                                                                    newColumns[colIdx] = { ...col, content: { ...col.content, style: val } };
                                                                                    updateBlockContent(block.id, { columns: newColumns });
                                                                                }}
                                                                            >
                                                                                <SelectTrigger className="w-full mt-1">
                                                                                    <SelectValue />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="primary">Primary (Filled)</SelectItem>
                                                                                    <SelectItem value="secondary">Secondary (Subtle)</SelectItem>
                                                                                    <SelectItem value="outline">Outline</SelectItem>
                                                                                    <SelectItem value="ghost">Ghost (Text only)</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                        {/* Button Preview */}
                                                                        <div className="p-4 border rounded-lg bg-muted/20">
                                                                            <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
                                                                            <Button 
                                                                                type="button" 
                                                                                variant={col.content?.style || 'default'}
                                                                                className="pointer-events-none"
                                                                            >
                                                                                {col.content?.text || 'Button'}
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </TabsContent>
                                                        ))}
                                                    </Tabs>
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'video' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-xs">Video Source (URL or Upload)</Label>
                                                    <div className="flex gap-2">
                                                        <MediaLibrary 
                                                            onSelect={(asset: MediaAsset) => updateBlockContent(block.id, { url: asset.url })}
                                                            trigger={
                                                                <Button type="button" variant="outline" size="sm" className="h-10">
                                                                    <ImageIcon className="h-4 w-4 mr-2" /> Select/Upload
                                                                </Button>
                                                            }
                                                        />
                                                        <Input 
                                                            className="flex-1"
                                                            value={block.content.url} 
                                                            onChange={(e) => updateBlockContent(block.id, { url: e.target.value })}
                                                            placeholder="https://..."
                                                        />
                                                    </div>
                                                </div>
                                                {block.content.url && (
                                                    <div className="aspect-video rounded-lg overflow-hidden border bg-black/5 flex items-center justify-center">
                                                        <video src={block.content.url} className="max-h-full" />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {block.type === 'image' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <Label className="text-xs">Image</Label>
                                                    <div className="flex gap-2">
                                                        <MediaLibrary 
                                                            onSelect={(asset: MediaAsset) => updateBlockContent(block.id, { url: asset.url })}
                                                            trigger={
                                                                <Button type="button" variant="outline" size="sm" className="h-10">
                                                                    <ImageIcon className="h-4 w-4 mr-2" /> Select
                                                                </Button>
                                                            }
                                                        />
                                                        <Input 
                                                            className="flex-1"
                                                            value={block.content.url} 
                                                            onChange={(e) => updateBlockContent(block.id, { url: e.target.value })}
                                                            placeholder="https://..."
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Alt Text</Label>
                                                    <Input 
                                                        value={block.content.alt} 
                                                        onChange={(e) => updateBlockContent(block.id, { alt: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Caption</Label>
                                                    <Input 
                                                        value={block.content.caption} 
                                                        onChange={(e) => updateBlockContent(block.id, { caption: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'features' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-xs">Section Title</Label>
                                                    <Input 
                                                        value={block.content.title} 
                                                        onChange={(e) => updateBlockContent(block.id, { title: e.target.value })}
                                                    />
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <Label className="text-xs">Feature Items</Label>
                                                    {(block.content.items || []).map((item: any, i: number) => (
                                                        <div key={i} className="flex gap-2 items-start border p-2 rounded-md bg-background">
                                                            <div className="flex-1 space-y-2">
                                                                <Input 
                                                                    placeholder="Title"
                                                                    value={item.title} 
                                                                    onChange={(e) => {
                                                                        const newItems = [...(block.content.items || [])];
                                                                        newItems[i] = { ...item, title: e.target.value };
                                                                        updateBlockContent(block.id, { items: newItems });
                                                                    }}
                                                                />
                                                                <Textarea 
                                                                    placeholder="Description"
                                                                    className="h-16 text-xs"
                                                                    value={item.desc} 
                                                                    onChange={(e) => {
                                                                        const newItems = [...(block.content.items || [])];
                                                                        newItems[i] = { ...item, desc: e.target.value };
                                                                        updateBlockContent(block.id, { items: newItems });
                                                                    }}
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost" 
                                                                size="icon"
                                                                className="text-destructive h-8 w-8"
                                                                onClick={() => {
                                                                    const newItems = block.content.items.filter((_: unknown, idx: number) => idx !== i);
                                                                    updateBlockContent(block.id, { items: newItems });
                                                                }}
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={() => {
                                                            const newItems = [...(block.content.items || []), { title: 'New Feature', desc: 'Description' }];
                                                            updateBlockContent(block.id, { items: newItems });
                                                        }}
                                                    >
                                                        <Plus className="h-3 w-3 mr-2" /> Add Feature Item
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'testimonials' && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-xs">Title</Label>
                                                        <Input 
                                                            value={block.content.title} 
                                                            onChange={(e) => updateBlockContent(block.id, { title: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Subtitle</Label>
                                                        <Input 
                                                            value={block.content.subtitle} 
                                                            onChange={(e) => updateBlockContent(block.id, { subtitle: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label className="text-xs">Description</Label>
                                                        <Textarea 
                                                            value={block.content.description} 
                                                            onChange={(e) => updateBlockContent(block.id, { description: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <Label className="text-xs">Testimonial Items</Label>
                                                    {(block.content.items || []).map((item: any, i: number) => (
                                                        <div key={i} className="flex gap-4 items-start border p-3 rounded-md bg-background">
                                                            <div className="w-16 h-16 flex-shrink-0">
                                                                <div className="relative w-full h-full rounded-full overflow-hidden bg-muted">
                                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 space-y-2">
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <Input 
                                                                        placeholder="Name"
                                                                        className="h-8 text-xs"
                                                                        value={item.name} 
                                                                        onChange={(e) => {
                                                                            const newItems = [...(block.content.items || [])];
                                                                            newItems[i] = { ...item, name: e.target.value };
                                                                            updateBlockContent(block.id, { items: newItems });
                                                                        }}
                                                                    />
                                                                    <Input 
                                                                        placeholder="Role"
                                                                        className="h-8 text-xs"
                                                                        value={item.role} 
                                                                        onChange={(e) => {
                                                                            const newItems = [...(block.content.items || [])];
                                                                            newItems[i] = { ...item, role: e.target.value };
                                                                            updateBlockContent(block.id, { items: newItems });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <MediaLibrary 
                                                                        onSelect={(asset: MediaAsset) => {
                                                                            const newItems = [...(block.content.items || [])];
                                                                            newItems[i] = { ...item, image: asset.url };
                                                                            updateBlockContent(block.id, { items: newItems });
                                                                        }}
                                                                        trigger={
                                                                            <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0">
                                                                                <ImageIcon className="h-3 w-3" />
                                                                            </Button>
                                                                        }
                                                                    />
                                                                     <Input 
                                                                        placeholder="Image URL"
                                                                        className="h-8 text-xs flex-1"
                                                                        value={item.image} 
                                                                        onChange={(e) => {
                                                                            const newItems = [...(block.content.items || [])];
                                                                            newItems[i] = { ...item, image: e.target.value };
                                                                            updateBlockContent(block.id, { items: newItems });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <Textarea 
                                                                    placeholder="Testimonial Text"
                                                                    className="h-20 text-xs"
                                                                    value={item.text} 
                                                                    onChange={(e) => {
                                                                        const newItems = [...(block.content.items || [])];
                                                                        newItems[i] = { ...item, text: e.target.value };
                                                                        updateBlockContent(block.id, { items: newItems });
                                                                    }}
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost" 
                                                                size="icon"
                                                                className="text-destructive h-8 w-8"
                                                                onClick={() => {
                                                                    const newItems = block.content.items.filter((_: unknown, idx: number) => idx !== i);
                                                                    updateBlockContent(block.id, { items: newItems });
                                                                }}
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={() => {
                                                            const newItems = [...(block.content.items || []), { 
                                                                name: 'New User', 
                                                                role: 'User', 
                                                                image: 'https://via.placeholder.com/150',
                                                                text: 'Testimonial text goes here...' 
                                                            }];
                                                            updateBlockContent(block.id, { items: newItems });
                                                        }}
                                                    >
                                                        <Plus className="h-3 w-3 mr-2" /> Add Testimonial
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        {block.type === 'cinematic_hero' && (
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-sm font-bold">Slides (2-6 max)</Label>
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        size="sm"
                                                        disabled={(block.content.slides || []).length >= 6}
                                                        onClick={() => {
                                                            const newSlides = [...(block.content.slides || []), { title: 'New Slide', subtitle: 'Description', tagline: '#tag', image: '' }];
                                                            updateBlockContent(block.id, { slides: newSlides });
                                                        }}
                                                    >
                                                        <Plus className="h-3 w-3 mr-2" /> Add Slide
                                                    </Button>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    {(block.content.slides || []).map((slide: any, i: number) => (
                                                        <div key={i} className="border p-4 rounded-lg bg-muted/20 space-y-4 relative">
                                                            <div className="flex justify-between items-center border-b pb-2 mb-2">
                                                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Slide {i + 1}</span>
                                                                {(block.content.slides || []).length > 2 && (
                                                                    <Button 
                                                                        type="button"
                                                                        variant="ghost" 
                                                                        size="icon"
                                                                        className="h-6 w-6 text-destructive"
                                                                        onClick={() => {
                                                                            const newSlides = block.content.slides.filter((_: unknown, idx: number) => idx !== i);
                                                                            updateBlockContent(block.id, { slides: newSlides });
                                                                        }}
                                                                    >
                                                                        <Trash className="h-3 w-3" />
                                                                    </Button>
                                                                )}
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="col-span-2">
                                                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Title</Label>
                                                                    <Input 
                                                                        value={slide.title} 
                                                                        onChange={(e) => {
                                                                            const newSlides = [...block.content.slides];
                                                                            newSlides[i] = { ...slide, title: e.target.value };
                                                                            updateBlockContent(block.id, { slides: newSlides });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Subtitle</Label>
                                                                    <Textarea 
                                                                        className="h-20"
                                                                        value={slide.subtitle} 
                                                                        onChange={(e) => {
                                                                            const newSlides = [...block.content.slides];
                                                                            newSlides[i] = { ...slide, subtitle: e.target.value };
                                                                            updateBlockContent(block.id, { slides: newSlides });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tagline</Label>
                                                                    <Input 
                                                                        value={slide.tagline} 
                                                                        onChange={(e) => {
                                                                            const newSlides = [...block.content.slides];
                                                                            newSlides[i] = { ...slide, tagline: e.target.value };
                                                                            updateBlockContent(block.id, { slides: newSlides });
                                                                        }}
                                                                    />
                                                                </div>
                                                                 <div>
                                                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Slide Image</Label>
                                                                    <div className="flex gap-2">
                                                                        <MediaLibrary 
                                                                            onSelect={(asset: MediaAsset) => {
                                                                                const newSlides = [...block.content.slides];
                                                                                newSlides[i] = { ...slide, image: asset.url };
                                                                                updateBlockContent(block.id, { slides: newSlides });
                                                                            }}
                                                                            trigger={
                                                                                <Button type="button" variant="outline" size="sm" className="h-10">
                                                                                    <ImageIcon className="h-3 w-3" />
                                                                                </Button>
                                                                            }
                                                                        />
                                                                        <Input 
                                                                            className="flex-1 h-10 text-xs"
                                                                            value={slide.image} 
                                                                            onChange={(e) => {
                                                                                const newSlides = [...block.content.slides];
                                                                                newSlides[i] = { ...slide, image: e.target.value };
                                                                                updateBlockContent(block.id, { slides: newSlides });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {block.type === 'form' && (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="col-span-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">General Form Info</Label>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label className="text-xs">Form Title</Label>
                                                        <Input 
                                                            value={block.content.title} 
                                                            onChange={(e) => updateBlockContent(block.id, { title: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label className="text-xs">Description</Label>
                                                        <Textarea 
                                                            value={block.content.description} 
                                                            onChange={(e) => updateBlockContent(block.id, { description: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Submit Button Text</Label>
                                                        <Input 
                                                            value={block.content.submitText} 
                                                            onChange={(e) => updateBlockContent(block.id, { submitText: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Success Message</Label>
                                                        <Input 
                                                            value={block.content.successMessage} 
                                                            onChange={(e) => updateBlockContent(block.id, { successMessage: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-4">
                                                    <div className="flex justify-between items-center border-t pt-4">
                                                        <Label className="text-sm font-black uppercase tracking-tighter">Form Steps</Label>
                                                        <Button 
                                                            type="button" 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => {
                                                                const newSteps = [...(block.content.steps || []), { 
                                                                    id: `step-${Date.now()}`, 
                                                                    title: 'New Step', 
                                                                    description: '', 
                                                                    fields: [] 
                                                                }];
                                                                updateBlockContent(block.id, { steps: newSteps });
                                                            }}
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" /> Add Step
                                                        </Button>
                                                    </div>
                                                    
                                                    <div className="space-y-6">
                                                        {(block.content.steps || []).map((step: any, stepIdx: number) => (
                                                            <Card key={step.id || stepIdx} className="bg-muted/5 border-dashed">
                                                                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                                                                    <div className="flex-1 mr-4">
                                                                        <Input 
                                                                            value={step.title} 
                                                                            className="h-8 font-bold p-0 text-sm focus-visible:ring-0 bg-transparent border-none"
                                                                            onChange={(e) => {
                                                                                const newSteps = [...block.content.steps];
                                                                                newSteps[stepIdx] = { ...step, title: e.target.value };
                                                                                updateBlockContent(block.id, { steps: newSteps });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="icon" 
                                                                            className="h-8 w-8 text-destructive"
                                                                            onClick={() => {
                                                                                const newSteps = block.content.steps.filter((_: unknown, idx: number) => idx !== stepIdx);
                                                                                updateBlockContent(block.id, { steps: newSteps });
                                                                            }}
                                                                        >
                                                                            <Trash className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </CardHeader>
                                                                <CardContent className="px-4 pb-4 space-y-4">
                                                                    <div className="space-y-1">
                                                                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Step Description</Label>
                                                                        <Input 
                                                                            value={step.description || ''} 
                                                                            placeholder="Brief description for this step"
                                                                            className="h-8 text-xs bg-background"
                                                                            onChange={(e) => {
                                                                                const newSteps = [...block.content.steps];
                                                                                newSteps[stepIdx] = { ...step, description: e.target.value };
                                                                                updateBlockContent(block.id, { steps: newSteps });
                                                                            }}
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-3">
                                                                        <div className="flex justify-between items-center">
                                                                            <Label className="text-[10px] uppercase font-bold">Fields</Label>
                                                                            <Button 
                                                                                type="button" 
                                                                                variant="secondary" 
                                                                                size="sm" 
                                                                                className="h-6 text-[10px]"
                                                                                onClick={() => {
                                                                                    const newSteps = [...block.content.steps];
                                                                                    newSteps[stepIdx] = { 
                                                                                        ...step, 
                                                                                        fields: [...(step.fields || []), { label: 'New Field', type: 'text', name: `field_${Date.now()}`, required: false }] 
                                                                                    };
                                                                                    updateBlockContent(block.id, { steps: newSteps });
                                                                                }}
                                                                            >
                                                                                <Plus className="h-3 w-3 mr-1" /> Add Field
                                                                            </Button>
                                                                        </div>

                                                                        <div className="space-y-2">
                                                                            {(step.fields || []).map((field: any, fieldIdx: number) => (
                                                                                <div key={fieldIdx} className="p-3 rounded-lg bg-background border text-xs space-y-3">
                                                                                    <div className="grid grid-cols-12 gap-2 items-end">
                                                                                        <div className="col-span-4">
                                                                                            <Label className="text-[10px]">Label</Label>
                                                                                            <Input 
                                                                                                value={field.label} 
                                                                                                className="h-8 text-xs"
                                                                                                onChange={(e) => {
                                                                                                    const newSteps = [...block.content.steps];
                                                                                                    newSteps[stepIdx].fields[fieldIdx] = { ...field, label: e.target.value };
                                                                                                    updateBlockContent(block.id, { steps: newSteps });
                                                                                                }}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="col-span-3">
                                                                                            <Label className="text-[10px]">Type</Label>
                                                                                            <Select 
                                                                                                value={field.type} 
                                                                                                onValueChange={(val) => {
                                                                                                    const newSteps = [...block.content.steps];
                                                                                                    newSteps[stepIdx].fields[fieldIdx] = { ...field, type: val };
                                                                                                    updateBlockContent(block.id, { steps: newSteps });
                                                                                                }}
                                                                                            >
                                                                                                <SelectTrigger className="h-8 text-[10px]">
                                                                                                    <SelectValue />
                                                                                                </SelectTrigger>
                                                                                                <SelectContent>
                                                                                                    <SelectItem value="text">Text</SelectItem>
                                                                                                    <SelectItem value="email">Email</SelectItem>
                                                                                                    <SelectItem value="number">Number</SelectItem>
                                                                                                    <SelectItem value="tel">Phone</SelectItem>
                                                                                                    <SelectItem value="textarea">Textarea</SelectItem>
                                                                                                    <SelectItem value="select">Select</SelectItem>
                                                                                                    <SelectItem value="radio">Radio</SelectItem>
                                                                                                    <SelectItem value="checkbox">Checkbox</SelectItem>
                                                                                                </SelectContent>
                                                                                            </Select>
                                                                                        </div>
                                                                                        <div className="col-span-3">
                                                                                            <Label className="text-[10px]">Name (ID)</Label>
                                                                                            <Input 
                                                                                                value={field.name} 
                                                                                                className="h-8 text-xs font-mono"
                                                                                                onChange={(e) => {
                                                                                                    const newSteps = [...block.content.steps];
                                                                                                    newSteps[stepIdx].fields[fieldIdx] = { ...field, name: e.target.value };
                                                                                                    updateBlockContent(block.id, { steps: newSteps });
                                                                                                }}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="col-span-1 flex flex-col items-center gap-1 pb-1">
                                                                                            <Label className="text-[10px]">Req.</Label>
                                                                                            <Switch 
                                                                                                checked={field.required} 
                                                                                                onCheckedChange={(val) => {
                                                                                                    const newSteps = [...block.content.steps];
                                                                                                    newSteps[stepIdx].fields[fieldIdx] = { ...field, required: val };
                                                                                                    updateBlockContent(block.id, { steps: newSteps });
                                                                                                }}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="col-span-1 flex justify-end pb-1">
                                                                                            <Button 
                                                                                                variant="ghost" 
                                                                                                size="icon" 
                                                                                                className="h-7 w-7 text-destructive"
                                                                                                onClick={() => {
                                                                                                    const newSteps = [...block.content.steps];
                                                                                                    newSteps[stepIdx].fields = step.fields.filter((_: unknown, idx: number) => idx !== fieldIdx);
                                                                                                    updateBlockContent(block.id, { steps: newSteps });
                                                                                                }}
                                                                                            >
                                                                                                <Trash className="h-3.5 w-3.5" />
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="grid grid-cols-2 gap-2">
                                                                                        <div className="space-y-1">
                                                                                            <Label className="text-[10px]">Placeholder</Label>
                                                                                            <Input 
                                                                                                value={field.placeholder || ''} 
                                                                                                className="h-7 text-[10px]"
                                                                                                onChange={(e) => {
                                                                                                    const newSteps = [...block.content.steps];
                                                                                                    newSteps[stepIdx].fields[fieldIdx] = { ...field, placeholder: e.target.value };
                                                                                                    updateBlockContent(block.id, { steps: newSteps });
                                                                                                }}
                                                                                            />
                                                                                        </div>
                                                                                        {['select', 'radio', 'checkbox'].includes(field.type) && (
                                                                                            <div className="space-y-1">
                                                                                                <Label className="text-[10px]">Options (comma separated)</Label>
                                                                                                <Input 
                                                                                                    value={field.options?.join(', ') || ''} 
                                                                                                    placeholder="Option 1, Option 2..."
                                                                                                    className="h-7 text-[10px]"
                                                                                                    onChange={(e) => {
                                                                                                        const newSteps = [...block.content.steps];
                                                                                                        newSteps[stepIdx].fields[fieldIdx] = { 
                                                                                                            ...field, 
                                                                                                            options: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') 
                                                                                                        };
                                                                                                        updateBlockContent(block.id, { steps: newSteps });
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'story' && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-xs">Title</Label>
                                                        <Input 
                                                            value={block.content.title} 
                                                            onChange={(e) => updateBlockContent(block.id, { title: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Subtitle</Label>
                                                        <Input 
                                                            value={block.content.subtitle} 
                                                            onChange={(e) => updateBlockContent(block.id, { subtitle: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label className="text-xs">Body Text</Label>
                                                        <Textarea 
                                                            className="min-h-[100px]"
                                                            value={block.content.body} 
                                                            onChange={(e) => updateBlockContent(block.id, { body: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <Label className="text-xs font-bold">Stats</Label>
                                                    {(block.content.items || []).map((item: any, i: number) => (
                                                        <div key={i} className="flex gap-2 items-end border p-3 rounded bg-muted/10">
                                                            <div className="flex-1">
                                                                <Label className="text-[10px]">Value</Label>
                                                                <Input 
                                                                    value={item.value} 
                                                                    onChange={(e) => {
                                                                        const newItems = [...block.content.items];
                                                                        newItems[i] = { ...item, value: e.target.value };
                                                                        updateBlockContent(block.id, { items: newItems });
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label className="text-[10px]">Label</Label>
                                                                <Input 
                                                                    value={item.label} 
                                                                    onChange={(e) => {
                                                                        const newItems = [...block.content.items];
                                                                        newItems[i] = { ...item, label: e.target.value };
                                                                        updateBlockContent(block.id, { items: newItems });
                                                                    }}
                                                                />
                                                            </div>
                                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                                                                const newItems = block.content.items.filter((_:any, idx:number) => idx !== i);
                                                                updateBlockContent(block.id, { items: newItems });
                                                            }}>
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button variant="outline" size="sm" onClick={() => {
                                                        const newItems = [...(block.content.items || []), { value: '0', label: 'New Stat' }];
                                                        updateBlockContent(block.id, { items: newItems });
                                                    }}>
                                                        <Plus className="h-3 w-3 mr-2" /> Add Stat
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'manifesto' && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-xs">Title</Label>
                                                        <Input 
                                                            value={block.content.title} 
                                                            onChange={(e) => updateBlockContent(block.id, { title: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Subtitle</Label>
                                                        <Input 
                                                            value={block.content.subtitle} 
                                                            onChange={(e) => updateBlockContent(block.id, { subtitle: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <Label className="text-xs font-bold">Pillars</Label>
                                                    {(block.content.items || []).map((item: any, i: number) => (
                                                        <div key={i} className="space-y-2 border p-3 rounded bg-muted/10">
                                                            <div className="flex gap-2">
                                                                <div className="w-20">
                                                                    <Label className="text-[10px]">Emoji</Label>
                                                                    <Input 
                                                                        value={item.emoji} 
                                                                        onChange={(e) => {
                                                                            const newItems = [...block.content.items];
                                                                            newItems[i] = { ...item, emoji: e.target.value };
                                                                            updateBlockContent(block.id, { items: newItems });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <Label className="text-[10px]">Title</Label>
                                                                    <Input 
                                                                        value={item.title} 
                                                                        onChange={(e) => {
                                                                            const newItems = [...block.content.items];
                                                                            newItems[i] = { ...item, title: e.target.value };
                                                                            updateBlockContent(block.id, { items: newItems });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <Button variant="ghost" size="icon" className="text-destructive mt-6" onClick={() => {
                                                                    const newItems = block.content.items.filter((_:any, idx:number) => idx !== i);
                                                                    updateBlockContent(block.id, { items: newItems });
                                                                }}>
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <div>
                                                                <Label className="text-[10px]">Description</Label>
                                                                <Textarea 
                                                                    className="h-16 text-xs"
                                                                    value={item.desc} 
                                                                    onChange={(e) => {
                                                                        const newItems = [...block.content.items];
                                                                        newItems[i] = { ...item, desc: e.target.value };
                                                                        updateBlockContent(block.id, { items: newItems });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <Button variant="outline" size="sm" onClick={() => {
                                                        const newItems = [...(block.content.items || []), { title: 'New Pillar', desc: '', emoji: '✨' }];
                                                        updateBlockContent(block.id, { items: newItems });
                                                    }}>
                                                        <Plus className="h-3 w-3 mr-2" /> Add Pillar
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'process' && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-xs">Title</Label>
                                                        <Input 
                                                            value={block.content.title} 
                                                            onChange={(e) => updateBlockContent(block.id, { title: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Subtitle</Label>
                                                        <Input 
                                                            value={block.content.subtitle} 
                                                            onChange={(e) => updateBlockContent(block.id, { subtitle: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <Label className="text-xs font-bold">Steps</Label>
                                                    {(block.content.items || []).map((item: any, i: number) => (
                                                        <div key={i} className="space-y-2 border p-3 rounded bg-muted/10">
                                                            <div className="flex gap-2">
                                                                <div className="w-20">
                                                                    <Label className="text-[10px]">Step #</Label>
                                                                    <Input 
                                                                        value={item.step} 
                                                                        onChange={(e) => {
                                                                            const newItems = [...block.content.items];
                                                                            newItems[i] = { ...item, step: e.target.value };
                                                                            updateBlockContent(block.id, { items: newItems });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <Label className="text-[10px]">Title</Label>
                                                                    <Input 
                                                                        value={item.title} 
                                                                        onChange={(e) => {
                                                                            const newItems = [...block.content.items];
                                                                            newItems[i] = { ...item, title: e.target.value };
                                                                            updateBlockContent(block.id, { items: newItems });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <Button variant="ghost" size="icon" className="text-destructive mt-6" onClick={() => {
                                                                    const newItems = block.content.items.filter((_:any, idx:number) => idx !== i);
                                                                    updateBlockContent(block.id, { items: newItems });
                                                                }}>
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <div>
                                                                <Label className="text-[10px]">Description</Label>
                                                                <Textarea 
                                                                    className="h-16 text-xs"
                                                                    value={item.desc} 
                                                                    onChange={(e) => {
                                                                        const newItems = [...block.content.items];
                                                                        newItems[i] = { ...item, desc: e.target.value };
                                                                        updateBlockContent(block.id, { items: newItems });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <Button variant="outline" size="sm" onClick={() => {
                                                        const newItems = [...(block.content.items || []), { title: 'New Step', desc: '', step: '0' + ((block.content.items?.length || 0) + 1) }];
                                                        updateBlockContent(block.id, { items: newItems });
                                                    }}>
                                                        <Plus className="h-3 w-3 mr-2" /> Add Step
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'contact_info' && (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-xs">Title</Label>
                                                        <Input 
                                                            value={block.content.title} 
                                                            onChange={(e) => updateBlockContent(block.id, { title: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Subtitle</Label>
                                                        <Input 
                                                            value={block.content.subtitle} 
                                                            onChange={(e) => updateBlockContent(block.id, { subtitle: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <Label className="text-xs font-bold">Contact Items</Label>
                                                    {(block.content.items || []).map((item: any, i: number) => (
                                                        <div key={i} className="space-y-2 border p-3 rounded bg-muted/10">
                                                            <div className="grid grid-cols-3 gap-2">
                                                                <div>
                                                                    <Label className="text-[10px]">Label</Label>
                                                                    <Input 
                                                                        value={item.label} 
                                                                        onChange={(e) => {
                                                                            const newItems = [...block.content.items];
                                                                            newItems[i] = { ...item, label: e.target.value };
                                                                            updateBlockContent(block.id, { items: newItems });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="col-span-1">
                                                                    <Label className="text-[10px]">Value</Label>
                                                                    <Input 
                                                                        value={item.value} 
                                                                        onChange={(e) => {
                                                                            const newItems = [...block.content.items];
                                                                            newItems[i] = { ...item, value: e.target.value };
                                                                            updateBlockContent(block.id, { items: newItems });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <div className="flex-1">
                                                                        <Label className="text-[10px]">Link (href)</Label>
                                                                        <Input 
                                                                            value={item.href} 
                                                                            onChange={(e) => {
                                                                                const newItems = [...block.content.items];
                                                                                newItems[i] = { ...item, href: e.target.value };
                                                                                updateBlockContent(block.id, { items: newItems });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <Button variant="ghost" size="icon" className="text-destructive mt-6" onClick={() => {
                                                                        const newItems = block.content.items.filter((_:any, idx:number) => idx !== i);
                                                                        updateBlockContent(block.id, { items: newItems });
                                                                    }}>
                                                                        <Trash className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <Button variant="outline" size="sm" onClick={() => {
                                                        const newItems = [...(block.content.items || []), { label: 'New Label', value: '', href: '' }];
                                                        updateBlockContent(block.id, { items: newItems });
                                                    }}>
                                                        <Plus className="h-3 w-3 mr-2" /> Add Contact Item
                                                    </Button>
                                                </div>

                                                <div className="space-y-4">
                                                    <Label className="text-xs font-bold">Office Hours</Label>
                                                    {(block.content.office_hours || []).map((hour: string, i: number) => (
                                                        <div key={i} className="flex gap-2">
                                                            <Input 
                                                                value={hour} 
                                                                onChange={(e) => {
                                                                    const newHours = [...block.content.office_hours];
                                                                    newHours[i] = e.target.value;
                                                                    updateBlockContent(block.id, { office_hours: newHours });
                                                                }}
                                                            />
                                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                                                                const newHours = block.content.office_hours.filter((_:any, idx:number) => idx !== i);
                                                                updateBlockContent(block.id, { office_hours: newHours });
                                                            }}>
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button variant="outline" size="sm" onClick={() => {
                                                        const newHours = [...(block.content.office_hours || []), 'Mon — Fri: 09:00 — 18:00'];
                                                        updateBlockContent(block.id, { office_hours: newHours });
                                                    }}>
                                                        <Plus className="h-3 w-3 mr-2" /> Add Office Hour
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'faq' && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-xs">Title</Label>
                                                        <Input 
                                                            value={block.content.title} 
                                                            onChange={(e) => updateBlockContent(block.id, { title: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Subtitle</Label>
                                                        <Input 
                                                            value={block.content.subtitle} 
                                                            onChange={(e) => updateBlockContent(block.id, { subtitle: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <Label className="text-xs font-bold">Q&A Items</Label>
                                                    {(block.content.items || []).map((item: any, i: number) => (
                                                        <div key={i} className="space-y-2 border p-3 rounded bg-muted/10">
                                                            <div>
                                                                <Label className="text-[10px]">Question</Label>
                                                                <div className="flex gap-2">
                                                                    <Input 
                                                                        value={item.q} 
                                                                        onChange={(e) => {
                                                                            const newItems = [...block.content.items];
                                                                            newItems[i] = { ...item, q: e.target.value };
                                                                            updateBlockContent(block.id, { items: newItems });
                                                                        }}
                                                                    />
                                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                                                                        const newItems = block.content.items.filter((_:any, idx:number) => idx !== i);
                                                                        updateBlockContent(block.id, { items: newItems });
                                                                    }}>
                                                                        <Trash className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Label className="text-[10px]">Answer</Label>
                                                                <Textarea 
                                                                    className="h-16 text-xs"
                                                                    value={item.a} 
                                                                    onChange={(e) => {
                                                                        const newItems = [...block.content.items];
                                                                        newItems[i] = { ...item, a: e.target.value };
                                                                        updateBlockContent(block.id, { items: newItems });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <Button variant="outline" size="sm" onClick={() => {
                                                        const newItems = [...(block.content.items || []), { q: 'Question?', a: 'Answer...' }];
                                                        updateBlockContent(block.id, { items: newItems });
                                                    }}>
                                                        <Plus className="h-3 w-3 mr-2" /> Add FAQ Item
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'cover_demo' && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-xs">Title Part 1</Label>
                                                        <Input 
                                                            value={block.content.titleOne || ''} 
                                                            onChange={(e) => updateBlockContent(block.id, { titleOne: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Title Part 2</Label>
                                                        <Input 
                                                            value={block.content.titleTwo || ''} 
                                                            onChange={(e) => updateBlockContent(block.id, { titleTwo: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label className="text-xs">Cover Text (Animated)</Label>
                                                        <Input 
                                                            value={block.content.coverText || ''} 
                                                            onChange={(e) => updateBlockContent(block.id, { coverText: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Font Size (Tailwind)</Label>
                                                        <Select 
                                                            value={block.content.fontSize || 'text-4xl md:text-4xl lg:text-6xl'} 
                                                            onValueChange={(value) => updateBlockContent(block.id, { fontSize: value })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select size" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="text-2xl md:text-3xl lg:text-4xl">Small (2xl/4xl)</SelectItem>
                                                                <SelectItem value="text-3xl md:text-4xl lg:text-5xl">Medium (3xl/5xl)</SelectItem>
                                                                <SelectItem value="text-4xl md:text-4xl lg:text-6xl">Large (4xl/6xl) - Default</SelectItem>
                                                                <SelectItem value="text-5xl md:text-6xl lg:text-7xl">X-Large (5xl/7xl)</SelectItem>
                                                                <SelectItem value="text-6xl md:text-7xl lg:text-8xl">Jumbo (6xl/8xl)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Font Weight</Label>
                                                        <Select 
                                                            value={block.content.fontWeight || 'font-semibold'} 
                                                            onValueChange={(value) => updateBlockContent(block.id, { fontWeight: value })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select weight" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="font-normal">Normal (400)</SelectItem>
                                                                <SelectItem value="font-medium">Medium (500)</SelectItem>
                                                                <SelectItem value="font-semibold">Semibold (600) - Default</SelectItem>
                                                                <SelectItem value="font-bold">Bold (700)</SelectItem>
                                                                <SelectItem value="font-black">Black (900)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}

                            {blocks.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                    <p>No content blocks added yet.</p>
                                    <p className="text-sm">Click the buttons above to start building your page.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Settings */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Page Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Page Title</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                    />
                                    {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                    />
                                    {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="template">Template</Label>
                                    <Select 
                                        value={data.template} 
                                        onValueChange={(val: any) => setData('template', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">Default Page</SelectItem>
                                            <SelectItem value="home">Homepage</SelectItem>
                                            <SelectItem value="contact">Contact Page</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                        id="is_published"
                                        checked={data.is_published}
                                        onCheckedChange={(checked) => setData('is_published', checked)}
                                    />
                                    <Label htmlFor="is_published">Published</Label>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">SEO</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="meta_title">Meta Title</Label>
                                    <Input
                                        id="meta_title"
                                        value={data.meta_title}
                                        onChange={(e) => setData('meta_title', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="meta_description">Description</Label>
                                    <Textarea
                                        id="meta_description"
                                        value={data.meta_description}
                                        onChange={(e) => setData('meta_description', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
