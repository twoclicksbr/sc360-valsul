<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('url_prefix')->nullable();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->enum('type', ['module', 'submodule', 'pivot'])->default('module');
            $table->boolean('is_custom')->default(false);
            $table->string('model')->default('GenericModel');
            $table->string('request')->default('GenericRequest');
            $table->string('controller')->default('GenericController');
            $table->string('observer')->default('GenericObserver');
            $table->string('service')->default('GenericService');
            $table->integer('order')->default(1);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
