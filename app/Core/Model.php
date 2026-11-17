<?php

declare(strict_types=1);

namespace App\Core;

use PDO;

/**
 * Modelo base: acceso a una tabla con PDO y consultas preparadas.
 * Los nombres de tabla/columna vienen del código (nunca del usuario) y se validan.
 */
abstract class Model
{
    protected static string $table;

    public static function db(): PDO
    {
        return Database::connection();
    }

    public static function all(): array
    {
        return static::db()->query('SELECT * FROM ' . static::table() . ' ORDER BY id DESC')->fetchAll();
    }

    public static function find(int $id): ?array
    {
        $stmt = static::db()->prepare('SELECT * FROM ' . static::table() . ' WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }

    /** Inserta y devuelve el id generado. */
    public static function create(array $data): int
    {
        $columns = array_keys($data);
        static::assertIdentifiers($columns);

        $sql = sprintf(
            'INSERT INTO %s (%s) VALUES (%s)',
            static::table(),
            implode(', ', $columns),
            implode(', ', array_map(static fn (string $c): string => ':' . $c, $columns))
        );
        static::db()->prepare($sql)->execute($data);
        return (int) static::db()->lastInsertId();
    }

    public static function update(int $id, array $data): bool
    {
        if ($data === []) {
            return false;
        }
        $columns = array_keys($data);
        static::assertIdentifiers($columns);

        $sql = sprintf(
            'UPDATE %s SET %s WHERE id = :__id',
            static::table(),
            implode(', ', array_map(static fn (string $c): string => "{$c} = :{$c}", $columns))
        );
        $stmt = static::db()->prepare($sql);
        $stmt->execute($data + ['__id' => $id]);
        return $stmt->rowCount() > 0;
    }

    public static function delete(int $id): bool
    {
        $stmt = static::db()->prepare('DELETE FROM ' . static::table() . ' WHERE id = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;
    }

    protected static function table(): string
    {
        static::assertIdentifiers([static::$table]);
        return static::$table;
    }

    private static function assertIdentifiers(array $names): void
    {
        foreach ($names as $name) {
            if (!is_string($name) || !preg_match('/^[a-z_][a-z0-9_]*$/', $name)) {
                throw new \InvalidArgumentException("Identificador SQL inválido: {$name}");
            }
        }
    }
}
