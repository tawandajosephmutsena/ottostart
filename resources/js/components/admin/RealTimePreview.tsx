import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Eye, 
    EyeOff, 
    Monitor, 
    Tablet, 
    Smartphone, 
    Maximize2, 
    Minimize2,
    RefreshCw,
    ExternalLink,
    Share2,
    Download,
    Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewData {
    title: string;
    slug: string;
    excerpt: string;
    content: { body: string };
    featured_image: string;
    author_id: number;
    category_id: number;
    tags: string[];
    reading_time: number;
    is_published: boolean;
    is_featured: boolean;
}

interface RealTimePreviewProps {
    data: PreviewData;
    contentType: 'insight' | 'portfolio' | 'service';
    isVisible: boolean;
    onToggle: () => void;
    className?: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export default function RealTimePreview({
    data,
    contentType,
    isVisible,
    onToggle,
    className
}: RealTimePreviewProps) {
    const [device, setDevice] = useState<DeviceType>('desktop');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const previewDataRef = useRef<PreviewData>(data);

    // Update preview data reference when data changes
    useEffect(() => {
        previewDataRef.current = data;
        setLastUpdate(new Date());
        updatePreview();
    }, [data]);

    // Generate preview URL
    useEffect(() => {
        if (data.slug) {
            const baseUrl = window.location.origin;
            let url = '';
            
            switch (contentType) {
                case 'insight':
                    url = `${baseUrl}/blog/${data.slug}`;
                    break;
                case 'portfolio':
                    url = `${baseUrl}/portfolio/${data.slug}`;
                    break;
                case 'service':
                    url = `${baseUrl}/services/${data.slug}`;
                    break;
            }
            
            setPreviewUrl(url + '?preview=true');
        }
    }, [data.slug, contentType]);

    const updatePreview = async () => {
        if (!iframeRef.current || !isVisible) return;

        setIsLoading(true);
        
        try {
            // Send preview data to the iframe
            const iframe = iframeRef.current;
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'PREVIEW_UPDATE',
                    data: previewDataRef.current,
                    timestamp: Date.now()
                }, '*');
            }
        } catch (error) {
            console.error('Failed to update preview:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshPreview = () => {
        if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
        }
    };

    const openInNewTab = () => {
        if (previewUrl) {
            window.open(previewUrl, '_blank');
        }
    };

    const sharePreview = async () => {
        if (navigator.share && previewUrl) {
            try {
                await navigator.share({
                    title: data.title,
                    text: data.excerpt,
                    url: previewUrl,
                });
            } catch (error) {
                // Fallback to clipboard
                navigator.clipboard.writeText(previewUrl);
            }
        } else if (previewUrl) {
            navigator.clipboard.writeText(previewUrl);
        }
    };

    const getDeviceClass = () => {
        switch (device) {
            case 'tablet':
                return 'max-w-3xl mx-auto';
            case 'mobile':
                return 'max-w-sm mx-auto';
            default:
                return 'w-full';
        }
    };

    const getDeviceHeight = () => {
        switch (device) {
            case 'tablet':
                return 'h-[600px]';
            case 'mobile':
                return 'h-[667px]';
            default:
                return 'h-[800px]';
        }
    };

    if (!isVisible) {
        return (
            <div className={cn("fixed bottom-4 right-4 z-50", className)}>
                <Button
                    onClick={onToggle}
                    className="bg-agency-accent text-agency-primary hover:bg-agency-accent/90 shadow-lg"
                    size="lg"
                >
                    <Eye className="h-5 w-5 mr-2" />
                    Show Preview
                </Button>
            </div>
        );
    }

    return (
        <div className={cn(
            "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
            isFullscreen && "bg-background"
        )}>
            <div className={cn(
                "h-full flex flex-col",
                !isFullscreen && "p-4"
            )}>
                <Card className={cn(
                    "flex-1 flex flex-col",
                    !isFullscreen && "max-h-[calc(100vh-2rem)]"
                )}>
                    <CardHeader className="flex-shrink-0 pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="h-5 w-5" />
                                    Live Preview
                                </CardTitle>
                                <Badge variant="outline" className="text-xs">
                                    {data.title || 'Untitled'}
                                </Badge>
                                {isLoading && (
                                    <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                    Updated {lastUpdate.toLocaleTimeString()}
                                </span>
                                <Separator orientation="vertical" className="h-6" />
                                
                                {/* Device Selection */}
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant={device === 'desktop' ? 'default' : 'ghost'}
                                        size="icon"
                                        onClick={() => setDevice('desktop')}
                                        className="h-8 w-8"
                                    >
                                        <Monitor className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={device === 'tablet' ? 'default' : 'ghost'}
                                        size="icon"
                                        onClick={() => setDevice('tablet')}
                                        className="h-8 w-8"
                                    >
                                        <Tablet className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={device === 'mobile' ? 'default' : 'ghost'}
                                        size="icon"
                                        onClick={() => setDevice('mobile')}
                                        className="h-8 w-8"
                                    >
                                        <Smartphone className="h-4 w-4" />
                                    </Button>
                                </div>

                                <Separator orientation="vertical" className="h-6" />

                                {/* Actions */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={refreshPreview}
                                    className="h-8 w-8"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={openInNewTab}
                                    className="h-8 w-8"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={sharePreview}
                                    className="h-8 w-8"
                                >
                                    <Share2 className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="h-8 w-8"
                                >
                                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onToggle}
                                    className="h-8 w-8"
                                >
                                    <EyeOff className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-hidden">
                        <div className={cn("h-full p-4", getDeviceClass())}>
                            <div className={cn(
                                "border rounded-lg overflow-hidden bg-white shadow-lg",
                                getDeviceHeight(),
                                device === 'mobile' && "border-8 border-gray-800 rounded-3xl",
                                device === 'tablet' && "border-4 border-gray-600 rounded-2xl"
                            )}>
                                {previewUrl ? (
                                    <iframe
                                        ref={iframeRef}
                                        src={previewUrl}
                                        className="w-full h-full"
                                        title="Live Preview"
                                        onLoad={() => setIsLoading(false)}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <div className="text-center">
                                            <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                            <p className="text-muted-foreground">
                                                Add a slug to enable preview
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}