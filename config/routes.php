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

use App\Controllers\AuthController;
use App\Controllers\HomeController;

$router->get('/', [HomeController::class, 'index']);

// Autenticación
$router->get('/login',     [AuthController::class, 'showLogin'],    ['guest']);
$router->post('/login',    [AuthController::class, 'login'],        ['guest']);
$router->get('/register',  [AuthController::class, 'showRegister'], ['guest']);
$router->post('/register', [AuthController::class, 'register'],     ['guest']);
$router->post('/logout',   [AuthController::class, 'logout'],       ['auth']);
