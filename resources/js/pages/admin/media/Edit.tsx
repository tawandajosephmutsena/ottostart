import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MediaAsset } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Save, 
    X, 
    Tag as TagIcon 
} from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    mediaAsset: MediaAsset;
    folders: string[];
}

export default function Edit({ mediaAsset, folders }: Props) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Media Library', href: '/admin/media' },
        { title: mediaAsset.original_name, href: `/admin/media/${mediaAsset.id}` },
        { title: 'Edit', href: `/admin/media/${mediaAsset.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        alt_text: mediaAsset.alt_text || '',
        caption: mediaAsset.caption || '',
        folder: mediaAsset.folder || 'uploads',
        tags: mediaAsset.tags || [],
    });

    const [newTag, setNewTag] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/media/${mediaAsset.id}`);
    };

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag) {
            e.preventDefault();
            if (!data.tags.includes(newTag)) {
                setData('tags', [...data.tags, newTag]);
            }
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setData('tags', data.tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <AdminLayout title={`Edit ${mediaAsset.original_name}`} breadcrumbs={breadcrumbs}>
            <div className="max-w-2xl mx-auto w-full space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/media/${mediaAsset.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Media Details</h1>
                        <p className="text-muted-foreground text-sm">{mediaAsset.original_name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="alt_text">Alt Text</Label>
                                <Input
                                    id="alt_text"
                                    value={data.alt_text}
                                    onChange={e => setData('alt_text', e.target.value)}
                                    placeholder="Describe the image for accessibility"
                                />
                                {errors.alt_text && <p className="text-sm text-destructive">{errors.alt_text}</p>}
                                <p className="text-xs text-muted-foreground">
                                    Alternative text is used for screen readers and SEO.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="caption">Caption</Label>
                                <Textarea
                                    id="caption"
                                    value={data.caption}
                                    onChange={e => setData('caption', e.target.value)}
                                    placeholder="Add a caption or description"
                                    rows={3}
                                />
                                {errors.caption && <p className="text-sm text-destructive">{errors.caption}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="folder">Folder</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="folder"
                                        value={data.folder}
                                        onChange={e => setData('folder', e.target.value)}
                                        placeholder="uploads"
                                        list="folder-options"
                                    />
                                </div>
                                <datalist id="folder-options">
                                    {folders.map(folder => (
                                        <option key={folder} value={folder} />
                                    ))}
                                </datalist>
                                {errors.folder && <p className="text-sm text-destructive">{errors.folder}</p>}
                                <p className="text-xs text-muted-foreground text-amber-600">
                                    Warning: Changing the folder moves the file physically. This might break existing links if not handled dynamically.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="tags"
                                        value={newTag}
                                        onChange={e => setNewTag(e.target.value)}
                                        onKeyDown={addTag}
                                        placeholder="Type a tag and press Enter"
                                    />
                                    <Button type="button" variant="outline" onClick={() => {
                                        if (newTag && !data.tags.includes(newTag)) {
                                            setData('tags', [...data.tags, newTag]);
                                            setNewTag('');
                                        }
                                    }}>
                                        Add
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2 p-2 border rounded-md min-h-[40px] bg-muted/20">
                                    {data.tags.length > 0 ? (
                                        data.tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="gap-1 pl-2">
                                                <TagIcon className="h-3 w-3" />
                                                {tag}
                                                <X 
                                                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                                                    onClick={() => removeTag(tag)}
                                                />
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic px-2 py-1">No tags added</p>
                                    )}
                                </div>
                                {errors.tags && <p className="text-sm text-destructive">{errors.tags}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/admin/media/${mediaAsset.id}`}>
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
