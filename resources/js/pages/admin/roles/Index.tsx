import React from 'react';
import { Link, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/AdminLayout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MoreHorizontal,
    Plus,
    Shield,
    Edit,
    Trash,
    Users,
    Key,
} from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

// @ts-ignore
declare const route: any;

interface Permission {
    id: number;
    name: string;
    slug: string;
    category: string;
}

interface Role {
    id: number;
    name: string;
    slug: string;
    description?: string;
    permissions: Permission[];
    users_count: number;
}

interface IndexProps {
    roles: Role[];
    permissions: Permission[];
}

export default function RolesIndex({ roles, permissions }: IndexProps) {
    const { can } = usePermissions();

    const deleteRole = (role: Role) => {
        if (role.slug === 'super-admin') {
            alert('Cannot delete the super-admin role.');
            return;
        }

        if (role.users_count > 0) {
            alert(`Cannot delete this role. It is assigned to ${role.users_count} user(s).`);
            return;
        }

        if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
            router.delete(route('admin.roles.destroy', role.id));
        }
    };

    const isSystemRole = (slug: string) => {
        return ['super-admin', 'admin'].includes(slug);
    };

    return (
        <AdminLayout
            title="Roles & Permissions"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin' },
                { title: 'Roles', href: '/admin/roles' },
            ]}
        >
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
                        <p className="text-muted-foreground">
                            Manage roles and their associated permissions.
                        </p>
                    </div>
                    {can('roles.manage') && (
                        <Button asChild>
                            <Link href={route('admin.roles.create')}>
                                <Plus className="mr-2 size-4" /> Add Role
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Roles Table */}
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Users</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No roles found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                roles.map((role) => (
                                    <TableRow key={role.id} className="group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    <Shield className="size-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{role.name}</span>
                                                        {isSystemRole(role.slug) && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                System
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{role.slug}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {role.description || '—'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Key className="size-4 text-muted-foreground" />
                                                <span className="font-medium">{role.permissions.length}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    permission{role.permissions.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="size-4 text-muted-foreground" />
                                                <span className="font-medium">{role.users_count}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    user{role.users_count !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                                        <MoreHorizontal className="size-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    {can('roles.manage') && (
                                                        <>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('admin.roles.edit', role.id)}>
                                                                    <Edit className="mr-2 size-4" /> Edit Role
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {!isSystemRole(role.slug) && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem 
                                                                        className="text-destructive focus:text-destructive"
                                                                        onClick={() => deleteRole(role)}
                                                                    >
                                                                        <Trash className="mr-2 size-4" /> Delete Role
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
