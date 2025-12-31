<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Page>
 */
class PageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence();
        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'meta_title' => fake()->sentence(),
            'meta_description' => fake()->paragraph(),
            'template' => 'default',
            'is_published' => fake()->boolean(),
            'content' => [
                'blocks' => [
                    [
                        'id' => Str::uuid()->toString(),
                        'type' => 'text',
                        'content' => ['body' => fake()->paragraph()]
                    ]
                ]
            ],
        ];
    }
}
