<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Service>
 */
class ServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->words(3, true);
        
        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'description' => fake()->sentence(),
            'content' => [
                'body' => fake()->paragraphs(3, true),
                'features' => fake()->words(5),
            ],
            'icon' => 'icon-' . fake()->word(),
            'featured_image' => 'uploads/services/' . fake()->slug() . '.jpg',
            'price_range' => fake()->randomElement(['$500-$1000', '$1000-$5000', '$5000+']),
            'is_featured' => fake()->boolean(30),
            'is_published' => true,
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}