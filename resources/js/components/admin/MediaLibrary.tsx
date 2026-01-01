import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MediaAsset } from '@/types';
import { 
    Image as ImageIcon, 
    Video, 
    FileText, 
    Search, 
    Check, 
    Loader2, 
    Filter,
    Grid3X3,
    List,
    Download,
    Trash2,
    Copy,
    Tag,
    Calendar,
    SortAsc,
    SortDesc,
    MoreHorizontal
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import MediaUpload from './MediaUpload';

type MediaLibraryProps = {
    type?: 'image' | 'video' | 'all';
    trigger?: React.ReactNode;
} & (
    | {
          multiple?: false;
          onSelect: (asset: MediaAsset) => void;
          currentValue?: string;
      }
    | {
          multiple: true;
          onSelect: (assets: MediaAsset[]) => void;
          currentValue?: string[];
      }
);

export default function MediaLibrary(props: MediaLibraryProps): React.JSX.Element {
    const { type = 'all', trigger, multiple = false, onSelect, currentValue } = props;
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterType, setFilterType] = useState<string>('all');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [bulkMode, setBulkMode] = useState(false);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('q', search);
            if (type !== 'all') params.append('type', type);
            if (filterType !== 'all') params.append('filter_type', filterType);
            if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));
            params.append('sort_by', sortBy);
            params.append('sort_order', sortOrder);
            
            const response = await fetch(`/admin/media-search?${params.toString()}`);
            const data = await response.json();
            setAssets(data.assets || []);
            setAvailableTags(data.tags || []);
        } catch (error) {
            console.error('Failed to fetch assets', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchAssets();
            setSelectedAssets([]);
        }
    }, [open, search, type, sortBy, sortOrder, filterType, selectedTags]);

    const isSelected = (asset: MediaAsset) => {
        if (multiple) {
            return selectedAssets.some(a => a.id === asset.id);
        }
        return currentValue === asset.url;
    };

    const handleAssetClick = (asset: MediaAsset) => {
        if (multiple || bulkMode) {
            if (isSelected(asset)) {
                setSelectedAssets(selectedAssets.filter(a => a.id !== asset.id));
            } else {
                setSelectedAssets([...selectedAssets, asset]);
            }
        } else {
            (onSelect as (asset: MediaAsset) => void)(asset);
            setOpen(false);
        }
    };

    const handleConfirm = () => {
        if (multiple) {
            (onSelect as (assets: MediaAsset[]) => void)(selectedAssets);
        }
        setOpen(false);
    };

    const handleBulkAction = async (action: 'delete' | 'tag' | 'download') => {
        if (selectedAssets.length === 0) return;

        try {
            switch (action) {
                case 'delete':
                    if (confirm(`Delete ${selectedAssets.length} files?`)) {
                        await fetch('/admin/media/bulk-delete', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                            body: JSON.stringify({ ids: selectedAssets.map(a => a.id) }),
                        });
                        fetchAssets();
                        setSelectedAssets([]);
                    }
                    break;
                case 'download':
                    selectedAssets.forEach(asset => {
                        const link = document.createElement('a');
                        link.href = asset.url;
                        link.download = asset.original_name;
                        link.click();
                    });
                    break;
                case 'tag':
                    break;
            }
        } catch (error) {
            console.error('Bulk action failed:', error);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const renderGridView = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {assets.map((asset) => (
                <div 
                    key={asset.id}
                    className={`
                        aspect-square rounded-lg border-2 overflow-hidden cursor-pointer relative group transition-all
                        ${isSelected(asset) ? 'border-agency-accent ring-2 ring-agency-accent/20' : 'border-transparent hover:border-agency-accent/50'}
                    `}
                >
                    {bulkMode && (
                        <div className="absolute top-2 left-2 z-10">
                            <Checkbox
                                checked={isSelected(asset)}
                                onCheckedChange={() => handleAssetClick(asset)}
                                className="bg-white/80 backdrop-blur-sm"
                            />
                        </div>
                    )}

                    <div onClick={() => !bulkMode && handleAssetClick(asset)} className="w-full h-full">
                        {asset.is_image ? (
                            <img src={asset.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground gap-1">
                                {asset.is_video ? <Video className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                                <span className="text-[8px] uppercase font-bold">{asset.mime_type.split('/')[1]}</span>
                            </div>
                        )}
                    </div>
                    
                    {isSelected(asset) && !bulkMode && (
                        <div className="absolute inset-0 bg-agency-accent/10 flex items-center justify-center">
                            <div className="bg-agency-accent text-agency-primary rounded-full p-1 shadow-lg">
                                <Check className="h-4 w-4 stroke-[3]" />
                            </div>
                        </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate text-center">{asset.original_name}</p>
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 bg-white/80 backdrop-blur-sm">
                                    <MoreHorizontal className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => window.open(asset.url, '_blank')}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(asset.url)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy URL
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderListView = () => (
        <div className="space-y-2">
            {assets.map((asset) => (
                <div 
                    key={asset.id}
                    className={`
                        flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all
                        ${isSelected(asset) ? 'border-agency-accent bg-agency-accent/5' : 'border-transparent hover:border-agency-accent/50 hover:bg-muted/50'}
                    `}
                    onClick={() => handleAssetClick(asset)}
                >
                    {bulkMode && (
                        <Checkbox
                            checked={isSelected(asset)}
                            onCheckedChange={() => handleAssetClick(asset)}
                        />
                    )}

                    <div className="w-12 h-12 rounded border bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                        {asset.is_image ? (
                            <img src={asset.url} alt="" className="w-full h-full object-cover rounded" />
                        ) : asset.is_video ? (
                            <Video className="h-6 w-6" />
                        ) : (
                            <FileText className="h-6 w-6" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{asset.original_name}</h4>
                            {isSelected(asset) && (
                                <Check className="h-4 w-4 text-agency-accent flex-shrink-0" />
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {formatFileSize(asset.size || 0)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(asset.created_at)}
                            </span>
                            {asset.tags && asset.tags.length > 0 && (
                                <div className="flex gap-1">
                                    {asset.tags.slice(0, 2).map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                    {asset.tags.length > 2 && (
                                        <Badge variant="secondary" className="text-xs">
                                            +{asset.tags.length - 2}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Select Media</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Media Library</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="browse" className="flex-1 flex flex-col min-h-0">
                    <div className="px-6 border-b">
                        <TabsList className="bg-transparent h-12 w-full justify-start gap-6 rounded-none p-0">
                            <TabsTrigger 
                                value="browse" 
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-agency-accent data-[state=active]:bg-transparent px-0 font-bold"
                            >
                                Browse Files
                            </TabsTrigger>
                            <TabsTrigger 
                                value="upload"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-agency-accent data-[state=active]:bg-transparent px-0 font-bold"
                            >
                                Upload New
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="browse" className="flex-1 flex flex-col p-6 min-h-0 space-y-4 data-[state=active]:flex">
                        {/* Search and Filters */}
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search files..." 
                                        className="pl-10"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="image">Images</SelectItem>
                                        <SelectItem value="video">Videos</SelectItem>
                                        <SelectItem value="document">Documents</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Advanced Filters */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <Select value={sortBy} onValueChange={(value: 'name' | 'date' | 'size') => setSortBy(value)}>
                                            <SelectTrigger className="w-24">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="date">Date</SelectItem>
                                                <SelectItem value="name">Name</SelectItem>
                                                <SelectItem value="size">Size</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                        >
                                            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                                        </Button>
                                    </div>

                                    {availableTags.length > 0 && (
                                        <Select value={selectedTags.join(',')} onValueChange={(value) => setSelectedTags(value ? value.split(',') : [])}>
                                            <SelectTrigger className="w-32">
                                                <SelectValue placeholder="Tags" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableTags.map(tag => (
                                                    <SelectItem key={tag} value={tag}>
                                                        <div className="flex items-center gap-2">
                                                            <Tag className="h-3 w-3" />
                                                            {tag}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setBulkMode(!bulkMode)}
                                        className={bulkMode ? 'bg-agency-accent text-agency-primary' : ''}
                                    >
                                        <Checkbox className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                    >
                                        {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            {/* Bulk Actions */}
                            {bulkMode && selectedAssets.length > 0 && (
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm font-medium">
                                        {selectedAssets.length} file{selectedAssets.length !== 1 ? 's' : ''} selected
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleBulkAction('download')}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleBulkAction('tag')}
                                        >
                                            <Tag className="h-4 w-4 mr-2" />
                                            Tag
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleBulkAction('delete')}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Media Grid/List */}
                        <div className="flex-1 overflow-y-auto min-h-0">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-agency-accent" />
                                </div>
                            ) : assets.length > 0 ? (
                                viewMode === 'grid' ? renderGridView() : renderListView()
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
                                    <ImageIcon className="h-12 w-12 opacity-20" />
                                    <p>No media found</p>
                                    <Button variant="link" onClick={() => setSearch('')}>Clear search</Button>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="upload" className="flex-1 p-6 overflow-y-auto">
                        <MediaUpload onSuccess={() => {
                            fetchAssets();
                        }} />
                    </TabsContent>
                </Tabs>

                {multiple && selectedAssets.length > 0 && (
                    <DialogFooter className="p-4 border-t bg-muted/30 flex sm:justify-between items-center">
                        <div className="text-sm font-medium">
                            {selectedAssets.length} file{selectedAssets.length !== 1 ? 's' : ''} selected
                        </div>
                        <div className="flex gap-2">
                             <Button variant="ghost" onClick={() => setSelectedAssets([])} size="sm">
                                Clear
                             </Button>
                             <Button onClick={handleConfirm} className="bg-agency-accent text-agency-primary hover:bg-agency-accent/90" size="sm">
                                Add Selected
                             </Button>
                        </div>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
