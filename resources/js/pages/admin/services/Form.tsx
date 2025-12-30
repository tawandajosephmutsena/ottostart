import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Service } from '@/types';
import { useForm } from '@inertiajs/react';
import React from 'react';
import { Save, ArrowLeft, ImagePlus, Palette, Layout, Code, Cpu, Shield, Rocket, Globe, Zap } from 'lucide-react';
import { Link } from '@inertiajs/react';
import MediaLibrary from '@/components/admin/MediaLibrary';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Props {
    service?: Service;
}

interface ServiceFormData {
    title: string;
    slug: string;
    description: string;
    price_range: string;
    featured_image: string;
    icon: string;
    is_published: boolean;
    is_featured: boolean;
    sort_order: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: any;
}

const ICONS = [
    { value: 'palette', label: 'Palette', icon: Palette },
    { value: 'layout', label: 'Layout', icon: Layout },
    { value: 'code', label: 'Code', icon: Code },
    { value: 'cpu', label: 'CPU', icon: Cpu },
    { value: 'shield', label: 'Shield', icon: Shield },
    { value: 'rocket', label: 'Rocket', icon: Rocket },
    { value: 'globe', label: 'Globe', icon: Globe },
    { value: 'zap', label: 'Zap', icon: Zap },
];

export default function ServiceForm({ service }: Props) {
    const { data, setData, post, put, processing, errors } = useForm<ServiceFormData>({
        title: service?.title || '',
        slug: service?.slug || '',
        description: service?.description || '',
        price_range: service?.price_range || '',
        featured_image: service?.featured_image || '',
        icon: service?.icon || 'zap',
        is_published: service?.is_published ?? false,
        is_featured: service?.is_featured ?? false,
        sort_order: service?.sort_order ?? 0,
        content: service?.content || {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (service) {
            put(`/admin/services/${service.id}`);
        } else {
            post('/admin/services');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/services">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {service ? 'Edit Service' : 'New Service'}
                    </h1>
                </div>
                <Button type="submit" disabled={processing} className="bg-agency-accent text-agency-primary hover:bg-agency-accent/90">
                    <Save className="h-4 w-4 mr-2" />
                    {service ? 'Update Service' : 'Create Service'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. Creative Brand Strategy"
                                />
                                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder="e.g. creative-brand-strategy"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Short Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    placeholder="A brief overview of the service..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Scope & Content</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Detailed Scope (Markdown)</Label>
                                <Textarea
                                    value={data.content?.body || ''}
                                    onChange={(e) => setData('content', { ...data.content, body: e.target.value })}
                                    rows={10}
                                    placeholder="Detailed description of what's included..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Published</Label>
                                <Switch
                                    checked={data.is_published}
                                    onCheckedChange={(checked) => setData('is_published', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Featured</Label>
                                <Switch
                                    checked={data.is_featured}
                                    onCheckedChange={(checked) => setData('is_featured', checked)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sort_order">Sort Order</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing & Visuals</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price_range">Price Range</Label>
                                <Input
                                    id="price_range"
                                    value={data.price_range}
                                    onChange={(e) => setData('price_range', e.target.value)}
                                    placeholder="e.g. $5,000 - $10,000"
                                />
                            </div>
                            
                            <div className="grid gap-2">
                                <Label>Icon</Label>
                                <Select value={data.icon} onValueChange={(val) => setData('icon', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select icon" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ICONS.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                <div className="flex items-center gap-2">
                                                    <item.icon className="h-4 w-4" />
                                                    {item.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Featured Image</Label>
                                <MediaLibrary 
                                    type="image"
                                    currentValue={data.featured_image}
                                    onSelect={(asset) => setData('featured_image', asset.url)}
                                    trigger={
                                        <div 
                                            className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20 overflow-hidden relative"
                                        >
                                            {data.featured_image ? (
                                                <img src={data.featured_image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                                                    <p className="text-xs text-muted-foreground">Select Image</p>
                                                </>
                                            )}
                                        </div>
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
