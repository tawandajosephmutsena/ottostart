import AdminLayout from '@/layouts/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Head, router, useForm } from '@inertiajs/react';
import { Folder, Play, Plus, Trash, StopCircle } from 'lucide-react';
import { useRef } from 'react';

interface Plugin {
    name: string;
    description: string;
    enabled: boolean;
    path: string;
}

interface Props {
    plugins: Plugin[];
}

export default function Index({ plugins }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { processing } = useForm({
        plugin: null as File | null,
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            router.post('/admin/plugins', {
                plugin: file,
            }, {
                forceFormData: true,
                onSuccess: () => {
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                }
            });
        }
    };

    const togglePlugin = (plugin: Plugin) => {
        router.put(`/admin/plugins/${plugin.name}`);
    };

    const deletePlugin = (plugin: Plugin) => {
        if (confirm('Are you sure you want to delete this plugin? This action cannot be undone.')) {
            router.delete(`/admin/plugins/${plugin.name}`);
        }
    };

    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Plugins', href: '/admin/plugins' },
    ];

    return (
        <AdminLayout title="Plugin Management" breadcrumbs={breadcrumbs}>
            <Head title="Plugins" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Plugins</h1>
                        <p className="text-muted-foreground">Manage application extensions and plugins</p>
                    </div>
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".zip"
                            title="Upload Plugin"
                            onChange={handleFileUpload}
                        />
                        <Button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()} 
                            disabled={processing}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Install Plugin
                        </Button>
                    </div>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plugin</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plugins?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No plugins installed. Upload a ZIP file to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (plugins || []).map((plugin) => (
                                    <TableRow key={plugin.name}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Folder className="h-4 w-4 text-muted-foreground" />
                                                {plugin.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={plugin.enabled ? 'default' : 'secondary'}>
                                                {plugin.enabled ? 'Enabled' : 'Disabled'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {plugin.description || 'No description provided'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => togglePlugin(plugin)}
                                                    title={plugin.enabled ? 'Disable' : 'Enable'}
                                                >
                                                    {plugin.enabled ? (
                                                        <StopCircle className="h-4 w-4 text-orange-500" />
                                                    ) : (
                                                        <Play className="h-4 w-4 text-green-500" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deletePlugin(plugin)}
                                                    title="Delete"
                                                >
                                                    <Trash className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    );
}
