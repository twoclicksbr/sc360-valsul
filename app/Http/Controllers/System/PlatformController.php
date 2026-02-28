<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Platform;
use Illuminate\Http\JsonResponse;

class PlatformController extends Controller
{
    public function credentials(string $tenant, string $id): JsonResponse
    {
        $record = Platform::withTrashed()->findOrFail($id);

        return response()->json([
            'sand_password' => $record->sand_password,
            'prod_password' => $record->prod_password,
            'log_password'  => $record->log_password,
        ]);
    }
}
