<?php

declare(strict_types=1);

/**
 * Praxia — rutas.
 *
 * $router->get(path, [Controller::class, 'method'], ['auth'|'guest']);
 * $router->post(...)  // el token CSRF se valida automáticamente en todo POST
 * Parámetros: '/projects/{id}' → método recibe string $id
 *
 * @var App\Core\Router $router
 */

use App\Controllers\HomeController;

$router->get('/', [HomeController::class, 'index']);
