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
        Schema::create('event_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['free', 'paid'])->default('free');
            $table->enum('tier', ['regular', 'early_bird', 'vip', 'group'])->default('regular');
            $table->unsignedBigInteger('price')->default(0); // in smallest currency unit (IDR)
            $table->unsignedInteger('quota')->nullable();
            $table->unsignedSmallInteger('max_per_order')->default(1);
            $table->dateTime('sales_start')->nullable();
            $table->dateTime('sales_end')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_tickets');
    }
};
