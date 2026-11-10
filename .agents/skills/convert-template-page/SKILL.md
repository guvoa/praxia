---
name: convert-template-page
description: >-
  Convierte una página HTML de la plantilla Sovix (_template/*.html) en una vista
  PHP de Praxia usando el layout y los partials comunes. Use this skill when the
  user asks to create or migrate a Praxia screen/view from the Sovix template
  (p. ej. "convierte groups.html", "crea la vista de proyectos", "extrae el header").
---

# Convertir una página de Sovix a vista PHP

La UI de Praxia **siempre** sale de `_template/` (solo lectura). Nunca inventes
componentes ni clases: copia el marcado y sustituye datos estáticos por PHP.

Antes de empezar lee:
- [references/component-map.md](references/component-map.md): bloques de la
  plantilla → partials, componentes `sx-*`, atributos JS que hay que quitar.
- `docs/dominio.md` §7 (mapa de vistas y equivalencias de textos).

## Pasos

1. **Identifica la página origen** en el mapa de vistas de `docs/dominio.md`
   (p. ej. Proyectos → `_template/groups.html`).
2. **Localiza los bloques** con `grep -n` sobre los comentarios marcadores
   (`TOPBAR`, `LEFT RAIL`, `RIGHT RAIL`, `MOBILE TABBAR`, `MODALS`) y el `<main>`.
3. **Partials comunes**: si aún no existen en `app/Views/partials/`, extráelos
   una sola vez (ver tabla del component-map). Si ya existen, reutilízalos.
4. **Copia solo el contenido de `<main>`** a
   `app/Views/pages/<modulo>/<accion>.php`. El layout `app/Views/layouts/main.php`
   aporta `<head>`, topbar, rails, footer, tabbar, modales y scripts.
5. **Sustituye datos estáticos** por variables del controlador:
   - Toda salida con `<?= e($var) ?>`.
   - Listas repetidas → `foreach` + partial (p. ej. `partials/project-card.php`).
   - Enlaces `*.html` → `<?= url('/ruta') ?>`; imágenes/CSS/JS → `<?= asset('img/...') ?>`.
   - Estados vacíos con el componente de la plantilla, no texto suelto.
6. **Textos al español** según las equivalencias de `docs/dominio.md` §7.
7. **Formularios reales**:
   - `method="post"`, `action="<?= url(...) ?>"`, `name` en cada campo.
   - `<?= csrf_field() ?>` dentro de todo form POST.
   - **Quita** los atributos de simulación JS (`data-sx-auth-form`,
     `data-sx-cp-form`, `data-sx-action="join"`, etc.; lista en el component-map),
     o el JS de la plantilla interceptará el envío.
   - Muestra errores de validación con las clases Bootstrap (`is-invalid`,
     `invalid-feedback`) que ya usa la plantilla.
8. **Elimina lo fuera de alcance**: carrito/minicart, historias, IA/asistente,
   creaciones, tienda, blog, galería (lista en el component-map).

## Verificación

- `php -l` del archivo creado.
- Abrir la ruta en `http://localhost/praxia/...` y compararla visualmente con
  `http://localhost/praxia/_template/<pagina>.html` (misma estructura y estilos).
- Revisar que no queden enlaces `.html`, textos en inglés ni datos de ejemplo
  (Ravi Menon, Sovix, etc.): `grep -n -E "\.html|Sovix|Ravi" <archivo>`.
- Usar el skill `local-verify` para lint + HTTP.
