<?php

namespace App\Services;

use App\Models\Tenant;
use Database\Seeders\AdminSeeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class TenantDatabaseService
{
    public function provision(Tenant $tenant): void
    {
        $dbName = 'sc360_' . $tenant->db_name;
        $dbUser = $tenant->db_user;
        $dbPass = $tenant->db_password; // decriptografado automaticamente pelo cast 'encrypted'

        $dbCreated   = false;
        $userCreated = false;

        try {
            // a. Criar o banco de dados via conexão main (superuser postgres)
            DB::connection('main')->statement("CREATE DATABASE \"{$dbName}\"");
            $dbCreated = true;

            // b. Criar o user e conceder privilégios no banco
            DB::connection('main')->statement(
                "CREATE USER \"{$dbUser}\" WITH PASSWORD '{$dbPass}'"
            );
            $userCreated = true;

            DB::connection('main')->statement(
                "GRANT ALL PRIVILEGES ON DATABASE \"{$dbName}\" TO \"{$dbUser}\""
            );

            // Conectar ao novo banco como superuser e transferir ownership do schema public
            // para que o tenant user possa criar tabelas durante as migrations
            $adminConfig = array_merge(
                config('database.connections.main'),
                ['database' => $dbName]
            );
            config(['database.connections.tenant_setup' => $adminConfig]);
            DB::purge('tenant_setup');
            DB::connection('tenant_setup')->statement(
                "ALTER SCHEMA public OWNER TO \"{$dbUser}\""
            );
            DB::purge('tenant_setup');

            // c. Configurar conexão tenant dinamicamente com as credenciais do novo tenant
            $this->configureTenantConnection($dbName, $dbUser, $dbPass);

            // d. Rodar migrations no banco do tenant
            Artisan::call('migrate', [
                '--database' => 'tenant',
                '--path'     => 'database/migrations/tenant',
                '--force'    => true,
            ]);

            // e. Seeder: criar person Admin + user admin@admin.com no banco do tenant
            $previousDefault = DB::getDefaultConnection();
            DB::setDefaultConnection('tenant');
            (new AdminSeeder())->run();
            DB::setDefaultConnection($previousDefault);

        } catch (\Throwable $e) {
            $this->rollback($tenant, $dbName, $dbUser, $dbCreated, $userCreated);
            throw $e;
        }
    }

    private function configureTenantConnection(string $dbName, string $dbUser, string $dbPass): void
    {
        config(['database.connections.tenant' => array_merge(
            config('database.connections.main'),
            [
                'database' => $dbName,
                'username' => $dbUser,
                'password' => $dbPass,
            ]
        )]);

        DB::purge('tenant');
        DB::reconnect('tenant');
    }

    private function rollback(Tenant $tenant, string $dbName, string $dbUser, bool $dbCreated, bool $userCreated): void
    {
        // Remover o registro do tenant para não deixar linha órfã no banco main
        try {
            DB::connection('main')
                ->table('tenants')
                ->where('id', $tenant->id)
                ->delete();
        } catch (\Throwable) {
        }

        // Fechar conexões abertas com o banco do tenant antes de dropá-lo
        DB::purge('tenant');
        DB::purge('tenant_setup');

        try {
            if ($dbCreated) {
                // Encerrar conexões ativas no banco do tenant
                DB::connection('main')->statement(
                    "SELECT pg_terminate_backend(pid)
                     FROM pg_stat_activity
                     WHERE datname = :db AND pid <> pg_backend_pid()",
                    ['db' => $dbName]
                );

                DB::connection('main')->statement("DROP DATABASE IF EXISTS \"{$dbName}\"");
            }
        } catch (\Throwable) {
        }

        try {
            if ($userCreated) {
                DB::connection('main')->statement("DROP USER IF EXISTS \"{$dbUser}\"");
            }
        } catch (\Throwable) {
        }
    }
}
