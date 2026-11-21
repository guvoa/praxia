<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;

final class Sector extends Model
{
    protected static string $table = 'sectors';

    /** Sectores ordenados por nombre. */
    public static function ordered(): array
    {
        return static::db()->query('SELECT id, name, slug FROM sectors ORDER BY name')->fetchAll();
    }

    public static function findBySlug(string $slug): ?array
    {
        $stmt = static::db()->prepare('SELECT * FROM sectors WHERE slug = :slug LIMIT 1');
        $stmt->execute(['slug' => $slug]);
        return $stmt->fetch() ?: null;
    }
}
