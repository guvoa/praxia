<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Controlador base.
 */
abstract class Controller
{
    /** Renderiza app/Views/pages/<view>.php dentro del layout. */
    protected function render(string $view, array $data = [], ?string $layout = 'main'): void
    {
        echo View::render('pages/' . $view, $data, $layout);
    }

    protected function redirect(string $path): void
    {
        redirect($path);
    }

    /** Vuelve a la página anterior (solo si es de esta misma app) o a $fallback. */
    protected function back(string $fallback = '/'): void
    {
        $referer = (string) ($_SERVER['HTTP_REFERER'] ?? '');
        $base = (string) config('app.url');
        if ($referer !== '' && str_starts_with($referer, $base)) {
            header('Location: ' . $referer, true, 302);
            exit;
        }
        redirect($fallback);
    }

    protected function notFound(): void
    {
        http_response_code(404);
        echo View::render('errors/error', [
            'code'    => 404,
            'title'   => 'Página no encontrada',
            'message' => 'La página que buscas no existe o fue movida.',
        ], null);
    }

    protected function forbidden(): void
    {
        http_response_code(403);
        echo View::render('errors/error', [
            'code'    => 403,
            'title'   => 'Acceso denegado',
            'message' => 'No tienes permiso para realizar esta acción.',
        ], null);
    }

    /** Redirige a /login si no hay sesión. Devuelve el id del usuario autenticado. */
    protected function requireAuth(): int
    {
        if (!Auth::check()) {
            Session::flash('error', 'Inicia sesión para continuar.');
            Session::set('_intended', $_SERVER['REQUEST_URI'] ?? null);
            redirect('/login');
        }
        return (int) Auth::id();
    }

    /** Valor de $_POST recortado (string) o $default. */
    protected function input(string $key, mixed $default = null): mixed
    {
        $value = $_POST[$key] ?? $default;
        return is_string($value) ? trim($value) : $value;
    }

    /** Subconjunto de $_POST con las claves indicadas (strings recortados). */
    protected function only(array $keys): array
    {
        $data = [];
        foreach ($keys as $key) {
            $data[$key] = $this->input($key);
        }
        return $data;
    }

    /** Guarda errores y entrada anterior y vuelve atrás. */
    protected function failValidation(array $errors, array $input, string $fallback = '/'): void
    {
        Session::flash('errors', $errors);
        Session::flash('old', array_diff_key($input, array_flip(['password', 'password_confirmation', Csrf::FIELD])));
        $this->back($fallback);
    }
}
