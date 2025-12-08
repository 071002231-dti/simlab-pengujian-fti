<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('request_procedures', function (Blueprint $table) {
            $table->id();
            $table->string('test_request_id');
            $table->foreignId('procedure_template_id')->constrained();
            $table->string('procedure_version_snapshot');
            $table->json('procedure_snapshot');
            $table->enum('status', [
                'draft',
                'in_progress',
                'completed',
                'rejected',
                'needs_sample_revision'
            ])->default('draft');
            $table->foreignId('assigned_analyst_id')->nullable()->constrained('users');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('revision_notes')->nullable();
            $table->timestamps();

            $table->foreign('test_request_id')->references('id')->on('test_requests')->onDelete('cascade');
            $table->index(['test_request_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_procedures');
    }
};
