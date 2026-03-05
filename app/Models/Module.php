<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Module extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'slug',
        'url_prefix',
        'name',
        'icon',
        'type',
        'is_custom',
        'model',
        'request',
        'controller',
        'observer',
        'service',
        'page',
        'order',
        'active',
    ];

    protected $casts = [
        'is_custom' => 'boolean',
        'order'     => 'integer',
        'active'    => 'boolean',
    ];
}
