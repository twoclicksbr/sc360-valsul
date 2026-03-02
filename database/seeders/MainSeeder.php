<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\Platform;
use App\Services\PlatformDatabaseService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MainSeeder extends Seeder
{
    public function run(): void
    {
        // Platform TwoClicks — withoutEvents para não disparar provision automático
        $platform = Platform::withoutEvents(function () {
            return Platform::firstOrCreate(
                ['slug' => 'tc'],
                [
                    'name'            => 'TwoClicks',
                    'domain'          => 'twoclicks.com.br',
                    'domain_local'    => 'tc.test',
                    'db_name'         => 'tc_master',
                    'expiration_date' => now()->addYears(100),
                    'order'           => 1,
                    'active'          => true,
                ]
            );
        });

        // Gera credenciais se ausentes (normalmente geradas pelo PlatformObserver::creating)
        if (empty($platform->sand_user)) {
            $base = str_replace('-', '_', $platform->slug);
            $platform->update([
                'sand_user'     => 'sand_' . $base,
                'sand_password' => Str::random(24),
                'prod_user'     => 'prod_' . $base,
                'prod_password' => Str::random(24),
                'log_user'      => 'log_' . $base,
                'log_password'  => Str::random(24),
            ]);
            $platform->refresh();
        }

        // Provisiona o banco tc_master (idempotente — provision detecta que db já existe e pula migrations)
        app(PlatformDatabaseService::class)->provision($platform);

        // Módulos do tc_master
        Module::on('main')->firstOrCreate(
            ['slug' => 'modules'],
            [
                'name'        => 'Módulos',
                'type'        => 'module',
                'model'       => 'Module',
                'request'     => 'ModuleRequest',
                'controller'  => 'System\\ModuleController',
                'owner_level' => 'master',
                'owner_id'    => 0,
                'order'       => 1,
                'active'      => true,
            ]
        );

        Module::on('main')->firstOrCreate(
            ['slug' => 'module-fields'],
            [
                'name'        => 'Campos do Módulo',
                'type'        => 'submodule',
                'model'       => 'ModuleField',
                'request'     => 'ModuleFieldRequest',
                'controller'  => null,
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
                'icon'        => 'Layers',
                'type'        => 'module',
                'model'       => 'Platform',
                'request'     => 'PlatformRequest',
                'controller'  => 'System\\PlatformController',
                'owner_level' => 'master',
                'owner_id'    => 0,
                'order'       => 3,
                'active'      => true,
            ]
        );
    }
}
