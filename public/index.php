<?php

declare(strict_types=1);

/**
 * Praxia — punto de entrada único (front controller).
 */

define('BASE_PATH', dirname(__DIR__));

require BASE_PATH . '/app/bootstrap.php';

$router = new App\Core\Router();

require BASE_PATH . '/config/routes.php';

$router->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', $_SERVER['REQUEST_URI'] ?? '/');
