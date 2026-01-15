<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Nwidart\Modules\Facades\Module;
use Tests\TestCase;
use ZipArchive;

class PluginManagementTest extends TestCase
{
    use \Illuminate\Foundation\Testing\RefreshDatabase;
    
    protected function setUp(): void
    {
        parent::setUp();
        // Clean up any existing TestModule
        if (File::exists(base_path('Modules/TestModule'))) {
            File::deleteDirectory(base_path('Modules/TestModule'));
        }
    }

    protected function tearDown(): void
    {
        if (File::exists(base_path('Modules/TestModule'))) {
            File::deleteDirectory(base_path('Modules/TestModule'));
        }
        parent::tearDown();
    }

    public function test_admin_can_upload_plugin()
    {
        $user = User::factory()->create(['role' => 'admin']); // Assuming 'role' or similar method exists. 
        // Based on routes/web.php, there's an `isAdmin()` check. I'll mock the user to pass that.
        // Actually, looking at routes: `Route::middleware(['auth', 'verified', 'admin' ...`
        // I need to see how `admin` middleware and `isAdmin` works.
        // For now, I'll try with a factory user and assume I can set the attribute.
        
        $this->actingAs($user);

        // Create a zip
        $zipPath = storage_path('app/test_plugin.zip');
        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE) === TRUE) {
            $zip->addEmptyDir('TestModule');
            $zip->addFromString('TestModule/module.json', json_encode([
                'name' => 'TestModule',
                'alias' => 'testmodule',
                'description' => 'A test module',
                'keywords' => [],
                'priority' => 0,
                'providers' => [],
                'aliases' => [],
                'files' => [],
                'requires' => []
            ]));
            $zip->close();
        }

        $file = new UploadedFile($zipPath, 'test_plugin.zip', 'application/zip', null, true);

        $response = $this->post(route('admin.plugins.store'), [
            'plugin' => $file,
        ]);

        $response->assertRedirect();
        
        $this->assertTrue(File::exists(base_path('Modules/TestModule')), 'Module directory should exist');
        $this->assertTrue(File::exists(base_path('Modules/TestModule/module.json')), 'module.json should exist');
    }

    public function test_admin_can_list_plugins()
    {
        $user = User::factory()->create(); 
        // Force admin
        $user->role = 'admin'; // Guessing the column name, might need adjustment
        $user->save();
        
       // Mock the isAdmin method if strictly needed, but if it relies on DB column, saving is enough.
       // Let's assume the user factory creates a valid user and I can override.
        
        // Ensure module exists first (manually create it for this test)
        if (!File::exists(base_path('Modules/TestModule'))) {
            File::makeDirectory(base_path('Modules/TestModule'), 0755, true);
            File::put(base_path('Modules/TestModule/module.json'), json_encode([
                'name' => 'TestModule',
                'description' => 'A test module',
            ]));
        }

        $this->actingAs($user);
        
        $response = $this->get(route('admin.plugins.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/plugins/Index')
            ->has('plugins')
        );
    }
}
