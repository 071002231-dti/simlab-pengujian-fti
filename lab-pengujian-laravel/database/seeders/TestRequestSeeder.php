<?php

namespace Database\Seeders;

use App\Models\Lab;
use App\Models\TestRequest;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestRequestSeeder extends Seeder
{
    public function run(): void
    {
        $tekstilLab = Lab::where('code', 'tekstil')->first();
        $kimiaLab = Lab::where('code', 'kimia')->first();
        $forensikLab = Lab::where('code', 'forensik')->first();

        $customers = User::where('role', 'customer')->get();

        $requests = [
            [
                'user' => $customers->where('email', 'contact@maju-jaya.com')->first(),
                'lab' => $tekstilLab,
                'test_type' => 'Uji Kekuatan Tarik',
                'sample_name' => 'Kain Katun Premium',
                'description' => 'Pengujian kekuatan tarik untuk kain katun grade A',
                'status' => TestRequest::STATUS_PENDING,
                'days_ago' => 1,
            ],
            [
                'user' => $customers->where('email', 'contact@maju-jaya.com')->first(),
                'lab' => $tekstilLab,
                'test_type' => 'Uji Ketahanan Luntur Warna',
                'sample_name' => 'Kain Batik Motif Parang',
                'description' => 'Uji ketahanan luntur warna terhadap pencucian',
                'status' => TestRequest::STATUS_APPROVED,
                'days_ago' => 3,
            ],
            [
                'user' => $customers->where('email', 'info@kimiasejahtera.co.id')->first(),
                'lab' => $kimiaLab,
                'test_type' => 'Uji Kandungan Logam Berat',
                'sample_name' => 'Sampel Air Limbah',
                'description' => 'Analisis kandungan logam berat pada air limbah industri',
                'status' => TestRequest::STATUS_IN_PROGRESS,
                'days_ago' => 5,
            ],
            [
                'user' => $customers->where('email', 'info@kimiasejahtera.co.id')->first(),
                'lab' => $kimiaLab,
                'test_type' => 'Uji pH',
                'sample_name' => 'Larutan Kimia X-100',
                'description' => 'Pengujian pH larutan kimia untuk keperluan produksi',
                'status' => TestRequest::STATUS_COMPLETED,
                'days_ago' => 7,
            ],
            [
                'user' => $customers->where('email', 'admin@dfi.id')->first(),
                'lab' => $forensikLab,
                'test_type' => 'Analisis Perangkat Mobile',
                'sample_name' => 'iPhone 13 Pro',
                'description' => 'Ekstraksi dan analisis data dari perangkat mobile',
                'status' => TestRequest::STATUS_RECEIVED,
                'days_ago' => 2,
            ],
            [
                'user' => $customers->where('email', 'admin@dfi.id')->first(),
                'lab' => $forensikLab,
                'test_type' => 'Recovery Data',
                'sample_name' => 'HDD Seagate 1TB',
                'description' => 'Recovery data dari harddisk yang rusak',
                'status' => TestRequest::STATUS_DELIVERED,
                'days_ago' => 14,
            ],
            [
                'user' => $customers->where('email', 'budi.santoso@gmail.com')->first(),
                'lab' => $tekstilLab,
                'test_type' => 'Uji Komposisi Serat',
                'sample_name' => 'Kain Campuran',
                'description' => 'Identifikasi komposisi serat pada kain campuran',
                'status' => TestRequest::STATUS_PENDING,
                'days_ago' => 0,
            ],
            [
                'user' => $customers->where('email', 'siti.rahayu@yahoo.com')->first(),
                'lab' => $kimiaLab,
                'test_type' => 'Analisis Spektrofotometri',
                'sample_name' => 'Sampel Kosmetik',
                'description' => 'Analisis kandungan bahan aktif pada produk kosmetik',
                'status' => TestRequest::STATUS_IN_PROGRESS,
                'days_ago' => 4,
            ],
        ];

        foreach ($requests as $data) {
            TestRequest::create([
                'id' => TestRequest::generateId(),
                'user_id' => $data['user']->id,
                'customer_name' => $data['user']->name,
                'lab_id' => $data['lab']->id,
                'lab_name' => $data['lab']->name,
                'test_type' => $data['test_type'],
                'date_submitted' => now()->subDays($data['days_ago']),
                'status' => $data['status'],
                'sample_name' => $data['sample_name'],
                'description' => $data['description'],
                'expiry_date' => now()->addDays(30 - $data['days_ago']),
            ]);
        }
    }
}
