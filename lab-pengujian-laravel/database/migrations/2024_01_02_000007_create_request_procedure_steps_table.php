<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('request_procedure_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_procedure_id')->constrained()->onDelete('cascade');
            $table->foreignId('procedure_step_id')->constrained();
            $table->integer('step_order');
            $table->enum('status', [
                'pending',
                'in_progress',
                'completed',
                'skipped',
                'failed'
            ])->default('pending');
            $table->json('results')->nullable();
            $table->json('attachments')->nullable();
            $table->text('notes')->nullable();
            $table->enum('pass_fail_status', ['pass', 'fail', 'pending'])->default('pending');
            $table->foreignId('executed_by')->nullable()->constrained('users');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['request_procedure_id', 'step_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_procedure_steps');
    }
};
