<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ModuleField extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'module_id',
        'name',
        'type',
        'length',
        'nullable',
        'default',
        'unique',
        'index',
        'fk_table',
        'fk_column',
        'is_system',
        'order',
        'active',
    ];

    protected $casts = [
        'module_id' => 'integer',
        'nullable'  => 'boolean',
        'unique'    => 'boolean',
        'index'     => 'boolean',
        'is_system' => 'boolean',
        'order'     => 'integer',
        'active'    => 'boolean',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }
}
