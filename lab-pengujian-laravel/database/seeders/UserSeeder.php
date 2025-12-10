<?php

namespace Database\Seeders;

use App\Models\Lab;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $tekstilLab = Lab::where('code', 'tekstil')->first();
        $kimiaLab = Lab::where('code', 'kimia')->first();
        $forensikLab = Lab::where('code', 'forensik')->first();

        // Admin
        User::create([
            'name' => 'Administrator',
            'email' => '071002231@uii.ac.id',
            'password' => Hash::make('admin'),
            'role' => 'admin',
            'lab_id' => null,
            'avatar' => null,
        ]);

        // Laboran
        User::create([
            'name' => 'Laboran Tekstil',
            'email' => '111002203@uii.ac.id',
            'password' => Hash::make('123'),
            'role' => 'laboran',
            'lab_id' => $tekstilLab->id,
            'avatar' => null,
        ]);

        User::create([
            'name' => 'Laboran Kimia',
            'email' => '191002101@uii.ac.id',
            'password' => Hash::make('123'),
            'role' => 'laboran',
            'lab_id' => $kimiaLab->id,
            'avatar' => null,
        ]);

        User::create([
            'name' => 'Laboran Forensik',
            'email' => 'crimeleavestrace@gmail.com',
            'password' => Hash::make('123'),
            'role' => 'laboran',
            'lab_id' => $forensikLab->id,
            'avatar' => null,
        ]);

        // Customers
        User::create([
            'name' => 'PT Maju Jaya Textile',
            'email' => 'contact@maju-jaya.com',
            'password' => Hash::make('customer123'),
            'role' => 'customer',
            'lab_id' => null,
            'avatar' => null,
        ]);

        User::create([
            'name' => 'CV Kimia Sejahtera',
            'email' => 'info@kimiasejahtera.co.id',
            'password' => Hash::make('customer123'),
            'role' => 'customer',
            'lab_id' => null,
            'avatar' => null,
        ]);

        User::create([
            'name' => 'PT Digital Forensik Indonesia',
            'email' => 'admin@dfi.id',
            'password' => Hash::make('customer123'),
            'role' => 'customer',
            'lab_id' => null,
            'avatar' => null,
        ]);

        User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi.santoso@gmail.com',
            'password' => Hash::make('customer123'),
            'role' => 'customer',
            'lab_id' => null,
            'avatar' => null,
        ]);

        User::create([
            'name' => 'Siti Rahayu',
            'email' => 'siti.rahayu@yahoo.com',
            'password' => Hash::make('customer123'),
            'role' => 'customer',
            'lab_id' => null,
            'avatar' => null,
        ]);
    }
}
