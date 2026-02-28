<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('modules', 'slug')->ignore($id)->whereNull('deleted_at'),
            ],

            'name'        => ['required', 'string', 'max:255'],
            'owner_level' => ['required', Rule::in(['master', 'platform', 'tenant'])],
            'owner_id'    => ['required', 'integer', 'min:0'],
            'type'        => ['required', Rule::in(['module', 'submodule', 'pivot'])],

            'url_prefix' => ['nullable', 'string', 'max:255'],
            'icon'       => ['nullable', 'string', 'max:255'],
            'model'      => ['nullable', 'string', 'max:255'],
            'request'    => ['nullable', 'string', 'max:255'],
            'controller' => ['nullable', 'string', 'max:255'],
            'size_modal' => ['nullable', Rule::in(['p', 'm', 'g'])],

            'description_index'   => ['nullable', 'string'],
            'description_show'    => ['nullable', 'string'],
            'description_store'   => ['nullable', 'string'],
            'description_update'  => ['nullable', 'string'],
            'description_delete'  => ['nullable', 'string'],
            'description_restore' => ['nullable', 'string'],

            'after_store'   => ['nullable', Rule::in(['index', 'show', 'create', 'edit'])],
            'after_update'  => ['nullable', Rule::in(['index', 'show', 'create', 'edit'])],
            'after_restore' => ['nullable', Rule::in(['index', 'show', 'create', 'edit'])],

            'order'  => ['nullable', 'integer', 'min:1'],
            'active' => ['nullable', 'boolean'],
        ];
    }
}
