<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcedureStep extends Model
{
    use HasFactory;

    const ROLE_ANALYST = 'analyst';
    const ROLE_ADMIN = 'admin';
    const ROLE_SUPERVISOR = 'supervisor';

    protected $fillable = [
        'procedure_template_id',
        'step_order',
        'name',
        'description',
        'equipment',
        'materials',
        'parameters',
        'reference_standard',
        'pass_fail_criteria',
        'estimated_duration_minutes',
        'responsible_role',
        'requires_approval',
    ];

    protected $casts = [
        'equipment' => 'array',
        'materials' => 'array',
        'parameters' => 'array',
        'pass_fail_criteria' => 'array',
        'requires_approval' => 'boolean',
    ];

    public function procedureTemplate()
    {
        return $this->belongsTo(ProcedureTemplate::class);
    }

    public function requestProcedureSteps()
    {
        return $this->hasMany(RequestProcedureStep::class);
    }
}
