import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Code, 
    CheckCircle, 
    XCircle, 
    Eye,
    Accessibility,
    FileText,
    Lightbulb
} from 'lucide-react';

interface SemanticAnalysisProps {
    contentType: 'insight' | 'portfolio' | 'service' | 'page';
    contentId: number;
    htmlContent?: string;
}

interface HeadingStructure {
    headings: Array<{
        level: number;
        text: string;
        length: number;
    }>;
    h1_count: number;
    total_headings: number;
    issues: string[];
    hierarchy_valid: boolean;
}

interface SemanticElements {
    found: Record<string, number>;
    missing: string[];
    recommendations: string[];
    semantic_ratio: number;
}

interface AccessibilityAnalysis {
    images_without_alt: number;
    input_count: number;
    label_count: number;
    aria_landmarks: number;
    issues: string[];
    recommendations: string[];
    score: number;
}

interface LandmarkAnalysis {
    found: Record<string, {
        role_count: number;
        semantic_count: number;
        total: number;
    }>;
    missing: string[];
    coverage: number;
}

interface SemanticAnalysisResult {
    heading_structure: HeadingStructure;
    semantic_elements: SemanticElements;
    accessibility: AccessibilityAnalysis;
    landmarks: LandmarkAnalysis;
    score: number;
    issues: string[];
    recommendations: string[];
}

