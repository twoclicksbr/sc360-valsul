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
        'label',
        'icon',
        'type',
        'length',
        'precision',
        'default',
        'nullable',
        'required',
        'min',
        'max',
        'unique',
        'index',
        'unique_table',
        'unique_column',
        'fk_table',
        'fk_column',
        'fk_label',
        'auto_from',
        'auto_type',
        'main',
        'is_custom',
        'owner_level',
        'owner_id',
        'order',
        'active',
    ];

    protected $casts = [
        'module_id' => 'integer',
        'length'    => 'integer',
        'precision' => 'integer',
        'nullable'  => 'boolean',
        'required'  => 'boolean',
        'unique'    => 'boolean',
        'index'     => 'boolean',
        'main'      => 'boolean',
        'is_custom' => 'boolean',
        'owner_id'  => 'integer',
        'order'     => 'integer',
        'active'    => 'boolean',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }
}
