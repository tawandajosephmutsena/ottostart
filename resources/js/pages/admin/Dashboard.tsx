import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import {
    FolderOpen,
    Briefcase,
    FileText,
    Users,
    Image,
    MessageSquare,
    Plus,
    Eye,
    Star,
    Settings,
    Globe,
    PanelsTopLeft,
    BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface DashboardStats {
    portfolio_items: {
        total: number;
        published: number;
        featured: number;
    };
    services: {
        total: number;
        published: number;
        featured: number;
    };
    insights: {
        total: number;
        published: number;
        featured: number;
    };
    team_members: {
        total: number;
        active: number;
        featured: number;
    };
    media_assets: {
        total: number;
        images: number;
        videos: number;
    };
    users: {
        total: number;
        admins: number;
        editors: number;
    };
    contact_inquiries: {
        total: number;
        new: number;
        unread: number;
    };
}

interface RecentActivityItem {
    id: number;
    title?: string;
    subject?: string;
    name?: string;
    created_at: string;
    is_published?: boolean;
    status?: string;
}

interface RecentActivity {
    portfolio: RecentActivityItem[];
    insights: RecentActivityItem[];
    inquiries: RecentActivityItem[];
}

interface SeoStats {
    average_score: number;
    pages_needing_attention: number;
    total_pages: number;
}

interface DashboardProps {
    stats: DashboardStats;
    recent_activity: RecentActivity;
    system_activity: number[];
    seo_stats: SeoStats;
}

const StatCard = ({
    title,
    icon: Icon,
    total,
    published,
    featured,
    href,
    className,
}: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    total: number;
    published?: number;
    featured?: number;
    href: string;
    className?: string;
}) => (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <div className="flex gap-2 mt-2">
                {published !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        {published} published
                    </Badge>
                )}
                {featured !== undefined && (
                    <Badge variant="outline" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        {featured} featured
                    </Badge>
                )}
            </div>
            <Link href={href}>
                <Button variant="ghost" size="sm" className="mt-2 w-full">
                    Manage
                </Button>
            </Link>
        </CardContent>
    </Card>
);

