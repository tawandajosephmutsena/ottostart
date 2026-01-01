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
import { Badge } from '@/components/ui/badge';
import { Insight, Category, User } from '@/types';
import { useForm } from '@inertiajs/react';
import React from 'react';
import { Save, ArrowLeft, ImagePlus, X, Plus, History, Eye } from 'lucide-react';
import { Link } from '@inertiajs/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import MediaLibrary from '@/components/admin/MediaLibrary';
import RichTextEditor from '@/components/admin/RichTextEditor';
import VersionHistory from '@/components/admin/VersionHistory';
import VersionComparison from '@/components/admin/VersionComparison';
import RealTimePreview from '@/components/admin/RealTimePreview';
import PreviewShare from '@/components/admin/PreviewShare';

interface Props {
    insight?: Insight;
    categories: Category[];
    authors: User[];
}

export default function InsightForm({ insight, categories, authors }: Props) {
    const { data, setData, post, put, processing, errors } = useForm<{
        title: string;
        slug: string;
        excerpt: string;
        content: { body: string };
        featured_image: string;
        author_id: string | number;
        category_id: string | number;
        tags: string[];
        reading_time: number;
        is_published: boolean;
        is_featured: boolean;
    }>({
        title: insight?.title || '',
        slug: insight?.slug || '',
        excerpt: insight?.excerpt || '',
        content: (insight?.content as { body: string }) || { body: '' },
        featured_image: insight?.featured_image || '',
        author_id: insight?.author_id || authors[0]?.id || '',
        category_id: insight?.category_id || '',
        tags: insight?.tags || [],
        reading_time: insight?.reading_time || 5,
        is_published: insight?.is_published ?? false,
        is_featured: insight?.is_featured ?? false,
    });

    const [newTag, setNewTag] = React.useState('');
    const [showVersionHistory, setShowVersionHistory] = React.useState(false);
    const [showVersionComparison, setShowVersionComparison] = React.useState(false);
    const [comparisonVersions, setComparisonVersions] = React.useState<[number, number] | null>(null);
    const [showPreview, setShowPreview] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (insight) {
            put(`/admin/insights/${insight.id}`);
        } else {
            post('/admin/insights');
        }
    };

    const addTag = () => {
        if (newTag && !data.tags.includes(newTag)) {
            setData('tags', [...data.tags, newTag]);
            setNewTag('');
        }
    };

    const removeTag = (tag: string) => {
        setData('tags', data.tags.filter((t) => t !== tag));
    };

    const handleVersionRestore = () => {
        // Refresh the page to load the restored content
        window.location.reload();
    };

    const handleVersionCompare = (version1: number, version2: number) => {
        setComparisonVersions([version1, version2]);
        setShowVersionComparison(true);
        setShowVersionHistory(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/insights">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {insight ? 'Edit Article' : 'New Article'}
                    </h1>
                </div>
                <Button type="submit" disabled={processing} className="bg-agency-accent text-agency-primary hover:bg-agency-accent/90">
                    <Save className="h-4 w-4 mr-2" />
                    {insight ? 'Update Article' : 'Publish Article'}
                </Button>
                {insight && (
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowVersionHistory(!showVersionHistory)}
                        className="gap-2"
                    >
                        <History className="h-4 w-4" />
                        Version History
                    </Button>
                )}
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowPreview(!showPreview)}
                    className="gap-2"
                >
                    <Eye className="h-4 w-4" />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Article Content</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="The Future of Avant-Garde Design"
                                />
                                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="excerpt">Excerpt</Label>
                                <Textarea
                                    id="excerpt"
                                    value={data.excerpt}
                                    onChange={(e) => setData('excerpt', e.target.value)}
                                    placeholder="A brief summary for the blog list..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Content</Label>
                                <RichTextEditor
                                    content={data.content.body}
                                    onChange={(content) => setData('content', { ...data.content, body: content })}
                                    placeholder="Write your article here..."
                                    limit={50000}
                                    autoSave={true}
                                    onSave={(content) => {
                                        // Auto-save functionality - could save to localStorage or send to server
                                        localStorage.setItem(`insight-draft-${insight?.id || 'new'}`, content);
                                    }}
                                    showWordCount={true}
                                    showTableOfContents={true}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Rich text editor with auto-save, media integration, and advanced formatting options.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Publishing</CardTitle>
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
                            <div className="grid gap-2 text-xs">
                               <Label>Author</Label>
                               <Select 
                                    value={data.author_id.toString()} 
                                    onValueChange={(val) => setData('author_id', parseInt(val))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select author" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {authors.map(author => (
                                            <SelectItem key={author.id} value={author.id.toString()}>
                                                {author.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                               </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cataloging</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <Select 
                                    value={data.category_id?.toString()} 
                                    onValueChange={(val) => setData('category_id', parseInt(val))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Tags</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Add tag..."
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    />
                                    <Button type="button" size="icon" onClick={addTag} variant="outline">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {data.tags.map(tag => (
                                         <Badge key={tag} variant="secondary" className="gap-1 px-1.5">
                                            {tag}
                                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                                         </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="reading_time">Reading Time (min)</Label>
                                <Input
                                    id="reading_time"
                                    type="number"
                                    value={data.reading_time}
                                    onChange={(e) => setData('reading_time', parseInt(e.target.value))}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Featured Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MediaLibrary 
                                type="image"
                                currentValue={data.featured_image}
                                onSelect={(asset) => setData('featured_image', asset.url)}
                                trigger={
                                    <div 
                                        className="aspect-video rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted mb-3 overflow-hidden bg-muted/20"
                                    >
                                        {data.featured_image ? (
                                            <img src={data.featured_image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImagePlus className="h-8 w-8 text-muted-foreground" />
                                        )}
                                    </div>
                                }
                            />
                            <Input
                                value={data.featured_image}
                                onChange={(e) => setData('featured_image', e.target.value)}
                                placeholder="Image URL"
                                className="text-xs"
                            />
                        </CardContent>
                    </Card>

                    {insight && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview Sharing</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PreviewShare
                                    contentType="insight"
                                    contentId={insight.id}
                                    contentTitle={data.title}
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Version History and Comparison */}
            {insight && showVersionHistory && !showVersionComparison && (
                <div className="mt-6">
                    <VersionHistory
                        contentType="insight"
                        contentId={insight.id}
                        onRestore={handleVersionRestore}
                        onCompare={handleVersionCompare}
                    />
                </div>
            )}

            {insight && showVersionComparison && comparisonVersions && (
                <div className="mt-6">
                    <VersionComparison
                        contentType="insight"
                        contentId={insight.id}
                        version1={comparisonVersions[0]}
                        version2={comparisonVersions[1]}
                        onClose={() => {
                            setShowVersionComparison(false);
                            setShowVersionHistory(true);
                            setComparisonVersions(null);
                        }}
                    />
                </div>
            )}

            {/* Real-time Preview */}
            <RealTimePreview
                data={{
                    ...data,
                    author_id: typeof data.author_id === 'string' ? parseInt(data.author_id) : data.author_id,
                    category_id: typeof data.category_id === 'string' ? parseInt(data.category_id) : data.category_id,
                }}
                contentType="insight"
                isVisible={showPreview}
                onToggle={() => setShowPreview(!showPreview)}
            />
        </form>
    );
}
