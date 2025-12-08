<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            LabSeeder::class,
            UserSeeder::class,
            TestTypeSeeder::class,
            TujuanPengujianSeeder::class,
            ProcedureTemplateSeeder::class,
            TestRequestSeeder::class,
        ]);
    }
}
