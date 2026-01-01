<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CompressionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only compress successful responses
        if ($response->getStatusCode() !== 200) {
            return $response;
        }

        // Don't compress if already compressed
        if ($response->headers->has('Content-Encoding')) {
            return $response;
        }

        // Check if client accepts compression
        $acceptEncoding = $request->header('Accept-Encoding', '');
        
        if (!$this->shouldCompress($response, $acceptEncoding)) {
            return $response;
        }

        // Apply compression
        return $this->compressResponse($response, $acceptEncoding);
    }

    /**
     * Determine if response should be compressed
     */
    private function shouldCompress(Response $response, string $acceptEncoding): bool
    {
        // Don't compress small responses
        $content = $response->getContent();
        if (strlen($content) < 1024) { // Less than 1KB
            return false;
        }

        // Check if client accepts gzip or deflate
        if (!str_contains($acceptEncoding, 'gzip') && !str_contains($acceptEncoding, 'deflate')) {
            return false;
        }

        // Check content type
        $contentType = $response->headers->get('Content-Type', '');
        
        return $this->isCompressibleContentType($contentType);
    }

    /**
     * Check if content type is compressible
     */
    private function isCompressibleContentType(string $contentType): bool
    {
        $compressibleTypes = [
            'text/html',
            'text/css',
            'text/javascript',
            'text/plain',
            'text/xml',
            'application/json',
            'application/javascript',
            'application/xml',
            'application/rss+xml',
            'application/atom+xml',
            'image/svg+xml',
        ];

        foreach ($compressibleTypes as $type) {
            if (str_starts_with($contentType, $type)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Compress the response
     */
    private function compressResponse(Response $response, string $acceptEncoding): Response
    {
        $content = $response->getContent();
        
        if (str_contains($acceptEncoding, 'gzip')) {
            $compressed = gzencode($content, 6); // Compression level 6 (good balance)
            
            if ($compressed !== false) {
                $response->setContent($compressed);
                $response->headers->set('Content-Encoding', 'gzip');
                $response->headers->set('Content-Length', strlen($compressed));
                $response->headers->set('Vary', 'Accept-Encoding');
                
                return $response;
            }
        } elseif (str_contains($acceptEncoding, 'deflate')) {
            $compressed = gzdeflate($content, 6);
            
            if ($compressed !== false) {
                $response->setContent($compressed);
                $response->headers->set('Content-Encoding', 'deflate');
                $response->headers->set('Content-Length', strlen($compressed));
                $response->headers->set('Vary', 'Accept-Encoding');
                
                return $response;
            }
        }

        return $response;
    }
}
