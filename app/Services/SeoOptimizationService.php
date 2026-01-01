<?php

namespace App\Services;

use Illuminate\Support\Str;

class SeoOptimizationService
{
    /**
     * Optimize page title for SEO
     */
    public function optimizeTitle(string $title, ?string $siteName = null, array $options = []): array
    {
        $siteName = $siteName ?? config('seo.site_name', config('app.name'));
        $separator = $options['separator'] ?? config('seo.title_separator', ' | ');
        $maxLength = $options['max_length'] ?? 60;
        $minLength = $options['min_length'] ?? 30;

        $analysis = [
            'original' => $title,
            'optimized' => $title,
            'length' => strlen($title),
            'issues' => [],
            'suggestions' => [],
            'score' => 100,
        ];

        // Check title length
        if (strlen($title) < $minLength) {
            $analysis['issues'][] = "Title is too short ({$analysis['length']} chars). Aim for {$minLength}-{$maxLength} characters.";
            $analysis['suggestions'][] = 'Consider adding descriptive keywords to make the title more informative.';
            $analysis['score'] -= 20;
        } elseif (strlen($title) > $maxLength) {
            $analysis['issues'][] = "Title is too long ({$analysis['length']} chars). Keep it under {$maxLength} characters.";
            $analysis['suggestions'][] = 'Shorten the title while keeping the most important keywords.';
            $analysis['score'] -= 15;
        }

        // Generate optimized title with site name
        $fullTitle = $title . $separator . $siteName;
        $fullTitleLength = strlen($fullTitle);

        if ($fullTitleLength > $maxLength) {
            // Truncate title to fit with site name
            $availableLength = $maxLength - strlen($separator . $siteName) - 3; // 3 for ellipsis
            if ($availableLength > 0) {
                $analysis['optimized'] = Str::limit($title, $availableLength, '...') . $separator . $siteName;
                $analysis['suggestions'][] = 'Title was truncated to fit within recommended length with site name.';
            }
        } else {
            $analysis['optimized'] = $fullTitle;
        }

        // Check for keyword stuffing
        $words = str_word_count(strtolower($title), 1);
        $wordCounts = array_count_values($words);
        $repeatedWords = array_filter($wordCounts, fn($count) => $count > 2);
        
        if (!empty($repeatedWords)) {
            $analysis['issues'][] = 'Possible keyword stuffing detected: ' . implode(', ', array_keys($repeatedWords));
            $analysis['suggestions'][] = 'Avoid repeating keywords too frequently in the title.';
            $analysis['score'] -= 10;
        }

        // Check for stop words at the beginning
        $stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        $firstWord = strtolower(explode(' ', trim($title))[0] ?? '');
        
        if (in_array($firstWord, $stopWords)) {
            $analysis['suggestions'][] = 'Consider starting the title with a more impactful keyword instead of "' . $firstWord . '".';
            $analysis['score'] -= 5;
        }

        // Check for title case
        if ($title === strtoupper($title)) {
            $analysis['issues'][] = 'Title is in all caps, which may appear as shouting.';
            $analysis['suggestions'][] = 'Use proper title case for better readability.';
            $analysis['score'] -= 10;
        }

        return $analysis;
    }

