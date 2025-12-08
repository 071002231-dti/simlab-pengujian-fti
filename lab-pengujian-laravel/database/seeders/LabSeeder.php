<?php

namespace Database\Seeders;

use App\Models\Lab;
use Illuminate\Database\Seeder;

class LabSeeder extends Seeder
{
    public function run(): void
    {
        $labs = [
            [
                'name' => 'Laboratorium Tekstil',
                'code' => 'tekstil',
                'description' => 'Laboratorium pengujian kualitas tekstil dan produk berbahan dasar serat',
                'services' => [
                    'Uji Kekuatan Tarik',
                    'Uji Ketahanan Luntur Warna',
                    'Uji Komposisi Serat',
                    'Uji Pilling',
                    'Uji Shrinkage',
                ],
                'icon_name' => 'Shirt',
            ],
            [
                'name' => 'Laboratorium Kimia',
                'code' => 'kimia',
                'description' => 'Laboratorium analisis kimia untuk berbagai jenis sampel',
                'services' => [
                    'Uji pH',
                    'Uji Kadar Air',
                    'Uji Kandungan Logam Berat',
                    'Analisis Spektrofotometri',
                    'Uji Kemurnian',
                ],
                'icon_name' => 'FlaskConical',
            ],
            [
                'name' => 'Laboratorium Forensik Digital',
                'code' => 'forensik',
                'description' => 'Laboratorium investigasi dan analisis bukti digital',
                'services' => [
                    'Analisis Perangkat Mobile',
                    'Recovery Data',
                    'Analisis Malware',
                    'Investigasi Email',
                    'Analisis Network Traffic',
                ],
                'icon_name' => 'Shield',
            ],
        ];

        foreach ($labs as $lab) {
            Lab::create($lab);
        }
    }
}
