import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Search, 
    TrendingUp, 
    AlertTriangle, 
    CheckCircle, 
    XCircle,
    Lightbulb,
    BarChart3,
    FileText,
    Eye
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface SeoAnalysisProps {
    contentType: 'insight' | 'portfolio' | 'service' | 'page';
    contentId: number;
    initialAnalysis?: SeoAnalysisResult;
}

interface SeoAnalysisResult {
    title: {
        original: string;
        optimized: string;
        length: number;
        issues: string[];
        suggestions: string[];
        score: number;
    };
    description: {
        original: string;
        optimized: string;
        length: number;
        issues: string[];
        suggestions: string[];
        score: number;
    };
    keywords: string[];
    suggestions: {
        titles: string[];
        descriptions: string[];
    };
    overall_score: number;
    grade: string;
}

export const SeoAnalysis: React.FC<SeoAnalysisProps> = ({
    contentType,
    contentId,
    initialAnalysis
}) => {
    const [analysis, setAnalysis] = useState<SeoAnalysisResult | null>(initialAnalysis || null);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const runAnalysis = async () => {
        setLoading(true);
        try {
            const response = await fetch('/admin/seo/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    type: contentType,
                    id: contentId,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setAnalysis(data.analysis);
            }
        } catch (error) {
            console.error('SEO analysis failed:', error);
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

    const getGradeBadgeVariant = (grade: string) => {
        switch (grade) {
            case 'A': return 'default';
            case 'B': return 'secondary';
            case 'C': return 'outline';
            case 'D': return 'destructive';
            case 'F': return 'destructive';
            default: return 'outline';
        }
    };

    if (!analysis) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        SEO Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">
                            Run an SEO analysis to get insights and recommendations for this content.
                        </p>
                        <Button onClick={runAnalysis} disabled={loading}>
                            {loading ? 'Analyzing...' : 'Run SEO Analysis'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Overall Score */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            SEO Score
                        </span>
                        <Badge variant={getGradeBadgeVariant(analysis.grade)}>
                            Grade {analysis.grade}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <Progress value={analysis.overall_score} className="h-3" />
                        </div>
                        <span className={`text-2xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                            {analysis.overall_score}
                        </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Button 
                            onClick={runAnalysis} 
                            disabled={loading}
                            variant="outline"
                            size="sm"
                        >
                            Re-analyze
                        </Button>
                        <Button 
                            onClick={() => setShowSuggestions(!showSuggestions)}
                            variant="outline"
                            size="sm"
                        >
                            <Lightbulb className="w-4 h-4 mr-2" />
                            {showSuggestions ? 'Hide' : 'Show'} Suggestions
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Title Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Title Analysis
                        <Badge variant={analysis.title.score >= 80 ? 'default' : 'destructive'}>
                            {analysis.title.score}/100
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Current Title</label>
                        <p className="text-sm bg-gray-50 p-2 rounded border">
                            {analysis.title.original}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {analysis.title.length} characters
                        </p>
                    </div>

                    {analysis.title.issues.length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-red-600 flex items-center gap-1">
                                <XCircle className="w-4 h-4" />
                                Issues
                            </label>
                            <ul className="text-sm text-red-600 space-y-1 mt-1">
                                {analysis.title.issues.map((issue, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                                        {issue}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {analysis.title.suggestions.length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-blue-600 flex items-center gap-1">
                                <Lightbulb className="w-4 h-4" />
                                Suggestions
                            </label>
                            <ul className="text-sm text-blue-600 space-y-1 mt-1">
                                {analysis.title.suggestions.map((suggestion, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Description Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Meta Description Analysis
                        <Badge variant={analysis.description.score >= 80 ? 'default' : 'destructive'}>
                            {analysis.description.score}/100
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Current Description</label>
                        <p className="text-sm bg-gray-50 p-2 rounded border">
                            {analysis.description.original || 'No meta description set'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {analysis.description.length} characters
                        </p>
                    </div>

                    {analysis.description.issues.length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-red-600 flex items-center gap-1">
                                <XCircle className="w-4 h-4" />
                                Issues
                            </label>
                            <ul className="text-sm text-red-600 space-y-1 mt-1">
                                {analysis.description.issues.map((issue, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                                        {issue}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {analysis.description.suggestions.length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-blue-600 flex items-center gap-1">
                                <Lightbulb className="w-4 h-4" />
                                Suggestions
                            </label>
                            <ul className="text-sm text-blue-600 space-y-1 mt-1">
                                {analysis.description.suggestions.map((suggestion, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Keywords */}
            {analysis.keywords.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Detected Keywords
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {analysis.keywords.map((keyword, index) => (
                                <Badge key={index} variant="outline">
                                    {keyword}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Suggestions */}
            {showSuggestions && (
                <div className="space-y-4">
                    {analysis.suggestions.titles.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5" />
                                    Title Suggestions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {analysis.suggestions.titles.map((title, index) => (
                                        <div key={index} className="p-2 bg-gray-50 rounded border text-sm">
                                            {title}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {analysis.suggestions.descriptions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5" />
                                    Description Suggestions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {analysis.suggestions.descriptions.map((description, index) => (
                                        <div key={index} className="p-2 bg-gray-50 rounded border text-sm">
                                            {description}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};