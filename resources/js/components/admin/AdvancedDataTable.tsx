import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MoreHorizontal,
    Search,
    LayoutGrid,
    List,
    Plus,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';

interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

interface AdvancedDataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    onSearch?: (value: string) => void;
    onFilter?: (filters: Record<string, unknown>) => void;
    renderGridItem?: (item: T) => React.ReactNode;
    actions?: (item: T) => void;
    createUrl?: string;
    createLabel?: string;
    searchPlaceholder?: string;
    routeKey?: keyof T;
}

export function AdvancedDataTable<T extends { id: number | string }>({
    data,
    columns,
    pagination,
    onSearch,
    renderGridItem,
    createUrl,
    createLabel = 'Create New',
    searchPlaceholder = 'Search...',
    routeKey = 'id' as keyof T,
}: AdvancedDataTableProps<T>) {
    const [viewMode, setViewMode] = useState<'table' | 'grid'>(renderGridItem ? 'grid' : 'table');
    const [search, setSearch] = useState('');
    const basePath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') : '';

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearch) onSearch(search);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </form>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {renderGridItem && (
                        <div className="flex items-center border rounded-md p-1 bg-muted/50">
                            <Button
                                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode('table')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {createUrl && (
                        <Link href={createUrl}>
                            <Button className="w-full sm:w-auto">
                                <Plus className="h-4 w-4 mr-2" />
                                {createLabel}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="rounded-md border bg-card">
                {viewMode === 'table' ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((col, i) => (
                                    <TableHead key={i} className={col.className}>
                                        {col.header}
                                    </TableHead>
                                ))}
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length > 0 ? (
                                data.map((item) => (
                                    <TableRow key={item.id}>
                                        {columns.map((col, i) => (
                                            <TableCell key={i} className={col.className}>
                                                {col.cell
                                                    ? col.cell(item)
                                                    : col.accessorKey
                                                    ? String(item[col.accessorKey])
                                                    : null}
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => router.get(`${basePath}/${String(item[routeKey])}`)}
                                                    >
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => router.get(`${basePath}/${String(item[routeKey])}/edit`)}
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this item?')) {
                                                                router.delete(`${basePath}/${String(item[routeKey])}`);
                                                            }
                                                        }}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {data.length > 0 ? (
                            data.map((item) => (
                                <div key={item.id}>
                                    {renderGridItem!(item)}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full h-24 flex items-center justify-center text-muted-foreground">
                                No results found.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-muted-foreground">
                        Showing {data.length} of {pagination.total} results
                    </div>
                    <div className="flex items-center space-x-2">
                        {pagination.links.map((link, i) => {
                            if (link.label.includes('Previous')) {
                                return (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                );
                            }
                            if (link.label.includes('Next')) {
                                return (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                );
                            }
                            // Process numeric labels or ellipsis
                            const isNumeric = !isNaN(Number(link.label));
                            if (isNumeric) {
                                return (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => link.url && router.get(link.url)}
                                    >
                                        {link.label}
                                    </Button>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
