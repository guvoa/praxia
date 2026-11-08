# Praxia — Reglas del proyecto

Praxia es una red social de emprendimiento: los usuarios publican proyectos y
reciben solicitudes de profesionistas (a vacantes), inversores y mentores.
El dominio completo (roles, reglas de negocio, estados, modelo de datos) está en
[docs/dominio.md](docs/dominio.md). Léelo antes de tocar lógica de negocio.

## 1. Forma de trabajo (obligatorio)

- **Pregunta siempre antes de ejecutar** cualquier comando, crear/modificar/borrar
  archivos, migraciones o hacer commits/push. Muestra primero los pasos y espera
  autorización explícita del usuario.
- Avanza por fases pequeñas y verificables. Al cerrar cada fase: commit y
  `git push origin main` (con autorización).
- Commits con formato `tipo: descripción` (`feat`, `fix`, `docs`, `chore`,
  `refactor`, `style`, `test`), descripción en español.
- Responde al usuario en español.

## 2. Stack

- PHP 8.2 puro (sin framework) con MVC ligero, sobre XAMPP (Apache + MySQL/MariaDB).
- Binario PHP: `/Applications/XAMPP/xamppfiles/bin/php`.
- Base de datos vía **PDO** (utf8mb4). Sin ORM.
- Front-end: plantilla Sovix (Bootstrap 5 + `assets/css/style.css` + iconos Lucide).
- Sin Composer por ahora; autoload PSR-4 propio para el namespace `App\`.
- URL local: `http://localhost/praxia/`.

## 3. Idioma y convenciones

- **Código en inglés** (tablas, columnas, clases, métodos, variables, rutas).
- **Interfaz en español** (textos visibles, mensajes de validación, correos).
- Clases `PascalCase`, métodos/variables `camelCase`, tablas y columnas
  `snake_case` en plural (`projects`, `vacancies`, `requests`).
- Controladores: `App\Controllers\ProjectController`; modelos en singular:
  `App\Models\Project`.
- Vistas en `app/Views/pages/<modulo>/<accion>.php`.
- Migraciones SQL numeradas: `database/migrations/NNN_descripcion.sql`.

## 4. Estructura de directorios

```text
_template/        Plantilla Sovix original. SOLO LECTURA (referencia de UI).
public/           Raíz web: index.php (front controller), .htaccess, assets/
app/Core/         Router, Database, View, Auth, Csrf, Session, Validator
app/Controllers/  Un controlador por módulo
app/Models/       Acceso a datos con PDO
app/Views/        layouts/, partials/, pages/
app/Helpers/      Funciones auxiliares (e(), url(), asset(), etc.)
config/           app.php, database.php (leen de .env)
database/         migrations/, seeds/
storage/          logs/, uploads/ (fuera de git)
docs/             Documentación funcional y decisiones
.agents/skills/   Skills del proyecto
```

## 5. UI: siempre desde la plantilla

- No inventes componentes ni estilos: copia el marcado de `_template/` y
  reutiliza las clases `sx-*` existentes. Nunca edites archivos de `_template/`.
- Header, rail izquierdo, rail derecho, footer y tabbar móvil se extraen a
  `app/Views/partials/`; los modales comunes también.
- Elimina de la UI todo lo que esté fuera de alcance (tienda/carrito, blog,
  galería, historias, IA/asistente, creaciones).
- Mapa principal de vistas (detalle en `docs/dominio.md`):
  - `groups.html` → área de Proyectos (Mis proyectos / Explorar / Solicitudes).
  - `group.html` → detalle de proyecto; `group-settings.html` → administrar proyecto.
  - `spaces.html` → catálogo público de proyectos y directorio de personas.
  - `jobs.html` / `job.html` → vacantes.
- Las tarjetas de proyecto son un único partial `project-card.php`.

## 6. Seguridad (no negociable)

- Siempre consultas preparadas con PDO; nunca concatenar input en SQL.
- Escapar toda salida HTML con el helper `e()` (`htmlspecialchars`, UTF-8).
- Token CSRF en todo formulario POST y validación en el servidor.
- Contraseñas con `password_hash()` / `password_verify()`.
- `session_regenerate_id(true)` al iniciar sesión.
- Autorización en el servidor: verificar dueño del proyecto antes de editar,
  aceptar o rechazar solicitudes. Nunca confiar en campos ocultos.
- Validar tipo y tamaño de archivos subidos; guardarlos en `storage/uploads/`.
- Credenciales solo en `.env` (no versionado). Mantener `.env.example` al día.

## 7. Verificación

- `php -l` sobre cada archivo PHP modificado.
- Probar las rutas afectadas en `http://localhost/praxia/...`.
- Para lógica de solicitudes, comprobar cada regla de `docs/dominio.md`.
