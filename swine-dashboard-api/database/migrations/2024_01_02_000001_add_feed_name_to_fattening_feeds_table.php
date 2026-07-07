<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fattening_feeds', function (Blueprint $table) {
            $table->string('feed_name')->after('fattening_batch_id');
        });
    }

    public function down(): void
    {
        Schema::table('fattening_feeds', function (Blueprint $table) {
            $table->dropColumn('feed_name');
        });
    }
};
