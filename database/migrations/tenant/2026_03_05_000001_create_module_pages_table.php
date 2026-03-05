<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('module_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->string('tab');
            $table->json('layout')->nullable();
            $table->boolean('is_published')->default(false);
            $table->integer('version')->default(1);
            $table->integer('order')->default(1);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['module_id', 'tab']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('module_pages');
    }
};
