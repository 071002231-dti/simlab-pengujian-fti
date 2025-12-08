<?php

namespace Database\Seeders;

use App\Models\Lab;
use App\Models\TestType;
use Illuminate\Database\Seeder;

class TestTypeSeeder extends Seeder
{
    public function run(): void
    {
        $tekstilLab = Lab::where('code', 'tekstil')->first();
        $kimiaLab = Lab::where('code', 'kimia')->first();
        $forensikLab = Lab::where('code', 'forensik')->first();

        // Lab Tekstil
        $testTypes = [
            [
                'lab_id' => $tekstilLab->id,
                'name' => 'Pengujian Nomor Benang',
                'code' => 'PNB',
                'description' => 'Pengujian untuk menentukan nomor/kehalusan benang tekstil',
            ],
            [
                'lab_id' => $tekstilLab->id,
                'name' => 'Pengujian Jenis Anyaman',
                'code' => 'PJA',
                'description' => 'Identifikasi dan analisis jenis anyaman pada kain',
            ],
            [
                'lab_id' => $tekstilLab->id,
                'name' => 'Pengujian Tetal Benang',
                'code' => 'PTB',
                'description' => 'Pengujian kerapatan benang per satuan panjang kain',
            ],
            // Lab Kimia
            [
                'lab_id' => $kimiaLab->id,
                'name' => 'Pengujian Kadar Air',
                'code' => 'PKA',
                'description' => 'Analisis kandungan air dalam sampel menggunakan metode gravimetri',
            ],
            [
                'lab_id' => $kimiaLab->id,
                'name' => 'Pengujian Kadar Abu',
                'code' => 'PKAB',
                'description' => 'Analisis kandungan abu/mineral dalam sampel',
            ],
            // Lab Forensik Digital
            [
                'lab_id' => $forensikLab->id,
                'name' => 'Pemeriksaan Komputer',
                'code' => 'PKP',
                'description' => 'Analisis forensik pada perangkat komputer/laptop',
            ],
            [
                'lab_id' => $forensikLab->id,
                'name' => 'Pemeriksaan Handphone',
                'code' => 'PHP',
                'description' => 'Ekstraksi dan analisis data dari perangkat mobile',
            ],
        ];

        foreach ($testTypes as $type) {
            TestType::create($type);
        }
    }
}
