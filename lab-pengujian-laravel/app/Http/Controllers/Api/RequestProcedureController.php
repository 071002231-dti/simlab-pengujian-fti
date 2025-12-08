<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProcedureApproval;
use App\Models\RequestProcedure;
use App\Models\RequestProcedureStep;
use App\Models\TestRequest;
use Illuminate\Http\Request;

class RequestProcedureController extends Controller
{
    public function show(string $requestId)
    {
        $testRequest = TestRequest::findOrFail($requestId);
        $procedure = $testRequest->requestProcedure;

        if (!$procedure) {
            return response()->json([
                'success' => false,
                'message' => 'Prosedur belum ditetapkan untuk permohonan ini',
            ], 404);
        }

        $procedure->load(['steps.procedureStep', 'steps.executor', 'approvals.requester', 'approvals.approver', 'assignedAnalyst']);

        return response()->json([
            'success' => true,
            'data' => [
                'request_id' => $testRequest->id,
                'procedure' => [
                    'id' => $procedure->id,
                    'template_name' => $procedure->procedure_snapshot['template_name'] ?? null,
                    'template_version' => $procedure->procedure_version_snapshot,
                    'status' => $procedure->status,
                    'assigned_analyst' => $procedure->assignedAnalyst ? [
                        'id' => $procedure->assignedAnalyst->id,
                        'name' => $procedure->assignedAnalyst->name,
                    ] : null,
                    'started_at' => $procedure->started_at?->toISOString(),
                    'completed_at' => $procedure->completed_at?->toISOString(),
                    'progress_percentage' => $procedure->getProgressPercentage(),
                    'current_step' => $procedure->getCurrentStep()?->step_order,
                ],
                'steps' => $procedure->steps->map(function ($step) {
                    return [
                        'id' => $step->id,
                        'step_order' => $step->step_order,
                        'name' => $step->procedureStep->name,
                        'description' => $step->procedureStep->description,
                        'equipment' => $step->procedureStep->equipment,
                        'parameters' => $step->procedureStep->parameters,
                        'pass_fail_criteria' => $step->procedureStep->pass_fail_criteria,
                        'requires_approval' => $step->procedureStep->requires_approval,
                        'status' => $step->status,
                        'results' => $step->results,
                        'attachments' => $step->attachments,
                        'notes' => $step->notes,
                        'pass_fail_status' => $step->pass_fail_status,
                        'executed_by' => $step->executor ? $step->executor->name : null,
                        'started_at' => $step->started_at?->toISOString(),
                        'completed_at' => $step->completed_at?->toISOString(),
                    ];
                }),
                'approvals' => $procedure->approvals->map(function ($approval) {
                    return [
                        'id' => $approval->id,
                        'type' => $approval->approval_type,
                        'status' => $approval->status,
                        'requested_by' => $approval->requester->name,
                        'approved_by' => $approval->approver?->name,
                        'approved_at' => $approval->approved_at?->toISOString(),
                        'notes' => $approval->notes,
                    ];
                }),
            ],
        ]);
    }

