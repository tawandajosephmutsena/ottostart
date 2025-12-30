<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class TeamMemberRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('manage-team');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'bio' => 'nullable|string|max:2000',
            'avatar' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'social_links' => 'nullable|array|max:10',
            'social_links.*.platform' => 'required_with:social_links|string|max:50',
            'social_links.*.url' => 'required_with:social_links|url|max:255',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0|max:9999',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'team member name',
            'position' => 'position/role',
            'bio' => 'biography',
            'avatar' => 'profile photo',
            'email' => 'email address',
            'social_links.*.platform' => 'social media platform',
            'social_links.*.url' => 'social media URL',
            'is_featured' => 'featured status',
            'is_active' => 'active status',
            'sort_order' => 'sort order',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The team member name is required.',
            'name.max' => 'The team member name cannot exceed 255 characters.',
            'position.required' => 'The position/role is required.',
            'position.max' => 'The position/role cannot exceed 255 characters.',
            'bio.max' => 'The biography cannot exceed 2000 characters.',
            'email.email' => 'Please enter a valid email address.',
            'email.max' => 'The email address cannot exceed 255 characters.',
            'social_links.max' => 'You can add a maximum of 10 social media links.',
            'social_links.*.platform.required_with' => 'Please specify the social media platform.',
            'social_links.*.platform.max' => 'The platform name cannot exceed 50 characters.',
            'social_links.*.url.required_with' => 'Please enter the social media URL.',
            'social_links.*.url.url' => 'Please enter a valid URL for the social media link.',
            'social_links.*.url.max' => 'The social media URL cannot exceed 255 characters.',
            'sort_order.min' => 'The sort order must be at least 0.',
            'sort_order.max' => 'The sort order cannot exceed 9999.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure boolean values are properly cast
        $this->merge([
            'is_featured' => $this->boolean('is_featured'),
            'is_active' => $this->boolean('is_active', true), // Default to true
        ]);

        // Filter out empty social links
        if ($this->has('social_links') && is_array($this->social_links)) {
            $socialLinks = array_filter($this->social_links, function ($link) {
                return !empty($link['platform']) && !empty($link['url']);
            });
            
            // Re-index the array to avoid validation issues
            $this->merge([
                'social_links' => array_values($socialLinks),
            ]);
        }

        // Trim whitespace from text fields
        $this->merge([
            'name' => trim($this->name ?? ''),
            'position' => trim($this->position ?? ''),
            'bio' => trim($this->bio ?? ''),
            'email' => trim($this->email ?? ''),
        ]);
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Validate social media platforms are unique
            if ($this->has('social_links') && is_array($this->social_links)) {
                $platforms = array_column($this->social_links, 'platform');
                $uniquePlatforms = array_unique($platforms);
                
                if (count($platforms) !== count($uniquePlatforms)) {
                    $validator->errors()->add('social_links', 'Each social media platform can only be added once.');
                }
            }
        });
    }
}