const QuickActionCard = ({
    title,
    description,
    icon: Icon,
    href,
    variant = 'default',
}: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    variant?: 'default' | 'primary';
}) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
            <div className="flex items-center gap-3">
                <div className={cn(
                    'p-2 rounded-lg',
                    variant === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription className="text-sm">{description}</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="pt-0">
            <Link href={href}>
                <Button 
                    variant={variant === 'primary' ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Get Started
                </Button>
            </Link>
        </CardContent>
    </Card>
);

const RecentActivityCard = ({
    title,
    items,
    emptyMessage,
    href,
}: {
    title: string;
    items: RecentActivityItem[];
    emptyMessage: string;
    href: string;
}) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {items.length > 0 ? (
                <div className="space-y-3">
                    {items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {item.title || item.subject || `${item.name}: ${item.subject}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {item.is_published !== undefined && (
                                    <Badge 
                                        variant={item.is_published ? 'default' : 'secondary'}
                                        className="text-xs"
                                    >
                                        {item.is_published ? 'Published' : 'Draft'}
                                    </Badge>
                                )}
                                {item.status && (
                                    <Badge 
                                        variant={item.status === 'new' ? 'destructive' : 'secondary'}
                                        className="text-xs"
                                    >
                                        {item.status}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                    <Link href={href}>
                        <Button variant="ghost" size="sm" className="w-full mt-2">
                            View All
                        </Button>
                    </Link>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            )}
        </CardContent>
    </Card>
);

export default function Dashboard({ stats, recent_activity, system_activity, seo_stats }: DashboardProps) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Dashboard', href: '/admin' },
    ];

    // Use actual system activity from backend or fallback to empty array if undefined
    const activityData = system_activity || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const maxVal = Math.max(...activityData, 1); // Prevent division by zero

    return (
        <AdminLayout title="Dashboard" breadcrumbs={breadcrumbs}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome to your content management system. Here's an overview of your site.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Portfolio"
                        icon={FolderOpen}
                        total={stats.portfolio_items.total}
                        published={stats.portfolio_items.published}
                        featured={stats.portfolio_items.featured}
                        href="/admin/portfolio"
                        className="border-l-4 border-l-agency-accent"
                    />
                    <StatCard
                        title="Services"
                        icon={Briefcase}
                        total={stats.services.total}
                        published={stats.services.published}
                        featured={stats.services.featured}
                        href="/admin/services"
                        className="border-l-4 border-l-blue-400"
                    />
                    <StatCard
                        title="Insights"
                        icon={FileText}
                        total={stats.insights.total}
                        published={stats.insights.published}
                        featured={stats.insights.featured}
                        href="/admin/insights"
                        className="border-l-4 border-l-purple-400"
                    />
                    <StatCard
                        title="Inquiries"
                        icon={MessageSquare}
                        total={stats.contact_inquiries.total}
                        published={stats.contact_inquiries.unread}
                        featured={stats.contact_inquiries.new}
                        href="/admin/contact-inquiries"
                        className="border-l-4 border-l-rose-400"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">System Activity Overview</CardTitle>
                            <CardDescription>Visual representation of site engagement over the last 12 days</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[200px] flex items-end justify-between gap-1 pt-4">
                            {activityData.map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div 
                                        className="w-full bg-agency-accent/20 hover:bg-agency-accent transition-all duration-500 rounded-t-sm relative"
                                        style={{ height: `${val > 0 ? Math.max((val / maxVal) * 100, 8) : 4}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {val} views
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-mono">D{i+1}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base">Content Health</CardTitle>
                            <CardDescription>Status of your site data</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-center space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-medium">
                                    <span>SEO Health Score</span>
                                    <span>{seo_stats.average_score}%</span>
                                </div>
                                <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                                    <div 
                                        className={cn("h-full", seo_stats.average_score >= 80 ? "bg-green-500" : seo_stats.average_score >= 60 ? "bg-yellow-500" : "bg-red-500")} 
                                        style={{ width: `${seo_stats.average_score}%` }} 
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-medium">
                                    <span>Portfolio Published</span>
                                    <span>{Math.round((stats.portfolio_items.published / (stats.portfolio_items.total || 1)) * 100)}%</span>
                                </div>
                                <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                                    <div className="bg-agency-accent h-full" style={{ width: `${(stats.portfolio_items.published / (stats.portfolio_items.total || 1)) * 100}%` }} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-medium">
                                    <span>Insights Published</span>
                                    <span>{Math.round((stats.insights.published / (stats.insights.total || 1)) * 100)}%</span>
                                </div>
                                <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                                    <div className="bg-purple-400 h-full" style={{ width: `${(stats.insights.published / (stats.insights.total || 1)) * 100}%` }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                        <QuickActionCard
                            title="New Portfolio Item"
                            description="Add a new project to showcase"
                            icon={FolderOpen}
                            href="/admin/portfolio/create"
                            variant="primary"
                        />
                        <QuickActionCard
                            title="New Blog Post"
                            description="Write a new insight or article"
                            icon={FileText}
                            href="/admin/insights/create"
                        />
                        <QuickActionCard
                            title="Add Service"
                            description="Create a new service offering"
                            icon={Briefcase}
                            href="/admin/services/create"
                        />
                        <QuickActionCard
                            title="Manage Pages"
                            description="Edit site pages and content"
                            icon={PanelsTopLeft}
                            href="/admin/pages"
                        />
                        <QuickActionCard
                            title="Upload Media"
                            description="Add images and files"
                            icon={Image}
                            href="/admin/media/create"
                        />
                        <QuickActionCard
                            title="Add Team Member"
                            description="Add a new team member"
                            icon={Users}
                            href="/admin/team/create"
                        />
                        <QuickActionCard
                            title="SEO Dashboard"
                            description="Optimize for search engines"
                            icon={Globe}
                            href="/admin/seo"
                        />
                        <QuickActionCard
                            title="Site Settings"
                            description="Configure your website"
                            icon={Settings}
                            href="/admin/settings"
                        />
                        <QuickActionCard
                            title="Documentation"
                            description="User & developer guides"
                            icon={BookOpen}
                            href="/documentation"
                        />
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <RecentActivityCard
                            title="Recent Portfolio"
                            items={recent_activity.portfolio}
                            emptyMessage="No portfolio items yet"
                            href="/admin/portfolio"
                        />
                        <RecentActivityCard
                            title="Recent Insights"
                            items={recent_activity.insights}
                            emptyMessage="No blog posts yet"
                            href="/admin/insights"
                        />
                        <RecentActivityCard
                            title="Recent Inquiries"
                            items={recent_activity.inquiries}
                            emptyMessage="No inquiries yet"
                            href="/admin/contact-inquiries"
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}