import React from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
    Plus, 
    Layout, 
    Type, 
    ImageIcon, 
    Video, 
    BookOpen, 
    PhoneCall, 
    HelpCircle,
    Star,
    Layers,
    Activity,
    Users
} from 'lucide-react';
import { BlockType } from '@/pages/admin/pages/Edit';


interface AddBlockMenuProps {
    onAddBlock: (type: BlockType) => void;
}

const CATEGORIES = [
    {
        name: 'Heroes',
        icon: <Layout className="h-4 w-4" />,
        blocks: [
            { type: 'hero', label: 'Classic Hero', icon: <Layout className="h-5 w-5" />, desc: 'Standard headline with image' },
            { type: 'cover_demo', label: 'Cover Hero', icon: <Star className="h-5 w-5" />, desc: 'Animated text with light beams' },
            { type: 'animated_shader_hero', label: 'Shader Hero', icon: <Activity className="h-5 w-5" />, desc: 'Modern animated background' },
            { type: 'cinematic_hero', label: 'Cinematic', icon: <Video className="h-5 w-5" />, desc: 'Fullscreen immersive story' },
            { type: 'video_background_hero', label: 'Video Hero', icon: <Video className="h-5 w-5" />, desc: 'Hero with background video' },
        ]
    },
    {
        name: 'Content',
        icon: <Type className="h-4 w-4" />,
        blocks: [
            { type: 'text', label: 'Text Block', icon: <Type className="h-5 w-5" />, desc: 'Rich text and columns' },
            { type: 'image', label: 'Image', icon: <ImageIcon className="h-5 w-5" />, desc: 'Single large image' },
            { type: 'video', label: 'Video', icon: <Video className="h-5 w-5" />, desc: 'Embedded video player' },
            { type: 'stats', label: 'Statistics', icon: <Activity className="h-5 w-5" />, desc: 'Animated counter grid' },
            { type: 'features', label: 'Features', icon: <Layers className="h-5 w-5" />, desc: 'Feature grid with icons' },
        ]
    },
    {
        name: 'Showcase',
        icon: <Star className="h-4 w-4" />,
        blocks: [
            { type: 'services', label: 'Services', icon: <Layers className="h-5 w-5" />, desc: 'Service listing grid' },
            { type: 'portfolio', label: 'Portfolio', icon: <Layout className="h-5 w-5" />, desc: 'Recent work showcase' },
            { type: 'insights', label: 'Insights', icon: <BookOpen className="h-5 w-5" />, desc: 'Latest blog posts' },
            { type: 'testimonials', label: 'Reviews', icon: <Users className="h-5 w-5" />, desc: 'Client testimonials' },
            { type: 'logo_cloud', label: 'Logos', icon: <Layout className="h-5 w-5" />, desc: 'Client logo strip' },
            { type: 'apple_cards_carousel', label: 'Cards Carousel', icon: <Layers className="h-5 w-5" />, desc: 'Apple-style slider' },
        ]
    },
    {
        name: 'About & Interaction',
        icon: <PhoneCall className="h-4 w-4" />,
        blocks: [
            { type: 'story', label: 'Story', icon: <BookOpen className="h-5 w-5" />, desc: 'Brand narrative section' },
            { type: 'manifesto', label: 'Manifesto', icon: <HelpCircle className="h-5 w-5" />, desc: 'Vision and mission' },
            { type: 'process', label: 'Process', icon: <Activity className="h-5 w-5" />, desc: 'Step-by-step workflow' },
            { type: 'form', label: 'Custom Form', icon: <Plus className="h-5 w-5" />, desc: 'Multi-step contact form' },
            { type: 'contact_info', label: 'Contact Details', icon: <PhoneCall className="h-5 w-5" />, desc: 'Office and maps' },
            { type: 'faq', label: 'FAQ', icon: <HelpCircle className="h-5 w-5" />, desc: 'Accordion questions' },
            { type: 'cta', label: 'Call to Action', icon: <Plus className="h-5 w-5" />, desc: 'Direct conversion box' },
        ]
    }
];

export default function AddBlockMenu({ onAddBlock }: AddBlockMenuProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-agency-accent text-white hover:bg-agency-accent/90 shadow-lg gap-2">
                    <Plus className="h-4 w-4" /> Add Section
                </Button>
            </DialogTrigger>
            <DialogContent className="!max-w-6xl max-h-[85vh] p-0 gap-0 overflow-hidden rounded-2xl border-none flex flex-col">
                <DialogHeader className="p-8 pb-4 bg-muted/30 shrink-0">
                    <DialogTitle className="text-3xl font-black uppercase tracking-tight">Add New Section</DialogTitle>
                    <DialogDescription>
                        Choose a section type to add to your page. You can customize the content later.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="space-y-12 pb-8">
                        {CATEGORIES.map((category) => (
                            <div key={category.name} className="space-y-4">
                                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-b pb-2">
                                    {category.icon} {category.name}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {category.blocks.map((block) => (
                                        <button
                                            key={block.type}
                                            onClick={() => {
                                                onAddBlock(block.type as BlockType);
                                                setOpen(false);
                                            }}
                                            className="group flex items-start gap-4 p-4 rounded-xl border bg-card hover:border-agency-accent hover:ring-1 hover:ring-agency-accent transition-all text-left shadow-sm hover:shadow-md"
                                        >
                                            <div className="flex items-center justify-center p-3 rounded-lg bg-muted text-muted-foreground group-hover:bg-agency-accent group-hover:text-white transition-colors">
                                                {block.icon}
                                            </div>
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <span className="text-sm font-bold truncate tracking-tight">{block.label}</span>
                                                <span className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">{block.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
