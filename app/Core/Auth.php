<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Autenticación por sesión (básica; se completa en la Fase 6 con la tabla users).
 */
final class Auth
{
    private const KEY = '_user_id';
    private static ?array $user = null;

    public static function check(): bool
    {
        return self::id() !== null;
    }

    public static function id(): ?int
    {
        $id = Session::get(self::KEY);
        return is_int($id) ? $id : null;
    }

    /** Usuario autenticado (fila de users) o null. Se consulta una sola vez por petición. */
    public static function user(): ?array
    {
        if (self::$user === null && self::check()) {
            $stmt = Database::connection()->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
            $stmt->execute(['id' => self::id()]);
            $row = $stmt->fetch();
            if (is_array($row)) {
                unset($row['password_hash']);
                self::$user = $row;
            }
        }
        return self::$user;
    }

    public static function login(int $userId): void
    {
        Session::regenerate();
        Session::set(self::KEY, $userId);
        self::$user = null;
    }

    /** Cierra la sesión: vacía los datos y rota el id (la sesión sigue viva para mensajes flash). */
    public static function logout(): void
    {
        self::$user = null;
        $_SESSION = ['_flash_old' => [], '_flash_new' => []];
        Session::regenerate();
    }
}
