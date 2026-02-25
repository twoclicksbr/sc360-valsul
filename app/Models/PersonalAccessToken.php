<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    public function getConnectionName(): ?string
    {
        return DB::getDefaultConnection();
    }
}
