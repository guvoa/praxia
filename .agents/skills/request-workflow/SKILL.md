---
name: request-workflow
description: >-
  Implementa y valida el flujo de solicitudes de Praxia (profesionista a vacante,
  inversor y mentor a proyecto): creación, aceptación, rechazo, retiro, alta en el
  equipo y notificaciones. Use this skill when working on requests/solicitudes,
  vacancies applications, project_members, or the accept/reject logic.
---

# Flujo de solicitudes

La fuente de verdad es `docs/dominio.md` §3–§5. Si una regla aquí y allí difieren,
manda `docs/dominio.md` (y avisa al usuario para alinear este skill).

## Dónde vive la lógica

- **`App\Services\RequestService`** (crear `app/Services/` si no existe):
  toda regla de negocio y transición de estado. Los controladores no deciden reglas.
- **`App\Models\ProjectRequest`** → tabla `requests`. (`Request` choca con el
  concepto HTTP; usa `ProjectRequest` como nombre de clase.)
- **`App\Controllers\RequestController`**: recibe el POST, valida CSRF y entrada,
  llama al servicio, redirige con mensaje flash en español.

## Operaciones del servicio

| Método | Quién | Validaciones (en este orden) | Efecto |
|---|---|---|---|
| `send(userId, projectId, type, vacancyId?, message, amount?)` | solicitante | proyecto existe y `published` · no es el dueño · tiene perfil activo del `type` · si `professional`: vacante del proyecto y `open` · si `investor`: `amount` opcional > 0 · si `mentor`/`professional`: sin `amount` · no es ya miembro con ese rol · no hay `pending` duplicada | INSERT `pending` + notificación al dueño |
| `accept(ownerId, requestId)` | dueño | solicitud existe · el usuario es dueño del proyecto · estado `pending` | `accepted`, `responded_at`, INSERT `project_members` (rol según tipo) + notificación al solicitante |
| `reject(ownerId, requestId)` | dueño | igual que accept | `rejected`, `responded_at` + notificación |
| `withdraw(userId, requestId)` | solicitante | es el remitente · estado `pending` | `withdrawn` + notificación al dueño |

Mapeo de rol en `project_members`: `professional` → `team`, `investor` → `investor`,
`mentor` → `mentor`.

## Reglas de implementación

1. **Transacción** en `accept` (UPDATE de la solicitud + INSERT del miembro +
   notificación): `beginTransaction()` / `commit()` / `rollBack()`.
2. **Bloqueo optimista**: actualizar con
   `UPDATE requests SET status = :new WHERE id = :id AND status = 'pending'` y
   comprobar `rowCount() === 1`; si es 0, otro proceso ya respondió.
3. **Duplicados**: comprobar en el servicio **y** reforzar con índice en BD
   (p. ej. columna generada `pending_key` única cuando `status = 'pending'`, o
   validación previa dentro de la transacción con `SELECT ... FOR UPDATE`).
4. **Autorización por ID de sesión**, nunca por campos ocultos del formulario
   (`owner_id`, `sender_id` jamás vienen del POST).
5. Errores de negocio → excepción de dominio (`DomainException`) con mensaje en
   español para el usuario; el controlador lo muestra como flash.
6. Cada transición crea su notificación (`notifications.type`:
   `request_received`, `request_accepted`, `request_rejected`, `request_withdrawn`).

## Verificación

Recorre **todos** los casos de [references/checklist.md](references/checklist.md)
(manualmente en el navegador o con un script de prueba) antes de cerrar la fase.
Usa además el skill `local-verify`.
