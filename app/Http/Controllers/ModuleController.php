<?php

namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Http\JsonResponse;

class ModuleController extends Controller
{
    private function resolveModule(string $nameUrl): Module
    {
        $module = Module::where('name_url', $nameUrl)->first();

        if (! $module) {
            abort(404, "Módulo '{$nameUrl}' não encontrado.");
        }

        return $module;
    }

    private function modelClass(Module $module): string
    {
        return "App\\Models\\{$module->model}";
    }

    private function requestClass(Module $module): string
    {
        return "App\\Http\\Requests\\{$module->request}";
    }

    public function index(string $module): JsonResponse
    {
        $mod        = $this->resolveModule($module);
        $modelClass = $this->modelClass($mod);
        $instance   = new $modelClass;

        $query = $modelClass::query();

        if (in_array('order', $instance->getFillable())) {
            $query->orderBy('order');
        }

        $items = $query->orderBy('id')->get();

        return response()->json($items);
    }

    public function show(string $module, int $id): JsonResponse
    {
        $mod        = $this->resolveModule($module);
        $modelClass = $this->modelClass($mod);

        $item = $modelClass::withTrashed()->findOrFail($id);

        return response()->json($item);
    }

    public function store(string $module): JsonResponse
    {
        $mod          = $this->resolveModule($module);
        $modelClass   = $this->modelClass($mod);
        $requestClass = $this->requestClass($mod);

        $formRequest = app($requestClass);
        $item        = $modelClass::create($formRequest->validated());

        return response()->json($item, 201);
    }

    public function update(string $module, int $id): JsonResponse
    {
        $mod          = $this->resolveModule($module);
        $modelClass   = $this->modelClass($mod);
        $requestClass = $this->requestClass($mod);

        $item        = $modelClass::findOrFail($id);
        $formRequest = app($requestClass);
        $item->update($formRequest->validated());

        return response()->json($item);
    }

    public function destroy(string $module, int $id): JsonResponse
    {
        $mod        = $this->resolveModule($module);
        $modelClass = $this->modelClass($mod);

        $item         = $modelClass::findOrFail($id);
        $item->active = false;
        $item->save();
        $item->delete();

        return response()->json(['message' => 'Registro deletado com sucesso.']);
    }

    public function restore(string $module, int $id): JsonResponse
    {
        $mod        = $this->resolveModule($module);
        $modelClass = $this->modelClass($mod);

        $item = $modelClass::withTrashed()->findOrFail($id);
        $item->restore();

        return response()->json($item);
    }
}
