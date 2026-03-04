<?php

namespace App\Observers;

use App\Models\Module;
use App\Models\ModuleField;

class ModuleObserver
{
    public function created(Module $module): void
    {
        if (ModuleField::where('module_id', $module->id)->exists()) {
            return;
        }

        $defaults = [
            ['name' => 'id',         'type' => 'bigint',   'nullable' => false, 'unique' => true,  'index' => true,  'default' => null,   'order' => 1],
            ['name' => 'order',      'type' => 'integer',  'nullable' => false, 'unique' => false, 'index' => false, 'default' => '1',    'order' => 2],
            ['name' => 'active',     'type' => 'boolean',  'nullable' => false, 'unique' => false, 'index' => false, 'default' => 'true', 'order' => 3],
            ['name' => 'created_at', 'type' => 'datetime', 'nullable' => true,  'unique' => false, 'index' => false, 'default' => null,   'order' => 4],
            ['name' => 'updated_at', 'type' => 'datetime', 'nullable' => true,  'unique' => false, 'index' => false, 'default' => null,   'order' => 5],
            ['name' => 'deleted_at', 'type' => 'datetime', 'nullable' => true,  'unique' => false, 'index' => false, 'default' => null,   'order' => 6],
        ];

        foreach ($defaults as $field) {
            ModuleField::create([
                'module_id' => $module->id,
                'name'      => $field['name'],
                'type'      => $field['type'],
                'nullable'  => $field['nullable'],
                'unique'    => $field['unique'],
                'index'     => $field['index'],
                'default'   => $field['default'],
                'is_system' => true,
                'active'    => true,
                'order'     => $field['order'],
            ]);
        }
    }
}
