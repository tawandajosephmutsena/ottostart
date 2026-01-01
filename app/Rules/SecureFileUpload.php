<?php

namespace App\Rules;

use App\Services\SecureFileUploadService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

class SecureFileUpload implements ValidationRule
{
    private string $category;
    private SecureFileUploadService $uploadService;

    public function __construct(string $category = 'image')
    {
        $this->category = $category;
        $this->uploadService = app(SecureFileUploadService::class);
    }

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$value instanceof UploadedFile) {
            $fail('The :attribute must be a valid file.');
            return;
        }

        $validation = $this->uploadService->validateFile($value, $this->category);
        
        if (!$validation['valid']) {
            $fail($validation['error']);
        }
    }
}