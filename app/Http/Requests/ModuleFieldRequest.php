<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ModuleFieldRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'module_id' => ['required', 'integer', 'exists:modules,id'],

            'name'  => ['required', 'string', 'max:255'],
            'label' => ['required', 'string', 'max:255'],
            'icon'  => ['nullable', 'string', 'max:100'],

            'type'      => ['required', 'string', Rule::in(['string', 'integer', 'boolean', 'decimal', 'text', 'date', 'datetime', 'json', 'bigint', 'timestamp'])],
            'length'    => ['nullable', 'integer'],
            'precision' => ['nullable', 'integer'],
            'default'   => ['nullable', 'string', 'max:255'],

            'nullable' => ['nullable', 'boolean'],
            'required' => ['nullable', 'boolean'],
            'min'      => ['nullable', 'string', 'max:50'],
            'max'      => ['nullable', 'string', 'max:50'],

            'unique'        => ['nullable', 'boolean'],
            'index'         => ['nullable', 'boolean'],
            'unique_table'  => ['nullable', 'string', 'max:255'],
            'unique_column' => ['nullable', 'string', 'max:255'],

            'fk_table'  => ['nullable', 'string', 'max:255'],
            'fk_column' => ['nullable', 'string', 'max:255'],
            'fk_label'  => ['nullable', 'string', 'max:255'],

            'auto_from' => ['nullable', 'string', 'max:255'],
            'auto_type' => ['nullable', 'string', Rule::in(['slug', 'uppercase', 'lowercase'])],

            'main'        => ['nullable', 'boolean'],
            'is_custom'   => ['nullable', 'boolean'],
            'owner_level' => ['required', Rule::in(['master', 'platform', 'tenant'])],
            'owner_id'    => ['required', 'integer', 'min:0'],
            'order'       => ['nullable', 'integer', 'min:1'],
            'active'      => ['nullable', 'boolean'],
        ];
    }
}
