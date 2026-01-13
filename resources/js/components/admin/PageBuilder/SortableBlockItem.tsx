import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Block } from '@/pages/admin/pages/Edit';
import { 
    GripVertical, 
    Eye, 
    EyeOff, 
    Trash, 
    Copy, 
    ChevronRight,
    Layout,
    Type,
    ImageIcon,
    Video,
    List,
    Plus,
    BookOpen,
    AlertCircle,
    PhoneCall,
    HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SortableBlockItemProps {
    block: Block;
    index: number;
    isActive: boolean;
    onSelect: () => void;
    onRemove: () => void;
    onDuplicate: () => void;
    onToggle: () => void;
}

const getBlockIcon = (type: string) => {
    switch (type) {
        case 'hero':
        case 'animated_shader_hero':
        case 'cinematic_hero':
        case 'video_background_hero':
            return <Layout className="h-4 w-4" />;
        case 'text':
        case 'cta':
        case 'cover_demo':
            return <Type className="h-4 w-4" />;
        case 'image':
        case 'logo_cloud':
            return <ImageIcon className="h-4 w-4" />;
        case 'video':
            return <Video className="h-4 w-4" />;
        case 'stats':
        case 'services':
        case 'portfolio':
        case 'insights':
        case 'testimonials':
        case 'apple_cards_carousel':
        case 'features':
            return <List className="h-4 w-4" />;
        case 'story':
        case 'process':
            return <BookOpen className="h-4 w-4" />;
        case 'manifesto':
            return <AlertCircle className="h-4 w-4" />;
        case 'form':
        case 'contact_info':
            return <PhoneCall className="h-4 w-4" />;
        case 'faq':
            return <HelpCircle className="h-4 w-4" />;
        default:
            return <Plus className="h-4 w-4" />;
    }
};

export default function SortableBlockItem({
    block,
    index,
    isActive,
    onSelect,
    onRemove,
    onDuplicate,
    onToggle
}: SortableBlockItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 50 : 0
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className={cn(
                "group relative bg-card border rounded-lg transition-all duration-200 overflow-hidden",
                isActive ? "border-agency-accent ring-1 ring-agency-accent shadow-md" : "hover:border-agency-accent/50",
                !block.is_enabled && "opacity-60 bg-muted/40"
            )}
        >
            <div className="flex items-center h-12">
                {/* Drag Handle */}
                <div 
                    {...attributes} 
                    {...listeners}
                    className="flex items-center px-3 h-full cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                >
                    <GripVertical className="h-4 w-4" />
                </div>

                {/* Content Info */}
                <button 
                    onClick={onSelect}
                    className="flex-1 flex items-center gap-3 h-full px-2 text-left bg-transparent"
                >
                    <div className={cn(
                        "flex items-center justify-center h-7 w-7 rounded-md",
                        isActive ? "bg-agency-accent text-white" : "bg-muted text-muted-foreground"
                    )}>
                        {getBlockIcon(block.type)}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 leading-none mb-1">
                            {block.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-semibold truncate leading-none">
                            {index + 1}. {block.content?.title || block.content?.headline?.line1 || 'Untitled section'}
                        </span>
                    </div>
                </button>

                {/* Actions */}
                <div className="flex items-center px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 hover:text-agency-accent"
                        onClick={(e) => { e.stopPropagation(); onToggle(); }}
                        title={block.is_enabled ? 'Hide' : 'Show'}
                    >
                        {block.is_enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 hover:text-agency-accent"
                        onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                        title="Duplicate"
                    >
                        <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        title="Delete"
                    >
                        <Trash className="h-3.5 w-3.5" />
                    </Button>
                    <div className="w-1 h-3 bg-muted mx-1" />
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 hover:text-agency-accent"
                        onClick={onSelect}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
