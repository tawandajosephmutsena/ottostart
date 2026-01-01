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
        Schema::create('content_versions', function (Blueprint $table) {
            $table->id();
            $table->morphs('versionable'); // polymorphic relationship
            $table->unsignedInteger('version_number');
            $table->json('content_data'); // stores the full content snapshot
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
            $table->string('change_summary')->nullable();
            $table->text('change_notes')->nullable();
            $table->boolean('is_published')->default(false);
            $table->boolean('is_current')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            // Indexes for performance (morphs() already creates versionable index)
            $table->index(['version_number']);
            $table->index(['is_current']);
            $table->index(['is_published']);
            $table->index(['created_at']);

            // Ensure version numbers are unique per content item
            $table->unique(['versionable_type', 'versionable_id', 'version_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_versions');
    }
};