import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
    ArrowLeft, 
    ArrowRight, 
    Plus, 
    Minus, 
    Edit,
    FileText,
    Calendar,
    User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VersionDifference {
    field: string;
    old_value: any;
    new_value: any;
    type: 'added' | 'removed' | 'modified';
}

interface VersionComparisonProps {
    contentType: string;
    contentId: number;
    version1: number;
    version2: number;
    onClose?: () => void;
}

export default function VersionComparison({
    contentType,
    contentId,
    version1,
    version2,
    onClose
}: VersionComparisonProps) {
    const [differences, setDifferences] = useState<VersionDifference[]>([]);
    const [loading, setLoading] = useState(false);
    const [version1Data, setVersion1Data] = useState<any>(null);
    const [version2Data, setVersion2Data] = useState<any>(null);

    useEffect(() => {
        fetchComparison();
    }, [contentType, contentId, version1, version2]);

    const fetchComparison = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `/admin/content-versions/${contentType}/${contentId}/compare?v1=${version1}&v2=${version2}`
            );
            const data = await response.json();
            setDifferences(data.differences || []);
            setVersion1Data(data.version1);
            setVersion2Data(data.version2);
        } catch (error) {
            console.error('Failed to fetch comparison:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderFieldValue = (value: any, field: string) => {
        if (value === null || value === undefined) {
            return <span className="text-muted-foreground italic">Empty</span>;
        }

        if (typeof value === 'boolean') {
            return <Badge variant={value ? 'default' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>;
        }

        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                return (
                    <div className="flex flex-wrap gap-1">
                        {value.map((item, index) => (
                            <Badge key={index} variant="outline">{item}</Badge>
                        ))}
                    </div>
                );
            }
            return <pre className="text-xs bg-muted p-2 rounded">{JSON.stringify(value, null, 2)}</pre>;
        }

        if (field === 'content' && typeof value === 'string') {
            // For HTML content, show a preview
            return (
                <div className="max-h-32 overflow-y-auto">
                    <div 
                        className="prose prose-sm max-w-none text-xs"
                        dangerouslySetInnerHTML={{ __html: value.substring(0, 500) + (value.length > 500 ? '...' : '') }}
                    />
                </div>
            );
        }

        return <span className="break-words">{String(value)}</span>;
    };

    const getDifferenceIcon = (type: string) => {
        switch (type) {
            case 'added':
                return <Plus className="h-4 w-4 text-green-500" />;
            case 'removed':
                return <Minus className="h-4 w-4 text-red-500" />;
            case 'modified':
                return <Edit className="h-4 w-4 text-blue-500" />;
            default:
                return <FileText className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getDifferenceColor = (type: string) => {
        switch (type) {
            case 'added':
                return 'border-green-200 bg-green-50';
            case 'removed':
                return 'border-red-200 bg-red-50';
            case 'modified':
                return 'border-blue-200 bg-blue-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const formatFieldName = (field: string) => {
        return field
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agency-accent"></div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Version Comparison
                    </CardTitle>
                    {onClose && (
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">Version {version1}</Badge>
                        {version1Data && (
                            <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {version1Data.author?.name}
                                <Calendar className="h-3 w-3 ml-2" />
                                {new Date(version1Data.created_at).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                    <ArrowRight className="h-4 w-4" />
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">Version {version2}</Badge>
                        {version2Data && (
                            <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {version2Data.author?.name}
                                <Calendar className="h-3 w-3 ml-2" />
                                {new Date(version2Data.created_at).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96">
                    {differences.length > 0 ? (
                        <div className="space-y-4">
                            {differences.map((diff, index) => (
                                <div 
                                    key={index}
                                    className={cn(
                                        "border rounded-lg p-4",
                                        getDifferenceColor(diff.type)
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        {getDifferenceIcon(diff.type)}
                                        <h4 className="font-medium">{formatFieldName(diff.field)}</h4>
                                        <Badge variant="outline" className="text-xs">
                                            {diff.type}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h5 className="text-sm font-medium mb-2 text-muted-foreground">
                                                Version {version1} {diff.type === 'added' ? '(Not present)' : ''}
                                            </h5>
                                            <div className="bg-white/50 p-3 rounded border">
                                                {diff.type === 'added' ? (
                                                    <span className="text-muted-foreground italic">Not present</span>
                                                ) : (
                                                    renderFieldValue(diff.old_value, diff.field)
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h5 className="text-sm font-medium mb-2 text-muted-foreground">
                                                Version {version2} {diff.type === 'removed' ? '(Removed)' : ''}
                                            </h5>
                                            <div className="bg-white/50 p-3 rounded border">
                                                {diff.type === 'removed' ? (
                                                    <span className="text-muted-foreground italic">Removed</span>
                                                ) : (
                                                    renderFieldValue(diff.new_value, diff.field)
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
                            <p>No differences found between these versions</p>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}