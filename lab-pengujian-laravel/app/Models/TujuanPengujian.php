<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TujuanPengujian extends Model
{
    use HasFactory;

    protected $table = 'tujuan_pengujian';

    protected $fillable = [
        'name',
        'code',
        'requires_input',
        'is_active',
    ];

    protected $casts = [
        'requires_input' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
