<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use App\Core\Model;

final class User extends Model
{
    protected static string $table = 'users';

    /** Tipos de perfil activables → tabla de perfil. */
    public const PROFILE_TABLES = [
        'professional' => 'professional_profiles',
        'investor'     => 'investor_profiles',
        'mentor'       => 'mentor_profiles',
    ];

    public const PROFILE_LABELS = [
        'professional' => 'Profesionista',
        'investor'     => 'Inversor',
        'mentor'       => 'Mentor',
    ];

    public static function findByEmail(string $email): ?array
    {
        $stmt = static::db()->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => self::normalizeEmail($email)]);
        return $stmt->fetch() ?: null;
    }

    public static function emailExists(string $email): bool
    {
        $stmt = static::db()->prepare('SELECT 1 FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => self::normalizeEmail($email)]);
        return (bool) $stmt->fetchColumn();
    }

    /**
     * Crea el usuario y sus perfiles iniciales en una transacción.
     *
     * @param string[] $profiles Subconjunto de array_keys(PROFILE_TABLES).
     */
    public static function register(string $name, string $email, string $password, array $profiles = []): int
    {
        return Database::transaction(static function () use ($name, $email, $password, $profiles): int {
            $id = static::create([
                'name'          => $name,
                'email'         => self::normalizeEmail($email),
                'password_hash' => password_hash($password, PASSWORD_DEFAULT),
            ]);
            foreach (array_unique($profiles) as $type) {
                self::activateProfile($id, $type);
            }
            return $id;
        });
    }

    /** Activa (o reactiva) un perfil del usuario. */
    public static function activateProfile(int $userId, string $type): void
    {
        $table = self::PROFILE_TABLES[$type] ?? throw new \InvalidArgumentException("Perfil inválido: {$type}");
        $stmt = static::db()->prepare(
            "INSERT INTO {$table} (user_id, is_active) VALUES (:user_id, 1)
             ON DUPLICATE KEY UPDATE is_active = 1"
        );
        $stmt->execute(['user_id' => $userId]);
    }

    public static function deactivateProfile(int $userId, string $type): void
    {
        $table = self::PROFILE_TABLES[$type] ?? throw new \InvalidArgumentException("Perfil inválido: {$type}");
        $stmt = static::db()->prepare("UPDATE {$table} SET is_active = 0 WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $userId]);
    }

    /** @return string[] Perfiles activos, p. ej. ['professional', 'mentor']. */
    public static function activeProfiles(int $userId): array
    {
        $stmt = static::db()->prepare(
            "SELECT 'professional' FROM professional_profiles WHERE user_id = :a AND is_active = 1
             UNION ALL SELECT 'investor' FROM investor_profiles WHERE user_id = :b AND is_active = 1
             UNION ALL SELECT 'mentor' FROM mentor_profiles WHERE user_id = :c AND is_active = 1"
        );
        $stmt->execute(['a' => $userId, 'b' => $userId, 'c' => $userId]);
        return $stmt->fetchAll(\PDO::FETCH_COLUMN);
    }

    public static function hasProfile(int $userId, string $type): bool
    {
        return in_array($type, self::activeProfiles($userId), true);
    }

    public static function touchLogin(int $userId): void
    {
        $stmt = static::db()->prepare('UPDATE users SET last_login_at = NOW() WHERE id = :id');
        $stmt->execute(['id' => $userId]);
    }

    public static function updatePasswordHash(int $userId, string $password): void
    {
        $stmt = static::db()->prepare('UPDATE users SET password_hash = :hash WHERE id = :id');
        $stmt->execute(['hash' => password_hash($password, PASSWORD_DEFAULT), 'id' => $userId]);
    }

    public static function normalizeEmail(string $email): string
    {
        return mb_strtolower(trim($email));
    }
}
