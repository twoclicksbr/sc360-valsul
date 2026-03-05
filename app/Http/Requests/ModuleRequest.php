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

            'url_prefix' => ['nullable', 'string', 'max:255'],
            'name'       => ['required', 'string', 'max:255'],
            'icon'       => ['nullable', 'string', 'max:255'],
            'type'       => ['required', Rule::in(['module', 'submodule', 'pivot'])],
            'is_custom'  => ['nullable', 'boolean'],
            'model'      => ['required', 'string', 'max:255'],
            'request'    => ['required', 'string', 'max:255'],
            'controller' => ['required', 'string', 'max:255'],
            'observer'   => ['required', 'string', 'max:255'],
            'service'    => ['required', 'string', 'max:255'],
            'page'       => ['nullable', 'string', 'max:255'],
            'order'      => ['nullable', 'integer', 'min:1'],
            'active'     => ['nullable', 'boolean'],
        ];
    }
}
