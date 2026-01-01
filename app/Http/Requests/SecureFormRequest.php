<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

abstract class SecureFormRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    abstract public function rules(): array;

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'required' => 'The :attribute field is required.',
            'string' => 'The :attribute must be a string.',
            'max' => 'The :attribute may not be greater than :max characters.',
            'min' => 'The :attribute must be at least :min characters.',
            'email' => 'The :attribute must be a valid email address.',
            'url' => 'The :attribute must be a valid URL.',
            'image' => 'The :attribute must be an image.',
            'mimes' => 'The :attribute must be a file of type: :values.',
            'max_file_size' => 'The :attribute may not be greater than :max kilobytes.',
            'regex' => 'The :attribute format is invalid.',
            'unique' => 'The :attribute has already been taken.',
            'exists' => 'The selected :attribute is invalid.',
            'no_script_tags' => 'The :attribute contains potentially dangerous content.',
            'safe_html' => 'The :attribute contains invalid HTML content.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Sanitize input data before validation
        $input = $this->all();
        
        // Remove null bytes and normalize whitespace
        array_walk_recursive($input, function (&$value) {
            if (is_string($value)) {
                // Remove null bytes
                $value = str_replace("\0", '', $value);
                
                // Normalize line endings
                $value = str_replace(["\r\n", "\r"], "\n", $value);
                
                // Trim whitespace for non-password fields
                if (!in_array($this->route()?->getActionMethod(), ['password', 'password_confirmation'])) {
                    $value = trim($value);
                }
            }
        });

        $this->replace($input);
    }

    /**
     * Get common validation rules for text fields
     */
    protected function getTextRules(int $maxLength = 255, bool $required = true): array
    {
        $rules = ['string', "max:$maxLength"];
        
        if ($required) {
            array_unshift($rules, 'required');
        } else {
            array_unshift($rules, 'nullable');
        }

        return $rules;
    }

    /**
     * Get common validation rules for safe text (no HTML)
     */
    protected function getSafeTextRules(int $maxLength = 255, bool $required = true): array
    {
        $rules = $this->getTextRules($maxLength, $required);
        $rules[] = 'regex:/^[^<>]*$/'; // No angle brackets
        
        return $rules;
    }

    /**
     * Get common validation rules for rich text content
     */
    protected function getRichTextRules(int $maxLength = 65535, bool $required = true): array
    {
        $rules = $this->getTextRules($maxLength, $required);
        $rules[] = new \App\Rules\SafeHtml();
        
        return $rules;
    }

    /**
     * Get common validation rules for slugs
     */
    protected function getSlugRules(string $table, ?int $ignoreId = null, bool $required = true): array
    {
        $rules = ['string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'];
        
        if ($required) {
            array_unshift($rules, 'required');
        } else {
            array_unshift($rules, 'nullable');
        }

        // Add unique rule
        $uniqueRule = Rule::unique($table, 'slug');
        if ($ignoreId) {
            $uniqueRule->ignore($ignoreId);
        }
        $rules[] = $uniqueRule;

        return $rules;
    }

    /**
     * Get common validation rules for email fields
     */
    protected function getEmailRules(bool $required = true): array
    {
        $rules = ['email:rfc,dns', 'max:255'];
        
        if ($required) {
            array_unshift($rules, 'required');
        } else {
            array_unshift($rules, 'nullable');
        }

        return $rules;
    }

    /**
     * Get common validation rules for URL fields
     */
    protected function getUrlRules(bool $required = false): array
    {
        $rules = ['url', 'max:2048'];
        
        if ($required) {
            array_unshift($rules, 'required');
        } else {
            array_unshift($rules, 'nullable');
        }

        return $rules;
    }

    /**
     * Get common validation rules for image uploads
     */
    protected function getImageRules(int $maxSizeKb = 2048, bool $required = false): array
    {
        $rules = [
            new \App\Rules\SecureFileUpload('image'),
            'image',
            'mimes:jpeg,jpg,png,gif,webp,svg',
            "max:$maxSizeKb",
            'dimensions:min_width=100,min_height=100,max_width=4000,max_height=4000'
        ];
        
        if ($required) {
            array_unshift($rules, 'required');
        } else {
            array_unshift($rules, 'nullable');
        }

        return $rules;
    }

    /**
     * Get common validation rules for file uploads
     */
    protected function getFileRules(array $mimes, int $maxSizeKb = 10240, bool $required = false): array
    {
        $category = $this->determineFileCategory($mimes);
        
        $rules = [
            new \App\Rules\SecureFileUpload($category),
            'file',
            'mimes:' . implode(',', $mimes),
            "max:$maxSizeKb"
        ];
        
        if ($required) {
            array_unshift($rules, 'required');
        } else {
            array_unshift($rules, 'nullable');
        }

        return $rules;
    }

    /**
     * Determine file category based on MIME types
     */
    private function determineFileCategory(array $mimes): string
    {
        $imageMimes = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg'];
        $documentMimes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
        $videoMimes = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'];
        $audioMimes = ['mp3', 'wav', 'ogg'];

        if (array_intersect($mimes, $imageMimes)) {
            return 'image';
        } elseif (array_intersect($mimes, $documentMimes)) {
            return 'document';
        } elseif (array_intersect($mimes, $videoMimes)) {
            return 'video';
        } elseif (array_intersect($mimes, $audioMimes)) {
            return 'audio';
        }

        return 'document'; // Default fallback
    }
}