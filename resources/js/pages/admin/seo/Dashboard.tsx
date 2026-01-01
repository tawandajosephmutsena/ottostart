import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Search, 
    TrendingUp, 
    AlertTriangle, 
    CheckCircle, 
    BarChart3,
    FileText,
    Eye,
    Lightbulb,
    RefreshCw,
    ExternalLink
} from 'lucide-react';

interface SeoStats {
    total_pages: number;
    analyzed_pages: number;
    average_score: number;
    pages_needing_attention: number;
    top_performing_pages: Array<{
        title: string;
        url: string;
        score: number;
    }>;
}

interface SeoIssue {
    issue: string;
    count: number;
    severity: 'high' | 'medium' | 'low';
}

interface SeoRecommendation {
    type: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action: string;
    items?: Array<{
        type: string;
        id: number;
        title: string;
        url: string;
    }>;
}

interface DashboardProps {
    stats: SeoStats;
    recentAnalyses: any[];
    topIssues: SeoIssue[];
}

export default function SeoDashboard({ stats, recentAnalyses, topIssues }: DashboardProps) {
    const [recommendations, setRecommendations] = useState<SeoRecommendation[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [bulkAnalyzing, setBulkAnalyzing] = useState(false);

    const loadRecommendations = async () => {
        setLoadingRecommendations(true);
        try {
            const response = await fetch('/admin/seo/recommendations');
            const data = await response.json();
            if (data.success) {
                setRecommendations(data.recommendations);
            }
        } catch (error) {
            console.error('Failed to load recommendations:', error);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const runBulkAnalysis = async (type: string) => {
        setBulkAnalyzing(true);
        try {
            const response = await fetch('/admin/seo/bulk-analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ type, limit: 20 }),
            });

            const data = await response.json();
            if (data.success) {
                // Refresh the page or update stats
                window.location.reload();
            }
        } catch (error) {
            console.error('Bulk analysis failed:', error);
        } finally {
            setBulkAnalyzing(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high': return 'destructive';
            case 'medium': return 'outline';
            case 'low': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <AdminLayout>
            <Head title="SEO Dashboard" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">SEO Dashboard</h1>
                        <p className="text-gray-600 mt-1">
                            Monitor and optimize your site's search engine performance
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            onClick={loadRecommendations}
                            disabled={loadingRecommendations}
                            variant="outline"
                        >
                            <Lightbulb className="w-4 h-4 mr-2" />
                            {loadingRecommendations ? 'Loading...' : 'Get Recommendations'}
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total Pages
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_pages}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Analyzed Pages
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.analyzed_pages}</div>
                            <Progress 
                                value={(stats.analyzed_pages / stats.total_pages) * 100} 
                                className="mt-2 h-2"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Average Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.average_score.toFixed(1)}</div>
                            <Progress value={stats.average_score} className="mt-2 h-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Need Attention
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {stats.pages_needing_attention}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RefreshCw className="w-5 h-5" />
                            Bulk Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Button 
                                onClick={() => runBulkAnalysis('insight')}
                                disabled={bulkAnalyzing}
                                variant="outline"
                                className="w-full"
                            >
                                Analyze Blog Posts
                            </Button>
                            <Button 
                                onClick={() => runBulkAnalysis('portfolio')}
                                disabled={bulkAnalyzing}
                                variant="outline"
                                className="w-full"
                            >
                                Analyze Portfolio
                            </Button>
                            <Button 
                                onClick={() => runBulkAnalysis('service')}
                                disabled={bulkAnalyzing}
                                variant="outline"
                                className="w-full"
                            >
                                Analyze Services
                            </Button>
                            <Button 
                                onClick={() => runBulkAnalysis('page')}
                                disabled={bulkAnalyzing}
                                variant="outline"
                                className="w-full"
                            >
                                Analyze Pages
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Issues */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Top SEO Issues
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {topIssues.map((issue, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                                        <div>
                                            <p className="font-medium">{issue.issue}</p>
                                            <p className="text-sm text-gray-600">{issue.count} pages affected</p>
                                        </div>
                                        <Badge 
                                            variant={issue.severity === 'high' ? 'destructive' : 
                                                   issue.severity === 'medium' ? 'outline' : 'secondary'}
                                        >
                                            {issue.severity}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="w-5 h-5" />
                                Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recommendations.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-600 mb-4">
                                        Click "Get Recommendations" to analyze your site and get personalized SEO advice.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recommendations.slice(0, 5).map((rec, index) => (
                                        <div key={index} className="p-3 rounded-lg border">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-medium">{rec.title}</h4>
                                                <Badge variant={getPriorityBadge(rec.priority)}>
                                                    {rec.priority}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                                            <p className="text-sm font-medium text-blue-600">{rec.action}</p>
                                            {rec.items && rec.items.length > 0 && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {rec.items.length} items need attention
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Top Performing Pages */}
                {stats.top_performing_pages.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Top Performing Pages
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats.top_performing_pages.map((page, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                                        <div className="flex-1">
                                            <p className="font-medium">{page.title}</p>
                                            <a 
                                                href={page.url} 
                                                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View Page
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-green-600">{page.score}</div>
                                            <div className="text-xs text-gray-500">SEO Score</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}