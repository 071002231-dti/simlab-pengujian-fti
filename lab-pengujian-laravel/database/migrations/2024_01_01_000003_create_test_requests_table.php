<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('test_requests', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('customer_name');
            $table->foreignId('lab_id')->constrained()->onDelete('cascade');
            $table->string('lab_name');
            $table->string('test_type');
            $table->date('date_submitted');
            $table->enum('status', [
                'Menunggu Persetujuan',
                'Disetujui Admin',
                'Sampel Diterima',
                'Sedang Diuji',
                'Selesai',
                'Hasil Dikirim'
            ])->default('Menunggu Persetujuan');
            $table->string('sample_name')->nullable();
            $table->text('description')->nullable();
            $table->date('expiry_date')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['lab_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_requests');
    }
};
