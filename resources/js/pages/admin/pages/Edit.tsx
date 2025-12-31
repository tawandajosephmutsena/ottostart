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
import { ChevronLeft, Save, Plus, Trash, ArrowUp, ArrowDown, Image as ImageIcon, Type, Layout } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface Props {
    page: Page;
}

// Define the structure of our blocks
type BlockType = 'hero' | 'text' | 'image' | 'features';

interface Block {
    id: string;
    type: BlockType;
    content: any;
}

export default function Edit({ page }: Props) {
    // Parse initial content or default to empty array
    // @ts-ignore
    const initialBlocks = (Array.isArray(page.content?.blocks) ? page.content.blocks : []) as Block[];

    const { data, setData, put, processing, errors } = useForm({
        title: page.title,
        slug: page.slug,
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        template: page.template,
        is_published: page.is_published,
        content: page.content || { blocks: [] },
    });

    const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

    // Update form data when blocks change
    React.useEffect(() => {
        setData('content', { ...data.content, blocks });
    }, [blocks]);

    const addBlock = (type: BlockType) => {
        const newBlock: Block = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: getDefaultContentForType(type),
        };
        setBlocks([...blocks, newBlock]);
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    const updateBlockContent = (id: string, content: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...content } } : b));
    };

    const getDefaultContentForType = (type: BlockType) => {
        switch (type) {
            case 'hero': return { title: 'Welcome', subtitle: 'Subtitle text', image: '' };
            case 'text': return { body: 'Enter your text here...' };
            case 'image': return { url: '', alt: '', caption: '' };
            case 'features': return { title: 'Our Features', items: [{ title: 'Feature 1', desc: 'Description' }] };
            default: return {};
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/pages/${page.id}`, {
            onSuccess: () => toast.success('Page updated successfully'),
            onError: () => toast.error('Failed to update page'),
        });
    };

    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Pages', href: '/admin/pages' },
        { title: 'Edit', href: `/admin/pages/${page.id}/edit` },
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
                            <a href={`/${page.slug === 'home' ? '' : page.slug}`} target="_blank" rel="noreferrer">
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
                                <Button type="button" variant="secondary" onClick={() => addBlock('hero')}>
                                    <Layout className="h-4 w-4 mr-2" /> Add Hero
                                </Button>
                                <Button type="button" variant="secondary" onClick={() => addBlock('text')}>
                                    <Type className="h-4 w-4 mr-2" /> Add Text
                                </Button>
                                <Button type="button" variant="secondary" onClick={() => addBlock('image')}>
                                    <ImageIcon className="h-4 w-4 mr-2" /> Add Image
                                </Button>
                             </div>
                        </Card>

                        <div className="space-y-4">
                            {blocks.map((block, index) => (
                                <Card key={block.id} className="relative group hover:border-agency-accent/50 transition-colors">
                                    <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                            {block.type === 'hero' && <Layout className="h-3 w-3" />}
                                            {block.type === 'text' && <Type className="h-3 w-3" />}
                                            {block.type === 'image' && <ImageIcon className="h-3 w-3" />}
                                            {block.type} Block
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="p-6">
                                        {block.type === 'hero' && (
                                            <div className="space-y-4">
                                                <div>
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
                                                    <Label className="text-xs">Background Image URL</Label>
                                                    <Input 
                                                        value={block.content.image} 
                                                        onChange={(e) => updateBlockContent(block.id, { image: e.target.value })}
                                                        placeholder="/images/hero.jpg"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'text' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-xs">Content (Markdown supported)</Label>
                                                    <Textarea 
                                                        className="min-h-[150px] font-mono text-sm"
                                                        value={block.content.body} 
                                                        onChange={(e) => updateBlockContent(block.id, { body: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'image' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <Label className="text-xs">Image URL</Label>
                                                    <Input 
                                                        value={block.content.url} 
                                                        onChange={(e) => updateBlockContent(block.id, { url: e.target.value })}
                                                        placeholder="https://..."
                                                    />
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
