import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Trash2,
    GripVertical,
    FileText,
    Link as LinkIcon,
    RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Page {
    id: number;
    title: string;
    slug: string;
}

interface MenuItem {
    id?: number; // Optional because new items won't have an ID yet (but backend handles this differently)
    // Actually, for the UI state we might need temp IDs.
    // Let's stick to the server structure, but for new items we might need a distinct way to handle them.
    // In this specific implementation, we are adding items directly to the server via storeItem,
    // so they will have IDs when they come back.
    title: string;
    url: string | null;
    page_id: number | null;
    order: number;
    is_visible: boolean;
    open_in_new_tab: boolean;
    icon: string | null;
    children?: MenuItem[];
    page?: Page;
}

interface Menu {
    id: number;
    name: string;
    slug: string;
    location: string;
    is_active: boolean;
    items: MenuItem[];
}

interface Props {
    menus: Menu[];
    pages: Page[];
    activeMenu?: Menu;
}

// Sortable Item Component
const SortableItem = ({ item, onRemove, onUpdate }: { item: MenuItem; onRemove: () => void; onUpdate: (item: MenuItem) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id as number });

    // dnd-kit requires inline styles for transform/transition - these are dynamically calculated
    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className={cn("flex items-center gap-3 bg-card border rounded-lg p-3 mb-2 shadow-sm group", isDragging && "opacity-50")}>
            <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
                <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.title}</span>
                    {item.page_id ? (
                        <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Page
                        </span>
                    ) : (
                        <span className="text-[10px] bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" /> Link
                        </span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-md">
                    {item.page ? `/${item.page.slug}` : item.url}
                </p>
            </div>
            
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-2">
                    <Label htmlFor={`visible-${item.id}`} className="sr-only">Visibility</Label>
                    <Switch 
                        id={`visible-${item.id}`}
                        checked={item.is_visible} 
                        onCheckedChange={(checked) => onUpdate({ ...item, is_visible: checked })}
                        className="scale-75"
                    />
                </div>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={onRemove}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

export default function MenuBuilder({ menus, pages, activeMenu: initialActiveMenu }: Props) {
    // Default to the first menu if none active (or "main-menu" if exists)
    const [selectedMenuId, setSelectedMenuId] = useState<string>(
        initialActiveMenu?.id.toString() || 
        menus.find(m => m.slug === 'main-menu')?.id.toString() || 
        menus[0]?.id.toString() || ''
    );
    
    const activeMenu = menus.find(m => m.id.toString() === selectedMenuId);
    
    // Sortable sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Custom Link Form
    const { data: customLinkData, setData: setCustomLinkData, post: postCustomLink, processing: processingCustomLink, reset: resetCustomLink } = useForm({
        title: '',
        url: 'https://',
        is_visible: true,
        open_in_new_tab: false,
    });

    // Add Page Form
    const { data: pageLinkData, setData: setPageLinkData, post: postPageLink, processing: processingPageLink, reset: resetPageLink } = useForm({
        page_id: '',
        title: '', // Will default to page title but can be renamed
        is_visible: true,
        open_in_new_tab: false,
    });

    const handleMenuChange = (value: string) => {
        if (value !== selectedMenuId) {
            setSelectedMenuId(value);
            // In a real app we might want to navigate to the URL for that menu, 
            // but client-side state switch works too if we pass all menus.
            // For now, let's just use the client state since we have all menus.
        }
    };

    const resetMenu = () => {
        if (!activeMenu) return;
        if (confirm('Are you sure you want to reset this menu to its default items? This will remove all current items.')) {
            router.post(`/admin/menus/${activeMenu.id}/reset`, {}, {
                preserveScroll: true,
                onSuccess: () => toast.success('Menu reset to default'),
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id && activeMenu) {
            const oldIndex = activeMenu.items.findIndex((item) => item.id === active.id);
            const newIndex = activeMenu.items.findIndex((item) => item.id === over.id);

            const newItems = arrayMove(activeMenu.items, oldIndex, newIndex);
            
            // Optimistic update locally would be complex due to the prop structure from Inertia not being mutable state directly in the way we might want.
            // But we can trigger the backend update directly.
            
            const reorderedItems = newItems.map((item, index) =>({
                id: item.id!,
                order: index,
            }));

            router.post(`/admin/menus/${activeMenu.id}/items/reorder`, {
                 items: reorderedItems
            }, {
                preserveScroll: true,
                onSuccess: () => toast.success('Order updated'),
            });
        }
    };

    const addCustomLink = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeMenu) return;

        postCustomLink(`/admin/menus/${activeMenu.id}/items`, {
            preserveScroll: true,
            onSuccess: () => {
                resetCustomLink();
                toast.success('Link added successfully');
            },
        });
    };

    const addPageLink = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeMenu || !pageLinkData.page_id) return;

        postPageLink(`/admin/menus/${activeMenu.id}/items`, {
            preserveScroll: true,
            onSuccess: () => {
                resetPageLink();
                toast.success('Page added successfully');
            },
        });
    };

    const removeMenuItem = (item: MenuItem) => {
        if (!activeMenu || !item.id) return;
        if (confirm('Are you sure you want to remove this item?')) {
            router.delete(`/admin/menus/${activeMenu.id}/items/${item.id}`, {
                preserveScroll: true,
                onSuccess: () => toast.success('Item removed'),
            });
        }
    };

    const updateMenuItem = (item: MenuItem) => {
         // This is a simplified update that just triggers a partial update for visibility/toggle
         // For a full edit, we'd probably want a modal or inline edit form.
         // Let's assume we just want to save the "items" array state for now via the main update.
         
         // Actually, let's make the visibility toggle work immediately via a PUT/PATCH or simplified update.
         // Since we don't have a specific single-item update route (except the main bulk update),
         // we can re-use the bulk update for a single item change implicitly or just map the whole current state.
         
         if (!activeMenu) return;

         const updatedItems = activeMenu.items.map(i => i.id === item.id ? item : i);
         
         router.put(`/admin/menus/${activeMenu.id}`, {
             items: updatedItems.map(i => ({
                 id: i.id,
                 title: i.title,
                 url: i.url,
                 page_id: i.page_id,
                 order: i.order,
                 is_visible: i.is_visible,
                 open_in_new_tab: i.open_in_new_tab,
                 icon: i.icon
             }))
         }, {
             preserveScroll: true,
             onSuccess: () => toast.success('Updated'),
         });
    };

    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Menus', href: '/admin/menus' },
    ];

    return (
        <AdminLayout title="Menu Builder" breadcrumbs={breadcrumbs}>
            <Head title="Menu Builder" />
            
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Navigation Menus</h1>
                        <p className="text-muted-foreground">Manage your site's navigation structure</p>
                    </div>
                </div>

                {menus.length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center text-muted-foreground">
                            No menus found. Please run the seeder or create a menu in the database.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Menu Selection & Add Items */}
                        <div className="space-y-6 lg:col-span-1">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle>Select Menu</CardTitle>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={resetMenu}
                                        className="h-8 text-xs text-muted-foreground hover:text-destructive"
                                        disabled={!activeMenu}
                                    >
                                        <RotateCcw className="w-3 h-3 mr-1" /> Reset
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <Select value={selectedMenuId} onValueChange={handleMenuChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a menu" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {menus.map((menu) => (
                                                <SelectItem key={menu.id} value={menu.id.toString()}>
                                                    {menu.name} ({menu.location})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Add Menu Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="page">
                                        <TabsList className="w-full grid grid-cols-2 mb-4">
                                            <TabsTrigger value="page">Page</TabsTrigger>
                                            <TabsTrigger value="custom">Custom Link</TabsTrigger>
                                        </TabsList>
                                        
                                        <TabsContent value="page">
                                            <form onSubmit={addPageLink} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Select Page</Label>
                                                    <Select 
                                                        value={pageLinkData.page_id} 
                                                        onValueChange={(val) => {
                                                            const page = pages.find(p => p.id.toString() === val);
                                                            setPageLinkData(data => ({
                                                                ...data,
                                                                page_id: val,
                                                                title: page?.title || ''
                                                            }));
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a page" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {pages.map((page) => (
                                                                <SelectItem key={page.id} value={page.id.toString()}>
                                                                    {page.title}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="page-label">Label</Label>
                                                    <Input 
                                                        id="page-label" 
                                                        value={pageLinkData.title}
                                                        onChange={e => setPageLinkData('title', e.target.value)}
                                                        placeholder="Menu Item Label"
                                                    />
                                                </div>
                                                <Button type="submit" className="w-full" disabled={processingPageLink || !pageLinkData.page_id}>
                                                    Add to Menu
                                                </Button>
                                            </form>
                                        </TabsContent>

                                        <TabsContent value="custom">
                                            <form onSubmit={addCustomLink} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="custom-url">URL</Label>
                                                    <Input 
                                                        id="custom-url" 
                                                        value={customLinkData.url}
                                                        onChange={e => setCustomLinkData('url', e.target.value)}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="custom-label">Label</Label>
                                                    <Input 
                                                        id="custom-label" 
                                                        value={customLinkData.title}
                                                        onChange={e => setCustomLinkData('title', e.target.value)}
                                                        placeholder="Link Text"
                                                    />
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Switch 
                                                        id="new-tab" 
                                                        checked={customLinkData.open_in_new_tab}
                                                        onCheckedChange={checked => setCustomLinkData('open_in_new_tab', checked)}
                                                    />
                                                    <Label htmlFor="new-tab">Open in new tab</Label>
                                                </div>
                                                <Button type="submit" className="w-full" disabled={processingCustomLink || !customLinkData.title}>
                                                    Add to Menu
                                                </Button>
                                            </form>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Menu Structure */}
                        <div className="lg:col-span-2">
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>Menu Structure</CardTitle>
                                    <CardDescription>Drag and drop to reorder items</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {activeMenu ? (
                                        <DndContext 
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext 
                                                items={activeMenu.items.map(item => item.id as number)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <div className="space-y-2 min-h-[200px]">
                                                    {activeMenu.items.length === 0 ? (
                                                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                                            No items in this menu yet. Add some from the left!
                                                        </div>
                                                    ) : (
                                                        activeMenu.items.map((item) => (
                                                            <SortableItem 
                                                                key={item.id} 
                                                                item={item} 
                                                                onRemove={() => removeMenuItem(item)}
                                                                onUpdate={updateMenuItem}
                                                            />
                                                        ))
                                                    )}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    ) : (
                                        <div className="text-center py-12 text-muted-foreground">
                                            Select a menu to edit structure
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            
                            {/* Tips/Legend */}
                            <div className="mt-4 grid grid-cols-2 text-xs text-muted-foreground gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    <span>Blue badge indicates a dynamic Page link</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                    <span>Orange badge indicates a custom URL</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