    /**
     * Optimize meta description for SEO
     */
    public function optimizeDescription(string $description, array $options = []): array
    {
        $maxLength = $options['max_length'] ?? 160;
        $minLength = $options['min_length'] ?? 120;

        $analysis = [
            'original' => $description,
            'optimized' => $description,
            'length' => strlen($description),
            'issues' => [],
            'suggestions' => [],
            'score' => 100,
        ];

        // Check description length
        if (strlen($description) < $minLength) {
            $analysis['issues'][] = "Description is too short ({$analysis['length']} chars). Aim for {$minLength}-{$maxLength} characters.";
            $analysis['suggestions'][] = 'Expand the description with more relevant details and keywords.';
            $analysis['score'] -= 20;
        } elseif (strlen($description) > $maxLength) {
            $analysis['issues'][] = "Description is too long ({$analysis['length']} chars). Keep it under {$maxLength} characters.";
            $analysis['optimized'] = Str::limit($description, $maxLength - 3, '...');
            $analysis['suggestions'][] = 'Description was truncated to fit within recommended length.';
            $analysis['score'] -= 15;
        }

        // Check for duplicate content (title in description)
        if (isset($options['title'])) {
            $titleWords = explode(' ', strtolower($options['title']));
            $descWords = explode(' ', strtolower($description));
            $commonWords = array_intersect($titleWords, $descWords);
            
            if (count($commonWords) > count($titleWords) * 0.7) {
                $analysis['issues'][] = 'Description is too similar to the title.';
                $analysis['suggestions'][] = 'Make the description complement the title with additional information.';
                $analysis['score'] -= 15;
            }
        }

        // Check for call-to-action
        $ctaWords = ['learn', 'discover', 'find', 'get', 'try', 'start', 'explore', 'see', 'read', 'download'];
        $hasCallToAction = false;
        
        foreach ($ctaWords as $cta) {
            if (str_contains(strtolower($description), $cta)) {
                $hasCallToAction = true;
                break;
            }
        }

        if (!$hasCallToAction) {
            $analysis['suggestions'][] = 'Consider adding a call-to-action to encourage clicks.';
            $analysis['score'] -= 5;
        }

        // Check for proper sentence structure
        if (!str_ends_with(trim($description), '.') && !str_ends_with(trim($description), '!') && !str_ends_with(trim($description), '?')) {
            $analysis['suggestions'][] = 'End the description with proper punctuation.';
            $analysis['score'] -= 5;
        }

        // Check for keyword density
        if (isset($options['keywords']) && is_array($options['keywords'])) {
            $keywordCount = 0;
            foreach ($options['keywords'] as $keyword) {
                $keywordCount += substr_count(strtolower($description), strtolower($keyword));
            }
            
            $wordCount = str_word_count($description);
            $keywordDensity = $wordCount > 0 ? ($keywordCount / $wordCount) * 100 : 0;
            
            if ($keywordDensity < 1) {
                $analysis['suggestions'][] = 'Consider including more relevant keywords in the description.';
                $analysis['score'] -= 5;
            } elseif ($keywordDensity > 5) {
                $analysis['issues'][] = 'Keyword density is too high (' . round($keywordDensity, 1) . '%). Aim for 1-3%.';
                $analysis['suggestions'][] = 'Reduce keyword repetition for more natural reading.';
                $analysis['score'] -= 10;
            }
        }

        return $analysis;
    }

    /**
     * Generate SEO-optimized title suggestions
     */
    public function generateTitleSuggestions(string $baseTitle, array $keywords = [], array $options = []): array
    {
        $suggestions = [];
        $siteName = $options['site_name'] ?? config('seo.site_name');
        
        // Template-based suggestions
        $templates = [
            '{title} - {siteName}',
            '{title} | {siteName}',
            '{keyword} - {title}',
            '{title}: {keyword}',
            'Best {title} - {siteName}',
            '{title} Guide - {siteName}',
            'How to {title} - {siteName}',
            '{title} Tips & Tricks',
        ];

        foreach ($templates as $template) {
            $suggestion = str_replace(
                ['{title}', '{siteName}', '{keyword}'],
                [$baseTitle, $siteName, $keywords[0] ?? ''],
                $template
            );
            
            if (strlen($suggestion) <= 60 && !empty(trim($suggestion))) {
                $suggestions[] = $suggestion;
            }
        }

        // Keyword-based suggestions
        foreach ($keywords as $keyword) {
            $keywordSuggestions = [
                $keyword . ' - ' . $baseTitle,
                $baseTitle . ' for ' . $keyword,
                $baseTitle . ': ' . $keyword . ' Guide',
            ];
            
            foreach ($keywordSuggestions as $suggestion) {
                if (strlen($suggestion) <= 60) {
                    $suggestions[] = $suggestion;
                }
            }
        }

        return array_unique($suggestions);
    }

    /**
     * Generate SEO-optimized description suggestions
     */
    public function generateDescriptionSuggestions(string $title, string $content = '', array $keywords = []): array
    {
        $suggestions = [];
        
        // Extract key sentences from content
        if (!empty($content)) {
            $sentences = preg_split('/[.!?]+/', strip_tags($content));
            $sentences = array_filter(array_map('trim', $sentences));
            
            foreach ($sentences as $sentence) {
                if (strlen($sentence) >= 50 && strlen($sentence) <= 160) {
                    $suggestions[] = $sentence . '.';
                }
            }
        }

        // Template-based suggestions
        $templates = [
            'Discover {title} and learn how to {keyword}. Get expert insights and practical tips.',
            'Learn about {title} with our comprehensive guide. Find everything you need to know about {keyword}.',
            'Explore {title} and unlock the power of {keyword}. Start your journey today.',
            'Get the ultimate guide to {title}. Master {keyword} with our expert advice and tips.',
        ];

        foreach ($templates as $template) {
            $suggestion = str_replace(
                ['{title}', '{keyword}'],
                [strtolower($title), $keywords[0] ?? 'success'],
                $template
            );
            
            if (strlen($suggestion) <= 160) {
                $suggestions[] = $suggestion;
            }
        }

        return array_slice(array_unique($suggestions), 0, 5);
    }

