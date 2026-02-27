<?php

namespace Database\Seeders;

use App\Models\Module;
use Illuminate\Database\Seeder;

class MainSeeder extends Seeder
{
    public function run(): void
    {
        Module::on('main')->firstOrCreate(
            ['slug' => 'tenants'],
            [
                'name'        => 'Empresas',
                'type'        => 'module',
                'model'       => 'Tenant',
                'request'     => 'TenantRequest',
                'owner_level' => 'master',
                'owner_id'    => 0,
                'order'       => 1,
                'active'      => true,
            ]
        );

        Module::on('main')->firstOrCreate(
            ['slug' => 'modules'],
            [
                'name'        => 'Módulos',
                'type'        => 'module',
                'model'       => 'Module',
                'request'     => 'ModuleRequest',
                'owner_level' => 'master',
                'owner_id'    => 0,
                'order'       => 2,
                'active'      => true,
            ]
        );

        Module::on('main')->firstOrCreate(
            ['slug' => 'platforms'],
            [
                'name'        => 'Plataformas',
                'type'        => 'module',
                'model'       => 'Platform',
                'request'     => 'PlatformRequest',
                'owner_level' => 'master',
                'owner_id'    => 0,
                'order'       => 3,
                'active'      => true,
            ]
        );

        Module::on('main')->firstOrCreate(
            ['slug' => 'pessoas'],
            [
                'name'        => 'Pessoas',
                'type'        => 'module',
                'model'       => 'Person',
                'request'     => 'PersonRequest',
                'owner_level' => 'master',
                'owner_id'    => 0,
                'order'       => 4,
                'active'      => true,
            ]
        );
    }
}
