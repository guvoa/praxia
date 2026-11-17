<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Validación de entrada con mensajes en español.
 *
 *   $v = Validator::make($data, [
 *       'email'    => 'required|email|max:191',
 *       'password' => 'required|min:8|confirmed',
 *   ], ['email' => 'correo electrónico', 'password' => 'contraseña']);
 *   if ($v->fails()) { $errors = $v->errors(); }
 *
 * Reglas: required, nullable, email, url, numeric, integer, min:n, max:n,
 *         between:a,b, in:a,b,c, confirmed, same:campo, regex:/patron/
 * min/max/between miden longitud en textos y valor en campos numeric/integer.
 */
final class Validator
{
    private array $errors = [];

    private function __construct(
        private readonly array $data,
        private readonly array $rules,
        private readonly array $labels,
    ) {
        $this->run();
    }

    public static function make(array $data, array $rules, array $labels = []): self
    {
        return new self($data, $rules, $labels);
    }

    public function fails(): bool
    {
        return $this->errors !== [];
    }

    public function passes(): bool
    {
        return $this->errors === [];
    }

    /** @return array<string, string> primer error por campo */
    public function errors(): array
    {
        return $this->errors;
    }

    private function run(): void
    {
        foreach ($this->rules as $field => $ruleSet) {
            $rules = is_array($ruleSet) ? $ruleSet : explode('|', $ruleSet);
            $value = $this->data[$field] ?? null;
            $isEmpty = $value === null || (is_string($value) && trim($value) === '') || $value === [];
            $numeric = in_array('numeric', $rules, true) || in_array('integer', $rules, true);

            if ($isEmpty) {
                if (in_array('required', $rules, true)) {
                    $this->errors[$field] = "El campo {$this->label($field)} es obligatorio.";
                }
                continue; // Las demás reglas solo aplican si hay valor.
            }

            foreach ($rules as $rule) {
                [$name, $param] = array_pad(explode(':', $rule, 2), 2, null);
                $message = $this->check($name, $param, $field, $value, $numeric);
                if ($message !== null) {
                    $this->errors[$field] = $message;
                    break;
                }
            }
        }
    }

    private function check(string $rule, ?string $param, string $field, mixed $value, bool $numeric): ?string
    {
        $label = $this->label($field);
        $size = $numeric && is_numeric($value) ? (float) $value : mb_strlen((string) $value);

        return match ($rule) {
            'required', 'nullable' => null,
            'email'   => filter_var($value, FILTER_VALIDATE_EMAIL) ? null : "El campo {$label} debe ser un correo válido.",
            'url'     => filter_var($value, FILTER_VALIDATE_URL) ? null : "El campo {$label} debe ser una URL válida.",
            'numeric' => is_numeric($value) ? null : "El campo {$label} debe ser un número.",
            'integer' => filter_var($value, FILTER_VALIDATE_INT) !== false ? null : "El campo {$label} debe ser un número entero.",
            'min'     => $size >= (float) $param ? null : ($numeric
                ? "El campo {$label} debe ser al menos {$param}."
                : "El campo {$label} debe tener al menos {$param} caracteres."),
            'max'     => $size <= (float) $param ? null : ($numeric
                ? "El campo {$label} no puede ser mayor que {$param}."
                : "El campo {$label} no puede tener más de {$param} caracteres."),
            'between' => (function () use ($param, $size, $label, $numeric): ?string {
                [$a, $b] = array_map('floatval', explode(',', (string) $param));
                return ($size >= $a && $size <= $b) ? null : ($numeric
                    ? "El campo {$label} debe estar entre {$a} y {$b}."
                    : "El campo {$label} debe tener entre {$a} y {$b} caracteres.");
            })(),
            'in'        => in_array((string) $value, explode(',', (string) $param), true) ? null : "El valor de {$label} no es válido.",
            'confirmed' => (($this->data[$field . '_confirmation'] ?? null) === $value) ? null : "La confirmación de {$label} no coincide.",
            'same'      => (($this->data[(string) $param] ?? null) === $value) ? null : "El campo {$label} debe coincidir con {$this->label((string) $param)}.",
            'regex'     => preg_match((string) $param, (string) $value) ? null : "El formato de {$label} no es válido.",
            default     => throw new \InvalidArgumentException("Regla de validación desconocida: {$rule}"),
        };
    }

    private function label(string $field): string
    {
        return $this->labels[$field] ?? str_replace('_', ' ', $field);
    }
}
