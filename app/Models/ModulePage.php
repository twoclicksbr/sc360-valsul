<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ModulePage extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'module_id',
        'tab',
        'layout',
        'is_published',
        'version',
        'order',
        'active',
    ];

    protected $casts = [
        'layout'       => 'array',
        'is_published' => 'boolean',
        'version'      => 'integer',
        'order'        => 'integer',
        'active'       => 'boolean',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }
}
