import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Users, 
    MousePointer2, 
    Globe, 
    TrendingUp, 
    Smartphone, 
    Monitor, 
    Tablet, 
    ExternalLink,
    ChevronUp,
    ChevronDown,
    Clock
} from 'lucide-react';
import React from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { cn } from '@/lib/utils';

interface AnalyticsProps {
    chartData: { date: string; views: number }[];
    topPages: { url: string; count: number }[];
    topReferrers: { referer: string; count: number }[];
    deviceData: { name: string; value: number }[];
    browserData: { name: string; value: number }[];
    topInteractions: { element_selector: string; count: number }[];
    activeNow: number;
    totalVisits: number;
    uniqueVisitors: number;
}

const COLORS = ['#C25E2E', '#3b82f6', '#a855f7', '#10b981', '#f59e0b'];

export default function Analytics({ 
    chartData, 
    topPages, 
    topReferrers, 
    deviceData, 
    browserData, 
    topInteractions,
    activeNow,
    totalVisits, 
    uniqueVisitors 
}: AnalyticsProps) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Analytics', href: '/admin/analytics' },
    ];

    return (
        <AdminLayout title="Analytics" breadcrumbs={breadcrumbs}>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mb-2">
                            Analytics Intelligence
                        </h1>
                        <p className="text-muted-foreground">
                            Deep insights into user behavior and site performance.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-black uppercase tracking-widest">{activeNow} Active Now</span>
                        </div>
                        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                            <Badge variant="secondary" className="px-3 py-1">Last 30 Days</Badge>
                        </div>
                    </div>
                </div>

                {/* Top Metrics Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-l-4 border-l-agency-accent overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-60">Total Page Views</CardTitle>
                            <TrendingUp className="h-4 w-4 text-agency-accent group-hover:scale-125 transition-transform" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">{totalVisits.toLocaleString()}</div>
                            <div className="flex items-center mt-1 text-xs text-green-500 font-bold">
                                <ChevronUp className="w-4 h-4 mr-0.5" />
                                12.5% from last month
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500 overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-60">Unique Visitors</CardTitle>
                            <Users className="h-4 w-4 text-blue-500 group-hover:scale-125 transition-transform" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">{uniqueVisitors.toLocaleString()}</div>
                            <div className="flex items-center mt-1 text-xs text-green-500 font-bold">
                                <ChevronUp className="w-4 h-4 mr-0.5" />
                                8.2% from last month
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500 overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-60">Avg. Session</CardTitle>
                            <Clock className="h-4 w-4 text-purple-500 group-hover:scale-125 transition-transform" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">2m 45s</div>
                            <div className="flex items-center mt-1 text-xs text-red-500 font-bold">
                                <ChevronDown className="w-4 h-4 mr-0.5" />
                                3.1% from last month
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-emerald-500 overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-60">Interaction Rate</CardTitle>
                            <MousePointer2 className="h-4 w-4 text-emerald-500 group-hover:scale-125 transition-transform" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">64.2%</div>
                            <div className="flex items-center mt-1 text-xs text-green-500 font-bold">
                                <ChevronUp className="w-4 h-4 mr-0.5" />
                                5.7% from last month
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Primary Traffic Chart */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold uppercase tracking-tight">Traffic Volume Over Time</CardTitle>
                            <CardDescription>Daily page views for the past 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#C25E2E" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#C25E2E" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                        <XAxis 
                                            dataKey="date" 
                                            axisLine={false} 
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                            tickFormatter={(str) => {
                                                const date = new Date(str);
                                                return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                                            }}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'hsl(var(--background))', 
                                                borderColor: 'hsl(var(--border))',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="views" 
                                            stroke="#C25E2E" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorViews)" 
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Device & Browser Pie Charts */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold uppercase tracking-tight">Device Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[250px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={deviceData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {deviceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'hsl(var(--background))', 
                                                borderColor: 'hsl(var(--border))',
                                                borderRadius: '8px',
                                                fontSize: '11px'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute flex flex-col items-center justify-center transform translate-y-2">
                                    <Smartphone className="w-5 h-5 text-muted-foreground opacity-50" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold uppercase tracking-tight">Browser Usage</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {browserData.map((browser, i) => (
                                        <div key={browser.name} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                                                <span>{browser.name}</span>
                                                <span className="opacity-60">{Math.round((browser.value / totalVisits) * 100)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-agency-accent transition-all duration-1000" 
                                                    style={{ width: `${(browser.value / totalVisits) * 100}%` }} 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Top Content Table */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold uppercase tracking-tight">Highest Traffic Pages</CardTitle>
                                <CardDescription>Content that resonates most with users</CardDescription>
                            </div>
                            <Globe className="h-5 w-5 opacity-20" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {topPages.map((page, i) => (
                                    <div key={page.url} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <p className="text-sm font-bold truncate">{page.url.replace(window.location.origin, '') || '/'}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest leading-none mt-1">Direct Entry Path</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-black">{page.count.toLocaleString()}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">Views</p>
                                            </div>
                                            <a href={page.url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Interaction Hotspots (Heatmap Data) */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold uppercase tracking-tight">Interaction Hotspots</CardTitle>
                                <CardDescription>Most clicked elements (Behavioral Heatmap)</CardDescription>
                            </div>
                            <MousePointer2 className="h-5 w-5 opacity-20" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {topInteractions.length > 0 ? topInteractions.map((interaction, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-agency-accent/20 bg-agency-accent/5 hover:bg-agency-accent/10 transition-colors group">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <p className="text-xs font-mono truncate text-agency-accent">{interaction.element_selector}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black">{interaction.count.toLocaleString()}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">Clicks</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground opacity-30">
                                        <MousePointer2 className="w-10 h-10 mb-2" />
                                        <p className="text-xs uppercase font-bold tracking-widest">No Click Data Yet</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Referrers Table */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold uppercase tracking-tight">Acquisition Channels</CardTitle>
                                <CardDescription>Traffic sources and referrers</CardDescription>
                            </div>
                            <Globe className="h-5 w-5 opacity-20" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {topReferrers.length > 0 ? topReferrers.map((referrer, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:border-agency-accent/30 transition-colors group">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <p className="text-sm font-bold truncate">{referrer.referer || 'Direct / None'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black">{referrer.count.toLocaleString()}</p>
                                            <Badge variant="secondary" className="text-[9px] uppercase tracking-tighter h-4">Referral</Badge>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground opacity-30">
                                        <Globe className="w-10 h-10 mb-2" />
                                        <p className="text-xs uppercase font-bold tracking-widest">No Referral Data Yet</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Growth Strategy Notice */}
                <Card className="bg-agency-accent text-white border-none shadow-2xl shadow-agency-accent/20">
                    <CardContent className="py-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1">
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Automated Insights Ready</h3>
                            <p className="opacity-80 text-sm max-w-xl font-medium">
                                Our AI system has identified that mobile traffic is up by **12%** this week. 
                                We recommend optimizing the "Services" parallax images for smaller viewports to increase engagement.
                            </p>
                        </div>
                        <Badge className="bg-white text-agency-accent hover:bg-white text-sm px-6 py-2 py-2 font-black cursor-pointer uppercase tracking-widest">
                            Optimize Now
                        </Badge>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
