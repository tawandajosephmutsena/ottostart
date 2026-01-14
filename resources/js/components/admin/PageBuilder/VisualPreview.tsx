import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
    Monitor, 
    Tablet, 
    Smartphone, 
    Maximize2, 
    Minimize2,
    RefreshCw,
    ExternalLink
} from 'lucide-react';
import { Block } from '@/pages/admin/pages/Edit';

interface VisualPreviewProps {
    blocks: Block[];
    pageTitle: string;
    pageSlug: string;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export default function VisualPreview({
    blocks,
    pageTitle,
    pageSlug,
    isFullscreen,
    onToggleFullscreen
}: VisualPreviewProps) {
    const [device, setDevice] = useState<DeviceType>('desktop');
    const [isLoading, setIsLoading] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const refreshPreview = React.useCallback(() => {
        setIsLoading(true);
        if (iframeRef.current) {
            // Append a timestamp to bypass cache if needed
            const url = pageSlug === 'home' ? '/' : `/${pageSlug}`;
            iframeRef.current.src = `${url}?preview=true&t=${Date.now()}`;
        }
    }, [pageSlug]);

    // Initial load and manual refresh
    useEffect(() => {
        const url = pageSlug === 'home' ? '/' : `/${pageSlug}`;
        const newSrc = `${url}?preview=true&t=${Date.now()}`;
        
        if (iframeRef.current) {
            // If it's the first load, just set the src
            if (!iframeRef.current.src) {
                iframeRef.current.src = newSrc;
            } else {
                // For subsequent refreshes, if we want to show loading we have to be careful
                // For now, just set the src without triggering a direct state update in the same render cycle
                // if it's already loading. But since we initialized it to true, we're safe.
                iframeRef.current.src = newSrc;
            }
        }
    }, [pageSlug]);

    // Send data to iframe when blocks change
    useEffect(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'PREVIEW_DATA_UPDATE',
                blocks: blocks,
            }, '*');
        }
    }, [blocks]);

    const getDeviceClass = () => {
        switch (device) {
            case 'tablet': return 'max-w-[768px] mx-auto';
            case 'mobile': return 'max-w-[390px] mx-auto';
            default: return 'w-full';
        }
    };

    const getDeviceHeight = () => {
        switch (device) {
            case 'tablet': return 'h-[1024px]';
            case 'mobile': return 'h-[844px]';
            default: return 'h-full';
        }
    };

    return (
        <div className="flex flex-col h-full bg-background/50">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 border-b bg-muted/20">
                <div className="flex items-center gap-1">
                    <Button
                        variant={device === 'desktop' ? 'default' : 'outline'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDevice('desktop')}
                        title="Desktop view"
                    >
                        <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={device === 'tablet' ? 'default' : 'outline'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDevice('tablet')}
                        title="Tablet view"
                    >
                        <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={device === 'mobile' ? 'default' : 'outline'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDevice('mobile')}
                        title="Mobile view"
                    >
                        <Smartphone className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground mr-2">
                        {pageTitle}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={refreshPreview}>
                        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Open in new tab">
                        <a href={pageSlug === 'home' ? '/' : `/${pageSlug}`} target="_blank" rel="noreferrer" aria-label="Open page in new tab">
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleFullscreen}>
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-auto p-8 flex justify-center bg-dots-grid">
                <div className={cn(
                    "transition-all duration-300 ease-in-out bg-white shadow-2xl rounded-t-lg overflow-hidden border border-border/50",
                    getDeviceClass(),
                    getDeviceHeight()
                )}>
                    <iframe
                        ref={iframeRef}
                        className="w-full h-full border-none"
                        title="Page Preview"
                        onLoad={() => setIsLoading(false)}
                    />
                </div>
            </div>
        </div>
    );
}
