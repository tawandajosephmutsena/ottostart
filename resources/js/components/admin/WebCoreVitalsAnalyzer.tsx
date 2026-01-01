import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
    Zap, 
    XCircle, 
    AlertTriangle,
    TrendingUp,
    Clock,
    Eye,
    Lightbulb,
    Target,
    BarChart3
} from 'lucide-react';

interface WebCoreVitalsAnalyzerProps {
    className?: string;
}

interface MetricAnalysis {
    metric: string;
    description: string;
    target: string;
    score: number;
    issues: string[];
    optimizations: string[];
}

interface WebCoreVitalsAnalysis {
    url: string | null;
    timestamp: string;
    lcp: MetricAnalysis;
    fid: MetricAnalysis;
    cls: MetricAnalysis;
    overall_score: number;
    recommendations: Array<{
        metric: string;
        type: string;
        description: string;
        priority: string;
    }>;
    optimizations: Array<{
        metric: string;
        optimization: string;
        impact: string;
        difficulty: string;
    }>;
}

interface OptimizationReport {
    summary: {
        overall_score: number;
        lcp_score: number;
        fid_score: number;
        cls_score: number;
        total_issues: number;
        high_priority_issues: number;
    };
    detailed_analysis: WebCoreVitalsAnalysis;
    action_plan: Array<{
        phase: string;
        description: string;
        optimizations: unknown[];
        estimated_time: string;
    }>;
}

