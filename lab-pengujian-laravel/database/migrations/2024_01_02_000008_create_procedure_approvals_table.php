<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('procedure_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_procedure_id')->constrained()->onDelete('cascade');
            $table->foreignId('request_procedure_step_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('approval_type', [
                'admin_verification',
                'analyst_verification',
                'step_approval',
                'supervisor_approval'
            ]);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('requested_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['request_procedure_id', 'approval_type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('procedure_approvals');
    }
};
