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
import { MediaAsset } from '@/types';
import { Image as ImageIcon, Video, FileText, Search, Check, Loader2 } from 'lucide-react';
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

export default function MediaLibrary(props: MediaLibraryProps) {
    const { type = 'all', trigger, multiple = false, onSelect, currentValue } = props;
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('q', search);
            if (type !== 'all') params.append('type', type);
            
            const response = await fetch(`/admin/media-search?${params.toString()}`);
            const data = await response.json();
            setAssets(data);
        } catch (error) {
            console.error('Failed to fetch assets', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchAssets();
            setSelectedAssets([]); // Reset local selection when opening
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, search, type]);

    const isSelected = (asset: MediaAsset) => {
        if (multiple) {
            return selectedAssets.some(a => a.id === asset.id);
        }
        return currentValue === asset.url;
    };

    const handleAssetClick = (asset: MediaAsset) => {
        if (multiple) {
            if (isSelected(asset)) {
                setSelectedAssets(selectedAssets.filter(a => a.id !== asset.id));
            } else {
                setSelectedAssets([...selectedAssets, asset]);
            }
        } else {
            // TypeScript needs help here because of the union type
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
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search files..." 
                                className="pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-0">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-agency-accent" />
                                </div>
                            ) : assets.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {assets.map((asset) => (
                                        <div 
                                            key={asset.id}
                                            className={`
                                                aspect-square rounded-lg border-2 overflow-hidden cursor-pointer relative group transition-all
                                                ${isSelected(asset) ? 'border-agency-accent ring-2 ring-agency-accent/20' : 'border-transparent hover:border-agency-accent/50'}
                                            `}
                                            onClick={() => handleAssetClick(asset)}
                                        >
                                            {asset.is_image ? (
                                                <img src={asset.url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground gap-1">
                                                    {asset.is_video ? <Video className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                                                    <span className="text-[8px] uppercase font-bold">{asset.mime_type.split('/')[1]}</span>
                                                </div>
                                            )}
                                            
                                            {isSelected(asset) && (
                                                <div className="absolute inset-0 bg-agency-accent/10 flex items-center justify-center">
                                                    <div className="bg-agency-accent text-agency-primary rounded-full p-1 shadow-lg">
                                                        <Check className="h-4 w-4 stroke-[3]" />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[10px] text-white truncate text-center">{asset.original_name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
