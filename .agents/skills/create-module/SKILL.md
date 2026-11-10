---
name: create-module
description: >-
  Genera el andamiaje de un módulo de Praxia (controlador, modelo y vistas index/show)
  siguiendo las convenciones del proyecto, e indica las rutas a registrar. Use this
  skill when the user asks to create a new module, CRUD, controller or model
  (p. ej. "crea el módulo de vacantes", "genera el controlador de proyectos").
---

# Crear un módulo

Genera los archivos base con [scripts/make_module.php](scripts/make_module.php)
a partir de las plantillas de [resources/](resources/). Después se completan a mano.

> Pide autorización al usuario antes de ejecutar el script.

## Contrato con el núcleo (`app/Core`)

Las plantillas asumen esta API del núcleo (se implementa en la Fase 5; si cambia,
actualiza las plantillas de `resources/`):

| Clase | Métodos usados |
|---|---|
| `App\Core\Controller` | `render(string $view, array $data = [])`, `redirect(string $path)`, `notFound()`, `requireAuth()` |
| `App\Core\Model` | `static $table`, `static all()`, `static find(int $id)`, `static db(): PDO` |
| Router (`config/routes.php`) | `$router->get(path, [Controller::class, 'method'])`, `$router->post(...)`, parámetros `{id}` |

## Pasos

1. Elige el nombre del **modelo en singular y PascalCase, en inglés**
   (`Project`, `Vacancy`, `Request`). La tabla y la carpeta de vistas se derivan
   en plural (`projects`, `vacancies`); usa `--table=` si el plural no es regular.
2. Comprueba que la tabla exista o créala antes con el skill `db-migration`.
3. Ejecuta desde la raíz:
   ```bash
   /Applications/XAMPP/xamppfiles/bin/php .agents/skills/create-module/scripts/make_module.php Vacancy
   /Applications/XAMPP/xamppfiles/bin/php .agents/skills/create-module/scripts/make_module.php Request --table=requests --force
   ```
   Crea:
   - `app/Controllers/<Name>Controller.php`
   - `app/Models/<Name>.php`
   - `app/Views/pages/<tabla>/index.php` y `show.php`

   No sobrescribe archivos existentes salvo con `--force`.
4. Registra en `config/routes.php` las rutas que imprime el script.
5. Completa el módulo:
   - Consultas específicas en el modelo (siempre `prepare` + parámetros nombrados).
   - Validación con `App\Core\Validator` y mensajes en español.
   - Autorización en el servidor (dueño del recurso) antes de editar/borrar.
   - Vistas con el skill `convert-template-page` (marcado de `_template/`).
   - Si el módulo toca solicitudes, sigue el skill `request-workflow`.

## Verificación

- `php -l` de los archivos generados (el script lo hace al final).
- Probar las rutas con el skill `local-verify`.
