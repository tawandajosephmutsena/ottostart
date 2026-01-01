import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
    Share2, 
    Copy, 
    Mail, 
    MessageSquare, 
    Clock, 
    Eye, 
    Lock,
    Globe,
    Calendar,
    User,
    CheckCircle2,
    ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewLink {
    id: string;
    url: string;
    token: string;
    expires_at: string;
    password?: string;
    is_active: boolean;
    view_count: number;
    created_at: string;
}

interface PreviewShareProps {
    contentType: string;
    contentId: number;
    contentTitle: string;
    onLinkCreated?: (link: PreviewLink) => void;
}

export default function PreviewShare({
    contentType,
    contentId,
    contentTitle,
    onLinkCreated
}: PreviewShareProps) {
    const [links, setLinks] = useState<PreviewLink[]>([]);
    const [loading, setLoading] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newLinkSettings, setNewLinkSettings] = useState({
        expires_in: '7', // days
        password: '',
        require_password: false,
        message: '',
    });
    const [copiedLink, setCopiedLink] = useState<string | null>(null);

    useEffect(() => {
        fetchPreviewLinks();
    }, [contentType, contentId]);

    const fetchPreviewLinks = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/admin/preview-links/${contentType}/${contentId}`);
            const data = await response.json();
            setLinks(data.links || []);
        } catch (error) {
            console.error('Failed to fetch preview links:', error);
        } finally {
            setLoading(false);
        }
    };

    const createPreviewLink = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/admin/preview-links/${contentType}/${contentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(newLinkSettings),
            });

            if (response.ok) {
                const data = await response.json();
                const newLink = data.link;
                setLinks([newLink, ...links]);
                setCreateDialogOpen(false);
                setNewLinkSettings({
                    expires_in: '7',
                    password: '',
                    require_password: false,
                    message: '',
                });
                
                if (onLinkCreated) {
                    onLinkCreated(newLink);
                }

                // Auto-copy the new link
                copyToClipboard(newLink.url);
            }
        } catch (error) {
            console.error('Failed to create preview link:', error);
        } finally {
            setLoading(false);
        }
    };

    const revokeLink = async (linkId: string) => {
        try {
            const response = await fetch(`/admin/preview-links/${linkId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setLinks(links.filter(link => link.id !== linkId));
            }
        } catch (error) {
            console.error('Failed to revoke link:', error);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedLink(text);
            setTimeout(() => setCopiedLink(null), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    const shareViaEmail = (link: PreviewLink) => {
        const subject = encodeURIComponent(`Preview: ${contentTitle}`);
        const body = encodeURIComponent(
            `Hi,\n\nI'd like to share a preview of "${contentTitle}" with you.\n\nPreview link: ${link.url}\n\n${newLinkSettings.message ? `Message: ${newLinkSettings.message}\n\n` : ''}This link will expire on ${new Date(link.expires_at).toLocaleDateString()}.\n\nBest regards`
        );
        window.open(`mailto:?subject=${subject}&body=${body}`);
    };

    const getExpiryStatus = (expiresAt: string) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const hoursLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));

        if (hoursLeft <= 0) {
            return { status: 'expired', text: 'Expired', color: 'text-red-500' };
        } else if (hoursLeft <= 24) {
            return { status: 'expiring', text: `${hoursLeft}h left`, color: 'text-orange-500' };
        } else {
            const daysLeft = Math.ceil(hoursLeft / 24);
            return { status: 'active', text: `${daysLeft}d left`, color: 'text-green-500' };
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Preview Sharing
                    </CardTitle>
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2">
                                <Share2 className="h-4 w-4" />
                                Create Link
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Preview Link</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="expires-in">Expires In</Label>
                                    <select
                                        id="expires-in"
                                        value={newLinkSettings.expires_in}
                                        onChange={(e) => setNewLinkSettings({ ...newLinkSettings, expires_in: e.target.value })}
                                        className="w-full mt-1 px-3 py-2 border rounded-md"
                                    >
                                        <option value="1">1 day</option>
                                        <option value="3">3 days</option>
                                        <option value="7">1 week</option>
                                        <option value="14">2 weeks</option>
                                        <option value="30">1 month</option>
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="require-password"
                                        checked={newLinkSettings.require_password}
                                        onCheckedChange={(checked) => 
                                            setNewLinkSettings({ ...newLinkSettings, require_password: checked })
                                        }
                                    />
                                    <Label htmlFor="require-password">Require password</Label>
                                </div>

                                {newLinkSettings.require_password && (
                                    <div>
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={newLinkSettings.password}
                                            onChange={(e) => setNewLinkSettings({ ...newLinkSettings, password: e.target.value })}
                                            placeholder="Enter password"
                                        />
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="message">Message (Optional)</Label>
                                    <Textarea
                                        id="message"
                                        value={newLinkSettings.message}
                                        onChange={(e) => setNewLinkSettings({ ...newLinkSettings, message: e.target.value })}
                                        placeholder="Add a message for recipients..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={createPreviewLink} disabled={loading}>
                                        Create Link
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {loading && links.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agency-accent"></div>
                    </div>
                ) : links.length > 0 ? (
                    <div className="space-y-4">
                        {links.map((link) => {
                            const expiry = getExpiryStatus(link.expires_at);
                            return (
                                <div key={link.id} className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                {link.password ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                                                <Badge variant="outline" className={expiry.color}>
                                                    {expiry.text}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => copyToClipboard(link.url)}
                                                className="h-6 w-6"
                                            >
                                                {copiedLink === link.url ? (
                                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                ) : (
                                                    <Copy className="h-3 w-3" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => shareViaEmail(link)}
                                                className="h-6 w-6"
                                            >
                                                <Mail className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => window.open(link.url, '_blank')}
                                                className="h-6 w-6"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => revokeLink(link.id)}
                                                className="h-6 w-6 text-destructive hover:text-destructive"
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="bg-muted/50 p-2 rounded text-sm font-mono break-all mb-3">
                                        {link.url}
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            {link.view_count} views
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Created {new Date(link.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Expires {new Date(link.expires_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <Share2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No preview links created yet</p>
                        <p className="text-sm">Create a link to share this content for review</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}