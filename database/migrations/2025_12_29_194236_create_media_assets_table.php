<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('media_assets', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('original_name');
            $table->string('mime_type', 100);
            $table->bigInteger('size');
            $table->string('path', 500);
            $table->string('alt_text')->nullable();
            $table->text('caption')->nullable();
            $table->string('folder')->nullable();
            $table->json('tags')->nullable();
            $table->timestamps();
            
            $table->index('filename');
            $table->index('mime_type');
            $table->index('folder');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_assets');
    }
};
