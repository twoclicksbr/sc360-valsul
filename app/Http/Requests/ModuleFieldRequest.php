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
            'name'      => ['required', 'string', 'max:255'],
            'type'      => ['required', 'string', Rule::in(['string', 'text', 'integer', 'bigint', 'boolean', 'date', 'datetime', 'decimal', 'enum'])],
            'length'    => ['nullable', 'string', 'max:50'],
            'nullable'  => ['nullable', 'boolean'],
            'default'   => ['nullable', 'string', 'max:255'],
            'unique'    => ['nullable', 'boolean'],
            'index'     => ['nullable', 'boolean'],
            'fk_table'  => ['nullable', 'string', 'max:255', 'required_if:type,bigint'],
            'fk_column' => ['nullable', 'string', 'max:255', 'required_if:type,bigint'],
            'is_system' => ['nullable', 'boolean'],
            'order'     => ['nullable', 'integer', 'min:1'],
            'active'    => ['nullable', 'boolean'],
        ];
    }
}
