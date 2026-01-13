<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Nwidart\Modules\Facades\Module;
use ZipArchive;

class PluginService
{
    public function install(UploadedFile $file): void
    {
        $path = base_path('Modules');
        if (!File::exists($path)) {
            File::makeDirectory($path, 0755, true);
        }

        $zip = new ZipArchive;
        $status = $zip->open($file->getRealPath());

        if ($status === true) {
            $zip->extractTo(base_path('Modules'));
            $zip->close();
        } else {
            throw new \Exception('Failed to open ZIP file.');
        }
    }

    public function remove(string $name): void
    {
        $module = Module::find($name);
        if ($module) {
            $module->delete();
        }
    }

    public function toggle(string $name): void
    {
        $module = Module::find($name);
        if ($module) {
            if ($module->isEnabled()) {
                $module->disable();
            } else {
                $module->enable();
            }
        }
    }

    public function all(): array
    {
        return array_values(array_map(function ($module) {
            return [
                'name' => $module->getName(),
                'description' => $module->getDescription(),
                'enabled' => $module->isEnabled(),
                'path' => $module->getPath(),
            ];
        }, Module::all()));
    }
}
