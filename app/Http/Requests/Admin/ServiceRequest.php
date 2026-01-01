<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\SecureFormRequest;
use App\Rules\NoScriptTags;
use App\Rules\SafeHtml;
use Illuminate\Support\Str;

class ServiceRequest extends SecureFormRequest
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
        $serviceId = $this->route('service') ? $this->route('service')->id : null;

        return [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:services,slug,' . $serviceId,
            'description' => 'required|string|max:1000',
            'content' => 'nullable|array',
            'content.overview' => 'nullable|string',
            'content.features' => 'nullable|array',
            'content.features.*' => 'string|max:500',
            'content.process' => 'nullable|string',
            'content.deliverables' => 'nullable|array',
            'content.deliverables.*' => 'string|max:500',
            'icon' => 'nullable|string|max:255',
            'featured_image' => 'nullable|string|max:255',
            'price_range' => 'nullable|string|max:100',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'sort_order' => 'nullable|integer|min:0|max:9999',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'title' => 'service title',
            'slug' => 'URL slug',
            'description' => 'service description',
            'content.overview' => 'service overview',
            'content.features.*' => 'service feature',
            'content.process' => 'service process',
            'content.deliverables.*' => 'service deliverable',
            'icon' => 'service icon',
            'featured_image' => 'featured image',
            'price_range' => 'price range',
            'is_featured' => 'featured status',
            'is_published' => 'published status',
            'sort_order' => 'sort order',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'The service title is required.',
            'title.max' => 'The service title cannot exceed 255 characters.',
            'slug.unique' => 'This URL slug is already in use. Please choose a different one.',
            'description.required' => 'The service description is required.',
            'description.max' => 'The service description cannot exceed 1000 characters.',
            'content.features.*.max' => 'Each service feature cannot exceed 500 characters.',
            'content.deliverables.*.max' => 'Each service deliverable cannot exceed 500 characters.',
            'price_range.max' => 'The price range cannot exceed 100 characters.',
            'sort_order.min' => 'The sort order must be at least 0.',
            'sort_order.max' => 'The sort order cannot exceed 9999.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Generate slug if not provided
        if (empty($this->slug) && !empty($this->title)) {
            $this->merge([
                'slug' => Str::slug($this->title),
            ]);
        }

        // Ensure boolean values are properly cast
        $this->merge([
            'is_featured' => $this->boolean('is_featured'),
            'is_published' => $this->boolean('is_published'),
        ]);

        // Filter out empty features and deliverables
        if ($this->has('content') && is_array($this->content)) {
            $content = $this->content;
            
            if (isset($content['features']) && is_array($content['features'])) {
                $content['features'] = array_filter($content['features'], function ($feature) {
                    return !empty(trim($feature));
                });
            }
            
            if (isset($content['deliverables']) && is_array($content['deliverables'])) {
                $content['deliverables'] = array_filter($content['deliverables'], function ($deliverable) {
                    return !empty(trim($deliverable));
                });
            }
            
            $this->merge(['content' => $content]);
        }
    }

    /**
     * Handle a passed validation attempt.
     */
    protected function passedValidation(): void
    {
        // Ensure unique slug
        if ($this->has('slug')) {
            $originalSlug = $this->slug;
            $counter = 1;
            $serviceId = $this->route('service') ? $this->route('service')->id : null;

            while (\App\Models\Service::where('slug', $this->slug)
                ->when($serviceId, fn($q) => $q->where('id', '!=', $serviceId))
                ->exists()) {
                $this->merge(['slug' => $originalSlug . '-' . $counter]);
                $counter++;
            }
        }
    }
}