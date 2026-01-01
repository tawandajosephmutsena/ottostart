<?php

namespace App\Traits;

use App\Services\SemanticHtmlService;

trait HasSemanticAnalysis
{
    /**
     * Get semantic HTML analysis for this model's rendered content
     */
    public function getSemanticAnalysis(?string $html = null): array
    {
        $semanticService = app(SemanticHtmlService::class);
        
        // Use provided HTML or try to render the model's content
        $htmlContent = $html ?? $this->renderToHtml();
        
        if (empty($htmlContent)) {
            return [
                'error' => 'No HTML content available for analysis',
                'score' => 0,
            ];
        }

        return $semanticService->analyzeSemanticStructure($htmlContent);
    }

    /**
     * Get semantic recommendations for this model
     */
    public function getSemanticRecommendations(?string $html = null): array
    {
        $analysis = $this->getSemanticAnalysis($html);
        
        if (isset($analysis['error'])) {
            return [];
        }

        $semanticService = app(SemanticHtmlService::class);
        return $semanticService->generateRecommendations($analysis);
    }

    /**
     * Render model content to HTML for analysis
     * This method should be overridden in models that use this trait
     */
    protected function renderToHtml(): string
    {
        // Default implementation - try to get content from common fields
        $content = '';
        
        // Add title as H1 if available
        if (isset($this->attributes['title'])) {
            $content .= '<h1>' . htmlspecialchars($this->attributes['title']) . '</h1>';
        }

        // Add content body
        if (isset($this->attributes['content'])) {
            if (is_array($this->attributes['content'])) {
                // Handle JSON content structure
                $contentData = $this->attributes['content'];
                
                if (isset($contentData['body'])) {
                    $content .= $contentData['body'];
                } elseif (isset($contentData['blocks'])) {
                    // Handle block-based content
                    foreach ($contentData['blocks'] as $block) {
                        if (isset($block['data']['text'])) {
                            $content .= '<p>' . $block['data']['text'] . '</p>';
                        }
                    }
                } else {
                    // Flatten array content
                    $content .= implode(' ', array_filter($contentData, 'is_string'));
                }
            } else {
                $content .= $this->attributes['content'];
            }
        }

        // Add description/excerpt
        if (isset($this->attributes['description'])) {
            $content .= '<p>' . htmlspecialchars($this->attributes['description']) . '</p>';
        } elseif (isset($this->attributes['excerpt'])) {
            $content .= '<p>' . htmlspecialchars($this->attributes['excerpt']) . '</p>';
        }

        return $content;
    }

    /**
     * Check if content has proper heading structure
     */
    public function hasProperHeadingStructure(?string $html = null): bool
    {
        $analysis = $this->getSemanticAnalysis($html);
        
        if (isset($analysis['error'])) {
            return false;
        }

        return $analysis['heading_structure']['hierarchy_valid'] && 
               $analysis['heading_structure']['h1_count'] === 1;
    }

    /**
     * Check if content uses semantic HTML elements
     */
    public function usesSemanticHtml(?string $html = null): bool
    {
        $analysis = $this->getSemanticAnalysis($html);
        
        if (isset($analysis['error'])) {
            return false;
        }

        return $analysis['semantic_elements']['semantic_ratio'] > 0.3; // At least 30% semantic elements
    }

    /**
     * Check accessibility compliance
     */
    public function isAccessibilityCompliant(?string $html = null): bool
    {
        $analysis = $this->getSemanticAnalysis($html);
        
        if (isset($analysis['error'])) {
            return false;
        }

        return $analysis['accessibility']['score'] >= 80; // At least 80% accessibility score
    }

    /**
     * Get semantic score for this content
     */
    public function getSemanticScore(?string $html = null): int
    {
        $analysis = $this->getSemanticAnalysis($html);
        
        if (isset($analysis['error'])) {
            return 0;
        }

        return $analysis['score'];
    }

    /**
     * Get heading structure summary
     */
    public function getHeadingStructure(?string $html = null): array
    {
        $analysis = $this->getSemanticAnalysis($html);
        
        if (isset($analysis['error'])) {
            return [];
        }

        return $analysis['heading_structure'];
    }

    /**
     * Get accessibility issues
     */
    public function getAccessibilityIssues(?string $html = null): array
    {
        $analysis = $this->getSemanticAnalysis($html);
        
        if (isset($analysis['error'])) {
            return [];
        }

        return $analysis['accessibility']['issues'];
    }

    /**
     * Generate optimized HTML structure suggestions
     */
    public function getHtmlOptimizationSuggestions(?string $html = null): array
    {
        $recommendations = $this->getSemanticRecommendations($html);
        $suggestions = [];

        foreach ($recommendations as $rec) {
            $suggestions[] = [
                'category' => $rec['type'],
                'priority' => $rec['priority'],
                'issue' => $rec['issue'],
                'solution' => $rec['solution'],
            ];
        }

        return $suggestions;
    }
}