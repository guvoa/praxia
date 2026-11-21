<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Router mínimo: GET/POST, parámetros {nombre}, middleware 'auth'/'guest',
 * validación CSRF automática en POST y respuestas 404/405/419.
 */
final class Router
{
    /** @var array<int, array{method:string, path:string, regex:string, handler:mixed, middleware:array}> */
    private array $routes = [];

    public function get(string $path, array|\Closure $handler, array $middleware = []): void
    {
        $this->add('GET', $path, $handler, $middleware);
    }

    public function post(string $path, array|\Closure $handler, array $middleware = []): void
    {
        $this->add('POST', $path, $handler, $middleware);
    }

    private function add(string $method, string $path, array|\Closure $handler, array $middleware): void
    {
        $path = $this->normalize($path);
        $regex = preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '(?P<$1>[^/]+)', $path);
        $this->routes[] = [
            'method'     => $method,
            'path'       => $path,
            'regex'      => '#^' . $regex . '$#',
            'handler'    => $handler,
            'middleware' => $middleware,
        ];
    }

    public function dispatch(string $method, string $uri): void
    {
        $method = strtoupper($method) === 'HEAD' ? 'GET' : strtoupper($method);
        $path = $this->pathFromUri($uri);

        $allowed = [];
        foreach ($this->routes as $route) {
            if (!preg_match($route['regex'], $path, $matches)) {
                continue;
            }
            if ($route['method'] !== $method) {
                $allowed[] = $route['method'];
                continue;
            }

            if ($method === 'POST' && !Csrf::validate(Csrf::fromRequest())) {
                $this->abort(403, 'Sesión expirada', 'Tu sesión expiró o el formulario no es válido. Recarga la página e inténtalo de nuevo.');
                return;
            }

            if (!$this->runMiddleware($route['middleware'])) {
                return;
            }

            $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
            $this->call($route['handler'], array_values(array_map('rawurldecode', $params)));
            return;
        }

        if ($allowed !== []) {
            header('Allow: ' . implode(', ', array_unique($allowed)));
            $this->abort(405, 'Método no permitido', 'La acción solicitada no está disponible.');
            return;
        }

        $this->abort(404, 'Página no encontrada', 'La página que buscas no existe o fue movida.');
    }

    private function call(array|\Closure $handler, array $params): void
    {
        if ($handler instanceof \Closure) {
            $handler(...$params);
            return;
        }
        [$class, $action] = $handler;
        $controller = new $class();
        $controller->$action(...$params);
    }

    private function runMiddleware(array $middleware): bool
    {
        foreach ($middleware as $name) {
            if ($name === 'auth' && !Auth::check()) {
                Session::flash('error', 'Inicia sesión para continuar.');
                Session::set('_intended', $_SERVER['REQUEST_URI'] ?? null);
                redirect('/login');
                return false;
            }
            if ($name === 'guest' && Auth::check()) {
                redirect('/');
                return false;
            }
        }
        return true;
    }

    /** Quita el prefijo de la app (/praxia y /praxia/public) y normaliza. */
    private function pathFromUri(string $uri): string
    {
        $path = rawurldecode((string) parse_url($uri, PHP_URL_PATH));
        $base = rtrim((string) parse_url((string) config('app.url'), PHP_URL_PATH), '/');

        foreach ([$base . '/public', $base] as $prefix) {
            if ($prefix !== '' && ($path === $prefix || str_starts_with($path, $prefix . '/'))) {
                $path = substr($path, strlen($prefix));
                break;
            }
        }
        if ($path === '/index.php' || str_starts_with($path, '/index.php/')) {
            $path = substr($path, strlen('/index.php'));
        }
        return $this->normalize($path);
    }

    private function normalize(string $path): string
    {
        $path = '/' . trim($path, '/');
        return $path === '' ? '/' : $path;
    }

    private function abort(int $code, string $title, string $message): void
    {
        http_response_code($code);
        echo View::render('errors/error', compact('code', 'title', 'message'), null);
    }
}
