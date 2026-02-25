<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenantId = $this->route('id');

        return [
            'name'            => ['required', 'string', 'max:255'],
            'slug'            => ['required', 'string', 'max:255', 'unique:main.tenants,slug' . ($tenantId ? ',' . $tenantId : '')],
            'db_name'         => ['required', 'string', 'max:255'],
            'db_user'         => ['required', 'string', 'max:255'],
            'db_password'     => ['required', 'string'],
            'expiration_date' => ['required', 'date'],
            'order'           => ['integer', 'min:1'],
            'active'          => ['boolean'],
        ];
    }
}
