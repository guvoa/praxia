<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Carga variables desde .env. Las variables reales del entorno tienen prioridad.
 */
final class Env
{
    private static array $vars = [];

    public static function load(string $path): void
    {
        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                continue;
            }
            [$key, $value] = array_map('trim', explode('=', $line, 2));
            $value = trim($value, "\"'");
            $real = getenv($key);
            self::$vars[$key] = $real !== false ? $real : $value;
        }
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        if (!array_key_exists($key, self::$vars)) {
            return $default;
        }
        $value = self::$vars[$key];

        return match (strtolower((string) $value)) {
            'true'  => true,
            'false' => false,
            'null'  => null,
            ''      => $default ?? '',
            default => $value,
        };
    }
}
