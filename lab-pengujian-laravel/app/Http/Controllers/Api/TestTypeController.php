<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lab;
use App\Models\TestType;

class TestTypeController extends Controller
{
    public function index()
    {
        $testTypes = TestType::with('lab')->active()->get();

        return response()->json([
            'success' => true,
            'data' => $testTypes->map(function ($type) {
                return [
                    'id' => $type->id,
                    'lab_id' => $type->lab_id,
                    'lab_name' => $type->lab->name,
                    'name' => $type->name,
                    'code' => $type->code,
                    'description' => $type->description,
                ];
            }),
        ]);
    }

    public function byLab(int $labId)
    {
        $lab = Lab::findOrFail($labId);
        $testTypes = $lab->activeTestTypes;

        return response()->json([
            'success' => true,
            'data' => $testTypes->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'code' => $type->code,
                    'description' => $type->description,
                ];
            }),
        ]);
    }
}
