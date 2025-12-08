<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcedureApproval extends Model
{
    use HasFactory;

    const TYPE_ADMIN_VERIFICATION = 'admin_verification';
    const TYPE_ANALYST_VERIFICATION = 'analyst_verification';
    const TYPE_STEP_APPROVAL = 'step_approval';
    const TYPE_SUPERVISOR_APPROVAL = 'supervisor_approval';

    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'request_procedure_id',
        'request_procedure_step_id',
        'approval_type',
        'status',
        'requested_by',
        'approved_by',
        'approved_at',
        'notes',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function requestProcedure()
    {
        return $this->belongsTo(RequestProcedure::class);
    }

    public function requestProcedureStep()
    {
        return $this->belongsTo(RequestProcedureStep::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }
}
