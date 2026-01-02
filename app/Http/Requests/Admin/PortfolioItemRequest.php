<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\SecureFormRequest;
use App\Rules\NoScriptTags;
use Illuminate\Support\Str;

class PortfolioItemRequest extends SecureFormRequest
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
        $portfolio = $this->route('portfolio');
        $portfolioItemId = $portfolio instanceof \App\Models\PortfolioItem ? $portfolio->id : $portfolio;

        return [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:portfolio_items,slug,' . $portfolioItemId,
            'description' => 'required|string|max:1000',
            'content' => 'nullable|array',
            'content.overview' => 'nullable|string',
            'content.challenge' => 'nullable|string',
            'content.solution' => 'nullable|string',
            'content.results' => 'nullable|string',
            'featured_image' => 'nullable|string|max:255',
            'gallery' => 'nullable|array',
            'gallery.*' => 'string|max:255',
            'client' => 'nullable|string|max:255',
            'project_date' => 'nullable|date',
            'project_url' => 'nullable|url|max:255',
            'technologies' => 'nullable|array',
            'technologies.*' => 'string|max:100',
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
            'title' => 'project title',
            'slug' => 'URL slug',
            'description' => 'project description',
            'content.overview' => 'project overview',
            'content.challenge' => 'project challenge',
            'content.solution' => 'project solution',
            'content.results' => 'project results',
            'featured_image' => 'featured image',
            'gallery.*' => 'gallery image',
            'client' => 'client name',
            'project_date' => 'project date',
            'project_url' => 'project URL',
            'technologies.*' => 'technology',
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
            'title.required' => 'The project title is required.',
            'title.max' => 'The project title cannot exceed 255 characters.',
            'slug.unique' => 'This URL slug is already in use. Please choose a different one.',
            'description.required' => 'The project description is required.',
            'description.max' => 'The project description cannot exceed 1000 characters.',
            'project_url.url' => 'The project URL must be a valid URL.',
            'technologies.*.max' => 'Each technology name cannot exceed 100 characters.',
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

        // Filter out empty technologies
        if ($this->has('technologies') && is_array($this->technologies)) {
            $this->merge([
                'technologies' => array_filter($this->technologies, function ($tech) {
                    return !empty(trim($tech));
                }),
            ]);
        }

        // Filter out empty gallery items
        if ($this->has('gallery') && is_array($this->gallery)) {
            $this->merge([
                'gallery' => array_filter($this->gallery, function ($image) {
                    return !empty(trim($image));
                }),
            ]);
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
            $portfolioItemId = $this->route('portfolio') ? $this->route('portfolio')->id : null;

            while (\App\Models\PortfolioItem::where('slug', $this->slug)
                ->when($portfolioItemId, fn($q) => $q->where('id', '!=', $portfolioItemId))
                ->exists()) {
                $this->merge(['slug' => $originalSlug . '-' . $counter]);
                $counter++;
            }
        }
    }
}