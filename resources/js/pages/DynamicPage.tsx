import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { SeoHead } from '@/components/SeoHead';
import BlockRenderer from '@/components/Blocks/BlockRenderer';
import { Page, PageBlock } from '@/types';

interface CustomPage extends Page {
    content: {
        blocks: PageBlock[];
    };
}

export default function DynamicPage({ page }: { page: CustomPage }) {
    const [blocks, setBlocks] = React.useState<PageBlock[]>(page.content?.blocks || []);

    // Listen for preview updates from the admin builder
    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'PREVIEW_DATA_UPDATE') {
                setBlocks(event.data.blocks);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <MainLayout>
            <SeoHead 
                title={page.meta_title || page.title}
                description={page.meta_description ?? undefined}
            />
            
            <BlockRenderer blocks={blocks} />
            
            {blocks.length === 0 && (
                <div className="py-40 text-center">
                    <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
                    <p className="text-muted-foreground">This page is currently empty.</p>
                </div>
            )}
        </MainLayout>
    );
}
