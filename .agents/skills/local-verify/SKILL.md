---
name: local-verify
description: >-
  Verifica cambios de Praxia en local: lint de PHP (php -l) sobre archivos
  modificados y comprobación HTTP de rutas en http://localhost/praxia. Use this
  skill after creating or modifying PHP files, routes or views, and before
  committing a phase.
---

# Verificación local

Script: [scripts/verify.sh](scripts/verify.sh). Usa el PHP de XAMPP.

> Pide autorización antes de ejecutarlo. Las peticiones HTTP a `localhost`
> pueden requerir ejecutar fuera del sandbox.

## Uso

Desde la raíz del proyecto:

```bash
# Lint de los PHP modificados/nuevos según git (por defecto)
bash .agents/skills/local-verify/scripts/verify.sh

# Lint + comprobar rutas (código HTTP esperado opcional tras ":")
bash .agents/skills/local-verify/scripts/verify.sh / /login /projects:302 /app/:403

# Lint de todo app/, config/ y public/
bash .agents/skills/local-verify/scripts/verify.sh --all
```

- Sin código esperado, una ruta se considera correcta si responde `200`.
- Variables opcionales: `BASE_URL` (por defecto `http://localhost/praxia`),
  `PHP_BIN` (por defecto `/Applications/XAMPP/xamppfiles/bin/php`).
- Sale con código `1` si algún lint o ruta falla.

## Qué revisar además

1. Si una ruta da `500`, revisar `storage/logs/` y
   `/Applications/XAMPP/xamppfiles/logs/error_log`.
2. Rutas protegidas sin sesión deben dar `302` (redirige a `/login`).
3. Carpetas internas (`/app/`, `/config/`, `/storage/`, `/.env`) deben dar `403`.
4. Para vistas, comparar visualmente con `/_template/<pagina>.html`.
5. Para solicitudes, recorrer el checklist del skill `request-workflow`.
