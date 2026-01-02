<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add performance indexes to frequently queried columns
     */
    public function up(): void
    {
        // Portfolio items indexes
        Schema::table('portfolio_items', function (Blueprint $table) {
            $table->index(['is_featured', 'is_published'], 'idx_portfolio_featured_published');
            $table->index('slug', 'idx_portfolio_slug');
            $table->index('created_at', 'idx_portfolio_created');
        });

        // Services indexes
        Schema::table('services', function (Blueprint $table) {
            $table->index(['is_featured', 'is_published'], 'idx_services_featured_published');
            $table->index('slug', 'idx_services_slug');
        });

        // Insights indexes
        Schema::table('insights', function (Blueprint $table) {
            $table->index(['is_published', 'published_at'], 'idx_insights_published_date');
            $table->index('slug', 'idx_insights_slug');
            $table->index('author_id', 'idx_insights_author');
            $table->index('category_id', 'idx_insights_category');
        });

        // Pages indexes
        Schema::table('pages', function (Blueprint $table) {
            $table->index(['slug', 'is_published'], 'idx_pages_slug_published');
            $table->index('is_published', 'idx_pages_published');
        });

        // Contact inquiries indexes (for admin panel performance)
        Schema::table('contact_inquiries', function (Blueprint $table) {
            $table->index('status', 'idx_contact_status');
            $table->index('created_at', 'idx_contact_created');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('portfolio_items', function (Blueprint $table) {
            $table->dropIndex('idx_portfolio_featured_published');
            $table->dropIndex('idx_portfolio_slug');
            $table->dropIndex('idx_portfolio_created');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropIndex('idx_services_featured_published');
            $table->dropIndex('idx_services_slug');
        });

        Schema::table('insights', function (Blueprint $table) {
            $table->dropIndex('idx_insights_published_date');
            $table->dropIndex('idx_insights_slug');
            $table->dropIndex('idx_insights_author');
            $table->dropIndex('idx_insights_category');
        });

        Schema::table('pages', function (Blueprint $table) {
            $table->dropIndex('idx_pages_slug_published');
            $table->dropIndex('idx_pages_published');
        });

        Schema::table('contact_inquiries', function (Blueprint $table) {
            $table->dropIndex('idx_contact_status');
            $table->dropIndex('idx_contact_created');
        });
    }
};
