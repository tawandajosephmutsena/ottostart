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
    const blocks = page.content?.blocks || [];

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