    public function updateStep(Request $request, string $requestId, int $stepId)
    {
        $testRequest = TestRequest::findOrFail($requestId);
        $procedure = $testRequest->requestProcedure;

        if (!$procedure) {
            return response()->json([
                'success' => false,
                'message' => 'Prosedur tidak ditemukan',
            ], 404);
        }

        $step = $procedure->steps()->findOrFail($stepId);
        $user = $request->user();

        // Check authorization
        if ($user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk mengupdate langkah prosedur',
            ], 403);
        }

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,in_progress,completed,skipped,failed',
            'results' => 'nullable|array',
            'attachments' => 'nullable|array',
            'notes' => 'nullable|string',
            'pass_fail_status' => 'sometimes|in:pass,fail,pending',
        ]);

        // Update step
        $updateData = [];

        if (isset($validated['status'])) {
            $updateData['status'] = $validated['status'];

            if ($validated['status'] === 'in_progress' && !$step->started_at) {
                $updateData['started_at'] = now();

                // Also update procedure status if it's draft
                if ($procedure->status === 'draft') {
                    $procedure->update([
                        'status' => 'in_progress',
                        'started_at' => now(),
                    ]);
                }
            }

            if ($validated['status'] === 'completed') {
                $updateData['completed_at'] = now();
                $updateData['executed_by'] = $user->id;
            }
        }

        if (isset($validated['results'])) {
            $updateData['results'] = $validated['results'];
        }

        if (isset($validated['attachments'])) {
            $updateData['attachments'] = $validated['attachments'];
        }

        if (isset($validated['notes'])) {
            $updateData['notes'] = $validated['notes'];
        }

        if (isset($validated['pass_fail_status'])) {
            $updateData['pass_fail_status'] = $validated['pass_fail_status'];
        }

        $step->update($updateData);

        // Check if all steps are completed
        $allCompleted = $procedure->steps()->where('status', '!=', 'completed')->count() === 0;
        if ($allCompleted && $procedure->status !== 'completed') {
            $procedure->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Langkah prosedur berhasil diupdate',
            'data' => [
                'id' => $step->id,
                'status' => $step->status,
                'pass_fail_status' => $step->pass_fail_status,
            ],
        ]);
    }

    public function requestApproval(Request $request, string $requestId)
    {
        $testRequest = TestRequest::findOrFail($requestId);
        $procedure = $testRequest->requestProcedure;

        if (!$procedure) {
            return response()->json([
                'success' => false,
                'message' => 'Prosedur tidak ditemukan',
            ], 404);
        }

        $validated = $request->validate([
            'approval_type' => 'required|in:admin_verification,analyst_verification,step_approval,supervisor_approval',
            'step_id' => 'nullable|exists:request_procedure_steps,id',
            'notes' => 'nullable|string',
        ]);

        $approval = ProcedureApproval::create([
            'request_procedure_id' => $procedure->id,
            'request_procedure_step_id' => $validated['step_id'] ?? null,
            'approval_type' => $validated['approval_type'],
            'status' => 'pending',
            'requested_by' => $request->user()->id,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permintaan approval berhasil dibuat',
            'data' => [
                'id' => $approval->id,
                'approval_type' => $approval->approval_type,
                'status' => $approval->status,
            ],
        ], 201);
    }

    public function processApproval(Request $request, string $requestId, int $approvalId)
    {
        $testRequest = TestRequest::findOrFail($requestId);
        $procedure = $testRequest->requestProcedure;

        if (!$procedure) {
            return response()->json([
                'success' => false,
                'message' => 'Prosedur tidak ditemukan',
            ], 404);
        }

        $approval = $procedure->approvals()->findOrFail($approvalId);
        $user = $request->user();

        // Check authorization
        if ($user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk memproses approval',
            ], 403);
        }

        if (!$approval->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Approval sudah diproses sebelumnya',
            ], 422);
        }

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string',
        ]);

        $approval->update([
            'status' => $validated['status'],
            'approved_by' => $user->id,
            'approved_at' => now(),
            'notes' => $validated['notes'] ?? $approval->notes,
        ]);

        // If supervisor approval and approved, update test request status
        if ($approval->approval_type === 'supervisor_approval' && $validated['status'] === 'approved') {
            $testRequest->update(['status' => TestRequest::STATUS_COMPLETED]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Approval berhasil diproses',
            'data' => [
                'id' => $approval->id,
                'status' => $approval->status,
            ],
        ]);
    }

    public function assignAnalyst(Request $request, string $requestId)
    {
        $testRequest = TestRequest::findOrFail($requestId);
        $procedure = $testRequest->requestProcedure;

        if (!$procedure) {
            return response()->json([
                'success' => false,
                'message' => 'Prosedur tidak ditemukan',
            ], 404);
        }

        $validated = $request->validate([
            'analyst_id' => 'required|exists:users,id',
        ]);

        $procedure->update([
            'assigned_analyst_id' => $validated['analyst_id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Analyst berhasil ditugaskan',
        ]);
    }
}
