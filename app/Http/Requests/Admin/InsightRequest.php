<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\SecureFormRequest;
use App\Rules\NoScriptTags;
use App\Rules\SafeHtml;
use Illuminate\Support\Str;

class InsightRequest extends SecureFormRequest
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
        $insightId = $this->route('insight') ? $this->route('insight')->id : null;

        return [
            'title' => [...$this->getSafeTextRules(255), new NoScriptTags()],
            'slug' => $this->getSlugRules('insights', $insightId, false),
            'excerpt' => [...$this->getSafeTextRules(500), new NoScriptTags()],
            'content' => 'nullable|array',
            'content.introduction' => [...$this->getRichTextRules(65535, false), new SafeHtml()],
            'content.body' => [...$this->getRichTextRules(65535, false), new SafeHtml()],
            'content.conclusion' => [...$this->getRichTextRules(65535, false), new SafeHtml()],
            'content.sections' => 'nullable|array',
            'content.sections.*.title' => ['required_with:content.sections', ...$this->getSafeTextRules(255), new NoScriptTags()],
            'content.sections.*.content' => ['required_with:content.sections', ...$this->getRichTextRules(65535), new SafeHtml()],
            'featured_image' => [...$this->getSafeTextRules(255, false), 'regex:/^[a-zA-Z0-9\-_\.\/]+$/'],
            'author_id' => 'required|exists:users,id',
            'category_id' => 'nullable|exists:categories,id',
            'tags' => 'nullable|array|max:20',
            'tags.*' => [...$this->getSafeTextRules(50), new NoScriptTags()],
            'reading_time' => 'nullable|integer|min:1|max:999',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'title' => 'article title',
            'slug' => 'URL slug',
            'excerpt' => 'article excerpt',
            'content.introduction' => 'introduction',
            'content.body' => 'article body',
            'content.conclusion' => 'conclusion',
            'content.sections.*.title' => 'section title',
            'content.sections.*.content' => 'section content',
            'featured_image' => 'featured image',
            'author_id' => 'author',
            'category_id' => 'category',
            'tags.*' => 'tag',
            'reading_time' => 'reading time',
            'is_featured' => 'featured status',
            'is_published' => 'published status',
            'published_at' => 'publication date',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'The article title is required.',
            'title.max' => 'The article title cannot exceed 255 characters.',
            'slug.unique' => 'This URL slug is already in use. Please choose a different one.',
            'excerpt.required' => 'The article excerpt is required.',
            'excerpt.max' => 'The article excerpt cannot exceed 500 characters.',
            'author_id.required' => 'Please select an author for this article.',
            'author_id.exists' => 'The selected author is invalid.',
            'category_id.exists' => 'The selected category is invalid.',
            'tags.*.max' => 'Each tag cannot exceed 50 characters.',
            'reading_time.min' => 'The reading time must be at least 1 minute.',
            'reading_time.max' => 'The reading time cannot exceed 999 minutes.',
            'content.sections.*.title.required_with' => 'Each section must have a title.',
            'content.sections.*.content.required_with' => 'Each section must have content.',
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

        // Set published_at if publishing for the first time
        if ($this->boolean('is_published') && empty($this->published_at)) {
            $this->merge([
                'published_at' => now(),
            ]);
        }

        // Filter out empty tags
        if ($this->has('tags') && is_array($this->tags)) {
            $this->merge([
                'tags' => array_filter($this->tags, function ($tag) {
                    return !empty(trim($tag));
                }),
            ]);
        }

        // Calculate reading time if not provided
        if (empty($this->reading_time) && $this->has('content')) {
            $wordCount = 0;
            
            if (is_array($this->content)) {
                foreach ($this->content as $section) {
                    if (is_string($section)) {
                        $wordCount += str_word_count(strip_tags($section));
                    } elseif (is_array($section)) {
                        foreach ($section as $subsection) {
                            if (is_string($subsection)) {
                                $wordCount += str_word_count(strip_tags($subsection));
                            }
                        }
                    }
                }
            }
            
            if ($wordCount > 0) {
                $this->merge([
                    'reading_time' => max(1, ceil($wordCount / 200)), // 200 words per minute
                ]);
            }
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
            $insightId = $this->route('insight') ? $this->route('insight')->id : null;

            while (\App\Models\Insight::where('slug', $this->slug)
                ->when($insightId, fn($q) => $q->where('id', '!=', $insightId))
                ->exists()) {
                $this->merge(['slug' => $originalSlug . '-' . $counter]);
                $counter++;
            }
        }
    }
}