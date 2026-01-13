import React, { useState, useCallback } from 'react';
import BlockList from './BlockList';
import VisualPreview from './VisualPreview';
import { Block, BlockType } from '@/pages/admin/pages/Edit';

interface PageBuilderProps {
    blocks: Block[];
    setBlocks: (blocks: Block[] | ((prev: Block[]) => Block[])) => void;
    onUpdateBlock: (id: string, content: Record<string, any>) => void;
    onAddBlock: (type: BlockType) => void;
    onRemoveBlock: (id: string) => void;
    onDuplicateBlock: (id: string) => void;
    onToggleBlock: (id: string) => void;
    pageTitle: string;
    pageSlug: string;
}

export default function PageBuilder({
    blocks,
    setBlocks,
    onUpdateBlock,
    onAddBlock,
    onRemoveBlock,
    onDuplicateBlock,
    onToggleBlock,
    pageTitle,
    pageSlug
}: PageBuilderProps) {
    const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
    const [sidebarWidth] = useState(400);
    const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

    // Handle block selection
    const handleSelectBlock = useCallback((id: string | null) => {
        setActiveBlockId(id);
    }, []);

    return (
        <div className="flex h-[calc(100vh-10rem)] bg-background border rounded-xl overflow-hidden shadow-2xl">
            {/* Sidebar: Block List & Editor */}
            {!isPreviewFullscreen && (
                <div 
                    style={{ width: `${sidebarWidth}px` }}
                    className="flex-shrink-0 border-r bg-muted/10 flex flex-col"
                >
                    <BlockList 
                        blocks={blocks}
                        activeBlockId={activeBlockId}
                        onSelectBlock={handleSelectBlock}
                        onAddBlock={onAddBlock}
                        onRemoveBlock={onRemoveBlock}
                        onDuplicateBlock={onDuplicateBlock}
                        onToggleBlock={onToggleBlock}
                        onUpdateBlock={onUpdateBlock}
                        setBlocks={setBlocks}
                    />
                </div>
            )}

            {/* Main Preview Area */}
            <div className="flex-1 bg-muted/30 relative flex flex-col overflow-hidden">
                <VisualPreview 
                    blocks={blocks}
                    pageTitle={pageTitle}
                    pageSlug={pageSlug}
                    isFullscreen={isPreviewFullscreen}
                    onToggleFullscreen={() => setIsPreviewFullscreen(!isPreviewFullscreen)}
                />
            </div>
        </div>
    );
}
