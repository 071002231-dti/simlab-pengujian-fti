<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('test_requests', function (Blueprint $table) {
            // Bagian A - Pendaftaran (tambahan)
            $table->string('company_name')->nullable()->after('customer_name');
            $table->string('phone_whatsapp')->nullable()->after('company_name');
            $table->text('address')->nullable()->after('phone_whatsapp');

            // Bagian B - Keperluan & Layanan
            $table->foreignId('test_type_id')->nullable()->after('test_type')->constrained();
            $table->json('tujuan_pengujian')->nullable()->after('test_type_id');

            // Bagian C - Data Sampel (enhanced)
            $table->integer('sample_quantity')->nullable()->after('sample_name');
            $table->string('sample_packaging')->nullable()->after('sample_quantity');
            $table->date('estimated_delivery_date')->nullable()->after('sample_packaging');
            $table->enum('priority', ['regular', 'urgent'])->default('regular')->after('estimated_delivery_date');
            $table->text('special_notes')->nullable()->after('priority');

            // Bagian D - Logistik
            $table->enum('delivery_method', ['antar_langsung', 'ekspedisi'])->nullable()->after('special_notes');
            $table->json('special_handling')->nullable()->after('delivery_method');
            $table->enum('sample_return', ['dikembalikan', 'dimusnahkan', 'tidak_perlu'])->nullable()->after('special_handling');

            // Bagian E - Pernyataan
            $table->boolean('data_accuracy_confirmed')->default(false)->after('sample_return');
            $table->boolean('tat_cost_understood')->default(false)->after('data_accuracy_confirmed');
            $table->timestamp('declaration_timestamp')->nullable()->after('tat_cost_understood');

            // Procedure Linkage
            $table->foreignId('procedure_template_id')->nullable()->after('declaration_timestamp')->constrained();
        });
    }

    public function down(): void
    {
        Schema::table('test_requests', function (Blueprint $table) {
            $table->dropForeign(['test_type_id']);
            $table->dropForeign(['procedure_template_id']);
            $table->dropColumn([
                'company_name',
                'phone_whatsapp',
                'address',
                'test_type_id',
                'tujuan_pengujian',
                'sample_quantity',
                'sample_packaging',
                'estimated_delivery_date',
                'priority',
                'special_notes',
                'delivery_method',
                'special_handling',
                'sample_return',
                'data_accuracy_confirmed',
                'tat_cost_understood',
                'declaration_timestamp',
                'procedure_template_id',
            ]);
        });
    }
};
