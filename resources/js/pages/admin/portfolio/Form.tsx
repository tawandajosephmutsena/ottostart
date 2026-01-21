import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PortfolioItem, MediaAsset } from '@/types';
import { useForm } from '@inertiajs/react';
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImagePlus, X, Plus, Save, ArrowLeft, GripVertical } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import MediaLibrary from '@/components/admin/MediaLibrary';
import { toast } from 'sonner';

interface Props {
    portfolioItem?: PortfolioItem;
}

export default function PortfolioForm({ portfolioItem }: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        title: portfolioItem?.title || '',
        slug: portfolioItem?.slug || '',
        description: portfolioItem?.description || '',
        client: portfolioItem?.client || '',
        project_date: portfolioItem?.project_date ? portfolioItem.project_date.split('T')[0] : '',
        project_url: portfolioItem?.project_url || '',
        featured_image: portfolioItem?.featured_image || '',
        gallery: portfolioItem?.gallery || [],
        is_published: portfolioItem?.is_published ?? false,
        is_featured: portfolioItem?.is_featured ?? false,
        technologies: portfolioItem?.technologies || [],
        stats: portfolioItem?.stats || [],
        content: {
            overview: portfolioItem?.content?.overview || '',
            challenge: portfolioItem?.content?.challenge || '',
            solution: portfolioItem?.content?.solution || '',
            results: portfolioItem?.content?.results || '',
        },
    });

    const [newTech, setNewTech] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const options = {
            onSuccess: () => toast.success(portfolioItem ? 'Project updated successfully!' : 'Project created successfully!'),
            onError: () => toast.error('Failed to save project. Please check the form for errors.'),
        };
        
        if (portfolioItem && portfolioItem.id) {
            // Use slug if available as it's the route key, otherwise fallback to ID
            const routeKey = portfolioItem.slug || portfolioItem.id;
            put(`/admin/portfolio/${routeKey}`, options);
        } else {
            post('/admin/portfolio', options);
        }
    };

    const addTech = () => {
        if (newTech && !data.technologies.includes(newTech)) {
            setData('technologies', [...data.technologies, newTech]);
            setNewTech('');
        }
    };

    const removeTech = (tech: string) => {
        setData('technologies', data.technologies.filter((t: string) => t !== tech));
    };

    const addGalleryImages = (assets: MediaAsset | MediaAsset[]) => {
        const newImages = Array.isArray(assets) 
            ? assets.map(a => a.url) 
            : [assets.url];
        
        // Filter out duplicates
        const uniqueNewImages = newImages.filter(url => !data.gallery.includes(url));
        setData('gallery', [...data.gallery, ...uniqueNewImages]);
    };

    const removeGalleryImage = (url: string) => {
        setData('gallery', data.gallery.filter(img => img !== url));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/portfolio">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {portfolioItem ? 'Edit Project' : 'New Project'}
                    </h1>
                </div>
                <Button type="submit" disabled={processing} className="bg-agency-accent text-agency-primary hover:bg-agency-accent/90">
                    <Save className="h-4 w-4 mr-2" />
                    {portfolioItem ? 'Update Project' : 'Create Project'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Main details of the project</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Project Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. Avant-Garde Website Redesign"
                                />
                                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug (URL)</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder="avant-garde-website-redesign"
                                />
                                {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Short Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief summary for listing cards..."
                                    rows={3}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Detailed Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="overview">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="challenge">Challenge</TabsTrigger>
                                    <TabsTrigger value="solution">Solution</TabsTrigger>
                                    <TabsTrigger value="results">Results</TabsTrigger>
                                </TabsList>
                                <TabsContent value="overview" className="space-y-2">
                                    <Label>Project Overview</Label>
                                    <Textarea
                                        value={data.content.overview}
                                        onChange={(e) => setData('content', { ...data.content, overview: e.target.value })}
                                        placeholder="Full background of the project..."
                                        rows={8}
                                    />
                                </TabsContent>
                                <TabsContent value="challenge" className="space-y-2">
                                    <Label>The Challenge</Label>
                                    <Textarea
                                        value={data.content.challenge}
                                        onChange={(e) => setData('content', { ...data.content, challenge: e.target.value })}
                                        placeholder="What problems were we solving?"
                                        rows={8}
                                    />
                                </TabsContent>
                                <TabsContent value="solution" className="space-y-2">
                                    <Label>Our Solution</Label>
                                    <Textarea
                                        value={data.content.solution}
                                        onChange={(e) => setData('content', { ...data.content, solution: e.target.value })}
                                        placeholder="How did we address the project goals?"
                                        rows={8}
                                    />
                                </TabsContent>
                                <TabsContent value="results" className="space-y-2">
                                    <Label>Key Results</Label>
                                    <Textarea
                                        value={data.content.results}
                                        onChange={(e) => setData('content', { ...data.content, results: e.target.value })}
                                        placeholder="Metrics, deliverables, and impacts..."
                                        rows={8}
                                    />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Project Gallery</CardTitle>
                                <CardDescription>Additional images showcase</CardDescription>
                            </div>
                            <MediaLibrary 
                                type="image"
                                multiple
                                onSelect={addGalleryImages}
                                trigger={
                                    <Button type="button" variant="outline" size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Images
                                    </Button>
                                }
                            />
                        </CardHeader>
                        <CardContent>
                            {data.gallery.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {data.gallery.map((url, index) => (
                                        <div key={index} className="group relative aspect-square rounded-xl overflow-hidden border-2 border-muted hover:border-agency-accent transition-all shadow-sm">
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <Button 
                                                    type="button" 
                                                    variant="destructive" 
                                                    size="icon" 
                                                    className="h-8 w-8"
                                                    onClick={() => removeGalleryImage(url)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                                <div className="h-8 w-8 bg-white/20 backdrop-blur-md rounded-md flex items-center justify-center cursor-grab active:cursor-grabbing">
                                                    <GripVertical className="h-4 w-4 text-white" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/50 backdrop-blur-md rounded text-[10px] text-white font-bold">
                                                {index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
                                    <ImagePlus className="h-10 w-10 mb-4 opacity-20" />
                                    <p className="text-sm">No gallery images added yet.</p>
                                    <p className="text-xs mt-1">Click 'Add Images' to populate your gallery.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status & Visibility</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Publish Project</Label>
                                    <p className="text-xs text-muted-foreground">Make it visible on the site</p>
                                </div>
                                <Switch
                                    checked={data.is_published}
                                    onCheckedChange={(checked) => setData('is_published', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Featured Project</Label>
                                    <p className="text-xs text-muted-foreground">Highlight on homepage</p>
                                </div>
                                <Switch
                                    checked={data.is_featured}
                                    onCheckedChange={(checked) => setData('is_featured', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Featured Image</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <MediaLibrary 
                                type="image"
                                currentValue={data.featured_image}
                                onSelect={(asset) => setData('featured_image', (asset as MediaAsset).url)}
                                trigger={
                                    <div 
                                        className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20 overflow-hidden relative shadow-inner"
                                    >
                                        {data.featured_image ? (
                                            <img src={data.featured_image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                                                <p className="text-xs text-muted-foreground">Select Main Image</p>
                                            </>
                                        )}
                                    </div>
                                }
                            />
                            <div className="grid gap-2">
                                <Label className="text-xs opacity-60">Image URL</Label>
                                <Input
                                    value={data.featured_image}
                                    onChange={(e) => setData('featured_image', e.target.value)}
                                    placeholder="https://..."
                                    className="text-xs"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Project Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="client">Client Name</Label>
                                <Input
                                    id="client"
                                    value={data.client}
                                    onChange={(e) => setData('client', e.target.value)}
                                    placeholder="Leave empty for internal"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="project_date">Completion Date</Label>
                                <Input
                                    id="project_date"
                                    type="date"
                                    value={data.project_date}
                                    onChange={(e) => setData('project_date', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="project_url">Project URL</Label>
                                <Input
                                    id="project_url"
                                    value={data.project_url}
                                    onChange={(e) => setData('project_url', e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Technologies</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    value={newTech}
                                    onChange={(e) => setNewTech(e.target.value)}
                                    placeholder="Add tech..."
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                                />
                                <Button type="button" size="icon" onClick={addTech} variant="outline">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {data.technologies.map((tech, i) => (
                                    <Badge key={i} variant="secondary" className="pl-2 gap-1 bg-agency-accent/5 text-agency-primary hover:bg-agency-accent/10 transition-colors">
                                        {tech}
                                        <X
                                            className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                                            onClick={() => removeTech(tech)}
                                        />
                                    </Badge>
                                ))}
                                {data.technologies.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic">No technologies added.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Project Stats</CardTitle>
                            <CardDescription>Metrics displayed in the results section</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => setData('stats', [...data.stats, { value: '', label: '' }])}
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Stat
                            </Button>
                            <div className="space-y-3">
                                {data.stats.map((stat: { value: string; label: string }, i: number) => (
                                    <div key={i} className="group relative p-3 border rounded-lg bg-muted/10 space-y-2">
                                        <button 
                                            type="button" 
                                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setData('stats', data.stats.filter((_: { value: string; label: string }, idx: number) => idx !== i))}
                                            title="Remove stat"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                        <Input
                                            value={stat.value}
                                            onChange={(e) => {
                                                const newStats = [...data.stats];
                                                newStats[i] = { ...stat, value: e.target.value };
                                                setData('stats', newStats);
                                            }}
                                            placeholder="+85%"
                                            className="text-lg font-bold"
                                        />
                                        <Input
                                            value={stat.label}
                                            onChange={(e) => {
                                                const newStats = [...data.stats];
                                                newStats[i] = { ...stat, label: e.target.value };
                                                setData('stats', newStats);
                                            }}
                                            placeholder="Mobile Traffic"
                                            className="text-xs"
                                        />
                                    </div>
                                ))}
                                {data.stats.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic text-center py-2">
                                        No stats added. Default stats will be shown.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
