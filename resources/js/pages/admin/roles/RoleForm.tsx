import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Key, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// @ts-ignore
declare const route: any;

interface Permission {
    id: number;
    name: string;
    slug: string;
    category: string;
    description?: string;
}

interface Role {
    id: number;
    name: string;
    slug: string;
    description?: string;
    permissions: Permission[];
}

interface RoleFormProps {
    role?: Role;
    permissions: Permission[];
    isEditing?: boolean;
}

export function RoleForm({ role, permissions, isEditing = false }: RoleFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: role?.name || '',
        slug: role?.slug || '',
        description: role?.description || '',
        permissions: role?.permissions.map((p) => p.id) || [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditing && role) {
            put(route('admin.roles.update', role.id));
        } else {
            post(route('admin.roles.store'));
        }
    };

    const handlePermissionToggle = (permissionId: number) => {
        setData('permissions', 
            data.permissions.includes(permissionId)
                ? data.permissions.filter((id) => id !== permissionId)
                : [...data.permissions, permissionId]
        );
    };

    const handleCategoryToggle = (category: string) => {
        const categoryPermissions = permissions.filter((p) => p.category === category);
        const categoryIds = categoryPermissions.map((p) => p.id);
        const allSelected = categoryIds.every((id) => data.permissions.includes(id));

        if (allSelected) {
            // Deselect all in category
            setData('permissions', data.permissions.filter((id) => !categoryIds.includes(id)));
        } else {
            // Select all in category
            const newPermissions = Array.from(new Set([...data.permissions, ...categoryIds]));
            setData('permissions', newPermissions);
        }
    };

    // Group permissions by category
    const permissionsByCategory = permissions.reduce((acc, permission) => {
        if (!acc[permission.category]) {
            acc[permission.category] = [];
        }
        acc[permission.category].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    const categories = Object.keys(permissionsByCategory).sort();

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Shield className="size-5" />
                        </div>
                        <div>
                            <CardTitle>Role Details</CardTitle>
                            <CardDescription>
                                Define the role name and description
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Role Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g., Content Manager"
                                disabled={isEditing && role?.slug === 'super-admin'}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                placeholder="e.g., content-manager"
                                disabled={isEditing && role?.slug === 'super-admin'}
                            />
                            {errors.slug && (
                                <p className="text-sm text-destructive">{errors.slug}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Describe what this role is for..."
                            rows={3}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Key className="size-5" />
                        </div>
                        <div>
                            <CardTitle>Permissions</CardTitle>
                            <CardDescription>
                                Select which permissions this role should have
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {categories.map((category) => {
                        const categoryPerms = permissionsByCategory[category];
                        const allSelected = categoryPerms.every((p) => data.permissions.includes(p.id));
                        const someSelected = categoryPerms.some((p) => data.permissions.includes(p.id));

                        return (
                            <div key={category} className="space-y-3">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h4 className="font-semibold capitalize">{category}</h4>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCategoryToggle(category)}
                                        className="h-7 text-xs"
                                    >
                                        {allSelected ? 'Deselect All' : 'Select All'}
                                    </Button>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {categoryPerms.map((permission) => (
                                        <div key={permission.id} className="flex items-start space-x-3">
                                            <Checkbox
                                                id={`permission-${permission.id}`}
                                                checked={data.permissions.includes(permission.id)}
                                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <label
                                                    htmlFor={`permission-${permission.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {permission.name}
                                                </label>
                                                <p className="text-xs text-muted-foreground">
                                                    {permission.description || permission.slug}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {errors.permissions && (
                        <p className="text-sm text-destructive">{errors.permissions}</p>
                    )}
                </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    disabled={processing}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {isEditing ? 'Update Role' : 'Create Role'}
                </Button>
            </div>
        </form>
    );
}
