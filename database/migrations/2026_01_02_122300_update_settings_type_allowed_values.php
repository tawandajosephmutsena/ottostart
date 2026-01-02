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
        // For SQLite, we change to string to allow more types without check constraint issues
        Schema::table('settings', function (Blueprint $table) {
            $table->string('type')->default('text')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->enum('type', ['text', 'json', 'boolean', 'number'])->default('text')->change();
        });
    }
};
