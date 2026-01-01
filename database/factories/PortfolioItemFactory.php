<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PortfolioItem>
 */
class PortfolioItemFactory extends Factory
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
                'challenge' => fake()->paragraph(),
                'solution' => fake()->paragraph(),
                'results' => fake()->paragraph(),
            ],
            'featured_image' => 'uploads/portfolio/' . fake()->slug() . '.jpg',
            'gallery' => [
                'uploads/portfolio/' . fake()->slug() . '-1.jpg',
                'uploads/portfolio/' . fake()->slug() . '-2.jpg',
            ],
            'client' => fake()->company(),
            'project_date' => fake()->date(),
            'project_url' => fake()->url(),
            'technologies' => fake()->words(5),
            'is_featured' => fake()->boolean(30),
            'is_published' => true,
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}