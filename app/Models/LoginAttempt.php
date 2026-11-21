<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;

/**
 * Limitador de intentos de inicio de sesión por correo e IP.
 */
final class LoginAttempt extends Model
{
    protected static string $table = 'login_attempts';

    public const MAX_ATTEMPTS = 5;
    public const WINDOW_MINUTES = 15;

    public static function record(string $email, string $ip): void
    {
        static::create(['email' => User::normalizeEmail($email), 'ip_address' => $ip]);
    }

    /** true si el correo o la IP superaron el límite en la ventana de tiempo. */
    public static function tooMany(string $email, string $ip): bool
    {
        $stmt = static::db()->prepare(
            'SELECT
                SUM(email = :email) AS by_email,
                SUM(ip_address = :ip) AS by_ip
             FROM login_attempts
             WHERE attempted_at >= (NOW() - INTERVAL ' . self::WINDOW_MINUTES . ' MINUTE)
               AND (email = :email2 OR ip_address = :ip2)'
        );
        $email = User::normalizeEmail($email);
        $stmt->execute(['email' => $email, 'ip' => $ip, 'email2' => $email, 'ip2' => $ip]);
        $row = $stmt->fetch() ?: [];

        // Por IP se permite más margen (varias personas pueden compartir red).
        return (int) ($row['by_email'] ?? 0) >= self::MAX_ATTEMPTS
            || (int) ($row['by_ip'] ?? 0) >= self::MAX_ATTEMPTS * 4;
    }

    public static function clear(string $email): void
    {
        $stmt = static::db()->prepare('DELETE FROM login_attempts WHERE email = :email');
        $stmt->execute(['email' => User::normalizeEmail($email)]);
    }

    /** Limpieza de registros antiguos (se llama ocasionalmente). */
    public static function prune(): void
    {
        static::db()->exec('DELETE FROM login_attempts WHERE attempted_at < (NOW() - INTERVAL 1 DAY)');
    }
}
