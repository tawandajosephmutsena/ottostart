<?php

namespace Tests\Feature\Admin;

use App\Models\Page;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PageBuilderTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create an admin user for all tests
        $this->user = User::factory()->create(['role' => 'admin']);
    }

    public function test_admin_can_view_pages_index()
    {
        dump('Has pages table? ' . (\Illuminate\Support\Facades\Schema::hasTable('pages') ? 'Yes' : 'No'));

        $response = $this->actingAs($this->user)
            ->get(route('admin.pages.index'));

        $response->assertOk();
    }

    public function test_admin_can_create_new_page()
    {
        $this->withoutExceptionHandling();

        $response = $this->actingAs($this->user)
            ->post(route('admin.pages.store'), [
                'title' => 'New Page',
                'slug' => 'new-page',
                'meta_title' => 'Meta Title',
                'meta_description' => 'Meta Description',
                'template' => 'default',
                'is_published' => true,
                'content' => [
                    'blocks' => [
                        [
                            'id' => 'block-1',
                            'type' => 'text',
                            'content' => ['body' => 'Hello World']
                        ]
                    ]
                ]
            ]);

        $response->assertRedirect(route('admin.pages.index'));
        
        $this->assertDatabaseHas('pages', [
            'title' => 'New Page',
            'slug' => 'new-page',
            'is_published' => true,
        ]);

        $page = Page::first();
        $this->assertEquals('Hello World', $page->content['blocks'][0]['content']['body']);
    }

    public function test_admin_can_update_page_with_blocks()
    {
        $page = Page::factory()->create();

        $response = $this->actingAs($this->user)
            ->put(route('admin.pages.update', $page), [
                'title' => 'Updated Page',
                'slug' => 'updated-page',
                'meta_title' => 'Updated Meta',
                'meta_description' => 'Updated Desc',
                'template' => 'default',
                'is_published' => false,
                'content' => [
                    'blocks' => [
                        [
                            'id' => 'block-1',
                            'type' => 'hero',
                            'content' => ['title' => 'Hero Title']
                        ],
                        [
                            'id' => 'block-2',
                            'type' => 'text',
                            'content' => ['body' => 'Text Content']
                        ]
                    ]
                ]
            ]);

        $response->assertRedirect(route('admin.pages.index'));

        $page->refresh();
        $this->assertEquals('Updated Page', $page->title);
        $this->assertCount(2, $page->content['blocks']);
        $this->assertEquals('Hero Title', $page->content['blocks'][0]['content']['title']);
    }

    public function test_admin_can_delete_page()
    {
        $page = Page::factory()->create();

        $response = $this->actingAs($this->user)
            ->delete(route('admin.pages.destroy', $page));

        $response->assertRedirect(route('admin.pages.index'));
        $this->assertDatabaseMissing('pages', ['id' => $page->id]);
    }
}
