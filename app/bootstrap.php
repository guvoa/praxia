<?php

declare(strict_types=1);

/**
 * Praxia — arranque de la aplicación.
 * Requiere que BASE_PATH esté definido (ver public/index.php).
 */

use App\Core\Config;
use App\Core\Env;
use App\Core\Logger;
use App\Core\Session;
use App\Core\View;

// Autoload PSR-4 para el namespace App\ → app/
spl_autoload_register(static function (string $class): void {
    $prefix = 'App\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }
    $file = BASE_PATH . '/app/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
    if (is_file($file)) {
        require $file;
    }
});

require BASE_PATH . '/app/Helpers/functions.php';

// Entorno y configuración
if (!is_file(BASE_PATH . '/.env')) {
    http_response_code(500);
    exit('Falta el archivo .env. Copia .env.example a .env y ajusta los valores.');
}
Env::load(BASE_PATH . '/.env');
Config::load(BASE_PATH . '/config');

date_default_timezone_set((string) config('app.timezone', 'UTC'));
mb_internal_encoding('UTF-8');

// Errores
$debug = (bool) config('app.debug', false);
error_reporting(E_ALL);
ini_set('display_errors', $debug ? '1' : '0');
ini_set('log_errors', '1');

set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
    if (!(error_reporting() & $severity)) {
        return false;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

set_exception_handler(static function (Throwable $e) use ($debug): void {
    Logger::error($e->getMessage(), [
        'exception' => get_class($e),
        'file'      => $e->getFile() . ':' . $e->getLine(),
        'uri'       => $_SERVER['REQUEST_URI'] ?? '',
    ]);

    if (!headers_sent()) {
        http_response_code(500);
    }

    echo View::render('errors/error', [
        'code'    => 500,
        'title'   => 'Algo salió mal',
        'message' => 'Ocurrió un error inesperado. Inténtalo de nuevo en unos minutos.',
        'detail'  => $debug ? get_class($e) . ': ' . $e->getMessage() . ' en ' . $e->getFile() . ':' . $e->getLine() : null,
    ], null);
});

// Sesión
Session::start();
