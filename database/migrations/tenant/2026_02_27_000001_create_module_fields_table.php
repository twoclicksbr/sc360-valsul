<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('module_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->string('name');
            $table->string('type')->default('string');
            $table->string('length')->nullable();
            $table->boolean('nullable')->default(false);
            $table->string('default')->nullable();
            $table->boolean('unique')->default(false);
            $table->boolean('index')->default(false);
            $table->string('fk_table')->nullable();
            $table->string('fk_column')->nullable();
            $table->boolean('is_system')->default(false);
            $table->integer('order')->default(1);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('module_fields');
    }
};
