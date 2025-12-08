<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'laboran', 'customer'])->default('customer')->after('email');
            $table->foreignId('lab_id')->nullable()->after('role')->constrained('labs')->onDelete('set null');
            $table->string('avatar')->nullable()->after('lab_id');
            $table->string('google_id')->nullable()->unique()->after('avatar');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['lab_id']);
            $table->dropColumn(['role', 'lab_id', 'avatar', 'google_id']);
        });
    }
};
