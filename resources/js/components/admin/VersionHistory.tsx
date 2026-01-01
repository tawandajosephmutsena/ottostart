import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
    History, 
    Eye, 
    RotateCcw, 
    GitBranch, 
    Clock, 
    User, 
    FileText,
    CheckCircle,
    Circle,
    Calendar,
    MessageSquare,
    ArrowRight,
    Diff
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Version {
    id: number;
    version_number: number;
    author: {
        id: number;
        name: string;
        email: string;
    };
    change_summary: string;
    change_notes?: string;
    is_current: boolean;
    is_published: boolean;
    created_at: string;
    published_at?: string;
}

interface VersionHistoryProps {
    contentType: string;
    contentId: number;
    onRestore?: (versionNumber: number) => void;
    onPublish?: (versionNumber: number) => void;
    onCompare?: (version1: number, version2: number) => void;
}

export default function VersionHistory({
    contentType,
    contentId,
    onRestore,
    onPublish,
    onCompare
}: VersionHistoryProps) {
    const [versions, setVersions] = useState<Version[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedVersions, setSelectedVersions] = useState<number[]>([]);
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [versionToRestore, setVersionToRestore] = useState<number | null>(null);
    const [restoreNotes, setRestoreNotes] = useState('');

    useEffect(() => {
        fetchVersions();
    }, [contentType, contentId]);

    const fetchVersions = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/admin/content-versions/${contentType}/${contentId}`);
            const data = await response.json();
            setVersions(data.versions || []);
        } catch (error) {
            console.error('Failed to fetch versions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        if (!versionToRestore) return;

        try {
            const response = await fetch(`/admin/content-versions/${contentType}/${contentId}/restore`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    version_number: versionToRestore,
                    notes: restoreNotes,
                }),
            });

            if (response.ok) {
                if (onRestore) {
                    onRestore(versionToRestore);
                }
                fetchVersions();
                setRestoreDialogOpen(false);
                setRestoreNotes('');
                setVersionToRestore(null);
            }
        } catch (error) {
            console.error('Failed to restore version:', error);
        }
    };

    const handlePublish = async (versionNumber: number) => {
        try {
            const response = await fetch(`/admin/content-versions/${contentType}/${contentId}/publish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ version_number: versionNumber }),
            });

            if (response.ok) {
                if (onPublish) {
                    onPublish(versionNumber);
                }
                fetchVersions();
            }
        } catch (error) {
            console.error('Failed to publish version:', error);
        }
    };

    const handleVersionSelect = (versionNumber: number) => {
        if (selectedVersions.includes(versionNumber)) {
            setSelectedVersions(selectedVersions.filter(v => v !== versionNumber));
        } else if (selectedVersions.length < 2) {
            setSelectedVersions([...selectedVersions, versionNumber]);
        } else {
            setSelectedVersions([selectedVersions[1], versionNumber]);
        }
    };

    const handleCompare = () => {
        if (selectedVersions.length === 2 && onCompare) {
            onCompare(selectedVersions[0], selectedVersions[1]);
        }
    };

    const getVersionIcon = (version: Version) => {
        if (version.is_current) {
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    };

    const getVersionBadge = (version: Version) => {
        if (version.is_current && version.is_published) {
            return <Badge variant="default" className="bg-green-500">Current & Published</Badge>;
        } else if (version.is_current) {
            return <Badge variant="secondary">Current</Badge>;
        } else if (version.is_published) {
            return <Badge variant="outline">Published</Badge>;
        }
        return <Badge variant="secondary" className="opacity-60">Draft</Badge>;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Version History
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {selectedVersions.length === 2 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCompare}
                                className="gap-2"
                            >
                                <Diff className="h-4 w-4" />
                                Compare
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchVersions}
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>
                {selectedVersions.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                        {selectedVersions.length === 1 
                            ? `Version ${selectedVersions[0]} selected`
                            : `Versions ${selectedVersions.join(' and ')} selected for comparison`
                        }
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agency-accent"></div>
                        </div>
                    ) : versions.length > 0 ? (
                        <div className="space-y-4">
                            {versions.map((version, index) => (
                                <div key={version.id} className="relative">
                                    {index < versions.length - 1 && (
                                        <div className="absolute left-2 top-8 bottom-0 w-px bg-border"></div>
                                    )}
                                    
                                    <div 
                                        className={`
                                            flex items-start gap-4 p-3 rounded-lg border cursor-pointer transition-all
                                            ${selectedVersions.includes(version.version_number) 
                                                ? 'border-agency-accent bg-agency-accent/5' 
                                                : 'border-transparent hover:border-agency-accent/50 hover:bg-muted/50'
                                            }
                                        `}
                                        onClick={() => handleVersionSelect(version.version_number)}
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            {getVersionIcon(version)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium">
                                                        Version {version.version_number}
                                                    </h4>
                                                    {getVersionBadge(version)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        title="Preview version"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                    </Button>
                                                    {!version.is_current && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setVersionToRestore(version.version_number);
                                                                setRestoreDialogOpen(true);
                                                            }}
                                                            title="Restore this version"
                                                        >
                                                            <RotateCcw className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                    {!version.is_published && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handlePublish(version.version_number);
                                                            }}
                                                            title="Publish this version"
                                                        >
                                                            <GitBranch className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-sm text-muted-foreground mb-2">
                                                {version.change_summary}
                                            </p>

                                            {version.change_notes && (
                                                <div className="flex items-start gap-2 text-xs text-muted-foreground mb-2">
                                                    <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                    <p>{version.change_notes}</p>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {version.author.name}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                                                </div>
                                                {version.published_at && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Published {formatDistanceToNow(new Date(version.published_at), { addSuffix: true })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No version history available</p>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>

            {/* Restore Dialog */}
            <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Restore Version {versionToRestore}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            This will restore the content to version {versionToRestore} and create a new version. 
                            The current version will be preserved in the history.
                        </p>
                        <div>
                            <Label htmlFor="restore-notes">Restoration Notes (Optional)</Label>
                            <Textarea
                                id="restore-notes"
                                value={restoreNotes}
                                onChange={(e) => setRestoreNotes(e.target.value)}
                                placeholder="Explain why you're restoring this version..."
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleRestore}>
                                Restore Version
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}