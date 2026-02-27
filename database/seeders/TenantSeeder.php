<?php

namespace Database\Seeders;

use App\Models\Module;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        Module::firstOrCreate(
            ['slug' => 'modules'],
            [
                'name'        => 'Módulos',
                'type'        => 'module',
                'model'       => 'Module',
                'request'     => 'ModuleRequest',
                'owner_level' => 'master',
                'owner_id'    => 0,
                'order'       => 1,
                'active'      => true,
            ]
        );

        Module::firstOrCreate(
            ['slug' => 'pessoas'],
            [
                'name'        => 'Pessoas',
                'type'        => 'module',
                'model'       => 'Person',
                'request'     => 'PersonRequest',
                'owner_level' => 'master',
                'owner_id'    => 0,
                'order'       => 2,
                'active'      => true,
            ]
        );

        Module::firstOrCreate(
            ['slug' => 'users'],
            [
                'name'        => 'Usuários',
                'type'        => 'module',
                'model'       => 'User',
                'request'     => 'UserRequest',
                'owner_level' => 'master',
                'owner_id'    => 0,
                'order'       => 3,
                'active'      => true,
            ]
        );
    }
}
