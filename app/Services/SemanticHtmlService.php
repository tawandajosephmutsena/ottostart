<?php

namespace App\Services;

class SemanticHtmlService
{
    /**
     * Analyze HTML content for semantic structure
     */
    public function analyzeSemanticStructure(string $html): array
    {
        $analysis = [
            'heading_structure' => $this->analyzeHeadingStructure($html),
            'semantic_elements' => $this->analyzeSemanticElements($html),
            'accessibility' => $this->analyzeAccessibility($html),
            'landmarks' => $this->analyzeLandmarks($html),
            'score' => 0,
            'issues' => [],
            'recommendations' => [],
        ];

        // Calculate overall score
        $analysis['score'] = $this->calculateSemanticScore($analysis);

        return $analysis;
    }

    /**
     * Analyze heading hierarchy (H1-H6)
     */
    private function analyzeHeadingStructure(string $html): array
    {
        $headings = [];
        $issues = [];
        
        // Extract all headings
        preg_match_all('/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/i', $html, $matches, PREG_SET_ORDER);
        
        foreach ($matches as $match) {
            $level = (int) $match[1];
            $text = strip_tags($match[2]);
            $headings[] = [
                'level' => $level,
                'text' => trim($text),
                'length' => strlen(trim($text)),
            ];
        }

        // Check for H1
        $h1Count = count(array_filter($headings, fn($h) => $h['level'] === 1));
        if ($h1Count === 0) {
            $issues[] = 'Missing H1 tag - every page should have exactly one H1';
        } elseif ($h1Count > 1) {
            $issues[] = 'Multiple H1 tags found - use only one H1 per page';
        }

        // Check heading hierarchy
        $previousLevel = 0;
        foreach ($headings as $heading) {
            if ($heading['level'] > $previousLevel + 1 && $previousLevel > 0) {
                $issues[] = "Heading hierarchy skip detected: H{$previousLevel} to H{$heading['level']}";
            }
            $previousLevel = $heading['level'];
        }

        // Check empty headings
        $emptyHeadings = array_filter($headings, fn($h) => empty($h['text']));
        if (!empty($emptyHeadings)) {
            $issues[] = count($emptyHeadings) . ' empty heading(s) found';
        }

        // Check heading length
        $longHeadings = array_filter($headings, fn($h) => $h['length'] > 70);
        if (!empty($longHeadings)) {
            $issues[] = count($longHeadings) . ' heading(s) are too long (over 70 characters)';
        }

        return [
            'headings' => $headings,
            'h1_count' => $h1Count,
            'total_headings' => count($headings),
            'issues' => $issues,
            'hierarchy_valid' => empty($issues),
        ];
    }

    /**
     * Analyze semantic HTML5 elements
     */
    private function analyzeSemanticElements(string $html): array
    {
        $semanticElements = [
            'header' => 'Page/section header',
            'nav' => 'Navigation',
            'main' => 'Main content',
            'article' => 'Standalone content',
            'section' => 'Thematic grouping',
            'aside' => 'Sidebar content',
            'footer' => 'Page/section footer',
            'figure' => 'Self-contained content',
            'figcaption' => 'Figure caption',
            'time' => 'Date/time',
            'address' => 'Contact information',
        ];

        $found = [];
        $missing = [];
        $recommendations = [];

        foreach ($semanticElements as $element => $description) {
            $count = preg_match_all("/<{$element}[^>]*>/i", $html);
            if ($count > 0) {
                $found[$element] = $count;
            } else {
                $missing[] = $element;
            }
        }

        // Generate recommendations
        if (!isset($found['main'])) {
            $recommendations[] = 'Add a <main> element to identify the primary content area';
        }

        if (!isset($found['header'])) {
            $recommendations[] = 'Consider adding a <header> element for page/section headers';
        }

        if (!isset($found['nav'])) {
            $recommendations[] = 'Use <nav> elements for navigation menus';
        }

        if (!isset($found['footer'])) {
            $recommendations[] = 'Add a <footer> element for page/section footers';
        }

        // Check for overuse of divs
        $divCount = preg_match_all('/<div[^>]*>/i', $html);
        $semanticCount = array_sum($found);
        
        if ($divCount > $semanticCount * 2) {
            $recommendations[] = 'Consider replacing some <div> elements with semantic HTML5 elements';
        }

        return [
            'found' => $found,
            'missing' => $missing,
            'recommendations' => $recommendations,
            'semantic_ratio' => $divCount > 0 ? $semanticCount / ($divCount + $semanticCount) : 1,
        ];
    }

