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
import { TeamMember } from '@/types';
import { useForm } from '@inertiajs/react';
import React from 'react';
import { Save, ArrowLeft, UserPlus, Linkedin, Github, Globe } from 'lucide-react';
import { Link } from '@inertiajs/react';
import MediaLibrary from '@/components/admin/MediaLibrary';

interface Props {
    teamMember?: TeamMember;
}

export default function TeamMemberForm({ teamMember }: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: teamMember?.name || '',
        position: teamMember?.position || '',
        bio: teamMember?.bio || '',
        avatar: teamMember?.avatar || '',
        email: teamMember?.email || '',
        social_links: teamMember?.social_links || {
            linkedin: '',
            github: '',
            website: '',
        },
        is_active: teamMember?.is_active ?? true,
        is_featured: teamMember?.is_featured ?? false,
        sort_order: teamMember?.sort_order ?? 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (teamMember) {
            put(`/admin/team/${teamMember.id}`);
        } else {
            post('/admin/team');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/team">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {teamMember ? 'Edit member' : 'New Member'}
                    </h1>
                </div>
                <Button type="submit" disabled={processing} className="bg-agency-accent text-agency-primary hover:bg-agency-accent/90">
                    <Save className="h-4 w-4 mr-2" />
                    {teamMember ? 'Update Member' : 'Add to Tribe'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. John Doe"
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="position">Position / Role</Label>
                                <Input
                                    id="position"
                                    value={data.position}
                                    onChange={(e) => setData('position', e.target.value)}
                                    placeholder="e.g. Creative Director"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    rows={6}
                                    placeholder="Tell the story of this team member..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Social Presence</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label className="flex items-center gap-2">
                                    <Linkedin className="h-4 w-4" /> LinkedIn URL
                                </Label>
                                <Input
                                    value={data.social_links?.linkedin || ''}
                                    onChange={(e) => setData('social_links', { ...data.social_links, linkedin: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="flex items-center gap-2">
                                    <Github className="h-4 w-4" /> GitHub URL
                                </Label>
                                <Input
                                    value={data.social_links?.github || ''}
                                    onChange={(e) => setData('social_links', { ...data.social_links, github: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" /> Website/Portfolio URL
                                </Label>
                                <Input
                                    value={data.social_links?.website || ''}
                                    onChange={(e) => setData('social_links', { ...data.social_links, website: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Avatar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MediaLibrary 
                                type="image"
                                currentValue={data.avatar}
                                onSelect={(asset) => setData('avatar', asset.url)}
                                trigger={
                                     <div
                                        className="aspect-square rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted mb-3 overflow-hidden bg-muted/20 mx-auto max-w-[200px]"
                                    >
                                        {data.avatar ? (
                                            <img src={data.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserPlus className="h-10 w-10 text-muted-foreground" />
                                        )}
                                    </div>
                                }
                            />
                            <Input
                                value={data.avatar}
                                onChange={(e) => setData('avatar', e.target.value)}
                                placeholder="Avatar URL"
                                className="text-xs"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status & Sorting</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Active Member</Label>
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Featured Member</Label>
                                <Switch
                                    checked={data.is_featured}
                                    onCheckedChange={(checked) => setData('is_featured', checked)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sort_order">Display Order</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Public Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="john@example.com"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
