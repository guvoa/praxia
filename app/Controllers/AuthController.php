<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Core\Session;
use App\Core\Validator;
use App\Models\LoginAttempt;
use App\Models\User;

final class AuthController extends Controller
{
    public function showLogin(): void
    {
        $this->render('auth/login', [
            'title' => 'Iniciar sesión',
        ], 'auth');
    }

    public function login(): void
    {
        $input = $this->only(['email', 'password']);
        $email = (string) ($input['email'] ?? '');
        $password = (string) ($input['password'] ?? '');
        $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');

        $v = Validator::make($input, [
            'email'    => 'required|email|max:191',
            'password' => 'required',
        ], [
            'email'    => 'correo electrónico',
            'password' => 'contraseña',
        ]);

        if ($v->fails()) {
            $this->failValidation($v->errors(), $input, '/login');
        }

        if (LoginAttempt::tooMany($email, $ip)) {
            Session::flash('error', 'Demasiados intentos fallidos. Espera ' . LoginAttempt::WINDOW_MINUTES . ' minutos e inténtalo de nuevo.');
            Session::flash('old', ['email' => $email]);
            $this->redirect('/login');
        }

        $user = User::findByEmail($email);

        if ($user === null || !password_verify($password, (string) $user['password_hash'])) {
            LoginAttempt::record($email, $ip);
            $this->failValidation(
                ['email' => 'El correo o la contraseña no son correctos.'],
                ['email' => $email],
                '/login'
            );
        }

        if (($user['status'] ?? 'active') !== 'active') {
            $this->failValidation(
                ['email' => 'Tu cuenta se encuentra suspendida.'],
                ['email' => $email],
                '/login'
            );
        }

        if (password_needs_rehash((string) $user['password_hash'], PASSWORD_DEFAULT)) {
            User::updatePasswordHash((int) $user['id'], $password);
        }

        LoginAttempt::clear($email);
        if (random_int(1, 20) === 1) {
            LoginAttempt::prune();
        }

        Auth::login((int) $user['id']);
        User::touchLogin((int) $user['id']);

        Session::flash('success', 'Bienvenido de vuelta, ' . $user['name'] . '.');
        $this->redirect($this->pullIntended('/'));
    }

    public function showRegister(): void
    {
        $this->render('auth/register', [
            'title'        => 'Crear cuenta',
            'profileTypes' => User::PROFILE_LABELS,
        ], 'auth');
    }

    public function register(): void
    {
        $input = $this->only(['name', 'email', 'password', 'password_confirmation', 'terms']);
        $rawProfiles = $_POST['profiles'] ?? [];
        $profiles = is_array($rawProfiles)
            ? array_values(array_intersect($rawProfiles, array_keys(User::PROFILE_TABLES)))
            : [];

        $v = Validator::make($input, [
            'name'     => 'required|min:2|max:120',
            'email'    => 'required|email|max:191',
            'password' => 'required|min:8|max:100|confirmed',
            'terms'    => 'required',
        ], [
            'name'     => 'nombre completo',
            'email'    => 'correo electrónico',
            'password' => 'contraseña',
            'terms'    => 'términos y privacidad',
        ]);

        $errors = $v->errors();

        if (!isset($errors['email']) && User::emailExists((string) $input['email'])) {
            $errors['email'] = 'Ya existe una cuenta registrada con este correo.';
        }

        if ($errors !== []) {
            $input['profiles'] = $profiles;
            $this->failValidation($errors, $input, '/register');
        }

        $userId = User::register(
            (string) $input['name'],
            (string) $input['email'],
            (string) $input['password'],
            $profiles
        );

        Auth::login($userId);
        User::touchLogin($userId);

        Session::flash('success', '¡Cuenta creada! Ya eres parte de ' . config('app.name', 'Praxia') . '.');
        $this->redirect('/');
    }

    public function logout(): void
    {
        Auth::logout();
        Session::flash('info', 'Has cerrado sesión.');
        $this->redirect('/');
    }

    /** Devuelve la ruta guardada en sesión (_intended) si pertenece a la app, o $fallback. */
    private function pullIntended(string $fallback): string
    {
        $intended = Session::get('_intended');
        Session::forget('_intended');

        if (!is_string($intended) || $intended === '') {
            return $fallback;
        }

        $path = (string) parse_url($intended, PHP_URL_PATH);
        $base = rtrim((string) parse_url((string) config('app.url'), PHP_URL_PATH), '/');
        if ($base !== '' && ($path === $base || str_starts_with($path, $base . '/'))) {
            $path = substr($path, strlen($base));
        }

        $path = '/' . ltrim($path, '/');
        $query = parse_url($intended, PHP_URL_QUERY);
        return $query ? "{$path}?{$query}" : $path;
    }
}