    /**
     * Analyze accessibility features
     */
    private function analyzeAccessibility(string $html): array
    {
        $issues = [];
        $recommendations = [];
        $score = 100;

        // Check for alt attributes on images
        preg_match_all('/<img[^>]*>/i', $html, $imgMatches);
        $imagesWithoutAlt = 0;
        
        foreach ($imgMatches[0] as $img) {
            if (!preg_match('/alt\s*=\s*["\'][^"\']*["\']/i', $img)) {
                $imagesWithoutAlt++;
            }
        }

        if ($imagesWithoutAlt > 0) {
            $issues[] = "{$imagesWithoutAlt} image(s) missing alt attributes";
            $recommendations[] = 'Add descriptive alt text to all images for screen readers';
            $score -= 20;
        }

        // Check for form labels
        preg_match_all('/<input[^>]*>/i', $html, $inputMatches);
        preg_match_all('/<label[^>]*>/i', $html, $labelMatches);
        
        $inputCount = count($inputMatches[0]);
        $labelCount = count($labelMatches[0]);
        
        if ($inputCount > $labelCount) {
            $issues[] = 'Some form inputs may be missing labels';
            $recommendations[] = 'Ensure all form inputs have associated labels';
            $score -= 15;
        }

        // Check for skip links
        if (!preg_match('/skip\s+to\s+(main|content)/i', $html)) {
            $recommendations[] = 'Consider adding skip navigation links for keyboard users';
            $score -= 5;
        }

        // Check for ARIA landmarks
        $ariaLandmarks = preg_match_all('/role\s*=\s*["\'](?:banner|navigation|main|complementary|contentinfo)["\']/', $html);
        if ($ariaLandmarks === 0) {
            $recommendations[] = 'Consider adding ARIA landmark roles for better screen reader navigation';
            $score -= 10;
        }

        // Check for focus management
        if (!preg_match('/tabindex\s*=/', $html)) {
            $recommendations[] = 'Consider managing focus order with tabindex where appropriate';
        }

        return [
            'images_without_alt' => $imagesWithoutAlt,
            'input_count' => $inputCount,
            'label_count' => $labelCount,
            'aria_landmarks' => $ariaLandmarks,
            'issues' => $issues,
            'recommendations' => $recommendations,
            'score' => max(0, $score),
        ];
    }

    /**
     * Analyze ARIA landmarks and roles
     */
    private function analyzeLandmarks(string $html): array
    {
        $landmarks = [
            'banner' => 'Site header',
            'navigation' => 'Navigation menu',
            'main' => 'Main content',
            'complementary' => 'Sidebar/aside',
            'contentinfo' => 'Site footer',
            'search' => 'Search functionality',
            'form' => 'Form region',
        ];

        $found = [];
        $missing = [];

        foreach ($landmarks as $landmark => $description) {
            // Check for both role attribute and semantic elements
            $roleCount = preg_match_all("/role\s*=\s*[\"']{$landmark}[\"']/i", $html);
            $semanticCount = 0;
            
            // Map landmarks to semantic elements
            switch ($landmark) {
                case 'banner':
                    $semanticCount = preg_match_all('/<header[^>]*>/i', $html);
                    break;
                case 'navigation':
                    $semanticCount = preg_match_all('/<nav[^>]*>/i', $html);
                    break;
                case 'main':
                    $semanticCount = preg_match_all('/<main[^>]*>/i', $html);
                    break;
                case 'complementary':
                    $semanticCount = preg_match_all('/<aside[^>]*>/i', $html);
                    break;
                case 'contentinfo':
                    $semanticCount = preg_match_all('/<footer[^>]*>/i', $html);
                    break;
            }

            $totalCount = $roleCount + $semanticCount;
            
            if ($totalCount > 0) {
                $found[$landmark] = [
                    'role_count' => $roleCount,
                    'semantic_count' => $semanticCount,
                    'total' => $totalCount,
                ];
            } else {
                $missing[] = $landmark;
            }
        }

        return [
            'found' => $found,
            'missing' => $missing,
            'coverage' => count($found) / count($landmarks),
        ];
    }

