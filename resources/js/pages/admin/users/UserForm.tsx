import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, Mail, Lock } from 'lucide-react';

// @ts-ignore
declare const route: any;

interface Role {

    id: number;
    name: string;
    slug: string;
    description?: string;
}

interface UserFormProps {
    user?: {
        id: number;
        name: string;
        email: string;
        is_active: boolean;
        roles: { id: number }[];
    };
    roles: Role[];
    mode: 'create' | 'edit';
}

export function UserForm({ user, roles, mode }: UserFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        is_active: user?.is_active ?? true,
        roles: user?.roles.map(r => r.id) || [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'create') {
            post(route('admin.users.store'));
        } else {
            put(route('admin.users.update', user!.id));
        }
    };

    const toggleRole = (roleId: number) => {
        const currentRoles = new Set(data.roles);
        if (currentRoles.has(roleId)) {
            currentRoles.delete(roleId);
        } else {
            currentRoles.add(roleId);
        }
        setData('roles', Array.from(currentRoles));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>{mode === 'create' ? 'Basic Information' : 'User Details'}</CardTitle>
                    <CardDescription>
                        General information about the user account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                            <Input
                                id="name"
                                placeholder="John Doe"
                                className="pl-9"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                        </div>
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                className="pl-9"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                required
                            />
                        </div>
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            {mode === 'edit' ? 'New Password (Optional)' : 'Password'}
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type="password"
                                className="pl-9"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                required={mode === 'create'}
                            />
                        </div>
                        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                            <Input
                                id="password_confirmation"
                                type="password"
                                className="pl-9"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                required={mode === 'create'}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Active Status</Label>
                            <p className="text-sm text-muted-foreground">
                                Allow this user to log in to the system.
                            </p>
                        </div>
                        <Switch
                            checked={data.is_active}
                            onCheckedChange={checked => setData('is_active', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Role Assignment</CardTitle>
                    <CardDescription>
                        Select the roles to assign to this user.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {roles.map(role => (
                        <div key={role.id} className="flex items-start space-x-3 p-3 rounded-md border hover:bg-accent/50 transition-colors">
                            <Checkbox
                                id={`role-${role.id}`}
                                checked={data.roles.includes(role.id)}
                                onCheckedChange={() => toggleRole(role.id)}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label
                                    htmlFor={`role-${role.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                                >
                                    <Shield className="size-3.5 text-primary" />
                                    {role.name}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {role.description || 'No description provided.'}
                                </p>
                            </div>
                        </div>
                    ))}
                    {errors.roles && <p className="text-sm text-destructive">{errors.roles}</p>}
                </CardContent>
                <CardFooter>
                    <div className="flex w-full justify-end gap-2">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {mode === 'create' ? 'Create User' : 'Save Changes'}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </form>
    );
}
