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
        Schema::create('cache_performance_logs', function (Blueprint $table) {
            $table->id();
            $table->timestamp('timestamp');
            $table->decimal('hit_rate', 5, 2)->default(0);
            $table->decimal('average_response_time', 8, 4)->default(0);
            $table->integer('total_operations')->default(0);
            $table->json('memory_usage')->nullable();
            $table->json('redis_stats')->nullable();
            $table->timestamps();

            $table->index('timestamp');
            $table->index('hit_rate');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cache_performance_logs');
    }
};
