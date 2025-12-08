<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestProcedureStep extends Model
{
    use HasFactory;

    const STATUS_PENDING = 'pending';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_SKIPPED = 'skipped';
    const STATUS_FAILED = 'failed';

    const PASS_FAIL_PASS = 'pass';
    const PASS_FAIL_FAIL = 'fail';
    const PASS_FAIL_PENDING = 'pending';

    protected $fillable = [
        'request_procedure_id',
        'procedure_step_id',
        'step_order',
        'status',
        'results',
        'attachments',
        'notes',
        'pass_fail_status',
        'executed_by',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'results' => 'array',
        'attachments' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function requestProcedure()
    {
        return $this->belongsTo(RequestProcedure::class);
    }

    public function procedureStep()
    {
        return $this->belongsTo(ProcedureStep::class);
    }

    public function executor()
    {
        return $this->belongsTo(User::class, 'executed_by');
    }

    public function approvals()
    {
        return $this->hasMany(ProcedureApproval::class);
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isInProgress(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }
}
