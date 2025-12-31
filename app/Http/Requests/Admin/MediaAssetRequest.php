<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class MediaAssetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->role === 'admin' || $this->user()->role === 'editor';
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $rules = [
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:1000',
            'folder' => 'nullable|string|max:255|regex:/^[a-zA-Z0-9\-_\/]+$/',
            'tags' => 'nullable|array|max:20',
            'tags.*' => 'string|max:50',
        ];

        // Add file upload rules for store requests
        if ($this->isMethod('POST') && $this->routeIs('admin.media.store')) {
            $rules['files'] = 'required|array|min:1|max:10';
            $rules['files.*'] = [
                'required',
                'file',
                'max:10240', // 10MB
                'mimes:jpeg,jpg,png,gif,webp,svg,pdf,doc,docx,xls,xlsx,ppt,pptx,mp4,mov,avi,wmv,flv,webm,mp3,wav,ogg',
            ];
        }

        return $rules;
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'files' => 'files',
            'files.*' => 'file',
            'alt_text' => 'alt text',
            'caption' => 'caption',
            'folder' => 'folder',
            'tags.*' => 'tag',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'files.required' => 'Please select at least one file to upload.',
            'files.min' => 'Please select at least one file to upload.',
            'files.max' => 'You can upload a maximum of 10 files at once.',
            'files.*.required' => 'Each file is required.',
            'files.*.file' => 'Each upload must be a valid file.',
            'files.*.max' => 'Each file cannot exceed 10MB in size.',
            'files.*.mimes' => 'Only the following file types are allowed: JPEG, JPG, PNG, GIF, WebP, SVG, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, MP4, MOV, AVI, WMV, FLV, WebM, MP3, WAV, OGG.',
            'alt_text.max' => 'The alt text cannot exceed 255 characters.',
            'caption.max' => 'The caption cannot exceed 1000 characters.',
            'folder.max' => 'The folder name cannot exceed 255 characters.',
            'folder.regex' => 'The folder name can only contain letters, numbers, hyphens, underscores, and forward slashes.',
            'tags.max' => 'You can add a maximum of 20 tags.',
            'tags.*.max' => 'Each tag cannot exceed 50 characters.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Clean up folder path
        if ($this->has('folder')) {
            $folder = trim($this->folder, '/ ');
            $folder = preg_replace('/\/+/', '/', $folder); // Remove multiple slashes
            $this->merge(['folder' => $folder ?: 'uploads']);
        } else {
            $this->merge(['folder' => 'uploads']);
        }

        // Filter out empty tags
        if ($this->has('tags') && is_array($this->tags)) {
            $tags = array_filter($this->tags, function ($tag) {
                return !empty(trim($tag));
            });
            
            // Remove duplicates and re-index
            $this->merge([
                'tags' => array_values(array_unique($tags)),
            ]);
        }

        // Trim text fields
        $this->merge([
            'alt_text' => trim($this->alt_text ?? ''),
            'caption' => trim($this->caption ?? ''),
        ]);
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Additional file validation for security
            if ($this->hasFile('files')) {
                foreach ($this->file('files') as $index => $file) {
                    if ($file->isValid()) {
                        // Check for potentially dangerous file extensions
                        $dangerousExtensions = ['php', 'phtml', 'php3', 'php4', 'php5', 'phar', 'exe', 'bat', 'cmd', 'com', 'scr', 'vbs', 'js', 'jar'];
                        $extension = strtolower($file->getClientOriginalExtension());
                        
                        if (in_array($extension, $dangerousExtensions)) {
                            $validator->errors()->add("files.{$index}", 'This file type is not allowed for security reasons.');
                        }

                        // Check file size more strictly for images
                        if (str_starts_with($file->getMimeType(), 'image/') && $file->getSize() > 5242880) { // 5MB for images
                            $validator->errors()->add("files.{$index}", 'Image files cannot exceed 5MB in size.');
                        }
                    }
                }
            }
        });
    }
}