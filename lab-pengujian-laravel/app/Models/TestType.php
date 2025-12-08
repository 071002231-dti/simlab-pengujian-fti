<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestType extends Model
{
    use HasFactory;

    protected $fillable = [
        'lab_id',
        'name',
        'code',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function lab()
    {
        return $this->belongsTo(Lab::class);
    }

    public function procedureTemplates()
    {
        return $this->hasMany(ProcedureTemplate::class);
    }

    public function activeTemplate()
    {
        return $this->hasOne(ProcedureTemplate::class)->where('status', 'active');
    }

    public function testRequests()
    {
        return $this->hasMany(TestRequest::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