export const SemanticAnalyzer: React.FC<SemanticAnalysisProps> = ({
    contentType,
    contentId,
    htmlContent
}) => {
    const [analysis, setAnalysis] = useState<SemanticAnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'headings' | 'semantic' | 'accessibility' | 'landmarks'>('overview');

    const runAnalysis = async () => {
        setLoading(true);
        try {
            const response = await fetch('/admin/seo/semantic-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    type: contentType,
                    id: contentId,
                    html: htmlContent,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setAnalysis(data.analysis);
            }
        } catch (error) {
            console.error('Semantic analysis failed:', error);
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

    if (!analysis) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        Semantic HTML Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">
                            Analyze the semantic structure and accessibility of your HTML content.
                        </p>
                        <Button onClick={runAnalysis} disabled={loading}>
                            {loading ? 'Analyzing...' : 'Run Semantic Analysis'}
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
                            <Code className="w-5 h-5" />
                            Semantic HTML Score
                        </span>
                        <Badge variant={getScoreBadge(analysis.score)}>
                            {analysis.score}/100
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                            <Progress value={analysis.score} className="h-3" />
                        </div>
                        <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                            {analysis.score}
                        </span>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-lg font-semibold">{analysis.heading_structure.total_headings}</div>
                            <div className="text-sm text-gray-600">Headings</div>
                        </div>
                        <div>
                            <div className="text-lg font-semibold">{Object.keys(analysis.semantic_elements.found).length}</div>
                            <div className="text-sm text-gray-600">Semantic Elements</div>
                        </div>
                        <div>
                            <div className="text-lg font-semibold">{analysis.accessibility.score}</div>
                            <div className="text-sm text-gray-600">Accessibility Score</div>
                        </div>
                        <div>
                            <div className="text-lg font-semibold">{Math.round(analysis.landmarks.coverage * 100)}%</div>
                            <div className="text-sm text-gray-600">Landmark Coverage</div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <Button onClick={runAnalysis} disabled={loading} variant="outline" size="sm">
                            Re-analyze
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                {[
                    { key: 'overview', label: 'Overview', icon: Eye },
                    { key: 'headings', label: 'Headings', icon: FileText },
                    { key: 'semantic', label: 'Semantic', icon: Code },
                    { key: 'accessibility', label: 'Accessibility', icon: Accessibility },
                    { key: 'landmarks', label: 'Landmarks', icon: CheckCircle },
                ].map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key as 'overview' | 'headings' | 'semantic' | 'accessibility' | 'landmarks')}
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

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Issues */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-600" />
                                Issues Found
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {analysis.issues.length === 0 ? (
                                <p className="text-green-600 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    No major issues found!
                                </p>
                            ) : (
                                <ul className="space-y-2">
                                    {analysis.issues.map((issue, index) => (
                                        <li key={index} className="flex items-start gap-2 text-red-600">
                                            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            {issue}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-blue-600" />
                                Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {analysis.recommendations.length === 0 ? (
                                <p className="text-green-600 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Great job! No recommendations needed.
                                </p>
                            ) : (
                                <ul className="space-y-2">
                                    {analysis.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-2 text-blue-600">
                                            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'headings' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Heading Structure
                            <Badge variant={analysis.heading_structure.hierarchy_valid ? 'default' : 'destructive'}>
                                {analysis.heading_structure.hierarchy_valid ? 'Valid' : 'Invalid'}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">H1 Count</label>
                                <p className={`text-lg font-semibold ${
                                    analysis.heading_structure.h1_count === 1 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {analysis.heading_structure.h1_count}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Total Headings</label>
                                <p className="text-lg font-semibold">{analysis.heading_structure.total_headings}</p>
                            </div>
                        </div>

                        {analysis.heading_structure.headings.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Heading Hierarchy</label>
                                <div className="space-y-2">
                                    {analysis.heading_structure.headings.map((heading, index) => (
                                        <div 
                                            key={index} 
                                            className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                                            style={{ marginLeft: `${(heading.level - 1) * 20}px` }}
                                        >
                                            <Badge variant="outline">H{heading.level}</Badge>
                                            <span className="flex-1 truncate">{heading.text}</span>
                                            <span className="text-xs text-gray-500">{heading.length} chars</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {analysis.heading_structure.issues.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-red-600 mb-2 block">Issues</label>
                                <ul className="space-y-1">
                                    {analysis.heading_structure.issues.map((issue, index) => (
                                        <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                                            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            {issue}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === 'semantic' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code className="w-5 h-5" />
                            Semantic Elements
                            <Badge variant={analysis.semantic_elements.semantic_ratio > 0.3 ? 'default' : 'destructive'}>
                                {Math.round(analysis.semantic_elements.semantic_ratio * 100)}% Semantic
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.keys(analysis.semantic_elements.found).length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Found Elements</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(analysis.semantic_elements.found).map(([element, count]) => (
                                        <Badge key={element} variant="default">
                                            &lt;{element}&gt; ({count})
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {analysis.semantic_elements.missing.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Missing Elements</label>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.semantic_elements.missing.map((element) => (
                                        <Badge key={element} variant="outline">
                                            &lt;{element}&gt;
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {analysis.semantic_elements.recommendations.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-blue-600 mb-2 block">Recommendations</label>
                                <ul className="space-y-1">
                                    {analysis.semantic_elements.recommendations.map((rec, index) => (
                                        <li key={index} className="text-sm text-blue-600 flex items-start gap-2">
                                            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === 'accessibility' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Accessibility className="w-5 h-5" />
                            Accessibility Analysis
                            <Badge variant={getScoreBadge(analysis.accessibility.score)}>
                                {analysis.accessibility.score}/100
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Images without Alt</label>
                                <p className={`text-lg font-semibold ${
                                    analysis.accessibility.images_without_alt === 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {analysis.accessibility.images_without_alt}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Form Inputs</label>
                                <p className="text-lg font-semibold">{analysis.accessibility.input_count}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Form Labels</label>
                                <p className={`text-lg font-semibold ${
                                    analysis.accessibility.input_count <= analysis.accessibility.label_count 
                                        ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {analysis.accessibility.label_count}
                                </p>
                            </div>
                        </div>

                        {analysis.accessibility.issues.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-red-600 mb-2 block">Issues</label>
                                <ul className="space-y-1">
                                    {analysis.accessibility.issues.map((issue, index) => (
                                        <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                                            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            {issue}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {analysis.accessibility.recommendations.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-blue-600 mb-2 block">Recommendations</label>
                                <ul className="space-y-1">
                                    {analysis.accessibility.recommendations.map((rec, index) => (
                                        <li key={index} className="text-sm text-blue-600 flex items-start gap-2">
                                            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === 'landmarks' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            ARIA Landmarks
                            <Badge variant={analysis.landmarks.coverage > 0.6 ? 'default' : 'destructive'}>
                                {Math.round(analysis.landmarks.coverage * 100)}% Coverage
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.keys(analysis.landmarks.found).length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Found Landmarks</label>
                                <div className="space-y-2">
                                    {Object.entries(analysis.landmarks.found).map(([landmark, data]) => (
                                        <div key={landmark} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <span className="font-medium">{landmark}</span>
                                            <div className="text-sm text-gray-600">
                                                {data.semantic_count > 0 && <span>Semantic: {data.semantic_count} </span>}
                                                {data.role_count > 0 && <span>ARIA: {data.role_count}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {analysis.landmarks.missing.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Missing Landmarks</label>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.landmarks.missing.map((landmark) => (
                                        <Badge key={landmark} variant="outline">
                                            {landmark}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};