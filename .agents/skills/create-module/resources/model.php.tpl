<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;

final class {{Name}} extends Model
{
    protected static string $table = '{{table}}';

    // Añade aquí consultas específicas del módulo. Siempre con prepare():
    //
    // public static function findBySlug(string $slug): ?array
    // {
    //     $stmt = static::db()->prepare('SELECT * FROM {{table}} WHERE slug = :slug LIMIT 1');
    //     $stmt->execute(['slug' => $slug]);
    //     return $stmt->fetch() ?: null;
    // }
}
