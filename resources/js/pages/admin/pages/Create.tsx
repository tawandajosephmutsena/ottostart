import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm, Link } from '@inertiajs/react';
import { ChevronLeft, Save } from 'lucide-react';
import React from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        slug: '',
        meta_title: '',
        meta_description: '',
        template: 'default',
        is_published: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/pages');
    };

    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Pages', href: '/admin/pages' },
        { title: 'Create', href: '/admin/pages/create' },
    ];

    return (
        <AdminLayout title="Create Page" breadcrumbs={breadcrumbs}>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link href="/admin/pages" className="p-2 rounded-full hover:bg-muted transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create Page</h1>
                        <p className="text-muted-foreground text-sm">Initialize a new page structure</p>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="title">Page Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. Terms of Service"
                                />
                                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (Optional)</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder="terms-of-service"
                                />
                                {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="template">Page Template</Label>
                            <Select 
                                value={data.template} 
                                onValueChange={(val) => setData('template', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select template" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Default Page</SelectItem>
                                    <SelectItem value="home">Homepage (Complex)</SelectItem>
                                    <SelectItem value="contact">Contact Page</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Templates determine the available content blocks and layout structure.
                            </p>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-sm font-medium">SEO Configuration</h3>
                            <div className="space-y-2">
                                <Label htmlFor="meta_title">Meta Title</Label>
                                <Input
                                    id="meta_title"
                                    value={data.meta_title}
                                    onChange={(e) => setData('meta_title', e.target.value)}
                                    placeholder="Browser Tab Title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="meta_description">Meta Description</Label>
                                <Input
                                    id="meta_description"
                                    value={data.meta_description}
                                    onChange={(e) => setData('meta_description', e.target.value)}
                                    placeholder="Search engine description"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-4 border-t">
                            <Switch
                                id="is_published"
                                checked={data.is_published}
                                onCheckedChange={(checked) => setData('is_published', checked)}
                            />
                            <Label htmlFor="is_published">Publish immediately</Label>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => window.history.back()}>Cancel</Button>
                    <Button type="submit" disabled={processing}>
                        <Save className="h-4 w-4 mr-2" />
                        Create Page
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