export const WebCoreVitalsAnalyzer: React.FC<WebCoreVitalsAnalyzerProps> = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'analyze' | 'bulk'>('dashboard');
    const [analysis, setAnalysis] = useState<WebCoreVitalsAnalysis | null>(null);
    const [optimizationReport, setOptimizationReport] = useState<OptimizationReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (activeTab === 'dashboard') {
            loadDashboardData();
        }
    }, [activeTab]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/admin/web-core-vitals/dashboard');
            const data = await response.json();
            if (data.success) {
                setAnalysis(data.dashboard.site_analysis);
                setOptimizationReport(data.dashboard.optimization_report);
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const analyzeUrl = async () => {
        if (!url.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('/admin/web-core-vitals/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();
            if (data.success) {
                setAnalysis(data.analysis);
            }
        } catch (error) {
            console.error('Web Core Vitals analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 80) return 'text-blue-600';
        if (score >= 70) return 'text-yellow-600';
        if (score >= 60) return 'text-orange-600';
        return 'text-red-600';
    };

    const getScoreBadge = (score: number) => {
        if (score >= 90) return 'default';
        if (score >= 70) return 'secondary';
        if (score >= 50) return 'outline';
        return 'destructive';
    };

    const getMetricIcon = (metric: string) => {
        switch (metric.toLowerCase()) {
            case 'lcp':
                return <Clock className="w-5 h-5" />;
            case 'fid':
                return <Zap className="w-5 h-5" />;
            case 'cls':
                return <Eye className="w-5 h-5" />;
            default:
                return <BarChart3 className="w-5 h-5" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-600';
            case 'medium':
                return 'text-yellow-600';
            case 'low':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };

    const getImpactBadge = (impact: string) => {
        switch (impact) {
            case 'high':
                return 'destructive';
            case 'medium':
                return 'secondary';
            case 'low':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const getDifficultyBadge = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return 'default';
            case 'medium':
                return 'secondary';
            case 'hard':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Web Core Vitals Optimization
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 mb-4">
                        Monitor and optimize your website's Core Web Vitals for better user experience and SEO rankings.
                    </p>
                    
                    {/* Tab Navigation */}
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                        {[
                            { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                            { key: 'analyze', label: 'Analyze URL', icon: Target },
                            { key: 'bulk', label: 'Bulk Analysis', icon: Eye },
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key as 'dashboard' | 'analyze' | 'bulk')}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === key
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Dashboard */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    {/* Overall Score */}
                    {analysis && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Overall Web Core Vitals Score</span>
                                    <Badge variant={getScoreBadge(analysis.overall_score)}>
                                        {analysis.overall_score}/100
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex-1">
                                        <Progress value={analysis.overall_score} className="h-4" />
                                    </div>
                                    <span className={`text-3xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                                        {analysis.overall_score}
                                    </span>
                                </div>

                                {/* Individual Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[analysis.lcp, analysis.fid, analysis.cls].map((metric) => (
                                        <div key={metric.metric} className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                {getMetricIcon(metric.metric)}
                                                <h3 className="font-semibold">{metric.metric}</h3>
                                            </div>
                                            <div className={`text-2xl font-bold mb-1 ${getScoreColor(metric.score)}`}>
                                                {metric.score}
                                            </div>
                                            <div className="text-sm text-gray-600 mb-2">{metric.description}</div>
                                            <div className="text-xs text-gray-500">Target: {metric.target}</div>
                                            {metric.issues.length > 0 && (
                                                <div className="mt-2">
                                                    <Badge variant="destructive" className="text-xs">
                                                        {metric.issues.length} issue(s)
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Optimization Report Summary */}
                    {optimizationReport && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                                        Issues Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>Total Issues</span>
                                            <Badge variant="outline">{optimizationReport.summary.total_issues}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>High Priority</span>
                                            <Badge variant="destructive">{optimizationReport.summary.high_priority_issues}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Medium Priority</span>
                                            <Badge variant="secondary">
                                                {optimizationReport.summary.total_issues - optimizationReport.summary.high_priority_issues}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5 text-blue-600" />
                                        Action Plan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {optimizationReport.action_plan.map((phase, index) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium">{phase.phase}</div>
                                                    <div className="text-sm text-gray-600">{phase.estimated_time}</div>
                                                </div>
                                                <Badge variant="outline">{phase.optimizations.length} items</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Recommendations */}
                    {analysis && analysis.recommendations.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Priority Recommendations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {analysis.recommendations.slice(0, 5).map((rec, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                                            <Badge variant="outline" className="mt-0.5">{rec.metric}</Badge>
                                            <div className="flex-1">
                                                <div className="font-medium">{rec.description}</div>
                                                <div className={`text-sm ${getPriorityColor(rec.priority)}`}>
                                                    {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* URL Analysis */}
            {activeTab === 'analyze' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Analyze Specific URL</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL to Analyze
                                </label>
                                <Input
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com/page"
                                    type="url"
                                />
                            </div>

                            <Button onClick={analyzeUrl} disabled={loading || !url.trim()}>
                                {loading ? 'Analyzing...' : 'Analyze Web Core Vitals'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Analysis Results */}
                    {analysis && (
                        <div className="space-y-6">
                            {/* Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[analysis.lcp, analysis.fid, analysis.cls].map((metric) => (
                                    <Card key={metric.metric}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                {getMetricIcon(metric.metric)}
                                                {metric.metric}
                                                <Badge variant={getScoreBadge(metric.score)}>
                                                    {metric.score}/100
                                                </Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div>
                                                    <Progress value={metric.score} className="h-2 mb-2" />
                                                    <p className="text-sm text-gray-600">{metric.description}</p>
                                                    <p className="text-xs text-gray-500">Target: {metric.target}</p>
                                                </div>

                                                {metric.issues.length > 0 && (
                                                    <div>
                                                        <h4 className="font-medium text-red-600 mb-2">Issues</h4>
                                                        <ul className="space-y-1">
                                                            {metric.issues.map((issue, index) => (
                                                                <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                                                                    <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                                    {issue}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {metric.optimizations.length > 0 && (
                                                    <div>
                                                        <h4 className="font-medium text-blue-600 mb-2">Optimizations</h4>
                                                        <ul className="space-y-1">
                                                            {metric.optimizations.map((opt, index) => (
                                                                <li key={index} className="text-sm text-blue-600 flex items-start gap-2">
                                                                    <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                                    {opt}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Optimizations */}
                            {analysis.optimizations.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Optimization Recommendations</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {analysis.optimizations.map((opt, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                                    <div className="flex-1">
                                                        <div className="font-medium">{opt.optimization}</div>
                                                        <div className="text-sm text-gray-600">Metric: {opt.metric}</div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Badge variant={getImpactBadge(opt.impact)}>
                                                            {opt.impact} impact
                                                        </Badge>
                                                        <Badge variant={getDifficultyBadge(opt.difficulty)}>
                                                            {opt.difficulty}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Bulk Analysis */}
            {activeTab === 'bulk' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Bulk Content Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8">
                            <p className="text-gray-600 mb-4">
                                Bulk analysis of content models will be implemented here.
                            </p>
                            <Button disabled>
                                Coming Soon
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};