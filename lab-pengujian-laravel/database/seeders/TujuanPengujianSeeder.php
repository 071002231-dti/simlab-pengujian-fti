<?php

namespace Database\Seeders;

use App\Models\TujuanPengujian;
use Illuminate\Database\Seeder;

class TujuanPengujianSeeder extends Seeder
{
    public function run(): void
    {
        $tujuan = [
            [
                'name' => 'Kesesuaian SNI/ISO',
                'code' => 'SNI_ISO',
                'requires_input' => false,
            ],
            [
                'name' => 'Internal QA/QC',
                'code' => 'QA_QC',
                'requires_input' => false,
            ],
            [
                'name' => 'Sertifikasi/Perizinan',
                'code' => 'SERTIFIKASI',
                'requires_input' => false,
            ],
            [
                'name' => 'Penelitian',
                'code' => 'PENELITIAN',
                'requires_input' => false,
            ],
            [
                'name' => 'Lainnya',
                'code' => 'LAINNYA',
                'requires_input' => true,
            ],
        ];

        foreach ($tujuan as $item) {
            TujuanPengujian::create($item);
        }
    }
}
