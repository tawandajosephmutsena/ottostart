import React from 'react';
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import { 
    arrayMove, 
    SortableContext, 
    sortableKeyboardCoordinates, 
    verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { Block, BlockType } from '@/pages/admin/pages/Edit';
import SortableBlockItem from './SortableBlockItem';
import AddBlockMenu from './AddBlockMenu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Plus, Settings2 } from 'lucide-react';
import BlockEditor from './BlockEditor';

interface BlockListProps {
    blocks: Block[];
    activeBlockId: string | null;
    onSelectBlock: (id: string | null) => void;
    onAddBlock: (type: BlockType) => void;
    onRemoveBlock: (id: string) => void;
    onDuplicateBlock: (id: string) => void;
    onToggleBlock: (id: string) => void;
    onUpdateBlock: (id: string, content: Record<string, any>) => void;
    setBlocks: (blocks: Block[] | ((prev: Block[]) => Block[])) => void;
}

export default function BlockList({
    blocks,
    activeBlockId,
    onSelectBlock,
    onAddBlock,
    onRemoveBlock,
    onDuplicateBlock,
    onToggleBlock,
    onUpdateBlock,
    setBlocks
}: BlockListProps) {
    const activeBlock = blocks.find(b => b.id === activeBlockId);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    if (activeBlockId && activeBlock) {
        return (
            <div className="flex flex-col h-full bg-background">
                <div className="flex items-center gap-2 p-4 border-b">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => onSelectBlock(null)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Editing Block</span>
                        <h3 className="text-sm font-semibold truncate uppercase tracking-widest">{activeBlock.type.replace(/_/g, ' ')}</h3>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto">
                        <Settings2 className="h-4 w-4" />
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4">
                        <BlockEditor 
                            block={activeBlock} 
                            onUpdate={(content) => onUpdateBlock(activeBlock.id, content)} 
                        />
                    </div>
                </ScrollArea>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold tracking-tight">Blocks</h2>
                    <p className="text-xs text-muted-foreground">{blocks.length} sections active</p>
                </div>
                <AddBlockMenu onAddBlock={onAddBlock} />
            </div>

            <ScrollArea className="flex-1">
                <div className="p-3">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={blocks.map(b => b.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {blocks.map((block, index) => (
                                    <SortableBlockItem
                                        key={block.id}
                                        block={block}
                                        index={index}
                                        isActive={activeBlockId === block.id}
                                        onSelect={() => onSelectBlock(block.id)}
                                        onRemove={() => onRemoveBlock(block.id)}
                                        onDuplicate={() => onDuplicateBlock(block.id)}
                                        onToggle={() => onToggleBlock(block.id)}
                                    />
                                ))}
                                {blocks.length === 0 && (
                                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground">
                                        <Plus className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-sm font-medium">No blocks yet</p>
                                        <p className="text-[10px]">Add your first section to start building</p>
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </ScrollArea>
        </div>
    );
}
