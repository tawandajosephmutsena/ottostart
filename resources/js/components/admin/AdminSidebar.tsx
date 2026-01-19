import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { NavUser } from '@/components/nav-user';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    FolderOpen,
    Briefcase,
    FileText,
    Users,
    Image,
    Settings,
    Home,
    MessageSquare,
    BookOpen,
    List,
    TrendingUp,
    Shield,
} from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

import AppLogo from '@/components/app-logo';

const mainNavItems = [
    {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: TrendingUp,
    },
];

const contentNavItems = [
    {
        title: 'Portfolio',
        href: '/admin/portfolio',
        icon: FolderOpen,
    },
    {
        title: 'Services',
        href: '/admin/services',
        icon: Briefcase,
    },
    {
        title: 'Insights',
        href: '/admin/insights',
        icon: FileText,
    },
    {
        title: 'Team',
        href: '/admin/team',
        icon: Users,
    },
    {
        title: 'Pages',
        href: '/admin/pages',
        icon: LayoutDashboard,
    },
    {
        title: 'Menus',
        href: '/admin/menus',
        icon: List,
    },
    {
        title: 'Inquiries',
        href: '/admin/contact-inquiries',
        icon: MessageSquare,
    },
];

const systemNavItems = [
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
        permission: 'users.view',
    },
    {
        title: 'Roles',
        href: '/admin/roles',
        icon: Shield,
        permission: 'roles.manage',
    },
    {
        title: 'Media Library',
        href: '/admin/media',
        icon: Image,
        permission: 'media.manage',
    },
    {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        permission: 'settings.manage',
    },
];


const quickNavItems = [
    {
        title: 'View Site',
        href: '/',
        icon: Home,
    },
    {
        title: 'Documentation',
        href: '/documentation',
        icon: BookOpen,
    },
];

export function AdminSidebar() {
    const { url } = usePage();
    const { can } = usePermissions();


    const isActive = (href: string) => {
        if (href === '/admin') {
            return url === '/admin';
        }
        return url.startsWith(href);
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin" className="flex items-center justify-center">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.href)}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Content Management */}
                <SidebarGroup>
                    <SidebarGroupLabel>Content</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {contentNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.href)}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* System Management */}
                <SidebarGroup>
                    <SidebarGroupLabel>System</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                        <SidebarMenu>
                            {systemNavItems.filter(item => !item.permission || can(item.permission)).map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.href)}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Quick Actions */}
                <SidebarGroup>
                    <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {quickNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                    >
                                        <Link href={item.href} target="_blank">
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}