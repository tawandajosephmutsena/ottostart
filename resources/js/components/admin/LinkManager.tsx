import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X, Plus, GripVertical, Link as LinkIcon, FileText } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface LinkItem {
    name: string;
    href: string;
    type?: 'page' | 'custom';
}

interface Page {
    id: number;
    title: string;
    slug: string;
}

interface LinkManagerProps {
    value: LinkItem[];
    onChange: (links: LinkItem[]) => void;
    pages?: Page[];
    label?: string;
    description?: string;
}

export function LinkManager({ value, onChange, pages = [], label, description }: LinkManagerProps) {
    const [links, setLinks] = useState<LinkItem[]>(value || []);

    const handleAddLink = () => {
        const newLinks = [...links, { name: '', href: '', type: 'custom' }];
        setLinks(newLinks);
        onChange(newLinks);
    };

    const handleRemoveLink = (index: number) => {
        const newLinks = links.filter((_, i) => i !== index);
        setLinks(newLinks);
        onChange(newLinks);
    };

    const handleUpdateLink = (index: number, field: keyof LinkItem, value: string) => {
        const newLinks = [...links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setLinks(newLinks);
        onChange(newLinks);
    };

    const handleTypeChange = (index: number, type: 'page' | 'custom') => {
        const newLinks = [...links];
        newLinks[index] = { ...newLinks[index], type, href: '' };
        setLinks(newLinks);
        onChange(newLinks);
    };

    const handlePageSelect = (index: number, pageSlug: string) => {
        const page = pages.find(p => p.slug === pageSlug);
        if (page) {
            const newLinks = [...links];
            newLinks[index] = {
                ...newLinks[index],
                href: `/${pageSlug}`,
                name: newLinks[index].name || page.title
            };
            setLinks(newLinks);
            onChange(newLinks);
        }
    };

    return (
        <div className="space-y-3">
            {label && (
                <div>
                    <Label className="text-sm font-semibold">{label}</Label>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
            )}

            <div className="space-y-2">
                {links.map((link, index) => (
                    <Card key={index} className="p-3">
                        <div className="flex items-start gap-2">
                            <div className="mt-2 cursor-move text-muted-foreground hover:text-foreground transition-colors">
                                <GripVertical className="w-4 h-4" />
                            </div>

                            <div className="flex-1 space-y-2">
                                {/* Link Type Selector */}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={link.type === 'page' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleTypeChange(index, 'page')}
                                        className="flex-1 h-8"
                                    >
                                        <FileText className="w-3 h-3 mr-1" />
                                        Page
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={link.type === 'custom' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleTypeChange(index, 'custom')}
                                        className="flex-1 h-8"
                                    >
                                        <LinkIcon className="w-3 h-3 mr-1" />
                                        Custom URL
                                    </Button>
                                </div>

                                {/* Link Name */}
                                <Input
                                    placeholder="Link text (e.g., Blog)"
                                    value={link.name}
                                    onChange={(e) => handleUpdateLink(index, 'name', e.target.value)}
                                    className="h-8 text-sm"
                                />

                                {/* Page Selector or Custom URL Input */}
                                {link.type === 'page' ? (
                                    <Select
                                        value={link.href.replace('/', '')}
                                        onValueChange={(value) => handlePageSelect(index, value)}
                                    >
                                        <SelectTrigger className="h-8 text-sm">
                                            <SelectValue placeholder="Select a page..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pages.length > 0 ? (
                                                pages.map((page) => (
                                                    <SelectItem key={page.id} value={page.slug}>
                                                        {page.title}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-pages" disabled>
                                                    No pages available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        placeholder="URL (e.g., /blog or https://...)"
                                        value={link.href}
                                        onChange={(e) => handleUpdateLink(index, 'href', e.target.value)}
                                        className="h-8 text-sm"
                                    />
                                )}
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveLink(index)}
                                className="h-8 w-8 text-destructive hover:text-destructive mt-1"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLink}
                className="w-full"
            >
                <Plus className="w-4 h-4 mr-2" />
                Add Link
            </Button>
        </div>
    );
}
