import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash, ImageIcon, AlertCircle, Type, Image, Video, MousePointer } from 'lucide-react';
import MediaLibrary from '@/components/admin/MediaLibrary';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { MediaAsset } from '@/types';
import { Block } from '@/pages/admin/pages/Edit';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BlockEditorProps {
    block: Block;
    onUpdate: (content: Record<string, unknown>) => void;
}

// Type definitions matching frontend blocks
interface StatItem { value: string; label: string; suffix?: string; }
interface StoryItem { value: string; label: string; }
interface ManifestoItem { emoji: string; title: string; desc: string; }
interface ProcessItem { step: string; title: string; desc: string; }
interface FAQItem { q: string; a: string; }
interface ContactItem { label: string; value: string; href?: string; }
interface TestimonialItem { text: string; name: string; role: string; image?: string; }
interface LogoItem { name: string; url: string; }
interface AppleCardItem { category: string; title: string; src: string; content: string; link: string; }
interface CinematicSlide { title: string; subtitle?: string; tagline?: string; image?: string; }

interface Column {
    id: string;
    type: 'text' | 'image' | 'video' | 'button';
    content: Record<string, unknown>;
}

export default function BlockEditor({ block, onUpdate }: BlockEditorProps) {
    const updateContent = (updates: Record<string, unknown>) => {
        onUpdate({ ...block.content, ...updates });
    };

    // Render based on block type
    switch (block.type) {
        case 'hero':
            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Headline</Label>
                        <Input 
                            value={String(block.content.title || '')} 
                            onChange={(e) => updateContent({ title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Subtitle</Label>
                        <Input 
                            value={String(block.content.subtitle || '')} 
                            onChange={(e) => updateContent({ subtitle: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                            className="h-20"
                            value={String(block.content.description || '')} 
                            onChange={(e) => updateContent({ description: e.target.value })}
                        />
                    </div>
                    <div className="space-y-3">
                        <Label>Main Image</Label>
                        <div className="flex flex-col gap-3">
                            {block.content.image && (
                                <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                                    <img src={String(block.content.image)} className="w-full h-full object-cover" alt="Hero" />
                                </div>
                            )}
                            <div className="flex gap-2">
                                <MediaLibrary 
                                    onSelect={(asset: MediaAsset) => updateContent({ image: asset.url })}
                                    trigger={
                                        <Button type="button" variant="outline" size="sm" className="h-9">
                                            <ImageIcon className="h-4 w-4 mr-2" /> Change
                                        </Button>
                                    }
                                />
                                <Input 
                                    className="h-9 text-xs"
                                    value={String(block.content.image || '')} 
                                    onChange={(e) => updateContent({ image: e.target.value })}
                                    placeholder="External URL..."
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                        <Label className="text-xs font-bold uppercase tracking-wider">CTA Button</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[10px]">Button Text</Label>
                                <Input 
                                    className="h-8 text-xs"
                                    value={String(block.content.ctaText || '')} 
                                    onChange={(e) => updateContent({ ctaText: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px]">Link (URL)</Label>
                                <Input 
                                    className="h-8 text-xs"
                                    value={String(block.content.ctaHref || '')} 
                                    onChange={(e) => updateContent({ ctaHref: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 pt-4 border-t">
                        <Label>Background Marquee Text</Label>
                        <Input 
                            value={String(block.content.marqueeText || '')} 
                            onChange={(e) => updateContent({ marqueeText: e.target.value })}
                            placeholder="Scrolling background text..."
                        />
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                        <Label className="text-xs font-bold uppercase tracking-wider">Background Images (Floating Grid)</Label>
                        <p className="text-[10px] text-muted-foreground">These images appear in the collage/floating grid behind the hero content.</p>
                        <div className="space-y-3">
                            {[0, 1, 2].map((idx) => {
                                const bgImages = (block.content.backgroundImages as string[]) || [];
                                const currentImg = bgImages[idx] || '';
                                return (
                                    <div key={idx} className="p-3 border rounded-lg bg-muted/10 space-y-2">
                                        <Label className="text-[10px] text-muted-foreground">Image {idx + 1}</Label>
                                        {currentImg && (
                                            <img src={currentImg} className="w-full h-20 object-cover rounded-md" alt={`Background ${idx + 1}`} />
                                        )}
                                        <div className="flex gap-2">
                                            <MediaLibrary 
                                                onSelect={(asset: MediaAsset) => {
                                                    const newBgImages = [...bgImages];
                                                    while (newBgImages.length < 3) newBgImages.push('');
                                                    newBgImages[idx] = asset.url;
                                                    updateContent({ backgroundImages: newBgImages });
                                                }}
                                                trigger={<Button type="button" variant="outline" size="sm" className="h-8 text-xs"><ImageIcon className="h-3 w-3 mr-1" />{currentImg ? 'Change' : 'Upload'}</Button>}
                                            />
                                            <Input 
                                                className="h-8 text-xs flex-1"
                                                value={currentImg} 
                                                onChange={(e) => {
                                                    const newBgImages = [...bgImages];
                                                    while (newBgImages.length < 3) newBgImages.push('');
                                                    newBgImages[idx] = e.target.value;
                                                    updateContent({ backgroundImages: newBgImages });
                                                }}
                                                placeholder="Or paste image URL..."
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );

        case 'text': {
            const layout = String(block.content.layout || '1');
            const columns = (block.content.columns as Column[]) || [];
            
            const addColumn = (type: 'text' | 'image' | 'video' | 'button') => {
                const newCol: Column = {
                    id: 'col-' + Date.now(),
                    type,
                    content: type === 'text' ? { body: '', textSize: 'base', textAlign: 'left' } 
                           : type === 'image' ? { url: '', alt: '', caption: '' }
                           : type === 'video' ? { url: '' }
                           : { text: '', url: '', style: 'primary' }
                };
                updateContent({ columns: [...columns, newCol] });
            };

            const updateColumn = (idx: number, updates: Record<string, unknown>) => {
                const newCols = [...columns];
                newCols[idx] = { ...newCols[idx], content: { ...newCols[idx].content, ...updates } };
                updateContent({ columns: newCols });
            };

            const removeColumn = (idx: number) => {
                updateContent({ columns: columns.filter((_, i) => i !== idx) });
            };

            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Section Title (Optional)</Label>
                        <Input 
                            value={String(block.content.title || '')} 
                            onChange={(e) => updateContent({ title: e.target.value })}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Layout</Label>
                        <Select value={layout} onValueChange={(val) => updateContent({ layout: val })}>
                            <SelectTrigger className="h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Single Column</SelectItem>
                                <SelectItem value="1-1">Two Columns (50/50)</SelectItem>
                                <SelectItem value="1-1-1">Three Columns</SelectItem>
                                <SelectItem value="2-1">Two Columns (66/33)</SelectItem>
                                <SelectItem value="1-2">Two Columns (33/66)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider">Content Columns</Label>
                            <div className="flex gap-1">
                                <Button variant="outline" size="sm" onClick={() => addColumn('text')} title="Add Text">
                                    <Type className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => addColumn('image')} title="Add Image">
                                    <Image className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => addColumn('video')} title="Add Video">
                                    <Video className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => addColumn('button')} title="Add Button">
                                    <MousePointer className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {columns.map((col, i) => (
                                <div key={col.id || i} className="group relative p-4 border rounded-lg bg-muted/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            {col.type === 'text' ? 'Rich Text' : col.type === 'image' ? 'Image' : col.type === 'video' ? 'Video' : 'Button'}
                                        </span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeColumn(i)} title="Remove">
                                            <Trash className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    
                                    {col.type === 'text' && (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <Select 
                                                    value={String((col.content as Record<string, unknown>).textSize || 'base')} 
                                                    onValueChange={(val) => updateColumn(i, { textSize: val })}
                                                >
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="sm">Small</SelectItem>
                                                        <SelectItem value="base">Normal</SelectItem>
                                                        <SelectItem value="lg">Large</SelectItem>
                                                        <SelectItem value="xl">Extra Large</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Select 
                                                    value={String((col.content as Record<string, unknown>).textAlign || 'left')} 
                                                    onValueChange={(val) => updateColumn(i, { textAlign: val })}
                                                >
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="left">Left</SelectItem>
                                                        <SelectItem value="center">Center</SelectItem>
                                                        <SelectItem value="right">Right</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="min-h-[200px] border rounded-lg bg-background overflow-hidden">
                                                <RichTextEditor 
                                                    content={String((col.content as Record<string, unknown>).body || '')} 
                                                    onChange={(val) => updateColumn(i, { body: val })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    
                                    {col.type === 'image' && (
                                        <div className="space-y-3">
                                            {(col.content as Record<string, unknown>).url && (
                                                <img src={String((col.content as Record<string, unknown>).url)} className="w-full h-32 object-cover rounded" alt="" />
                                            )}
                                            <MediaLibrary 
                                                onSelect={(asset: MediaAsset) => updateColumn(i, { url: asset.url })}
                                                trigger={<Button type="button" variant="outline" size="sm" className="w-full"><ImageIcon className="h-4 w-4 mr-2" /> Select Image</Button>}
                                            />
                                            <Input className="h-8 text-xs" value={String((col.content as Record<string, unknown>).alt || '')} onChange={(e) => updateColumn(i, { alt: e.target.value })} placeholder="Alt text" />
                                            <Input className="h-8 text-xs" value={String((col.content as Record<string, unknown>).caption || '')} onChange={(e) => updateColumn(i, { caption: e.target.value })} placeholder="Caption (optional)" />
                                        </div>
                                    )}
                                    
                                    {col.type === 'video' && (
                                        <Input className="h-8 text-xs" value={String((col.content as Record<string, unknown>).url || '')} onChange={(e) => updateColumn(i, { url: e.target.value })} placeholder="Video URL..." />
                                    )}
                                    
                                    {col.type === 'button' && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input className="h-8 text-xs" value={String((col.content as Record<string, unknown>).text || '')} onChange={(e) => updateColumn(i, { text: e.target.value })} placeholder="Button Text" />
                                            <Input className="h-8 text-xs" value={String((col.content as Record<string, unknown>).url || '')} onChange={(e) => updateColumn(i, { url: e.target.value })} placeholder="URL" />
                                            <Select value={String((col.content as Record<string, unknown>).style || 'primary')} onValueChange={(val) => updateColumn(i, { style: val })}>
                                                <SelectTrigger className="h-8 text-xs col-span-2"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="primary">Primary</SelectItem>
                                                    <SelectItem value="secondary">Secondary</SelectItem>
                                                    <SelectItem value="outline">Outline</SelectItem>
                                                    <SelectItem value="ghost">Ghost</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {columns.length === 0 && (
                                <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                                    <p className="text-sm">No content yet. Add columns above.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Legacy body field for backward compatibility */}
                    <div className="space-y-2 pt-4 border-t">
                        <Label className="text-[10px] text-muted-foreground">Legacy Body (fallback)</Label>
                        <Textarea 
                            className="h-20 text-xs"
                            value={String(block.content.body || '')} 
                            onChange={(e) => updateContent({ body: e.target.value })}
                            placeholder="Used if no columns exist..."
                        />
                    </div>
                </div>
            );
        }

        case 'story': {
            const items = (block.content.items as StoryItem[]) || [];
            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Subtitle (Label)</Label>
                        <Input 
                            value={String(block.content.subtitle || '')} 
                            onChange={(e) => updateContent({ subtitle: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input 
                            value={String(block.content.title || '')} 
                            onChange={(e) => updateContent({ title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Body Text</Label>
                        <Textarea 
                            className="h-32"
                            value={String(block.content.body || '')} 
                            onChange={(e) => updateContent({ body: e.target.value })}
                        />
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider">Stats</Label>
                            <Button variant="outline" size="sm" onClick={() => updateContent({ items: [...items, { value: '0', label: 'New Stat' }] })}>
                                <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {items.map((item, i) => (
                                <div key={i} className="group relative grid grid-cols-2 gap-2 p-3 border rounded-lg bg-muted/10">
                                    <button type="button" title="Remove" className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100" onClick={() => updateContent({ items: items.filter((_, idx) => idx !== i) })}>
                                        <Trash className="h-3 w-3" />
                                    </button>
                                    <Input className="h-8 text-xs" value={item.value} onChange={(e) => { const n = [...items]; n[i] = { ...item, value: e.target.value }; updateContent({ items: n }); }} placeholder="Value (e.g., 5+)" />
                                    <Input className="h-8 text-xs" value={item.label} onChange={(e) => { const n = [...items]; n[i] = { ...item, label: e.target.value }; updateContent({ items: n }); }} placeholder="Label" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        case 'manifesto': {
            const items = (block.content.items as ManifestoItem[]) || [];
            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Subtitle (Label)</Label>
                        <Input value={String(block.content.subtitle || '')} onChange={(e) => updateContent({ subtitle: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={String(block.content.title || '')} onChange={(e) => updateContent({ title: e.target.value })} />
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider">Pillars</Label>
                            <Button variant="outline" size="sm" onClick={() => updateContent({ items: [...items, { emoji: '🎯', title: 'New Pillar', desc: '' }] })}>
                                <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {items.map((item, i) => (
                                <div key={i} className="group relative p-3 border rounded-lg bg-muted/10 space-y-2">
                                    <button type="button" title="Remove" className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100" onClick={() => updateContent({ items: items.filter((_, idx) => idx !== i) })}>
                                        <Trash className="h-3 w-3" />
                                    </button>
                                    <div className="grid grid-cols-[60px_1fr] gap-2">
                                        <Input className="h-8 text-center text-xl" value={item.emoji} onChange={(e) => { const n = [...items]; n[i] = { ...item, emoji: e.target.value }; updateContent({ items: n }); }} placeholder="🎯" />
                                        <Input className="h-8 text-xs" value={item.title} onChange={(e) => { const n = [...items]; n[i] = { ...item, title: e.target.value }; updateContent({ items: n }); }} placeholder="Title" />
                                    </div>
                                    <Textarea className="h-16 text-xs" value={item.desc} onChange={(e) => { const n = [...items]; n[i] = { ...item, desc: e.target.value }; updateContent({ items: n }); }} placeholder="Description..." />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        case 'process': {
            const items = (block.content.items as ProcessItem[]) || [];
            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Subtitle (Label)</Label>
                        <Input value={String(block.content.subtitle || '')} onChange={(e) => updateContent({ subtitle: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={String(block.content.title || '')} onChange={(e) => updateContent({ title: e.target.value })} />
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider">Steps</Label>
                            <Button variant="outline" size="sm" onClick={() => updateContent({ items: [...items, { step: String(items.length + 1).padStart(2, '0'), title: 'New Step', desc: '' }] })}>
                                <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {items.map((item, i) => (
                                <div key={i} className="group relative p-3 border rounded-lg bg-muted/10 space-y-2">
                                    <button type="button" title="Remove" className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100" onClick={() => updateContent({ items: items.filter((_, idx) => idx !== i) })}>
                                        <Trash className="h-3 w-3" />
                                    </button>
                                    <div className="grid grid-cols-[60px_1fr] gap-2">
                                        <Input className="h-8 text-xs font-mono" value={item.step} onChange={(e) => { const n = [...items]; n[i] = { ...item, step: e.target.value }; updateContent({ items: n }); }} placeholder="01" />
                                        <Input className="h-8 text-xs" value={item.title} onChange={(e) => { const n = [...items]; n[i] = { ...item, title: e.target.value }; updateContent({ items: n }); }} placeholder="Step Title" />
                                    </div>
                                    <Textarea className="h-16 text-xs" value={item.desc} onChange={(e) => { const n = [...items]; n[i] = { ...item, desc: e.target.value }; updateContent({ items: n }); }} placeholder="Description..." />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        case 'faq': {
            const items = (block.content.items as FAQItem[]) || [];
            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Subtitle (Label)</Label>
                        <Input value={String(block.content.subtitle || '')} onChange={(e) => updateContent({ subtitle: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={String(block.content.title || '')} onChange={(e) => updateContent({ title: e.target.value })} />
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider">Questions</Label>
                            <Button variant="outline" size="sm" onClick={() => updateContent({ items: [...items, { q: '', a: '' }] })}>
                                <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {items.map((item, i) => (
                                <div key={i} className="group relative p-3 border rounded-lg bg-muted/10 space-y-2">
                                    <button type="button" title="Remove" className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100" onClick={() => updateContent({ items: items.filter((_, idx) => idx !== i) })}>
                                        <Trash className="h-3 w-3" />
                                    </button>
                                    <Input className="h-8 text-xs font-semibold" value={item.q} onChange={(e) => { const n = [...items]; n[i] = { ...item, q: e.target.value }; updateContent({ items: n }); }} placeholder="Question" />
                                    <Textarea className="h-20 text-xs" value={item.a} onChange={(e) => { const n = [...items]; n[i] = { ...item, a: e.target.value }; updateContent({ items: n }); }} placeholder="Answer..." />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        case 'contact_info': {
            const items = (block.content.items as ContactItem[]) || [];
            const officeHours = (block.content.office_hours as string[]) || [];
            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Subtitle (Label)</Label>
                        <Input value={String(block.content.subtitle || '')} onChange={(e) => updateContent({ subtitle: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={String(block.content.title || '')} onChange={(e) => updateContent({ title: e.target.value })} />
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider">Contact Items</Label>
                            <Button variant="outline" size="sm" onClick={() => updateContent({ items: [...items, { label: 'Label', value: '', href: '' }] })}>
                                <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {items.map((item, i) => (
                                <div key={i} className="group relative p-3 border rounded-lg bg-muted/10 space-y-2">
                                    <button type="button" title="Remove" className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100" onClick={() => updateContent({ items: items.filter((_, idx) => idx !== i) })}>
                                        <Trash className="h-3 w-3" />
                                    </button>
                                    <Input className="h-8 text-xs" value={item.label} onChange={(e) => { const n = [...items]; n[i] = { ...item, label: e.target.value }; updateContent({ items: n }); }} placeholder="Label (e.g., Email)" />
                                    <Input className="h-8 text-xs" value={item.value} onChange={(e) => { const n = [...items]; n[i] = { ...item, value: e.target.value }; updateContent({ items: n }); }} placeholder="Value (e.g., hello@example.com)" />
                                    <Input className="h-8 text-xs" value={item.href || ''} onChange={(e) => { const n = [...items]; n[i] = { ...item, href: e.target.value }; updateContent({ items: n }); }} placeholder="Link (optional, e.g., mailto:...)" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider">Office Hours</Label>
                            <Button variant="outline" size="sm" onClick={() => updateContent({ office_hours: [...officeHours, 'New Hours'] })}>
                                <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {officeHours.map((hour, i) => (
                                <div key={i} className="group relative flex gap-2">
                                    <Input className="h-8 text-xs flex-1" value={hour} onChange={(e) => { const n = [...officeHours]; n[i] = e.target.value; updateContent({ office_hours: n }); }} />
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateContent({ office_hours: officeHours.filter((_, idx) => idx !== i) })} title="Remove">
                                        <Trash className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        case 'testimonials': {
            const items = (block.content.items as TestimonialItem[]) || [];
            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Subtitle</Label>
                        <Input value={String(block.content.subtitle || '')} onChange={(e) => updateContent({ subtitle: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={String(block.content.title || '')} onChange={(e) => updateContent({ title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea className="h-16" value={String(block.content.description || '')} onChange={(e) => updateContent({ description: e.target.value })} />
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider">Testimonials</Label>
                            <Button variant="outline" size="sm" onClick={() => updateContent({ items: [...items, { text: '', name: '', role: '', image: '' }] })}>
                                <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {items.map((item, i) => (
                                <div key={i} className="group relative p-3 border rounded-lg bg-muted/10 space-y-2">
                                    <button type="button" title="Remove" className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100" onClick={() => updateContent({ items: items.filter((_, idx) => idx !== i) })}>
                                        <Trash className="h-3 w-3" />
                                    </button>
                                    <Textarea className="h-16 text-xs" value={item.text} onChange={(e) => { const n = [...items]; n[i] = { ...item, text: e.target.value }; updateContent({ items: n }); }} placeholder="Quote..." />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input className="h-8 text-xs" value={item.name} onChange={(e) => { const n = [...items]; n[i] = { ...item, name: e.target.value }; updateContent({ items: n }); }} placeholder="Name" />
                                        <Input className="h-8 text-xs" value={item.role} onChange={(e) => { const n = [...items]; n[i] = { ...item, role: e.target.value }; updateContent({ items: n }); }} placeholder="Role" />
                                    </div>
                                    <Input className="h-8 text-xs" value={item.image || ''} onChange={(e) => { const n = [...items]; n[i] = { ...item, image: e.target.value }; updateContent({ items: n }); }} placeholder="Avatar URL (optional)" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        case 'services':
        case 'portfolio':
        case 'insights':
            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Section Title</Label>
                        <Input value={String(block.content.title || '')} onChange={(e) => updateContent({ title: e.target.value })} />
                    </div>
                    {block.type === 'services' && (
                        <div className="space-y-2">
                            <Label>Subtitle</Label>
                            <Textarea className="h-16" value={String(block.content.subtitle || '')} onChange={(e) => updateContent({ subtitle: e.target.value })} />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label>Number to Display</Label>
                        <Input type="number" min="1" max="12" className="h-9 w-24" value={Number(block.content.limit) || 3} onChange={(e) => updateContent({ limit: parseInt(e.target.value) || 3 })} />
                        <p className="text-[10px] text-muted-foreground">
                            {block.type === 'services' ? 'Services' : block.type === 'portfolio' ? 'Projects' : 'Articles'} are fetched dynamically.
                        </p>
                    </div>
                    {block.type === 'services' && (
                        <div className="flex items-center gap-3 pt-4 border-t">
                            <input type="checkbox" id="useStackedCards" checked={Boolean(block.content.useStackedCards)} onChange={(e) => updateContent({ useStackedCards: e.target.checked })} />
                            <Label htmlFor="useStackedCards" className="text-sm cursor-pointer">Use stacked card layout</Label>
                        </div>
                    )}
                </div>
            );

        case 'cta':
            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Headline</Label>
                        <Input value={String(block.content.title || '')} onChange={(e) => updateContent({ title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Subtitle</Label>
                        <Textarea className="h-20" value={String(block.content.subtitle || '')} onChange={(e) => updateContent({ subtitle: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                        <div className="space-y-1">
                            <Label className="text-[10px]">Button Text</Label>
                            <Input className="h-8 text-xs" value={String(block.content.ctaText || '')} onChange={(e) => updateContent({ ctaText: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px]">Button Link</Label>
                            <Input className="h-8 text-xs" value={String(block.content.ctaHref || '')} onChange={(e) => updateContent({ ctaHref: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Contact Email (Optional Overlay)</Label>
                        <Input className="h-9" value={String(block.content.email || '')} onChange={(e) => updateContent({ email: e.target.value })} placeholder="hello@example.com" />
                    </div>
                </div>
            );

        case 'stats': {
            const stats = (block.content.items as StatItem[]) || [];
            return (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider">Stat Items</Label>
                            <Button variant="outline" size="sm" onClick={() => updateContent({ items: [...stats, { value: '0', label: 'New Stat', suffix: '' }] })}>
                                <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {stats.map((stat, i) => (
                                <div key={i} className="group relative p-3 border rounded-lg bg-muted/10">
                                    <button type="button" title="Remove" className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => updateContent({ items: stats.filter((_, idx) => idx !== i) })}>
                                        <Trash className="h-3 w-3" />
                                    </button>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <Input className="h-8 text-xs" value={stat.value} onChange={(e) => { const n = [...stats]; n[i] = { ...stat, value: e.target.value }; updateContent({ items: n }); }} placeholder="Value" />
                                        <Input className="h-8 text-xs" value={stat.suffix || ''} onChange={(e) => { const n = [...stats]; n[i] = { ...stat, suffix: e.target.value }; updateContent({ items: n }); }} placeholder="Suffix (+, %)" />
                                    </div>
                                    <Input className="h-8 text-xs" value={stat.label} onChange={(e) => { const n = [...stats]; n[i] = { ...stat, label: e.target.value }; updateContent({ items: n }); }} placeholder="Label" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        case 'animated_shader_hero': {
            const headline = (block.content.headline as { line1?: string; line2?: string }) || {};
            const buttons = (block.content.buttons as { primary?: { text?: string; url?: string }; secondary?: { text?: string; url?: string } }) || {};
            return (
                <div className="space-y-6">
                    <div className="p-4 border rounded-xl bg-muted/20 space-y-4">
                        <Label className="text-xs font-bold uppercase tracking-widest">Headline Lines</Label>
                        <div className="space-y-3">
                            <Input value={headline.line1 || ''} onChange={(e) => updateContent({ headline: { ...headline, line1: e.target.value } })} placeholder="Line 1 (Top)" />
                            <Input value={headline.line2 || ''} onChange={(e) => updateContent({ headline: { ...headline, line2: e.target.value } })} placeholder="Line 2 (Gradient)" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Subtitle</Label>
                        <Textarea className="h-24" value={String(block.content.subtitle || '')} onChange={(e) => updateContent({ subtitle: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase">Primary Button</Label>
                            <Input className="h-8 text-xs" value={buttons.primary?.text || ''} onChange={(e) => updateContent({ buttons: { ...buttons, primary: { ...buttons.primary, text: e.target.value } } })} placeholder="Text" />
                            <Input className="h-8 text-xs" value={buttons.primary?.url || ''} onChange={(e) => updateContent({ buttons: { ...buttons, primary: { ...buttons.primary, url: e.target.value } } })} placeholder="URL" />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Secondary Button</Label>
                            <Input className="h-8 text-xs" value={buttons.secondary?.text || ''} onChange={(e) => updateContent({ buttons: { ...buttons, secondary: { ...buttons.secondary, text: e.target.value } } })} placeholder="Text" />
                            <Input className="h-8 text-xs" value={buttons.secondary?.url || ''} onChange={(e) => updateContent({ buttons: { ...buttons, secondary: { ...buttons.secondary, url: e.target.value } } })} placeholder="URL" />
                        </div>
                    </div>
                </div>
            );
        }

        case 'cinematic_hero': {
            const slides = (block.content.slides as CinematicSlide[]) || [];
            return (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider">Slides</Label>
                            <Button variant="outline" size="sm" onClick={() => updateContent({ slides: [...slides, { title: 'New Slide', subtitle: '', tagline: '', image: '' }] })}>
                                <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {slides.map((slide, i) => (
                                <div key={i} className="group relative p-4 border rounded-lg bg-muted/10 space-y-3">
                                    <button type="button" title="Remove" className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100" onClick={() => updateContent({ slides: slides.filter((_, idx) => idx !== i) })}>
                                        <Trash className="h-3 w-3" />
                                    </button>
                                    <Input className="h-8 text-xs font-semibold" value={slide.title} onChange={(e) => { const n = [...slides]; n[i] = { ...slide, title: e.target.value }; updateContent({ slides: n }); }} placeholder="Title" />
                                    <Textarea className="h-16 text-xs" value={slide.subtitle || ''} onChange={(e) => { const n = [...slides]; n[i] = { ...slide, subtitle: e.target.value }; updateContent({ slides: n }); }} placeholder="Subtitle..." />
                                    <Input className="h-8 text-xs" value={slide.tagline || ''} onChange={(e) => { const n = [...slides]; n[i] = { ...slide, tagline: e.target.value }; updateContent({ slides: n }); }} placeholder="#tagline" />
                                    <MediaLibrary 
                                        onSelect={(asset: MediaAsset) => { const n = [...slides]; n[i] = { ...slide, image: asset.url }; updateContent({ slides: n }); }}
                                        trigger={<Button type="button" variant="outline" size="sm"><ImageIcon className="h-4 w-4 mr-2" /> {slide.image ? 'Change' : 'Choose'} Image</Button>}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        case 'video_background_hero':
            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Headline</Label>
                        <Input value={String(block.content.title || '')} onChange={(e) => updateContent({ title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Subtitle</Label>
                        <Textarea className="h-16" value={String(block.content.subtitle || '')} onChange={(e) => updateContent({ subtitle: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Video URL</Label>
                        <Input value={String(block.content.videoUrl || '')} onChange={(e) => updateContent({ videoUrl: e.target.value })} placeholder="https://..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                        <div className="space-y-1">
                            <Label className="text-[10px]">CTA 1 Text</Label>
                            <Input className="h-8 text-xs" value={String(block.content.ctaText1 || '')} onChange={(e) => updateContent({ ctaText1: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px]">CTA 1 Link</Label>
                            <Input className="h-8 text-xs" value={String(block.content.ctaLink1 || '')} onChange={(e) => updateContent({ ctaLink1: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px]">CTA 2 Text</Label>
                            <Input className="h-8 text-xs" value={String(block.content.ctaText2 || '')} onChange={(e) => updateContent({ ctaText2: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px]">CTA 2 Link</Label>
                            <Input className="h-8 text-xs" value={String(block.content.ctaLink2 || '')} onChange={(e) => updateContent({ ctaLink2: e.target.value })} />
                        </div>
                    </div>
                </div>
            );

        case 'logo_cloud': {
            const items = (block.content.items as LogoItem[]) || [];
            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={String(block.content.title || '')} onChange={(e) => updateContent({ title: e.target.value })} />
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider">Logos</Label>
                            <Button variant="outline" size="sm" onClick={() => updateContent({ items: [...items, { name: 'Partner', url: '' }] })}>
                                <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {items.map((item, i) => (
                                <div key={i} className="group relative grid grid-cols-[1fr_2fr] gap-2 p-3 border rounded-lg bg-muted/10">
                                    <button type="button" title="Remove" className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100" onClick={() => updateContent({ items: items.filter((_, idx) => idx !== i) })}>
                                        <Trash className="h-3 w-3" />
                                    </button>
                                    <Input className="h-8 text-xs" value={item.name} onChange={(e) => { const n = [...items]; n[i] = { ...item, name: e.target.value }; updateContent({ items: n }); }} placeholder="Name" />
                                    <Input className="h-8 text-xs" value={item.url} onChange={(e) => { const n = [...items]; n[i] = { ...item, url: e.target.value }; updateContent({ items: n }); }} placeholder="Logo URL" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        case 'apple_cards_carousel': {
            const items = (block.content.items as AppleCardItem[]) || [];
            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={String(block.content.title || '')} onChange={(e) => updateContent({ title: e.target.value })} />
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider">Cards</Label>
                            <Button variant="outline" size="sm" onClick={() => updateContent({ items: [...items, { category: '', title: '', src: '', content: '', link: '' }] })}>
                                <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {items.map((item, i) => (
                                <div key={i} className="group relative p-3 border rounded-lg bg-muted/10 space-y-2">
                                    <button type="button" title="Remove" className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100" onClick={() => updateContent({ items: items.filter((_, idx) => idx !== i) })}>
                                        <Trash className="h-3 w-3" />
                                    </button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input className="h-8 text-xs" value={item.category} onChange={(e) => { const n = [...items]; n[i] = { ...item, category: e.target.value }; updateContent({ items: n }); }} placeholder="Category" />
                                        <Input className="h-8 text-xs" value={item.title} onChange={(e) => { const n = [...items]; n[i] = { ...item, title: e.target.value }; updateContent({ items: n }); }} placeholder="Title" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] text-muted-foreground">Card Image</Label>
                                        {item.src && (
                                            <img src={item.src} className="w-full h-24 object-cover rounded-md" alt={item.title || 'Card image'} />
                                        )}
                                        <div className="flex gap-2">
                                            <MediaLibrary 
                                                onSelect={(asset: MediaAsset) => { const n = [...items]; n[i] = { ...item, src: asset.url }; updateContent({ items: n }); }}
                                                trigger={<Button type="button" variant="outline" size="sm" className="h-8 text-xs"><ImageIcon className="h-3 w-3 mr-1" />{item.src ? 'Change' : 'Upload'}</Button>}
                                            />
                                            <Input className="h-8 text-xs flex-1" value={item.src} onChange={(e) => { const n = [...items]; n[i] = { ...item, src: e.target.value }; updateContent({ items: n }); }} placeholder="Or paste image URL..." />
                                        </div>
                                    </div>
                                    <Input className="h-8 text-xs" value={item.link} onChange={(e) => { const n = [...items]; n[i] = { ...item, link: e.target.value }; updateContent({ items: n }); }} placeholder="Link (optional)" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        case 'cover_demo':
            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Title Line 1</Label>
                        <Input value={String(block.content.titleOne || '')} onChange={(e) => updateContent({ titleOne: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Title Line 2</Label>
                        <Input value={String(block.content.titleTwo || '')} onChange={(e) => updateContent({ titleTwo: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Cover Text (Animated)</Label>
                        <Input value={String(block.content.coverText || '')} onChange={(e) => updateContent({ coverText: e.target.value })} />
                    </div>
                </div>
            );

        case 'image':
            return (
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Label>Image</Label>
                        {block.content.url && (
                            <img src={String(block.content.url)} className="w-full h-48 object-cover rounded-lg" alt="" />
                        )}
                        <MediaLibrary 
                            onSelect={(asset: MediaAsset) => updateContent({ url: asset.url })}
                            trigger={<Button type="button" variant="outline" size="sm"><ImageIcon className="h-4 w-4 mr-2" /> Select Image</Button>}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Alt Text</Label>
                        <Input value={String(block.content.alt || '')} onChange={(e) => updateContent({ alt: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Caption (Optional)</Label>
                        <Input value={String(block.content.caption || '')} onChange={(e) => updateContent({ caption: e.target.value })} />
                    </div>
                </div>
            );

        case 'video':
            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Video URL</Label>
                        <Input value={String(block.content.url || '')} onChange={(e) => updateContent({ url: e.target.value })} placeholder="https://..." />
                        <p className="text-[10px] text-muted-foreground">Supports YouTube, Vimeo, or direct video URLs.</p>
                    </div>
                </div>
            );

        case 'features': {
            const items = (block.content.items as { title: string; desc: string }[]) || [];
            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Section Title</Label>
                        <Input value={String(block.content.title || '')} onChange={(e) => updateContent({ title: e.target.value })} />
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider">Features</Label>
                            <Button variant="outline" size="sm" onClick={() => updateContent({ items: [...items, { title: 'Feature', desc: '' }] })}>
                                <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {items.map((item, i) => (
                                <div key={i} className="group relative p-3 border rounded-lg bg-muted/10 space-y-2">
                                    <button type="button" title="Remove" className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100" onClick={() => updateContent({ items: items.filter((_, idx) => idx !== i) })}>
                                        <Trash className="h-3 w-3" />
                                    </button>
                                    <Input className="h-8 text-xs font-semibold" value={item.title} onChange={(e) => { const n = [...items]; n[i] = { ...item, title: e.target.value }; updateContent({ items: n }); }} placeholder="Feature Title" />
                                    <Textarea className="h-16 text-xs" value={item.desc} onChange={(e) => { const n = [...items]; n[i] = { ...item, desc: e.target.value }; updateContent({ items: n }); }} placeholder="Description..." />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // Fallback for form and other complex types
        default:
            return (
                <div className="space-y-6">
                    <div className="p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center space-y-3 bg-muted/10">
                        <AlertCircle className="h-8 w-8 text-muted-foreground/30" />
                        <div className="space-y-1">
                            <p className="text-sm font-bold">Editor for "{block.type}"</p>
                            <p className="text-[11px] text-muted-foreground">This block type uses a specialized editor or is rendered from JSON data.</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase opacity-50">Content Data (Read Only)</Label>
                        <pre className="p-4 bg-muted rounded-lg text-[10px] overflow-auto max-h-48">
                            {JSON.stringify(block.content, null, 2)}
                        </pre>
                    </div>
                </div>
            );
    }
}
