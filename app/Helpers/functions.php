<?php

declare(strict_types=1);

/**
 * Praxia — funciones auxiliares globales.
 */

use App\Core\Auth;
use App\Core\Config;
use App\Core\Csrf;
use App\Core\Env;
use App\Core\Session;

if (!function_exists('env')) {
    function env(string $key, mixed $default = null): mixed
    {
        return Env::get($key, $default);
    }
}

if (!function_exists('config')) {
    function config(string $key, mixed $default = null): mixed
    {
        return Config::get($key, $default);
    }
}

if (!function_exists('e')) {
    /** Escapa texto para salida HTML. Usar en TODA salida de datos. */
    function e(mixed $value): string
    {
        return htmlspecialchars((string) ($value ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}

if (!function_exists('url')) {
    /** URL absoluta dentro de la app: url('/projects/5') → http://localhost/praxia/projects/5 */
    function url(string $path = ''): string
    {
        $base = rtrim((string) config('app.url'), '/');
        $path = ltrim($path, '/');
        return $path === '' ? $base . '/' : $base . '/' . $path;
    }
}

if (!function_exists('asset')) {
    /** URL de un archivo en public/assets: asset('css/style.css') */
    function asset(string $path): string
    {
        return url('assets/' . ltrim($path, '/'));
    }
}

if (!function_exists('redirect')) {
    function redirect(string $path, int $status = 302): never
    {
        $location = preg_match('#^https?://#', $path) ? $path : url($path);
        header('Location: ' . $location, true, $status);
        exit;
    }
}

if (!function_exists('csrf_token')) {
    function csrf_token(): string
    {
        return Csrf::token();
    }
}

if (!function_exists('csrf_field')) {
    /** Campo oculto con el token CSRF. Obligatorio en todo formulario POST. */
    function csrf_field(): string
    {
        return Csrf::field();
    }
}

if (!function_exists('old')) {
    /** Valor enviado en el formulario anterior (tras un error de validación). */
    function old(string $key, mixed $default = ''): mixed
    {
        $old = Session::getFlash('old', []);
        return $old[$key] ?? $default;
    }
}

if (!function_exists('error')) {
    /** Mensaje de error de validación de un campo, o null. */
    function error(string $field): ?string
    {
        $errors = Session::getFlash('errors', []);
        return $errors[$field] ?? null;
    }
}

if (!function_exists('flash')) {
    /** Mensaje flash de la petición anterior ('success', 'error', 'info'...). */
    function flash(string $key): mixed
    {
        return Session::getFlash($key);
    }
}

if (!function_exists('auth')) {
    /** Usuario autenticado o null. */
    function auth(): ?array
    {
        return Auth::user();
    }
}

if (!function_exists('current_path')) {
    /** Ruta actual relativa a la app, p. ej. '/projects'. */
    function current_path(): string
    {
        $path = (string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $base = rtrim((string) parse_url((string) config('app.url'), PHP_URL_PATH), '/');
        if ($base !== '' && str_starts_with($path, $base)) {
            $path = substr($path, strlen($base));
        }
        return '/' . trim($path, '/');
    }
}

if (!function_exists('is_active')) {
    /** true si la ruta actual coincide (o empieza por $path cuando $prefix = true). */
    function is_active(string $path, bool $prefix = false): bool
    {
        $current = current_path();
        $path = '/' . trim($path, '/');
        return $current === $path || ($prefix && $path !== '/' && str_starts_with($current, $path . '/'));
    }
}
