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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('description')->nullable();
            $table->string('category')->nullable();
            $table->enum('type', ['online', 'offline', 'hybrid'])->default('offline');
            $table->enum('status', ['draft', 'published', 'cancelled'])->default('draft');

            // Offline fields
            $table->string('location')->nullable();
            $table->string('maps_url')->nullable();

            // Online fields
            $table->string('online_platform')->nullable(); // zoom, youtube, etc
            $table->string('online_url')->nullable();     // protected streaming URL

            // Media
            $table->string('banner')->nullable();

            // Schedule
            $table->dateTime('starts_at')->nullable();
            $table->dateTime('ends_at')->nullable();

            // Capacity
            $table->unsignedInteger('max_attendees')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
