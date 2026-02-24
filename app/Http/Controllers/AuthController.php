<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * @group Autenticação
 *
 * Endpoints de login, logout e dados do usuário autenticado.
 */
class AuthController extends Controller
{
    /**
     * Login
     *
     * Autentica o usuário e retorna um token Sanctum.
     *
     * @unauthenticated
     *
     * @bodyParam email string required E-mail do usuário. Example: admin@admin.com
     * @bodyParam password string required Senha do usuário. Example: admin123
     *
     * @response 200 {
     *   "token": "1|abc123...",
     *   "user": {
     *     "id": 1,
     *     "email": "admin@admin.com",
     *     "active": true,
     *     "person": { "id": 1, "name": "Admin" }
     *   }
     * }
     * @response 422 { "message": "Credenciais inválidas." }
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::with('person')->where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciais inválidas.'],
            ]);
        }

        if (! $user->active) {
            throw ValidationException::withMessages([
                'email' => ['Usuário inativo.'],
            ]);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user,
        ]);
    }

    /**
     * Logout
     *
     * Revoga o token atual do usuário autenticado.
     *
     * @response 200 { "message": "Logout realizado com sucesso." }
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout realizado com sucesso.']);
    }

    /**
     * Usuário autenticado
     *
     * Retorna os dados do usuário logado com o relacionamento person.
     *
     * @response 200 {
     *   "id": 1,
     *   "email": "admin@admin.com",
     *   "active": true,
     *   "person": { "id": 1, "name": "Admin" }
     * }
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->load('person'));
    }
}
