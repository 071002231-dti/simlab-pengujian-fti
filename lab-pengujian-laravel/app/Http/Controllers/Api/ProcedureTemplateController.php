<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProcedureTemplate;
use App\Models\ProcedureStep;
use App\Models\TestType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProcedureTemplateController extends Controller
{
    public function index(Request $request)
    {
        $query = ProcedureTemplate::with(['testType.lab', 'creator', 'steps']);

        if ($request->has('test_type_id')) {
            $query->where('test_type_id', $request->test_type_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('lab_id')) {
            $query->whereHas('testType', function ($q) use ($request) {
                $q->where('lab_id', $request->lab_id);
            });
        }

        $templates = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $templates->map(function ($template) {
                return [
                    'id' => $template->id,
                    'test_type_id' => $template->test_type_id,
                    'test_type_name' => $template->testType->name,
                    'lab_name' => $template->testType->lab->name,
                    'version' => $template->version,
                    'name' => $template->name,
                    'reference_standard' => $template->reference_standard,
                    'estimated_tat_days' => $template->estimated_tat_days,
                    'status' => $template->status,
                    'steps_count' => $template->steps->count(),
                    'created_by' => [
                        'id' => $template->creator->id,
                        'name' => $template->creator->name,
                    ],
                    'created_at' => $template->created_at->toISOString(),
                ];
            }),
            'meta' => [
                'current_page' => $templates->currentPage(),
                'total' => $templates->total(),
                'per_page' => $templates->perPage(),
            ],
        ]);
    }

    public function show(int $id)
    {
        $template = ProcedureTemplate::with(['testType.lab', 'steps', 'creator', 'approver'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $template->id,
                'test_type' => [
                    'id' => $template->testType->id,
                    'name' => $template->testType->name,
                    'lab' => [
                        'id' => $template->testType->lab->id,
                        'name' => $template->testType->lab->name,
                    ],
                ],
                'version' => $template->version,
                'name' => $template->name,
                'description' => $template->description,
                'reference_standard' => $template->reference_standard,
                'estimated_tat_days' => $template->estimated_tat_days,
                'status' => $template->status,
                'steps' => $template->steps->map(function ($step) {
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
                }),
                'total_estimated_minutes' => $template->getTotalDurationMinutes(),
                'created_by' => $template->creator ? ['id' => $template->creator->id, 'name' => $template->creator->name] : null,
                'approved_by' => $template->approver ? ['id' => $template->approver->id, 'name' => $template->approver->name] : null,
                'approved_at' => $template->approved_at?->toISOString(),
                'created_at' => $template->created_at->toISOString(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'test_type_id' => 'required|exists:test_types,id',
            'version' => 'required|string|max:20',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'reference_standard' => 'nullable|string|max:255',
            'estimated_tat_days' => 'required|integer|min:1',
            'steps' => 'required|array|min:1',
            'steps.*.step_order' => 'required|integer|min:1',
            'steps.*.name' => 'required|string|max:255',
            'steps.*.description' => 'required|string',
            'steps.*.equipment' => 'nullable|array',
            'steps.*.materials' => 'nullable|array',
            'steps.*.parameters' => 'nullable|array',
            'steps.*.pass_fail_criteria' => 'nullable|array',
            'steps.*.estimated_duration_minutes' => 'required|integer|min:1',
            'steps.*.responsible_role' => 'required|in:analyst,admin,supervisor',
            'steps.*.requires_approval' => 'boolean',
        ]);

        $existing = ProcedureTemplate::where('test_type_id', $validated['test_type_id'])
            ->where('version', $validated['version'])
            ->exists();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Versi template sudah ada untuk jenis pengujian ini',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $template = ProcedureTemplate::create([
                'test_type_id' => $validated['test_type_id'],
                'version' => $validated['version'],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'reference_standard' => $validated['reference_standard'] ?? null,
                'estimated_tat_days' => $validated['estimated_tat_days'],
                'status' => 'draft',
                'created_by' => $request->user()->id,
            ]);

            foreach ($validated['steps'] as $stepData) {
                ProcedureStep::create([
                    'procedure_template_id' => $template->id,
                    'step_order' => $stepData['step_order'],
                    'name' => $stepData['name'],
                    'description' => $stepData['description'],
                    'equipment' => $stepData['equipment'] ?? null,
                    'materials' => $stepData['materials'] ?? null,
                    'parameters' => $stepData['parameters'] ?? null,
                    'pass_fail_criteria' => $stepData['pass_fail_criteria'] ?? null,
                    'estimated_duration_minutes' => $stepData['estimated_duration_minutes'],
                    'responsible_role' => $stepData['responsible_role'],
                    'requires_approval' => $stepData['requires_approval'] ?? false,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Template prosedur berhasil dibuat',
                'data' => [
                    'id' => $template->id,
                    'version' => $template->version,
                    'status' => $template->status,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat template: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, int $id)
    {
        $template = ProcedureTemplate::findOrFail($id);

        if (!$template->isDraft()) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya template dengan status draft yang dapat diedit',
            ], 422);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'reference_standard' => 'nullable|string|max:255',
            'estimated_tat_days' => 'sometimes|integer|min:1',
            'steps' => 'sometimes|array|min:1',
        ]);

        DB::beginTransaction();
        try {
            $template->update($validated);

            if (isset($validated['steps'])) {
                $template->steps()->delete();
                foreach ($validated['steps'] as $stepData) {
                    ProcedureStep::create([
                        'procedure_template_id' => $template->id,
                        'step_order' => $stepData['step_order'],
                        'name' => $stepData['name'],
                        'description' => $stepData['description'],
                        'equipment' => $stepData['equipment'] ?? null,
                        'materials' => $stepData['materials'] ?? null,
                        'parameters' => $stepData['parameters'] ?? null,
                        'pass_fail_criteria' => $stepData['pass_fail_criteria'] ?? null,
                        'estimated_duration_minutes' => $stepData['estimated_duration_minutes'],
                        'responsible_role' => $stepData['responsible_role'],
                        'requires_approval' => $stepData['requires_approval'] ?? false,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Template prosedur berhasil diupdate',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate template: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function activate(Request $request, int $id)
    {
        $template = ProcedureTemplate::findOrFail($id);
        $user = $request->user();

        if (!$user->isAdmin() && !($user->role === 'supervisor')) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya admin/supervisor yang dapat mengaktifkan template',
            ], 403);
        }

        if (!$template->isDraft()) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya template draft yang dapat diaktifkan',
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Deprecate existing active template for same test type
            ProcedureTemplate::where('test_type_id', $template->test_type_id)
                ->where('status', 'active')
                ->update(['status' => 'deprecated']);

            $template->update([
                'status' => 'active',
                'approved_by' => $user->id,
                'approved_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Template prosedur berhasil diaktifkan',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengaktifkan template: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function duplicate(Request $request, int $id)
    {
        $template = ProcedureTemplate::with('steps')->findOrFail($id);

        $validated = $request->validate([
            'version' => 'required|string|max:20',
        ]);

        $existing = ProcedureTemplate::where('test_type_id', $template->test_type_id)
            ->where('version', $validated['version'])
            ->exists();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Versi template sudah ada',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $newTemplate = $template->replicate();
            $newTemplate->version = $validated['version'];
            $newTemplate->status = 'draft';
            $newTemplate->created_by = $request->user()->id;
            $newTemplate->approved_by = null;
            $newTemplate->approved_at = null;
            $newTemplate->save();

            foreach ($template->steps as $step) {
                $newStep = $step->replicate();
                $newStep->procedure_template_id = $newTemplate->id;
                $newStep->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Template berhasil diduplikasi',
                'data' => [
                    'id' => $newTemplate->id,
                    'version' => $newTemplate->version,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menduplikasi template: ' . $e->getMessage(),
            ], 500);
        }
    }
}
