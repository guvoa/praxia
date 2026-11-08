# Praxia — Modelo de dominio

Fuente de verdad del negocio. Cualquier cambio de reglas se refleja aquí primero.

## 1. Visión

Praxia es una comunidad que forma una red social alrededor de **propuestas de
proyectos de emprendimiento**. Un usuario publica la idea de un proyecto y abre
vacantes; otros usuarios registrados se suman mediante **solicitudes** que el
dueño del proyecto acepta o rechaza.

## 2. Roles (multirol)

Toda cuenta es un **usuario** que puede crear proyectos (rol *emprendedor*
implícito). Además puede activar uno o varios perfiles:

| Rol | Qué hace | Perfil asociado |
|---|---|---|
| Emprendedor | Crea proyectos, publica vacantes, gestiona solicitudes y equipo | — (todo usuario) |
| Profesionista | Se postula a vacantes abiertas | `professional_profiles` |
| Inversor | Manifiesta interés en fondear un proyecto y propone un monto | `investor_profiles` |
| Mentor | Ofrece mentoría a un proyecto | `mentor_profiles` |

Para enviar una solicitud de un tipo, el usuario debe tener activo el perfil
correspondiente.

## 3. Flujo de solicitudes

```text
Solicitante ──(solicitud: tipo + mensaje [+ vacante | + monto])──► Dueño del proyecto
                                                  ├─ Acepta  → entra a project_members
                                                  └─ Rechaza → solicitud cerrada
```

Tipos (`requests.type`): `professional`, `investor`, `mentor`.

Estados (`requests.status`):

| Estado | Significado | Transiciones permitidas |
|---|---|---|
| `pending` | Enviada, esperando respuesta | → `accepted`, `rejected` (dueño) · → `withdrawn` (solicitante) |
| `accepted` | Aceptada por el dueño | final |
| `rejected` | Rechazada por el dueño | final |
| `withdrawn` | Retirada por el solicitante | final |

## 4. Reglas de negocio

1. **Profesionistas solo vía vacante:** una solicitud `professional` exige una
   `vacancy_id` de ese proyecto con estado `open`.
2. **Inversores y mentores** solicitan directamente al proyecto (sin vacante).
   `investor` puede incluir `proposed_amount`; `mentor` no.
3. **Solo el dueño** del proyecto acepta o rechaza solicitudes.
4. **No auto-solicitudes:** el dueño no puede enviar solicitudes a su propio proyecto.
5. **Sin duplicados:** no puede existir más de una solicitud `pending` del mismo
   usuario, mismo proyecto, mismo tipo (y misma vacante, si aplica).
6. **Notificaciones:** crear, aceptar, rechazar o retirar una solicitud genera
   una notificación para la contraparte.

Reglas complementarias:

- Al aceptar una solicitud `professional`, el dueño puede cerrar la vacante
  (opcional; por defecto sigue abierta hasta que la cierre manualmente).
- Solo se pueden solicitar proyectos con estado `published`.
- Un usuario ya miembro del proyecto con el mismo rol no puede volver a solicitar.

## 5. Fondeo (primera versión)

Sin pagos dentro de la plataforma. El inversor **manifiesta interés y propone
un monto**; al aceptarse, ambas partes continúan el acuerdo fuera de Praxia.
Los pagos reales quedan fuera de alcance.

## 6. Modelo de datos inicial

| Tabla | Campos clave |
|---|---|
| `users` | id, name, email (único), password_hash, avatar, headline, location, bio, status, created_at |
| `professional_profiles` | user_id (PK/FK), specialty, skills, experience_years, portfolio_url, cv_path |
| `investor_profiles` | user_id (PK/FK), investment_min, investment_max, preferred_sectors |
| `mentor_profiles` | user_id (PK/FK), expertise_areas, availability |
| `sectors` | id, name, slug |
| `projects` | id, owner_id, sector_id, title, slug, summary, description, stage (`idea`/`prototype`/`mvp`/`growth`), status (`draft`/`published`/`closed`), seeks_investment, funding_goal, seeks_mentorship, cover_image, created_at |
| `vacancies` | id, project_id, title, description, required_skills, modality (`remote`/`onsite`/`hybrid`), status (`open`/`closed`), created_at |
| `requests` | id, project_id, sender_id, type, vacancy_id (nullable), message, proposed_amount (nullable), status, responded_at, created_at |
| `project_members` | id, project_id, user_id, role (`team`/`investor`/`mentor`), vacancy_id (nullable), joined_at |
| `notifications` | id, user_id, type, reference_type, reference_id, data (JSON), read_at, created_at |
| `saved_projects` | user_id, project_id, created_at |

## 7. Mapa de vistas (Sovix → Praxia)

| Vista Praxia | Plantilla (`_template/`) |
|---|---|
| Login / registro / recuperar contraseña | `login.html`, `register.html`, `forgot-password.html` |
| Feed de inicio (actividad de proyectos) | `index.html` |
| **Proyectos**: Mis proyectos / Explorar / Solicitudes recibidas | `groups.html` |
| Catálogo público "Explorar proyectos" (con filtros) | `spaces.html` |
| Detalle del proyecto (equipo, vacantes, botón Solicitar) | `group.html` |
| Administrar proyecto (datos, vacantes, equipo, solicitudes) | `group-settings.html` |
| Publicar / editar proyecto | modal "Create a group" de `groups.html` / `create.html` |
| Vacantes: listado y detalle | `jobs.html`, `job.html` |
| Perfil (según roles activos) | `profile.html` |
| Directorio de profesionistas, inversores y mentores | `network.html` (layout ancho de `spaces.html`) |
| Notificaciones / solicitudes enviadas | `notifications.html` |
| Ajustes de cuenta y perfiles | `settings.html` |
| Búsqueda, guardados, sector | `search.html`, `saved.html`, `tag.html` |
| Páginas legales y ayuda | `about.html`, `help.html`, `privacy.html`, `terms.html`, `contact.html`, `404.html` |

Equivalencias de textos en `groups.html`:

| Sovix | Praxia |
|---|---|
| "Create a group" | "Publicar proyecto" |
| *Your groups* | Mis proyectos |
| *Discover* | Explorar proyectos |
| *Invitations* (Join / Ignore) | Solicitudes recibidas (Aceptar / Rechazar) |
| "Ask to join" | "Solicitar participar" (profesionista / inversor / mentor) |
| "Private group · 24 members" | Sector · etapa · N vacantes abiertas |
| "Groups vs spaces" | "Cómo funciona Praxia" |
| "Active in your groups" | Actividad reciente en mis proyectos |

## 8. Alcance

- **Primera versión:** autenticación, perfiles multirol, proyectos, vacantes,
  solicitudes, equipo del proyecto, notificaciones, directorio, búsqueda,
  guardados, ajustes.
- **Después:** mensajes, grupos de discusión, eventos, calendario, analíticas.
- **Fuera de alcance:** tienda/carrito/checkout/compras, galería, blog,
  historias, arte generativo, IA/asistente/creaciones, pagos reales.
