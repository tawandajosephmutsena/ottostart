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
        Schema::create('preview_links', function (Blueprint $table) {
            $table->id();
            $table->string('content_type'); // Polymorphic type
            $table->unsignedBigInteger('content_id'); // Polymorphic ID
            $table->string('token', 64)->unique(); // Unique token for the link
            $table->string('password')->nullable(); // Optional password protection
            $table->timestamp('expires_at'); // When the link expires
            $table->text('message')->nullable(); // Optional message for recipients
            $table->unsignedBigInteger('created_by'); // User who created the link
            $table->boolean('is_active')->default(true); // Whether the link is active
            $table->unsignedInteger('view_count')->default(0); // Number of times accessed
            $table->timestamps();

            // Indexes for performance
            $table->index(['content_type', 'content_id']);
            $table->index(['token', 'expires_at', 'is_active']);
            $table->index('created_by');

            // Foreign key constraint
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('preview_links');
    }
};
