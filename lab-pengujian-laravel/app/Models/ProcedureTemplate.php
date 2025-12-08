<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProcedureTemplate extends Model
{
    use HasFactory, SoftDeletes;

    const STATUS_DRAFT = 'draft';
    const STATUS_ACTIVE = 'active';
    const STATUS_DEPRECATED = 'deprecated';

    protected $fillable = [
        'test_type_id',
        'version',
        'name',
        'description',
        'reference_standard',
        'estimated_tat_days',
        'status',
        'created_by',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function testType()
    {
        return $this->belongsTo(TestType::class);
    }

    public function steps()
    {
        return $this->hasMany(ProcedureStep::class)->orderBy('step_order');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function requestProcedures()
    {
        return $this->hasMany(RequestProcedure::class);
    }

    public function scopeDraft($query)
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function getTotalDurationMinutes(): int
    {
        return $this->steps->sum('estimated_duration_minutes');
    }

    public function toSnapshot(): array
    {
        return [
            'template_id' => $this->id,
            'template_name' => $this->name,
            'version' => $this->version,
            'reference_standard' => $this->reference_standard,
            'estimated_tat_days' => $this->estimated_tat_days,
            'captured_at' => now()->toISOString(),
            'steps' => $this->steps->map(function ($step) {
                return [
                    'id' => $step->id,
                    'step_order' => $step->step_order,
                    'name' => $step->name,
                    'description' => $step->description,
                    'equipment' => $step->equipment,
                    'materials' => $step->materials,
                    'parameters' => $step->parameters,
                    'pass_fail_criteria' => $step->pass_fail_criteria,
                    'estimated_duration_minutes' => $step->estimated_duration_minutes,
                    'responsible_role' => $step->responsible_role,
                    'requires_approval' => $step->requires_approval,
                ];
            })->toArray(),
        ];
    }
}
