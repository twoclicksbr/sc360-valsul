<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Module extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'owner_level',
        'owner_id',
        'slug',
        'url_prefix',
        'name',
        'icon',
        'type',
        'model',
        'request',
        'controller',
        'size_modal',
        'description_index',
        'description_show',
        'description_store',
        'description_update',
        'description_delete',
        'description_restore',
        'after_store',
        'after_update',
        'after_restore',
        'order',
        'active',
    ];

    protected $casts = [
        'owner_id'      => 'integer',
        'type'          => 'string',
        'after_store'   => 'string',
        'after_update'  => 'string',
        'after_restore' => 'string',
        'order'         => 'integer',
        'active'        => 'boolean',
    ];
}
