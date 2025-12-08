<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('procedure_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_type_id')->constrained()->onDelete('cascade');
            $table->string('version');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('reference_standard')->nullable();
            $table->integer('estimated_tat_days');
            $table->enum('status', ['draft', 'active', 'deprecated'])->default('draft');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['test_type_id', 'version']);
            $table->index(['test_type_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('procedure_templates');
    }
};
