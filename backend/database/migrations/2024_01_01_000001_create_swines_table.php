<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('swines', function (Blueprint $table) {
            $table->id();
            $table->string('swine_name');
            $table->date('breeding_date');
            $table->date('pregnant_date');
            $table->date('iron_date');
            $table->date('labor_date_start');
            $table->date('labor_date_end');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('swines');
    }
};
