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
import { Input } from '@/components/ui/input';
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
    Search,
    Trash,
    Edit,
} from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { formatDistanceToNow } from 'date-fns';
import debounce from 'lodash/debounce';

// @ts-ignore
declare const route: any;


interface User {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string;
    roles: {
        id: number;
        name: string;
        slug: string;
    }[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface IndexProps {
    users: {
        data: User[];
        links: PaginationLink[];
        meta: any;
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search?: string;
        role?: string;
    };
    roles: {
        id: number;
        name: string;
        slug: string;
    }[];
}

export default function UsersIndex({ users, filters, roles }: IndexProps) {
    const { can, user: currentUser } = usePermissions();
    const [search, setSearch] = React.useState(filters.search || '');

    // debounced search function
    const debouncedSearch = React.useMemo(
        () =>
            debounce((value: string, role?: string) => {
                router.get(
                    route('admin.users.index'),
                    { search: value, role: role },
                    { preserveState: true, replace: true }
                );
            }, 300),
        []
    );

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value, filters.role);
    };

    // Handle role filter change
    const onRoleChange = (roleSlug: string | null) => {
         router.get(
            route('admin.users.index'),
             { search, role: roleSlug },
             { preserveState: true }
         );
    }

    const deleteUser = (user: User) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(route('admin.users.destroy', user.id));
        }
    };

    return (
        <AdminLayout
            title="Users"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin' },
                { title: 'Users', href: '/admin/users' },
            ]}
        >
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                        <p className="text-muted-foreground">
                            Manage users, roles, and access permissions.
                        </p>
                    </div>
                    {can('users.manage') && (
                        <Button asChild>
                            <Link href={route('admin.users.create')}>
                                <Plus className="mr-2 size-4" /> Add User
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg border">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-9 bg-background"
                            value={search}
                            onChange={onSearchChange}
                        />
                    </div>
                    <div className="flex gap-2">
                         <Button
                            variant={!filters.role ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onRoleChange(null)}
                        >
                            All Roles
                        </Button>
                        {roles.map((role) => (
                            <Button
                                key={role.id}
                                variant={filters.role === role.slug ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onRoleChange(filters.role === role.slug ? null : role.slug)}
                            >
                                {role.name}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Users Table */}
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((user) => (
                                    <TableRow key={user.id} className="group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.map((role) => (
                                                    <Badge key={role.id} variant="secondary" className="text-xs">
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                                {user.roles.length === 0 && (
                                                    <span className="text-xs text-muted-foreground italic">No roles</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {user.is_active ? (
                                                    <Badge variant="default" className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="bg-red-500/15 text-red-600 hover:bg-red-500/25 border-red-500/20">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground" title={user.created_at}>
                                                {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                                            </span>
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
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('admin.users.edit', user.id)}>
                                                            <Edit className="mr-2 size-4" /> Edit Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {currentUser.id !== user.id && can('users.manage') && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => deleteUser(user)}
                                                            >
                                                                <Trash className="mr-2 size-4" /> Delete User
                                                            </DropdownMenuItem>
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

