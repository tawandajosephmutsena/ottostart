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
        Schema::create('navigation_menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained('navigation_menus')->onDelete('cascade');
            $table->foreignId('page_id')->nullable()->constrained('pages')->onDelete('set null');
            $table->foreignId('parent_id')->nullable()->constrained('navigation_menu_items')->onDelete('cascade');
            $table->string('title');
            $table->string('url')->nullable(); // For custom URLs (when page_id is null)
            $table->integer('order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->boolean('open_in_new_tab')->default(false);
            $table->string('icon')->nullable(); // Optional icon class or name
            $table->timestamps();

            $table->index(['menu_id', 'order']);
            $table->index('parent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('navigation_menu_items');
    }
};
