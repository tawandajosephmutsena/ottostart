import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
    Image as ImageIcon, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    Eye,
    FileText,
    Lightbulb,
    Search,
    Folder,
    Upload
} from 'lucide-react';

interface ImageSeoAnalyzerProps {
    mode?: 'single' | 'bulk' | 'content';
}

interface ImageAnalysis {
    path: string;
    alt_text: string | null;
    title: string | null;
    filename_seo: {
        original: string;
        score: number;
        issues: string[];
    };
    file_optimization: {
        file_size: number;
        dimensions: { width: number; height: number };
        format: string;
        score: number;
        issues: string[];
    };
    accessibility: {
        score: number;
        issues: string[];
    };
    score: number;
    issues: string[];
    recommendations: string[];
}

interface BulkSummary {
    total_images: number;
    average_score: number;
    total_issues: number;
    needs_optimization: number;
    optimization_percentage: number;
}

export const ImageSeoAnalyzer: React.FC<ImageSeoAnalyzerProps> = ({ mode = 'single' }) => {
    const [activeTab, setActiveTab] = useState<'analyze' | 'bulk' | 'content'>('analyze');
    const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
    const [bulkResults, setBulkResults] = useState<ImageAnalysis[]>([]);
    const [bulkSummary, setBulkSummary] = useState<BulkSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [directories, setDirectories] = useState<Array<{ path: string; name: string; image_count: number }>>([]);
    const [contentModels, setContentModels] = useState<Array<{ type: string; id: number; title: string; image_count: number }>>([]);

    // Single image analysis state
    const [imagePath, setImagePath] = useState('');
    const [altText, setAltText] = useState('');
    const [titleText, setTitleText] = useState('');
    const [altSuggestions, setAltSuggestions] = useState<string[]>([]);

    // Bulk analysis state
    const [selectedDirectory, setSelectedDirectory] = useState('');

    useEffect(() => {
        loadDirectories();
        loadContentModels();
    }, []);

    const loadDirectories = async () => {
        try {
            const response = await fetch('/admin/image-seo/directories');
            const data = await response.json();
            if (data.success) {
                setDirectories(data.directories);
            }
        } catch (error) {
            console.error('Failed to load directories:', error);
        }
    };

    const loadContentModels = async () => {
        try {
            const response = await fetch('/admin/image-seo/content-models');
            const data = await response.json();
            if (data.success) {
                setContentModels(data.models);
            }
        } catch (error) {
            console.error('Failed to load content models:', error);
        }
    };

    const analyzeSingleImage = async () => {
        if (!imagePath.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('/admin/image-seo/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    path: imagePath,
                    alt_text: altText || null,
                    title: titleText || null,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setAnalysis(data.analysis);
            }
        } catch (error) {
            console.error('Image analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateAltTextSuggestions = async () => {
        if (!imagePath.trim()) return;

        try {
            const response = await fetch('/admin/image-seo/generate-alt-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    path: imagePath,
                    context: titleText || null,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setAltSuggestions(data.suggestions);
            }
        } catch (error) {
            console.error('Failed to generate alt text suggestions:', error);
        }
    };

    const analyzeBulkImages = async () => {
        if (!selectedDirectory) return;

        setLoading(true);
        try {
            const response = await fetch('/admin/image-seo/bulk-analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    directory: selectedDirectory,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setBulkResults(data.results);
                setBulkSummary(data.summary);
            }
        } catch (error) {
            console.error('Bulk analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const bulkOptimizeModels = async (modelType: string, ids: number[] = []) => {
        setLoading(true);
        try {
            const response = await fetch('/admin/image-seo/bulk-optimize-models', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    model_type: modelType,
                    ids: ids,
                }),
            });

            const data = await response.json();
            if (data.success) {
                // Refresh content models after optimization
                loadContentModels();
                return data;
            }
        } catch (error) {
            console.error('Bulk optimization failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const bulkOptimizeFilenames = async (directory: string, description?: string, keywords: string[] = [], applyChanges = false) => {
        setLoading(true);
        try {
            const response = await fetch('/admin/image-seo/bulk-optimize-filenames', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    directory: directory,
                    description: description,
                    keywords: keywords,
                    apply_changes: applyChanges,
                }),
            });

            const data = await response.json();
            if (data.success) {
                return data.results;
            }
        } catch (error) {
            console.error('Filename optimization failed:', error);
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

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Image SEO Optimization
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 mb-4">
                        Analyze and optimize images for better SEO performance, accessibility, and user experience.
                    </p>
                    
                    {/* Tab Navigation */}
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                        {[
                            { key: 'analyze', label: 'Single Image', icon: Eye },
                            { key: 'bulk', label: 'Bulk Analysis', icon: Folder },
                            { key: 'content', label: 'Content Models', icon: FileText },
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key as any)}
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

            {/* Single Image Analysis */}
            {activeTab === 'analyze' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Analyze Single Image</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image Path
                                </label>
                                <Input
                                    value={imagePath}
                                    onChange={(e) => setImagePath(e.target.value)}
                                    placeholder="e.g., uploads/images/example.jpg"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Alt Text (Optional)
                                    </label>
                                    <Textarea
                                        value={altText}
                                        onChange={(e) => setAltText(e.target.value)}
                                        placeholder="Descriptive alt text for the image"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title (Optional)
                                    </label>
                                    <Input
                                        value={titleText}
                                        onChange={(e) => setTitleText(e.target.value)}
                                        placeholder="Image title attribute"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={analyzeSingleImage} disabled={loading || !imagePath.trim()}>
                                    {loading ? 'Analyzing...' : 'Analyze Image'}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={generateAltTextSuggestions}
                                    disabled={!imagePath.trim()}
                                >
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    Generate Alt Text
                                </Button>
                            </div>

                            {/* Alt Text Suggestions */}
                            {altSuggestions.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Alt Text Suggestions
                                    </label>
                                    <div className="space-y-2">
                                        {altSuggestions.map((suggestion, index) => (
                                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                                <span className="flex-1 text-sm">{suggestion}</span>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setAltText(suggestion)}
                                                >
                                                    Use
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Single Image Results */}
                    {analysis && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Analysis Results</span>
                                    <Badge variant={getScoreBadge(analysis.score)}>
                                        {analysis.score}/100
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Overall Score */}
                                <div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="flex-1">
                                            <Progress value={analysis.score} className="h-3" />
                                        </div>
                                        <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                                            {analysis.score}
                                        </span>
                                    </div>
                                </div>

                                {/* Detailed Scores */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-gray-50 rounded">
                                        <div className="text-lg font-semibold">{analysis.filename_seo.score}</div>
                                        <div className="text-sm text-gray-600">Filename SEO</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded">
                                        <div className="text-lg font-semibold">{analysis.file_optimization.score}</div>
                                        <div className="text-sm text-gray-600">File Optimization</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded">
                                        <div className="text-lg font-semibold">{analysis.accessibility.score}</div>
                                        <div className="text-sm text-gray-600">Accessibility</div>
                                    </div>
                                </div>

                                {/* File Information */}
                                <div>
                                    <h4 className="font-medium mb-2">File Information</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Size:</span>
                                            <span className="ml-2">{formatFileSize(analysis.file_optimization.file_size)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Dimensions:</span>
                                            <span className="ml-2">
                                                {analysis.file_optimization.dimensions.width} × {analysis.file_optimization.dimensions.height}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Format:</span>
                                            <span className="ml-2 uppercase">{analysis.file_optimization.format}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Filename:</span>
                                            <span className="ml-2">{analysis.filename_seo.original}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Issues */}
                                {analysis.issues.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2 text-red-600">Issues Found</h4>
                                        <ul className="space-y-1">
                                            {analysis.issues.map((issue, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm text-red-600">
                                                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                    {issue}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Recommendations */}
                                {analysis.recommendations.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2 text-blue-600">Recommendations</h4>
                                        <ul className="space-y-1">
                                            {analysis.recommendations.map((rec, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm text-blue-600">
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
                </div>
            )}

            {/* Bulk Analysis */}
            {activeTab === 'bulk' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bulk Image Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Directory
                                </label>
                                <select
                                    value={selectedDirectory}
                                    onChange={(e) => setSelectedDirectory(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">Choose a directory...</option>
                                    {directories.map((dir) => (
                                        <option key={dir.path} value={dir.path}>
                                            {dir.name} ({dir.image_count} images)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Button 
                                onClick={analyzeBulkImages} 
                                disabled={loading || !selectedDirectory}
                            >
                                {loading ? 'Analyzing...' : 'Analyze Directory'}
                            </Button>
                            
                            {selectedDirectory && (
                                <Button 
                                    variant="outline"
                                    onClick={() => bulkOptimizeFilenames(selectedDirectory, '', [], false)}
                                    disabled={loading}
                                >
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    Optimize Filenames
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Bulk Results Summary */}
                    {bulkSummary && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Analysis Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold">{bulkSummary.total_images}</div>
                                        <div className="text-sm text-gray-600">Total Images</div>
                                    </div>
                                    <div>
                                        <div className={`text-2xl font-bold ${getScoreColor(bulkSummary.average_score)}`}>
                                            {bulkSummary.average_score}
                                        </div>
                                        <div className="text-sm text-gray-600">Average Score</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-red-600">{bulkSummary.total_issues}</div>
                                        <div className="text-sm text-gray-600">Total Issues</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-orange-600">{bulkSummary.needs_optimization}</div>
                                        <div className="text-sm text-gray-600">Need Optimization</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">{bulkSummary.optimization_percentage}%</div>
                                        <div className="text-sm text-gray-600">Optimized</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Bulk Results List */}
                    {bulkResults.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Individual Results</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {bulkResults.map((result, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 border rounded">
                                            <div className="flex-1">
                                                <div className="font-medium">{result.filename_seo.original}</div>
                                                <div className="text-sm text-gray-600">
                                                    {formatFileSize(result.file_optimization.file_size)} • 
                                                    {result.file_optimization.dimensions.width} × {result.file_optimization.dimensions.height} • 
                                                    {result.file_optimization.format.toUpperCase()}
                                                </div>
                                                {result.issues.length > 0 && (
                                                    <div className="text-sm text-red-600 mt-1">
                                                        {result.issues.length} issue(s) found
                                                    </div>
                                                )}
                                            </div>
                                            <Badge variant={getScoreBadge(result.score)}>
                                                {result.score}/100
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Content Models */}
            {activeTab === 'content' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Content Model Images</span>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => bulkOptimizeModels('portfolio')}
                                    disabled={loading}
                                >
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    Optimize All Portfolio
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => bulkOptimizeModels('insight')}
                                    disabled={loading}
                                >
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    Optimize All Insights
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => bulkOptimizeModels('service')}
                                    disabled={loading}
                                >
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    Optimize All Services
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => bulkOptimizeModels('media')}
                                    disabled={loading}
                                >
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    Optimize All Media
                                </Button>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {contentModels.map((model, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border rounded">
                                    <div>
                                        <div className="font-medium">{model.title}</div>
                                        <div className="text-sm text-gray-600">
                                            {model.type} • {model.image_count} image(s)
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                // TODO: Implement content model analysis
                                                console.log('Analyze', model);
                                            }}
                                        >
                                            Analyze
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => bulkOptimizeModels(model.type, [model.id])}
                                            disabled={loading}
                                        >
                                            <Lightbulb className="w-4 h-4 mr-2" />
                                            Optimize
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};