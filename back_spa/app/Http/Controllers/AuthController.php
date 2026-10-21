<?php
namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
class AuthController extends Controller {
    public function register(Request $request) {
        $data = $request->validate([
            'nom' => 'required|string|max:255', 'prenom' => 'required|string|max:255',
            'telephone' => 'required|string|max:20', 'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);
        $user = User::create(['name' => $data['prenom'].' '.$data['nom'], 'email' => $data['email'], 'password' => Hash::make($data['password'])]);
        Auth::guard('web')->login($user);
        $request->session()->regenerate();
        return response()->json($user, 201);
    }
    public function login(Request $request) {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required|string']);
        if (!Auth::guard('web')->attempt($data)) {
            throw ValidationException::withMessages(['email' => 'Email ou mot de passe incorrect.']);
        }
        $request->session()->regenerate();
        return response()->json($request->user('web'));
    }
    public function logout(Request $request) {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->noContent();
    }
}