    /**
     * Calculate overall semantic score
     */
    private function calculateSemanticScore(array $analysis): int
    {
        $score = 100;

        // Heading structure (30 points)
        if (!$analysis['heading_structure']['hierarchy_valid']) {
            $score -= 15;
        }
        if ($analysis['heading_structure']['h1_count'] !== 1) {
            $score -= 15;
        }

        // Semantic elements (25 points)
        $semanticScore = $analysis['semantic_elements']['semantic_ratio'] * 25;
        $score -= (25 - $semanticScore);

        // Accessibility (25 points)
        $accessibilityScore = $analysis['accessibility']['score'] * 0.25;
        $score -= (25 - $accessibilityScore);

        // Landmarks (20 points)
        $landmarkScore = $analysis['landmarks']['coverage'] * 20;
        $score -= (20 - $landmarkScore);

        return max(0, min(100, round($score)));
    }

    /**
     * Generate semantic HTML recommendations
     */
    public function generateRecommendations(array $analysis): array
    {
        $recommendations = [];

        // Heading recommendations
        foreach ($analysis['heading_structure']['issues'] as $issue) {
            $recommendations[] = [
                'type' => 'heading',
                'priority' => 'high',
                'issue' => $issue,
                'solution' => $this->getHeadingSolution($issue),
            ];
        }

        // Semantic element recommendations
        foreach ($analysis['semantic_elements']['recommendations'] as $rec) {
            $recommendations[] = [
                'type' => 'semantic',
                'priority' => 'medium',
                'issue' => $rec,
                'solution' => $this->getSemanticSolution($rec),
            ];
        }

        // Accessibility recommendations
        foreach ($analysis['accessibility']['recommendations'] as $rec) {
            $recommendations[] = [
                'type' => 'accessibility',
                'priority' => 'high',
                'issue' => $rec,
                'solution' => $this->getAccessibilitySolution($rec),
            ];
        }

        return $recommendations;
    }

    /**
     * Get solution for heading issues
     */
    private function getHeadingSolution(string $issue): string
    {
        if (str_contains($issue, 'Missing H1')) {
            return 'Add a single H1 tag that describes the main topic of the page';
        }
        
        if (str_contains($issue, 'Multiple H1')) {
            return 'Use only one H1 per page. Convert additional H1s to H2 or lower';
        }
        
        if (str_contains($issue, 'hierarchy skip')) {
            return 'Ensure heading levels follow a logical sequence (H1 → H2 → H3, etc.)';
        }
        
        if (str_contains($issue, 'empty heading')) {
            return 'Add descriptive text to all headings or remove empty ones';
        }
        
        if (str_contains($issue, 'too long')) {
            return 'Keep headings concise (under 70 characters) for better readability';
        }

        return 'Review and fix heading structure for better SEO and accessibility';
    }

    /**
     * Get solution for semantic element issues
     */
    private function getSemanticSolution(string $issue): string
    {
        if (str_contains($issue, '<main>')) {
            return 'Wrap your primary content in a <main> element';
        }
        
        if (str_contains($issue, '<header>')) {
            return 'Use <header> for page or section headers instead of generic divs';
        }
        
        if (str_contains($issue, '<nav>')) {
            return 'Wrap navigation menus in <nav> elements';
        }
        
        if (str_contains($issue, '<footer>')) {
            return 'Use <footer> for page or section footers';
        }
        
        if (str_contains($issue, '<div>')) {
            return 'Replace generic <div> elements with semantic HTML5 elements where appropriate';
        }

        return 'Use semantic HTML5 elements to improve document structure';
    }

    /**
     * Get solution for accessibility issues
     */
    private function getAccessibilitySolution(string $issue): string
    {
        if (str_contains($issue, 'alt text')) {
            return 'Add descriptive alt attributes to all images: <img src="..." alt="Description">';
        }
        
        if (str_contains($issue, 'labels')) {
            return 'Associate labels with form inputs using for/id attributes or wrap inputs in labels';
        }
        
        if (str_contains($issue, 'skip')) {
            return 'Add skip navigation links: <a href="#main" class="skip-link">Skip to main content</a>';
        }
        
        if (str_contains($issue, 'ARIA')) {
            return 'Add ARIA landmark roles: role="banner", role="navigation", role="main", etc.';
        }
        
        if (str_contains($issue, 'focus')) {
            return 'Manage focus order with tabindex and ensure interactive elements are keyboard accessible';
        }

        return 'Improve accessibility by following WCAG guidelines';
    }
}