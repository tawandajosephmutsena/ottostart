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
import RichTextEditor from '@/components/admin/RichTextEditor';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

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
    content: {
        body: string;
        scope: string;
        features?: string[];
        [key: string]: string | string[] | undefined;
    };
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
        content: {
            body: (service?.content as Record<string, string>)?.body || '',
            scope: (service?.content as Record<string, string>)?.scope || '',
            features: (service?.content as Record<string, string[]>)?.features || [],
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const options = {
            onSuccess: () => toast.success(service ? 'Service updated successfully!' : 'Service created successfully!'),
            onError: () => toast.error('Failed to save service. Please check the form for errors.'),
        };
        
        if (service) {
            put(`/admin/services/${service.slug}`, options);
        } else {
            post('/admin/services', options);
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
                        <CardContent className="space-y-6">
                            <div className="grid gap-2">
                                <Label>Detailed Scope</Label>
                                <RichTextEditor
                                    content={data.content?.scope || ''}
                                    onChange={(content) => setData('content', { ...data.content, scope: content })}
                                    placeholder="Outline the scope of work here..."
                                    className="min-h-[200px]"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Main Content</Label>
                                <RichTextEditor
                                    content={data.content?.body || ''}
                                    onChange={(content) => setData('content', { ...data.content, body: content })}
                                    placeholder="Detailed description of the service and its benefits..."
                                    className="min-h-[350px]"
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
                            <CardTitle>Features ("What's Included")</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(data.content?.features || []).map((feature, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={feature}
                                            onChange={(e) => {
                                                const newFeatures = [...(data.content.features || [])];
                                                newFeatures[index] = e.target.value;
                                                setData('content', { ...data.content, features: newFeatures });
                                            }}
                                            placeholder="e.g. Deep Strategic Analysis"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                const newFeatures = (data.content.features || []).filter((_, i) => i !== index);
                                                setData('content', { ...data.content, features: newFeatures });
                                            }}
                                        >
                                            <span className="sr-only">Remove</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const newFeatures = [...(data.content.features || []), ''];
                                        setData('content', { ...data.content, features: newFeatures });
                                    }}
                                    className="w-full"
                                >
                                    + Add Feature
                                </Button>
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
