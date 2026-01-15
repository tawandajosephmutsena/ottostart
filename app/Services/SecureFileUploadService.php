<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SecureFileUploadService
{
    /**
     * Determine file category based on MIME type and extension
     */
    public function getCategoryByFile(UploadedFile $file): string
    {
        $mimeType = $file->getMimeType();
        $extension = strtolower($file->getClientOriginalExtension());

        // Check for image
        if (str_starts_with($mimeType, 'image/') || in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'heic', 'heif', 'bmp'])) {
            return 'image';
        }

        // Check for video
        if (str_starts_with($mimeType, 'video/') || in_array($extension, ['mp4', 'mov', 'webm', 'avi', 'mkv', 'wmv', 'flv', 'm4v', '3gp', 'mpeg', 'mpg', 'ogv', 'm4a'])) {
            return 'video';
        }

        // Check for audio
        if (str_starts_with($mimeType, 'audio/') || in_array($extension, ['mp3', 'wav', 'ogg', 'aac', 'flac'])) {
            return 'audio';
        }

        return 'document'; // Default
    }

    /**
     * Allowed MIME types for different file categories
     */
    private array $allowedMimeTypes = [
        'image' => [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'image/avif',
            'image/heic',
            'image/heif',
            'image/bmp',
            'image/x-icon',
        ],
        'document' => [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/csv',
        ],
        'video' => [
            'video/mp4',
            'video/mpeg',
            'video/quicktime',
            'video/x-msvideo',
            'video/x-ms-wmv',
            'video/x-flv',
            'video/webm',
            'video/ogg',
            'video/3gpp',
            'video/3gpp2',
            'video/x-matroska',
            'video/x-m4v',
            'video/MP2T',
            'application/octet-stream', // Some video files report as this
        ],
        'audio' => [
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            'audio/mp4',
            'audio/x-m4a',
            'audio/aac',
            'audio/flac',
            'audio/webm',
        ],
    ];

    /**
     * Dangerous file extensions that should never be allowed
     */
    private array $dangerousExtensions = [
        'php', 'phtml', 'php3', 'php4', 'php5', 'phar', 'exe', 'bat', 'cmd', 'com', 
        'scr', 'vbs', 'js', 'jar', 'asp', 'aspx', 'jsp', 'pl', 'py', 'rb', 'sh',
        'htaccess', 'htpasswd', 'ini', 'conf', 'config', 'sql'
    ];

    /**
     * Maximum file sizes by category (in bytes)
     */
    private array $maxFileSizes = [
        'image' => 52428800,    // 50MB
        'document' => 52428800, // 50MB
        'video' => 209715200,   // 200MB
        'audio' => 52428800,    // 50MB
    ];

    /**
     * Upload a file securely
     */
    public function upload(UploadedFile $file, string $category = 'image', string $folder = 'uploads'): array
    {
        // Validate file
        $validation = $this->validateFile($file, $category);
        if (!$validation['valid']) {
            throw new \InvalidArgumentException($validation['error']);
        }

        // Generate secure filename
        $filename = $this->generateSecureFilename($file);
        
        // Create full path
        $path = $folder . '/' . date('Y/m') . '/' . $filename;
        
        // Store file
        $storedPath = Storage::disk('public')->putFileAs(
            dirname($path),
            $file,
            basename($path)
        );

        if (!$storedPath) {
            throw new \RuntimeException('Failed to store file');
        }

        // Perform additional security checks on stored file
        $fullPath = Storage::disk('public')->path($storedPath);
        $this->performPostUploadSecurityChecks($fullPath, $category);

        // Log successful upload
        Log::info('File uploaded successfully', [
            'original_name' => $file->getClientOriginalName(),
            'stored_path' => $storedPath,
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'user_id' => auth()->id(),
        ]);

        return [
            'path' => $storedPath,
            'url' => Storage::disk('public')->url($storedPath),
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ];
    }

    /**
     * Validate uploaded file
     */
    public function validateFile(UploadedFile $file, string $category): array
    {
        // If category is 'all', detect it automatically
        if ($category === 'all') {
            $category = $this->getCategoryByFile($file);
        }

        // Check if file is valid
        if (!$file->isValid()) {
            return ['valid' => false, 'error' => 'Invalid file upload'];
        }

        // Check file size
        $maxSizes = $this->maxFileSizes;
        $maxSize = $maxSizes[$category] ?? 209715200; // Default to 200MB if unknown

        if ($file->getSize() > $maxSize) {
            $maxSizeMB = $maxSize / 1048576;
            return ['valid' => false, 'error' => "File size exceeds {$maxSizeMB}MB limit"];
        }

        // Check MIME type
        $mimeType = $file->getMimeType();
        $extension = strtolower($file->getClientOriginalExtension());
        
        // Define allowed extensions for extension-based fallback
        $allowedExtensions = [
            'video' => ['mp4', 'mov', 'webm', 'avi', 'mkv', 'wmv', 'flv', 'm4v', '3gp', 'mpeg', 'mpg', 'ogv'],
            'image' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif', 'heic', 'heif'],
            'audio' => ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'webm'],
            'document' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'],
        ];
        
        // Try MIME type validation first
        $isMimeValid = in_array($mimeType, $this->allowedMimeTypes[$category]);
        
        // If MIME validation fails, try extension-based validation as fallback
        if (!$isMimeValid) {
            $isExtensionValid = isset($allowedExtensions[$category]) && 
                                in_array($extension, $allowedExtensions[$category]);
            
            if (!$isExtensionValid) {
                return ['valid' => false, 'error' => 'File type not allowed'];
            }
            
            // Log the fallback for debugging
            Log::info('File validated by extension fallback', [
                'file' => $file->getClientOriginalName(),
                'mime' => $mimeType,
                'extension' => $extension,
                'category' => $category,
            ]);
        }

        // Check file extension for dangerous extensions
        if (in_array($extension, $this->dangerousExtensions)) {
            return ['valid' => false, 'error' => 'File extension not allowed for security reasons'];
        }

        // Validate file signature (magic bytes)
        if (!$this->validateFileSignature($file, $category)) {
            return ['valid' => false, 'error' => 'File signature does not match declared type'];
        }

        // Check for embedded executables (for images)
        if ($category === 'image' && $this->containsEmbeddedExecutable($file)) {
            return ['valid' => false, 'error' => 'File contains potentially malicious content'];
        }

        return ['valid' => true];
    }

    /**
     * Validate file signature (magic bytes)
     */
    private function validateFileSignature(UploadedFile $file, string $category): bool
    {
        $handle = fopen($file->getPathname(), 'rb');
        if (!$handle) {
            return false;
        }

        $header = fread($handle, 16);
        fclose($handle);

        $signatures = [
            'image' => [
                'jpeg' => ["\xFF\xD8\xFF"],
                'png' => ["\x89\x50\x4E\x47\x0D\x0A\x1A\x0A"],
                'gif' => ["GIF87a", "GIF89a"],
                'webp' => ["RIFF", "WEBP"],
                'svg' => ["<?xml", "<svg"],
            ],
            'document' => [
                'pdf' => ["%PDF-"],
                'zip' => ["PK\x03\x04", "PK\x05\x06", "PK\x07\x08"], // For Office docs
            ],
        ];

        if (!isset($signatures[$category])) {
            return true; // Skip validation for unknown categories
        }

        foreach ($signatures[$category] as $type => $typeSignatures) {
            foreach ($typeSignatures as $signature) {
                if (str_starts_with($header, $signature)) {
                    return true;
                }
            }
        }

        return false;
    }

    private function containsEmbeddedExecutable(UploadedFile $file): bool
    {
        $path = $file->getPathname();
        $handle = fopen($path, 'rb');
        if (!$handle) {
            return false;
        }

        // Read the first 1KB for header checks
        $header = fread($handle, 1024);
        fclose($handle);

        // 1. Check for executable signatures at the VERY START of the file
        $startSignatures = [
            'MZ',               // DOS/Windows executable
            "\x7fELF",          // Linux executable
            "\xCA\xFE\xBA\xBE", // Java class file
            '#!',               // Shebang (scripts)
        ];

        foreach ($startSignatures as $sig) {
            if (str_starts_with($header, $sig)) {
                return true;
            }
        }

        // 2. Check for script tags
        // For SVGs, we must be strict as they can execute JS
        // For binary images, we only care if they are specifically trying to be polyglots
        $isSvg = $file->getMimeType() === 'image/svg+xml';
        
        $scriptSignatures = [
            '<?php',
            '<script',
            'base64_decode',
            'eval(',
        ];

        // Read more content if it's an SVG or if we want to be thorough, 
        // but avoid loading huge binaries into memory with file_get_contents
        if ($isSvg || $file->getSize() < 1024 * 1024) { // Only scan full content for SVGs or small files
            $content = file_get_contents($path);
            foreach ($scriptSignatures as $sig) {
                if (str_contains($content, $sig)) {
                    // Special case: SVGs often contain <?xml, which is fine, but we check for <?php
                    if ($sig === '<?php' && str_contains($content, '<?php')) {
                        return true;
                    }
                    if ($sig === '<script' && str_contains($content, '<script')) {
                        return true;
                    }
                    if ($sig !== '<?php' && $sig !== '<script') {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Generate secure filename
     */
    private function generateSecureFilename(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        
        // Sanitize original name
        $safeName = preg_replace('/[^a-zA-Z0-9\-_]/', '', $originalName);
        $safeName = substr($safeName, 0, 50); // Limit length
        
        // Generate unique identifier
        $uniqueId = Str::random(16);
        
        return $safeName . '_' . $uniqueId . '.' . $extension;
    }

    /**
     * Perform additional security checks after file upload
     */
    private function performPostUploadSecurityChecks(string $filePath, string $category): void
    {
        // Set secure file permissions
        chmod($filePath, 0644);

        // For images, strip EXIF data that might contain sensitive information
        if ($category === 'image' && function_exists('exif_read_data')) {
            $this->stripExifData($filePath);
        }

        // Scan for viruses if ClamAV is available
        if ($this->isVirusScannerAvailable()) {
            $this->scanForViruses($filePath);
        }
    }

    /**
     * Strip EXIF data from images
     */
    private function stripExifData(string $filePath): void
    {
        $imageInfo = getimagesize($filePath);
        if (!$imageInfo) {
            return;
        }

        $imageType = $imageInfo[2];
        
        try {
            switch ($imageType) {
                case IMAGETYPE_JPEG:
                    $image = imagecreatefromjpeg($filePath);
                    if ($image) {
                        imagejpeg($image, $filePath, 90);
                        imagedestroy($image);
                    }
                    break;
                    
                case IMAGETYPE_PNG:
                    $image = imagecreatefrompng($filePath);
                    if ($image) {
                        imagepng($image, $filePath, 9);
                        imagedestroy($image);
                    }
                    break;
            }
        } catch (\Exception $e) {
            Log::warning('Failed to strip EXIF data', [
                'file' => $filePath,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Check if virus scanner is available
     */
    private function isVirusScannerAvailable(): bool
    {
        return function_exists('exec') && 
               exec('which clamscan 2>/dev/null') !== '';
    }

    /**
     * Scan file for viruses using ClamAV
     */
    private function scanForViruses(string $filePath): void
    {
        if (!$this->isVirusScannerAvailable()) {
            return;
        }

        $output = [];
        $returnCode = 0;
        
        exec("clamscan --no-summary " . escapeshellarg($filePath) . " 2>&1", $output, $returnCode);
        
        if ($returnCode !== 0) {
            // Virus found or scan error
            unlink($filePath); // Delete the file
            
            Log::error('Virus detected in uploaded file', [
                'file' => $filePath,
                'scan_output' => implode("\n", $output),
                'user_id' => auth()->id(),
            ]);
            
            throw new \RuntimeException('File failed virus scan and has been deleted');
        }
    }

    /**
     * Delete uploaded file securely
     */
    public function deleteFile(string $path): bool
    {
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }
        
        return false;
    }

    /**
     * Get file information
     */
    public function getFileInfo(string $path): ?array
    {
        if (!Storage::disk('public')->exists($path)) {
            return null;
        }

        $fullPath = Storage::disk('public')->path($path);
        
        return [
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
            'size' => Storage::disk('public')->size($path),
            'mime_type' => Storage::disk('public')->mimeType($path),
            'last_modified' => Storage::disk('public')->lastModified($path),
            'exists' => true,
        ];
    }
}