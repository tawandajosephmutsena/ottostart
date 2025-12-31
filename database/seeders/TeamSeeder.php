<?php

namespace Database\Seeders;

use App\Models\TeamMember;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $members = [
            [
                'name' => 'Sarah Anderson',
                'position' => 'Creative Director',
                'bio' => 'Award-winning designer with over 10 years of experience in digital branding and UI/UX. Sarah leads our creative vision with a focus on minimalist aesthetics and user-centric design.',
                'email' => 'sarah@avantgarde.com',
                'avatar' => null, // Placeholder will be handled if needed, or null for initials
                'social_links' => [
                    ['platform' => 'LinkedIn', 'url' => 'https://linkedin.com'],
                    ['platform' => 'Twitter', 'url' => 'https://twitter.com'],
                    ['platform' => 'Dribbble', 'url' => 'https://dribbble.com']
                ],
                'is_featured' => true,
                'is_active' => true,
                'sort_order' => 1
            ],
            [
                'name' => 'Michael Chen',
                'position' => 'Lead Developer',
                'bio' => 'Full-stack architect specializing in high-performance web applications. Michael ensures our code is as beautiful as our designs, utilizing the latest in React and Laravel technologies.',
                'email' => 'michael@avantgarde.com',
                'avatar' => null,
                'social_links' => [
                    ['platform' => 'GitHub', 'url' => 'https://github.com'],
                    ['platform' => 'LinkedIn', 'url' => 'https://linkedin.com']
                ],
                'is_featured' => true,
                'is_active' => true,
                'sort_order' => 2
            ],
            [
                'name' => 'Elena Rodriguez',
                'position' => 'Digital Strategist',
                'bio' => 'Elena bridges the gap between creative vision and business goals. Her data-driven approach ensures every project we launch delivers measurable results and ROI.',
                'email' => 'elena@avantgarde.com',
                'avatar' => null,
                'social_links' => [
                    ['platform' => 'LinkedIn', 'url' => 'https://linkedin.com'],
                    ['platform' => 'Medium', 'url' => 'https://medium.com']
                ],
                'is_featured' => true,
                'is_active' => true,
                'sort_order' => 3
            ],
            [
                'name' => 'James Wilson',
                'position' => 'Motion Designer',
                'bio' => 'Bringing static designs to life through fluid animation and micro-interactions. James adds that magic touch that makes Avant-Garde projects feel alive.',
                'email' => 'james@avantgarde.com',
                'avatar' => null,
                'social_links' => [
                    ['platform' => 'Instagram', 'url' => 'https://instagram.com'],
                    ['platform' => 'Vimeo', 'url' => 'https://vimeo.com']
                ],
                'is_featured' => false,
                'is_active' => true,
                'sort_order' => 4
            ]
        ];

        foreach ($members as $member) {
            TeamMember::firstOrCreate(
                ['email' => $member['email']],
                $member
            );
        }
    }
}
