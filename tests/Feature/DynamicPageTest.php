<?php

namespace Tests\Feature;

use App\Models\Page;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class DynamicPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_view_published_dynamic_page()
    {
        $page = Page::factory()->create([
            'title' => 'My Public Page',
            'slug' => 'my-public-page',
            'is_published' => true,
            'content' => [
                'blocks' => [
                    ['id' => 'abc', 'type' => 'text', 'content' => ['body' => 'Public Content']]
                ]
            ]
        ]);

        $response = $this->get('/my-public-page');

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('DynamicPage')
                ->has('page', fn (Assert $page) => $page
                    ->where('title', 'My Public Page')
                    ->has('content.blocks', 1)
                    ->etc()
                )
            );
    }

    public function test_cannot_view_unpublished_page()
    {
        $page = Page::factory()->create([
            'slug' => 'draft-page',
            'is_published' => false,
        ]);

        $this->get('/draft-page')->assertNotFound();
    }
}
