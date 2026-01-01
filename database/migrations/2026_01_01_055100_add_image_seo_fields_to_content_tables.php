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
        // Add alt text and title fields for portfolio items
        Schema::table('portfolio_items', function (Blueprint $table) {
            $table->string('featured_image_alt')->nullable()->after('featured_image');
            $table->string('featured_image_title')->nullable()->after('featured_image_alt');
        });

        // Add alt text and title fields for insights
        Schema::table('insights', function (Blueprint $table) {
            $table->string('featured_image_alt')->nullable()->after('featured_image');
            $table->string('featured_image_title')->nullable()->after('featured_image_alt');
        });

        // Add alt text and title fields for services
        Schema::table('services', function (Blueprint $table) {
            $table->string('featured_image_alt')->nullable()->after('featured_image');
            $table->string('featured_image_title')->nullable()->after('featured_image_alt');
        });

        // Add alt text and title fields for team members
        Schema::table('team_members', function (Blueprint $table) {
            $table->string('avatar_alt')->nullable()->after('avatar');
            $table->string('avatar_title')->nullable()->after('avatar_alt');
        });

        // Add title field to media assets (alt_text already exists)
        Schema::table('media_assets', function (Blueprint $table) {
            $table->string('title')->nullable()->after('alt_text');
            $table->json('seo_metadata')->nullable()->after('title');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('portfolio_items', function (Blueprint $table) {
            $table->dropColumn(['featured_image_alt', 'featured_image_title']);
        });

        Schema::table('insights', function (Blueprint $table) {
            $table->dropColumn(['featured_image_alt', 'featured_image_title']);
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['featured_image_alt', 'featured_image_title']);
        });

        Schema::table('team_members', function (Blueprint $table) {
            $table->dropColumn(['avatar_alt', 'avatar_title']);
        });

        Schema::table('media_assets', function (Blueprint $table) {
            $table->dropColumn(['title', 'seo_metadata']);
        });
    }
};