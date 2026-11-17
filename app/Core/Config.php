<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Configuración: cada archivo config/<nombre>.php devuelve un array.
 * Acceso con notación de puntos: Config::get('app.session.name').
 */
final class Config
{
    private static array $items = [];

    public static function load(string $dir): void
    {
        foreach (glob($dir . '/*.php') ?: [] as $file) {
            $name = basename($file, '.php');
            if ($name === 'routes') {
                continue;
            }
            $data = require $file;
            if (is_array($data)) {
                self::$items[$name] = $data;
            }
        }
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        $value = self::$items;
        foreach (explode('.', $key) as $segment) {
            if (!is_array($value) || !array_key_exists($segment, $value)) {
                return $default;
            }
            $value = $value[$segment];
        }
        return $value;
    }
}
