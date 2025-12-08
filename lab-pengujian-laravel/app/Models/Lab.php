<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lab extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'services',
        'icon_name',
    ];

    protected $casts = [
        'services' => 'array',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function testRequests()
    {
        return $this->hasMany(TestRequest::class);
    }

    public function testTypes()
    {
        return $this->hasMany(TestType::class);
    }

    public function activeTestTypes()
    {
        return $this->hasMany(TestType::class)->where('is_active', true);
    }
}
