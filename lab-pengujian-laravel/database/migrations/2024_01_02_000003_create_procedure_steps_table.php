<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('procedure_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('procedure_template_id')->constrained()->onDelete('cascade');
            $table->integer('step_order');
            $table->string('name');
            $table->text('description');
            $table->json('equipment')->nullable();
            $table->json('materials')->nullable();
            $table->json('parameters')->nullable();
            $table->string('reference_standard')->nullable();
            $table->json('pass_fail_criteria')->nullable();
            $table->integer('estimated_duration_minutes');
            $table->enum('responsible_role', ['analyst', 'admin', 'supervisor'])->default('analyst');
            $table->boolean('requires_approval')->default(false);
            $table->timestamps();

            $table->unique(['procedure_template_id', 'step_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('procedure_steps');
    }
};
