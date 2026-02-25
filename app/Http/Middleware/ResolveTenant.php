<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $slug = $request->route('tenant');

        $tenant = Tenant::where('slug', $slug)->first();

        if (! $tenant) {
            return response()->json(['message' => 'Tenant não encontrado.'], 404);
        }

        config([
            'database.connections.tenant.database' => 'sc360_' . $tenant->db_name,
            'database.connections.tenant.username'  => $tenant->db_user,
            'database.connections.tenant.password'  => $tenant->db_password,
        ]);

        DB::purge('tenant');
        DB::setDefaultConnection('tenant');

        return $next($request);
    }
}
