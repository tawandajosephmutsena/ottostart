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
        Schema::create('security_events', function (Blueprint $table) {
            $table->id();
            $table->string('type', 50)->index(); // e.g., 'suspicious_query', 'failed_login', 'xss_attempt'
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium')->index();
            $table->text('description');
            $table->string('ip_address', 45)->index(); // IPv6 compatible
            $table->text('user_agent')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->json('metadata')->nullable(); // Additional event data
            $table->timestamp('resolved_at')->nullable()->index();
            $table->timestamps();

            // Indexes for performance
            $table->index(['type', 'severity']);
            $table->index(['created_at', 'severity']);
            $table->index(['ip_address', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('security_events');
    }
};
