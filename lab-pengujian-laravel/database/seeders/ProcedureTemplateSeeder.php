<?php

namespace Database\Seeders;

use App\Models\ProcedureTemplate;
use App\Models\ProcedureStep;
use App\Models\TestType;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProcedureTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        // SOP Pengujian Kadar Air
        $pkaType = TestType::where('code', 'PKA')->first();
        $templatePKA = ProcedureTemplate::create([
            'test_type_id' => $pkaType->id,
            'version' => '1.0',
            'name' => 'SOP Pengujian Kadar Air v1.0',
            'description' => 'Prosedur standar pengujian kadar air menggunakan metode gravimetri sesuai SNI ISO 712:2015',
            'reference_standard' => 'SNI ISO 712:2015',
            'estimated_tat_days' => 5,
            'status' => 'active',
            'created_by' => $admin->id,
            'approved_by' => $admin->id,
            'approved_at' => now(),
        ]);

        $stepsPKA = [
            [
                'step_order' => 1,
                'name' => 'Persiapan Sampel',
                'description' => 'Siapkan sampel sesuai ketentuan. Timbang cawan kosong dan catat beratnya. Masukkan sampel ke dalam cawan dan timbang berat awal.',
                'equipment' => ['Timbangan Analitik', 'Cawan Porselen', 'Spatula'],
                'materials' => ['Desikator', 'Silika Gel'],
                'parameters' => [
                    ['name' => 'Berat Cawan Kosong', 'unit' => 'gram', 'type' => 'number'],
                    ['name' => 'Berat Sampel Awal', 'unit' => 'gram', 'type' => 'number'],
                ],
                'pass_fail_criteria' => null,
                'estimated_duration_minutes' => 30,
                'responsible_role' => 'analyst',
                'requires_approval' => false,
            ],
            [
                'step_order' => 2,
                'name' => 'Pengeringan dalam Oven',
                'description' => 'Masukkan cawan berisi sampel ke dalam oven pada suhu 105°C selama 3 jam. Pastikan sirkulasi udara baik.',
                'equipment' => ['Oven', 'Penjepit Cawan', 'Timer'],
                'materials' => [],
                'parameters' => [
                    ['name' => 'Suhu Oven', 'unit' => '°C', 'type' => 'number'],
                    ['name' => 'Durasi Pengeringan', 'unit' => 'jam', 'type' => 'number'],
                ],
                'pass_fail_criteria' => ['suhu_min' => 103, 'suhu_max' => 107, 'unit' => '°C'],
                'estimated_duration_minutes' => 180,
                'responsible_role' => 'analyst',
                'requires_approval' => false,
            ],
            [
                'step_order' => 3,
                'name' => 'Pendinginan',
                'description' => 'Pindahkan cawan ke dalam desikator dan dinginkan hingga suhu ruang (±30 menit).',
                'equipment' => ['Desikator', 'Penjepit Cawan'],
                'materials' => ['Silika Gel'],
                'parameters' => [
                    ['name' => 'Waktu Pendinginan', 'unit' => 'menit', 'type' => 'number'],
                ],
                'pass_fail_criteria' => null,
                'estimated_duration_minutes' => 30,
                'responsible_role' => 'analyst',
                'requires_approval' => false,
            ],
            [
                'step_order' => 4,
                'name' => 'Penimbangan Akhir',
                'description' => 'Timbang cawan berisi sampel yang sudah dikeringkan. Catat berat akhir.',
                'equipment' => ['Timbangan Analitik'],
                'materials' => [],
                'parameters' => [
                    ['name' => 'Berat Sampel Akhir', 'unit' => 'gram', 'type' => 'number'],
                ],
                'pass_fail_criteria' => null,
                'estimated_duration_minutes' => 15,
                'responsible_role' => 'analyst',
                'requires_approval' => false,
            ],
            [
                'step_order' => 5,
                'name' => 'Kalkulasi & Evaluasi',
                'description' => 'Hitung kadar air dengan rumus: ((Berat Awal - Berat Akhir) / Berat Awal) x 100%. Evaluasi hasil terhadap standar.',
                'equipment' => ['Kalkulator/Komputer'],
                'materials' => [],
                'parameters' => [
                    ['name' => 'Kadar Air', 'unit' => '%', 'type' => 'calculated'],
                ],
                'pass_fail_criteria' => ['max_value' => 14, 'unit' => '%', 'description' => 'Kadar air maksimal 14%'],
                'estimated_duration_minutes' => 20,
                'responsible_role' => 'analyst',
                'requires_approval' => true,
            ],
        ];

        foreach ($stepsPKA as $step) {
            ProcedureStep::create(array_merge($step, ['procedure_template_id' => $templatePKA->id]));
        }

        // SOP Pemeriksaan Handphone
        $phpType = TestType::where('code', 'PHP')->first();
        $templatePHP = ProcedureTemplate::create([
            'test_type_id' => $phpType->id,
            'version' => '1.0',
            'name' => 'SOP Pemeriksaan Forensik Handphone v1.0',
            'description' => 'Prosedur standar ekstraksi dan analisis data dari perangkat mobile sesuai ISO/IEC 27037:2012',
            'reference_standard' => 'ISO/IEC 27037:2012',
            'estimated_tat_days' => 7,
            'status' => 'active',
            'created_by' => $admin->id,
            'approved_by' => $admin->id,
            'approved_at' => now(),
        ]);

        $stepsPHP = [
            [
                'step_order' => 1,
                'name' => 'Dokumentasi & Identifikasi Barang Bukti',
                'description' => 'Foto barang bukti dari berbagai sudut. Catat kondisi fisik, IMEI, model, dan informasi relevan lainnya.',
                'equipment' => ['Kamera', 'Lampu', 'Form Chain of Custody'],
                'materials' => ['Label Barang Bukti', 'Kantong Anti-Statik'],
                'parameters' => [
                    ['name' => 'IMEI', 'unit' => '', 'type' => 'text'],
                    ['name' => 'Model Perangkat', 'unit' => '', 'type' => 'text'],
                    ['name' => 'Kondisi Fisik', 'unit' => '', 'type' => 'text'],
                ],
                'pass_fail_criteria' => null,
                'estimated_duration_minutes' => 30,
                'responsible_role' => 'analyst',
                'requires_approval' => false,
            ],
            [
                'step_order' => 2,
                'name' => 'Isolasi Jaringan',
                'description' => 'Aktifkan mode pesawat atau masukkan ke dalam faraday bag untuk mencegah perubahan data jarak jauh.',
                'equipment' => ['Faraday Bag'],
                'materials' => [],
                'parameters' => [
                    ['name' => 'Metode Isolasi', 'unit' => '', 'type' => 'select', 'options' => ['Faraday Bag', 'Airplane Mode', 'SIM Removal']],
                ],
                'pass_fail_criteria' => null,
                'estimated_duration_minutes' => 10,
                'responsible_role' => 'analyst',
                'requires_approval' => false,
            ],
            [
                'step_order' => 3,
                'name' => 'Ekstraksi Data',
                'description' => 'Lakukan ekstraksi data menggunakan tools forensik yang sesuai (Cellebrite/UFED/dll).',
                'equipment' => ['Workstation Forensik', 'Cellebrite UFED', 'Kabel Data'],
                'materials' => ['Write Blocker'],
                'parameters' => [
                    ['name' => 'Tipe Ekstraksi', 'unit' => '', 'type' => 'select', 'options' => ['Physical', 'Logical', 'File System']],
                    ['name' => 'Tools yang Digunakan', 'unit' => '', 'type' => 'text'],
                    ['name' => 'Hash Hasil Ekstraksi', 'unit' => '', 'type' => 'text'],
                ],
                'pass_fail_criteria' => null,
                'estimated_duration_minutes' => 120,
                'responsible_role' => 'analyst',
                'requires_approval' => false,
            ],
            [
                'step_order' => 4,
                'name' => 'Analisis Data',
                'description' => 'Analisis hasil ekstraksi untuk menemukan bukti digital yang relevan dengan kasus.',
                'equipment' => ['Workstation Analisis', 'Software Analisis'],
                'materials' => [],
                'parameters' => [
                    ['name' => 'Jumlah Kontak', 'unit' => '', 'type' => 'number'],
                    ['name' => 'Jumlah Pesan', 'unit' => '', 'type' => 'number'],
                    ['name' => 'Jumlah File Media', 'unit' => '', 'type' => 'number'],
                    ['name' => 'Temuan Relevan', 'unit' => '', 'type' => 'text'],
                ],
                'pass_fail_criteria' => null,
                'estimated_duration_minutes' => 240,
                'responsible_role' => 'analyst',
                'requires_approval' => false,
            ],
            [
                'step_order' => 5,
                'name' => 'Pembuatan Laporan',
                'description' => 'Dokumentasikan semua temuan dalam laporan forensik yang komprehensif.',
                'equipment' => ['Komputer', 'Template Laporan'],
                'materials' => [],
                'parameters' => [
                    ['name' => 'Nomor Laporan', 'unit' => '', 'type' => 'text'],
                ],
                'pass_fail_criteria' => null,
                'estimated_duration_minutes' => 180,
                'responsible_role' => 'analyst',
                'requires_approval' => true,
            ],
        ];

        foreach ($stepsPHP as $step) {
            ProcedureStep::create(array_merge($step, ['procedure_template_id' => $templatePHP->id]));
        }
    }
}
