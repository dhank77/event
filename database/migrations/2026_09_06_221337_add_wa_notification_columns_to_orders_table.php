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
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('wa_pending_sent_at')->nullable()->after('payment_type');
            $table->timestamp('wa_paid_sent_at')->nullable()->after('wa_pending_sent_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['wa_pending_sent_at', 'wa_paid_sent_at']);
        });
    }
};