    /**
     * Analyze content for SEO keywords
     */
    public function extractKeywords(string $content, int $limit = 10): array
    {
        // Remove HTML tags and normalize text
        $text = strip_tags($content);
        $text = strtolower($text);
        $text = preg_replace('/[^a-z0-9\s]/', ' ', $text);
        
        // Remove common stop words
        $stopWords = [
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does',
            'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
            'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
            'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
        ];
        
        // Extract words and filter
        preg_match_all('/\b\w{3,}\b/', $text, $matches);
        $words = array_diff($matches[0], $stopWords);
        
        // Count word frequency
        $wordCount = array_count_values($words);
        arsort($wordCount);
        
        // Extract phrases (2-3 words)
        $phrases = [];
        $sentences = preg_split('/[.!?]+/', $text);
        
        foreach ($sentences as $sentence) {
            $sentenceWords = explode(' ', trim($sentence));
            $sentenceWords = array_filter($sentenceWords, fn($word) => strlen($word) > 2);
            
            // Extract 2-word phrases
            for ($i = 0; $i < count($sentenceWords) - 1; $i++) {
                $phrase = $sentenceWords[$i] . ' ' . $sentenceWords[$i + 1];
                if (!in_array($sentenceWords[$i], $stopWords) && !in_array($sentenceWords[$i + 1], $stopWords)) {
                    $phrases[] = $phrase;
                }
            }
            
            // Extract 3-word phrases
            for ($i = 0; $i < count($sentenceWords) - 2; $i++) {
                $phrase = $sentenceWords[$i] . ' ' . $sentenceWords[$i + 1] . ' ' . $sentenceWords[$i + 2];
                if (!in_array($sentenceWords[$i], $stopWords) && 
                    !in_array($sentenceWords[$i + 1], $stopWords) && 
                    !in_array($sentenceWords[$i + 2], $stopWords)) {
                    $phrases[] = $phrase;
                }
            }
        }
        
        $phraseCount = array_count_values($phrases);
        arsort($phraseCount);
        
        // Combine single words and phrases
        $keywords = [];
        
        // Add top phrases first
        foreach (array_slice($phraseCount, 0, $limit / 2, true) as $phrase => $count) {
            if ($count > 1) {
                $keywords[] = $phrase;
            }
        }
        
        // Fill remaining with single words
        $remaining = $limit - count($keywords);
        foreach (array_slice($wordCount, 0, $remaining, true) as $word => $count) {
            if ($count > 2 && strlen($word) > 3) {
                $keywords[] = $word;
            }
        }
        
        return array_slice($keywords, 0, $limit);
    }

    /**
     * Get comprehensive SEO analysis for a page
     */
    public function analyzePage(array $pageData): array
    {
        $title = $pageData['title'] ?? '';
        $description = $pageData['description'] ?? '';
        $content = $pageData['content'] ?? '';
        $keywords = $pageData['keywords'] ?? [];

        // Extract keywords from content if not provided
        if (empty($keywords) && !empty($content)) {
            $keywords = $this->extractKeywords($content);
        }

        $analysis = [
            'title' => $this->optimizeTitle($title),
            'description' => $this->optimizeDescription($description, [
                'title' => $title,
                'keywords' => $keywords,
            ]),
            'keywords' => $keywords,
            'suggestions' => [
                'titles' => $this->generateTitleSuggestions($title, $keywords),
                'descriptions' => $this->generateDescriptionSuggestions($title, $content, $keywords),
            ],
        ];

        // Calculate overall score
        $totalScore = ($analysis['title']['score'] + $analysis['description']['score']) / 2;
        $analysis['overall_score'] = round($totalScore);
        $analysis['grade'] = $this->getScoreGrade($totalScore);

        return $analysis;
    }

    /**
     * Get letter grade based on score
     */
    private function getScoreGrade(float $score): string
    {
        if ($score >= 90) return 'A';
        if ($score >= 80) return 'B';
        if ($score >= 70) return 'C';
        if ($score >= 60) return 'D';
        return 'F';
    }
}