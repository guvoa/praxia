---
name: db-migration
description: >-
  Crea y aplica migraciones SQL numeradas de Praxia contra el MySQL/MariaDB de
  XAMPP. Use this skill when the user asks to create a table, alter the schema,
  add seeds, check migration status, or run pending migrations.
---

# Migraciones de base de datos

Las migraciones son archivos SQL planos en `database/migrations/` con el formato
`NNN_descripcion.sql` (3 dígitos, orden ascendente, `snake_case` en inglés).
Se aplican con [scripts/migrate.php](scripts/migrate.php), que lee `.env`
y registra lo aplicado en la tabla `migrations`.

> Recuerda: pide autorización al usuario antes de crear o ejecutar migraciones.

## Crear una migración

1. Revisa el modelo en `docs/dominio.md` §6 y la última migración:
   `ls database/migrations/`.
2. Crea `database/migrations/NNN_<accion>_<tabla>.sql` con el siguiente número
   libre. Ejemplos: `001_create_users.sql`, `007_add_slug_to_projects.sql`.
3. Convenciones obligatorias:
   - `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`.
   - PK `id BIGINT UNSIGNED AUTO_INCREMENT` (las tablas de perfil usan `user_id` como PK).
   - `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
     `updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP`.
   - FKs explícitas con nombre `fk_<tabla>_<columna>` y `ON DELETE` pensado
     (normalmente `CASCADE` para hijos, `SET NULL` para referencias opcionales).
   - Enums de estado como `ENUM(...)` con los valores en inglés de `docs/dominio.md`.
   - Índices para columnas de búsqueda/filtro (`status`, `owner_id`, `slug` único...).
4. Una migración = un cambio lógico. **Nunca edites una migración ya aplicada**;
   crea una nueva que la corrija.
5. Seeds de desarrollo en `database/seeds/NNN_descripcion.sql` (datos de ejemplo,
   en español).

## Ejecutar

Desde la raíz del proyecto (requiere `.env` con `DB_*` y MySQL de XAMPP activo):

```bash
# Crear la base de datos si no existe (usa DB_DATABASE del .env)
/Applications/XAMPP/xamppfiles/bin/php .agents/skills/db-migration/scripts/migrate.php --create-db

# Ver estado (aplicadas / pendientes)
/Applications/XAMPP/xamppfiles/bin/php .agents/skills/db-migration/scripts/migrate.php --status

# Ver qué se aplicaría sin ejecutar
/Applications/XAMPP/xamppfiles/bin/php .agents/skills/db-migration/scripts/migrate.php --dry-run

# Aplicar pendientes
/Applications/XAMPP/xamppfiles/bin/php .agents/skills/db-migration/scripts/migrate.php

# Aplicar seeds (todos, en orden; no se registran)
/Applications/XAMPP/xamppfiles/bin/php .agents/skills/db-migration/scripts/migrate.php --seed
```

El script se detiene en el primer error y no registra la migración fallida.
MySQL hace *commit* implícito en DDL: si una migración falla a medias, revisa el
estado de la tabla manualmente antes de reintentar.

## Verificación

- `--status` muestra la migración como aplicada.
- Confirmar la estructura:
  `/Applications/XAMPP/xamppfiles/bin/mysql -u root praxia -e "SHOW CREATE TABLE <tabla>\G"`.
- Actualizar `docs/dominio.md` §6 si el esquema cambió respecto al documento.
