<?php

declare(strict_types=1);

/**
 * Praxia — generador de módulos.
 *
 * Uso (desde la raíz del proyecto):
 *   php .agents/skills/create-module/scripts/make_module.php <Name> [--table=nombre] [--force]
 */

if (PHP_SAPI !== 'cli') {
    exit("Solo se puede ejecutar desde la línea de comandos.\n");
}

$root = dirname(__DIR__, 4);
$resources = dirname(__DIR__) . '/resources';

$args = array_slice($argv, 1);
$name = null;
$table = null;
$force = false;

foreach ($args as $arg) {
    if ($arg === '--force') {
        $force = true;
    } elseif (str_starts_with($arg, '--table=')) {
        $table = substr($arg, 8);
    } elseif ($arg === '--help' || $arg === '-h') {
        echo "Uso: php make_module.php <Name> [--table=nombre] [--force]\n";
        exit(0);
    } elseif (!str_starts_with($arg, '--') && $name === null) {
        $name = $arg;
    } else {
        fail("Argumento no reconocido: {$arg}");
    }
}

if ($name === null || !preg_match('/^[A-Z][A-Za-z0-9]*$/', $name)) {
    fail('Indica el nombre del modelo en PascalCase y singular, p. ej. Vacancy');
}

$table ??= pluralize(snake($name));
if (!preg_match('/^[a-z][a-z0-9_]*$/', $table)) {
    fail("Nombre de tabla inválido: {$table}");
}

$replacements = [
    '{{Name}}'   => $name,
    '{{name}}'   => lcfirst($name),
    '{{table}}'  => $table,
    '{{module}}' => $table,
];

$targets = [
    'controller.php.tpl' => "app/Controllers/{$name}Controller.php",
    'model.php.tpl'      => "app/Models/{$name}.php",
    'view-index.php.tpl' => "app/Views/pages/{$table}/index.php",
    'view-show.php.tpl'  => "app/Views/pages/{$table}/show.php",
];

$created = [];
foreach ($targets as $template => $relative) {
    $path = $root . '/' . $relative;
    if (is_file($path) && !$force) {
        echo "  – omitido (ya existe): {$relative}\n";
        continue;
    }
    $source = $resources . '/' . $template;
    if (!is_file($source)) {
        fail("Falta la plantilla {$template}");
    }
    if (!is_dir(dirname($path)) && !mkdir(dirname($path), 0755, true)) {
        fail('No se pudo crear ' . dirname($relative));
    }
    file_put_contents($path, strtr((string) file_get_contents($source), $replacements));
    $created[] = $path;
    echo "  ✔ {$relative}\n";
}

// Lint de lo generado
$errors = 0;
foreach ($created as $path) {
    exec(escapeshellarg(PHP_BINARY) . ' -l ' . escapeshellarg($path) . ' 2>&1', $out, $code);
    if ($code !== 0) {
        $errors++;
        echo "  ✖ error de sintaxis en {$path}\n";
    }
}

echo "\nRegistra estas rutas en config/routes.php:\n";
echo "  use App\\Controllers\\{$name}Controller;\n";
echo "  \$router->get('/{$table}', [{$name}Controller::class, 'index']);\n";
echo "  \$router->get('/{$table}/{id}', [{$name}Controller::class, 'show']);\n";

exit($errors > 0 ? 1 : 0);

// ---------------------------------------------------------------- helpers

function snake(string $value): string
{
    return strtolower((string) preg_replace('/(?<!^)[A-Z]/', '_$0', $value));
}

function pluralize(string $word): string
{
    if (preg_match('/[^aeiou]y$/', $word)) {
        return substr($word, 0, -1) . 'ies';
    }
    if (preg_match('/(s|x|z|ch|sh)$/', $word)) {
        return $word . 'es';
    }
    return $word . 's';
}

function fail(string $message): never
{
    fwrite(STDERR, "✖ {$message}\n");
    exit(1);
}
