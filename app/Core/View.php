<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Renderizado de plantillas PHP en app/Views.
 * Las vistas se envuelven en un layout (app/Views/layouts/<layout>.php) que recibe $content.
 */
final class View
{
    /**
     * @param string      $template Ruta relativa a app/Views sin .php (p. ej. 'pages/home/index').
     * @param string|null $layout   Layout en app/Views/layouts; null = sin layout.
     */
    public static function render(string $template, array $data = [], ?string $layout = 'main'): string
    {
        $content = self::make($template, $data);

        if ($layout === null) {
            return $content;
        }

        $layoutFile = BASE_PATH . '/app/Views/layouts/' . $layout . '.php';
        if (!is_file($layoutFile)) {
            return $content; // Layout aún no creado: se devuelve solo la vista.
        }

        return self::make('layouts/' . $layout, array_merge($data, ['content' => $content]));
    }

    /** Renderiza una plantilla o partial y devuelve el HTML. */
    public static function make(string $template, array $data = []): string
    {
        if (!preg_match('#^[a-zA-Z0-9_\-/]+$#', $template) || str_contains($template, '..')) {
            throw new \InvalidArgumentException("Nombre de vista inválido: {$template}");
        }
        $file = BASE_PATH . '/app/Views/' . $template . '.php';
        if (!is_file($file)) {
            throw new \RuntimeException("Vista no encontrada: {$template}");
        }

        return (static function (string $__file, array $__data): string {
            extract($__data, EXTR_SKIP);
            ob_start();
            try {
                require $__file;
            } catch (\Throwable $e) {
                ob_end_clean();
                throw $e;
            }
            return (string) ob_get_clean();
        })($file, $data);
    }
}
