<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Token CSRF por sesión. El Router lo valida en todo POST.
 */
final class Csrf
{
    private const KEY = '_csrf_token';
    public const FIELD = '_csrf';

    public static function token(): string
    {
        $token = Session::get(self::KEY);
        if (!is_string($token) || $token === '') {
            $token = bin2hex(random_bytes(32));
            Session::set(self::KEY, $token);
        }
        return $token;
    }

    public static function field(): string
    {
        return '<input type="hidden" name="' . self::FIELD . '" value="' . self::token() . '">';
    }

    public static function validate(?string $token): bool
    {
        $stored = Session::get(self::KEY);
        return is_string($stored) && is_string($token) && $token !== '' && hash_equals($stored, $token);
    }

    /** Token enviado en el formulario o en la cabecera X-CSRF-TOKEN (peticiones fetch). */
    public static function fromRequest(): ?string
    {
        $token = $_POST[self::FIELD] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
        return is_string($token) ? $token : null;
    }
}
