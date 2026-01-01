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
        Schema::table('portfolio_items', function (Blueprint $table) {
            // Composite indexes for common query patterns
            $table->index(['is_published', 'is_featured', 'sort_order'], 'portfolio_published_featured_sorted');
            $table->index(['is_published', 'created_at'], 'portfolio_published_created');
            $table->index(['is_featured', 'sort_order'], 'portfolio_featured_sorted');
        });

        Schema::table('services', function (Blueprint $table) {
            // Composite indexes for common query patterns
            $table->index(['is_published', 'is_featured', 'sort_order'], 'services_published_featured_sorted');
            $table->index(['is_published', 'created_at'], 'services_published_created');
            $table->index(['is_featured', 'sort_order'], 'services_featured_sorted');
        });

        Schema::table('insights', function (Blueprint $table) {
            // Composite indexes for common query patterns
            $table->index(['is_published', 'published_at'], 'insights_published_date');
            $table->index(['is_published', 'is_featured'], 'insights_published_featured');
            $table->index(['category_id', 'is_published', 'published_at'], 'insights_category_published_date');
            $table->index(['author_id', 'is_published'], 'insights_author_published');
        });

        Schema::table('users', function (Blueprint $table) {
            // Index for author lookups
            $table->index(['id', 'name'], 'users_id_name');
        });

        Schema::table('categories', function (Blueprint $table) {
            // Index for category lookups
            $table->index(['id', 'name', 'slug'], 'categories_id_name_slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('portfolio_items', function (Blueprint $table) {
            $table->dropIndex('portfolio_published_featured_sorted');
            $table->dropIndex('portfolio_published_created');
            $table->dropIndex('portfolio_featured_sorted');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropIndex('services_published_featured_sorted');
            $table->dropIndex('services_published_created');
            $table->dropIndex('services_featured_sorted');
        });

        Schema::table('insights', function (Blueprint $table) {
            $table->dropIndex('insights_published_date');
            $table->dropIndex('insights_published_featured');
            $table->dropIndex('insights_category_published_date');
            $table->dropIndex('insights_author_published');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_id_name');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex('categories_id_name_slug');
        });
    }
};
