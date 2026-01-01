<?php

namespace App\Services;

class HtmlPurifierService
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
     * Purify HTML content
     */
    public function purify(string $html): string
    {
        // Remove dangerous content first
        $html = $this->removeDangerousContent($html);
        
        // Parse and clean HTML
        $dom = new \DOMDocument();
        libxml_use_internal_errors(true);
        
        // Load HTML with UTF-8 encoding
        $dom->loadHTML(
            '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>' . $html . '</body></html>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
        );
        
        $xpath = new \DOMXPath($dom);
        $body = $xpath->query('//body')->item(0);
        
        if (!$body) {
            return '';
        }
        
        // Clean the DOM
        $this->cleanDomNode($body);
        
        // Get the cleaned HTML
        $cleanedHtml = '';
        foreach ($body->childNodes as $node) {
            $cleanedHtml .= $dom->saveHTML($node);
        }
        
        libxml_clear_errors();
        
        return trim($cleanedHtml);
    }

    /**
     * Remove obviously dangerous content
     */
    private function removeDangerousContent(string $html): string
    {
        // Remove script tags
        $html = preg_replace('/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/mi', '', $html);
        
        // Remove javascript: and vbscript: protocols
        $html = preg_replace('/javascript\s*:/i', '', $html);
        $html = preg_replace('/vbscript\s*:/i', '', $html);
        
        // Remove event handlers
        $html = preg_replace('/\bon\w+\s*=/i', '', $html);
        
        // Remove dangerous tags
        $dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'meta', 'link', 'style'];
        foreach ($dangerousTags as $tag) {
            $html = preg_replace("/<\/?{$tag}\b[^>]*>/i", '', $html);
        }
        
        return $html;
    }

    /**
     * Clean a DOM node recursively
     */
    private function cleanDomNode(\DOMNode $node): void
    {
        $nodesToRemove = [];
        
        foreach ($node->childNodes as $child) {
            if ($child->nodeType === XML_ELEMENT_NODE) {
                $tagName = strtolower($child->nodeName);
                
                // Remove disallowed tags
                if (!in_array($tagName, $this->allowedTags)) {
                    $nodesToRemove[] = $child;
                    continue;
                }
                
                // Clean attributes
                $this->cleanAttributes($child, $tagName);
                
                // Recursively clean child nodes
                $this->cleanDomNode($child);
            }
        }
        
        // Remove disallowed nodes
        foreach ($nodesToRemove as $nodeToRemove) {
            $node->removeChild($nodeToRemove);
        }
    }

    /**
     * Clean attributes of a DOM element
     */
    private function cleanAttributes(\DOMElement $element, string $tagName): void
    {
        $attributesToRemove = [];
        
        foreach ($element->attributes as $attribute) {
            $attrName = strtolower($attribute->name);
            
            // Check if attribute is allowed for this tag
            if (!isset($this->allowedAttributes[$tagName]) || 
                !in_array($attrName, $this->allowedAttributes[$tagName])) {
                $attributesToRemove[] = $attrName;
                continue;
            }
            
            // Validate attribute values
            $attrValue = $attribute->value;
            
            if ($attrName === 'href' || $attrName === 'src') {
                if (!$this->isValidUrl($attrValue)) {
                    $attributesToRemove[] = $attrName;
                }
            }
        }
        
        // Remove invalid attributes
        foreach ($attributesToRemove as $attrName) {
            $element->removeAttribute($attrName);
        }
    }

    /**
     * Validate URL for href and src attributes
     */
    private function isValidUrl(string $url): bool
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
        
        // Reject dangerous protocols
        if (preg_match('/^[a-z][a-z0-9+.-]*:/i', $url)) {
            return false;
        }
        
        return true;
    }

    /**
     * Strip all HTML tags (for plain text output)
     */
    public function stripTags(string $html): string
    {
        return strip_tags($html);
    }

    /**
     * Get plain text excerpt from HTML
     */
    public function getExcerpt(string $html, int $length = 160): string
    {
        $text = $this->stripTags($html);
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);
        
        if (strlen($text) <= $length) {
            return $text;
        }
        
        return substr($text, 0, $length) . '...';
    }
}