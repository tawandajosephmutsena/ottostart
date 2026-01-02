<?php

namespace App\Services;

class ContentTaggingService
{
    /**
     * Common English stop words to ignore
     */
    protected array $stopWords = [
        'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
        'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
        'can', 'cannot', 'could', 'couldn\'t',
        'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
        'each',
        'few', 'for', 'from', 'further',
        'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s',
        'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself',
        'let\'s',
        'me', 'more', 'most', 'mustn\'t', 'my', 'myself',
        'no', 'nor', 'not',
        'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
        'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such',
        'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
        'under', 'until', 'up',
        'very',
        'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t',
        'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
    ];

    /**
     * Generate tags from content
     */
    public function generateTags(string $content, int $limit = 10): array
    {
        // Strip HTML tags
        $text = strip_tags($content);
        
        // Convert to lowercase and remove non-word characters
        $text = strtolower($text);
        $text = preg_replace('/[^\w\s]/', '', $text);
        
        // Tokenize
        $words = str_word_count($text, 1);
        
        // Remove stop words and short words
        $filteredWords = array_filter($words, function ($word) {
            return strlen($word) > 2 && !in_array($word, $this->stopWords);
        });
        
        // Count frequencies
        $frequencies = array_count_values($filteredWords);
        
        // Sort by frequency descending
        arsort($frequencies);
        
        // Return top N
        return array_keys(array_slice($frequencies, 0, $limit));
    }

    /**
     * Suggest optimization for content based on keywords
     */
    public function getOptimizationSuggestions(string $content, array $targetKeywords = []): array
    {
        $generatedTags = $this->generateTags($content, 20);
        $suggestions = [];

        if (empty($generatedTags)) {
            $suggestions[] = 'Content seems too short to analyze. Add more text.';
        }

        if (!empty($targetKeywords)) {
            foreach ($targetKeywords as $keyword) {
                if (!in_array(strtolower($keyword), $generatedTags)) {
                    $suggestions[] = "Target keyword '{$keyword}' appears to be missing or low frequency.";
                }
            }
        }

        return [
            'detected_keywords' => array_slice($generatedTags, 0, 5),
            'suggestions' => $suggestions
        ];
    }
}
