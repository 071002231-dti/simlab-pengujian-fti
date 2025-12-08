<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestProcedure extends Model
{
    use HasFactory;

    const STATUS_DRAFT = 'draft';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_REJECTED = 'rejected';
    const STATUS_NEEDS_REVISION = 'needs_sample_revision';

    protected $fillable = [
        'test_request_id',
        'procedure_template_id',
        'procedure_version_snapshot',
        'procedure_snapshot',
        'status',
        'assigned_analyst_id',
        'started_at',
        'completed_at',
        'rejection_reason',
        'revision_notes',
    ];

    protected $casts = [
        'procedure_snapshot' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function testRequest()
    {
        return $this->belongsTo(TestRequest::class, 'test_request_id', 'id');
    }

    public function procedureTemplate()
    {
        return $this->belongsTo(ProcedureTemplate::class);
    }

    public function assignedAnalyst()
    {
        return $this->belongsTo(User::class, 'assigned_analyst_id');
    }

    public function steps()
    {
        return $this->hasMany(RequestProcedureStep::class)->orderBy('step_order');
    }

    public function approvals()
    {
        return $this->hasMany(ProcedureApproval::class);
    }

    public function getProgressPercentage(): int
    {
        $totalSteps = $this->steps->count();
        if ($totalSteps === 0) return 0;

        $completedSteps = $this->steps->where('status', 'completed')->count();
        return (int) round(($completedSteps / $totalSteps) * 100);
    }

    public function getCurrentStep()
    {
        return $this->steps->where('status', 'in_progress')->first()
            ?? $this->steps->where('status', 'pending')->first();
    }

    public static function createFromTemplate(TestRequest $request, ProcedureTemplate $template, ?int $analystId = null): self
    {
        $procedure = self::create([
            'test_request_id' => $request->id,
            'procedure_template_id' => $template->id,
            'procedure_version_snapshot' => $template->version,
            'procedure_snapshot' => $template->toSnapshot(),
            'status' => self::STATUS_DRAFT,
            'assigned_analyst_id' => $analystId,
        ]);

        foreach ($template->steps as $step) {
            RequestProcedureStep::create([
                'request_procedure_id' => $procedure->id,
                'procedure_step_id' => $step->id,
                'step_order' => $step->step_order,
                'status' => 'pending',
                'pass_fail_status' => 'pending',
            ]);
        }

        return $procedure;
    }
}
