<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class SafeHtml implements ValidationRule
{
    /**
     * Allowed HTML tags for rich text content
     */
    private array $allowedTags = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 'del',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span'
    ];

    /**
     * Allowed attributes for specific tags
     */
    private array $allowedAttributes = [
        'a' => ['href', 'title', 'target', 'rel'],
        'img' => ['src', 'alt', 'title', 'width', 'height', 'class'],
        'div' => ['class', 'id'],
        'span' => ['class', 'id'],
        'p' => ['class'],
        'h1' => ['class', 'id'],
        'h2' => ['class', 'id'],
        'h3' => ['class', 'id'],
        'h4' => ['class', 'id'],
        'h5' => ['class', 'id'],
        'h6' => ['class', 'id'],
        'table' => ['class'],
        'th' => ['class', 'scope'],
        'td' => ['class', 'colspan', 'rowspan'],
    ];

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value)) {
            return;
        }

        // First check for obviously dangerous content
        $noScriptRule = new NoScriptTags();
        $noScriptRule->validate($attribute, $value, $fail);

        // Parse HTML and validate structure
        if (!$this->isValidHtml($value)) {
            $fail('The :attribute contains invalid HTML structure.');
            return;
        }

        // Check for disallowed tags
        if (!$this->hasOnlyAllowedTags($value)) {
            $fail('The :attribute contains HTML tags that are not allowed.');
            return;
        }

        // Check for disallowed attributes
        if (!$this->hasOnlyAllowedAttributes($value)) {
            $fail('The :attribute contains HTML attributes that are not allowed.');
            return;
        }

        // Check for suspicious URLs
        if (!$this->hasSafeUrls($value)) {
            $fail('The :attribute contains potentially unsafe URLs.');
            return;
        }
    }

    /**
     * Check if HTML is well-formed
     */
    private function isValidHtml(string $html): bool
    {
        // Use DOMDocument to parse and validate HTML structure
        $dom = new \DOMDocument();
        
        // Suppress warnings for malformed HTML
        libxml_use_internal_errors(true);
        
        $result = $dom->loadHTML(
            '<!DOCTYPE html><html><body>' . $html . '</body></html>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
        );
        
        libxml_clear_errors();
        
        return $result !== false;
    }

    /**
     * Check if HTML contains only allowed tags
     */
    private function hasOnlyAllowedTags(string $html): bool
    {
        // Extract all HTML tags
        preg_match_all('/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/i', $html, $matches);
        
        if (empty($matches[1])) {
            return true; // No tags found
        }

        $foundTags = array_map('strtolower', array_unique($matches[1]));
        
        foreach ($foundTags as $tag) {
            if (!in_array($tag, $this->allowedTags)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if HTML contains only allowed attributes
     */
    private function hasOnlyAllowedAttributes(string $html): bool
    {
        $dom = new \DOMDocument();
        libxml_use_internal_errors(true);
        
        if (!$dom->loadHTML('<!DOCTYPE html><html><body>' . $html . '</body></html>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD)) {
            return false;
        }

        $xpath = new \DOMXPath($dom);
        $elements = $xpath->query('//*');

        foreach ($elements as $element) {
            $tagName = strtolower($element->tagName);
            
            // Skip html and body tags added by DOMDocument
            if (in_array($tagName, ['html', 'body'])) {
                continue;
            }

            if ($element->hasAttributes()) {
                foreach ($element->attributes as $attribute) {
                    $attrName = strtolower($attribute->name);
                    
                    // Check if this attribute is allowed for this tag
                    if (!isset($this->allowedAttributes[$tagName]) || 
                        !in_array($attrName, $this->allowedAttributes[$tagName])) {
                        return false;
                    }
                }
            }
        }

        libxml_clear_errors();
        return true;
    }

    /**
     * Check if URLs in HTML are safe
     */
    private function hasSafeUrls(string $html): bool
    {
        // Extract URLs from href and src attributes
        preg_match_all('/(?:href|src)\s*=\s*["\']([^"\']*)["\']/', $html, $matches);
        
        if (empty($matches[1])) {
            return true; // No URLs found
        }

        foreach ($matches[1] as $url) {
            if (!$this->isSafeUrl($url)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if a single URL is safe
     */
    private function isSafeUrl(string $url): bool
    {
        // Allow relative URLs
        if (str_starts_with($url, '/') || str_starts_with($url, '#')) {
            return true;
        }

        // Allow mailto links
        if (str_starts_with($url, 'mailto:')) {
            return filter_var($url, FILTER_VALIDATE_EMAIL) !== false;
        }

        // Allow HTTP and HTTPS URLs
        if (preg_match('/^https?:\/\//', $url)) {
            return filter_var($url, FILTER_VALIDATE_URL) !== false;
        }

        // Reject javascript:, data:, vbscript:, and other protocols
        if (preg_match('/^[a-z][a-z0-9+.-]*:/i', $url)) {
            return false;
        }

        // Allow other relative URLs
        return true;
    }
}