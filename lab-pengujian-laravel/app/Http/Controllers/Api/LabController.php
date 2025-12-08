<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lab;

class LabController extends Controller
{
    public function index()
    {
        $labs = Lab::all();

        return response()->json([
            'success' => true,
            'data' => $labs->map(function ($lab) {
                return [
                    'id' => $lab->id,
                    'name' => $lab->name,
                    'code' => $lab->code,
                    'description' => $lab->description,
                    'services' => $lab->services,
                    'icon_name' => $lab->icon_name,
                ];
            }),
        ]);
    }

    public function show(int $id)
    {
        $lab = Lab::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $lab->id,
                'name' => $lab->name,
                'code' => $lab->code,
                'description' => $lab->description,
                'services' => $lab->services,
                'icon_name' => $lab->icon_name,
            ],
        ]);
    }
}
