# Checklist del flujo de solicitudes

Usuarios de prueba sugeridos: **Ana** (dueña del proyecto P1, publicado),
**Beto** (profesionista), **Carla** (inversora), **Dani** (mentor),
**Eva** (sin perfiles activos). P1 tiene la vacante V1 `open` y V2 `closed`.
P2 de Ana está en `draft`.

## Envío

| # | Caso | Resultado esperado |
|---|---|---|
| 1 | Beto solicita V1 de P1 | ✅ `pending`, Ana recibe `request_received` |
| 2 | Beto solicita V2 (cerrada) | ❌ "La vacante no está abierta" |
| 3 | Beto envía `professional` sin vacante | ❌ "Debes elegir una vacante" |
| 4 | Beto envía `professional` con vacante de otro proyecto | ❌ rechazado |
| 5 | Beto repite la solicitud a V1 con la primera aún `pending` | ❌ "Ya tienes una solicitud pendiente" |
| 6 | Carla solicita `investor` a P1 con monto 50000 | ✅ `pending` con `proposed_amount` |
| 7 | Carla solicita `investor` con monto 0 o negativo | ❌ validación de monto |
| 8 | Dani solicita `mentor` a P1 | ✅ `pending`, sin monto |
| 9 | Dani envía `mentor` con monto | ❌ o monto ignorado (según implementación documentada) |
| 10 | Eva solicita `investor` sin perfil de inversora | ❌ "Activa tu perfil de inversor" |
| 11 | Ana solicita a su propio P1 | ❌ "No puedes solicitar tu propio proyecto" |
| 12 | Beto solicita a P2 (`draft`) | ❌ proyecto no disponible |
| 13 | POST sin token CSRF | ❌ 419/403, sin cambios en BD |
| 14 | Usuario no autenticado | ❌ redirige a login |

## Respuesta del dueño

| # | Caso | Resultado esperado |
|---|---|---|
| 15 | Ana acepta la solicitud de Beto | ✅ `accepted`, `responded_at`, Beto en `project_members` como `team` con `vacancy_id`, notificación |
| 16 | Ana acepta la de Carla | ✅ miembro `investor` |
| 17 | Ana rechaza la de Dani | ✅ `rejected`, notificación, sin miembro nuevo |
| 18 | Beto (no dueño) intenta aceptar una solicitud de P1 | ❌ 403 |
| 19 | Ana acepta una solicitud ya `rejected`/`accepted`/`withdrawn` | ❌ "La solicitud ya fue respondida" |
| 20 | Doble clic / dos peticiones simultáneas de aceptar | ✅ solo una aplica; un único registro en `project_members` |
| 21 | Fallo al insertar miembro durante accept | ✅ rollback: la solicitud sigue `pending` |
| 22 | Beto ya es miembro `team` y vuelve a solicitar otra vacante de P1 | ❌ ya es miembro con ese rol |

## Retiro

| # | Caso | Resultado esperado |
|---|---|---|
| 23 | Beto retira su solicitud `pending` | ✅ `withdrawn`, Ana notificada |
| 24 | Beto intenta retirar una ya aceptada | ❌ |
| 25 | Carla intenta retirar la solicitud de Beto | ❌ 403 |
| 26 | Beto, tras retirar, vuelve a solicitar V1 | ✅ nueva `pending` (la retirada no bloquea) |

## Vistas

| # | Caso | Resultado esperado |
|---|---|---|
| 27 | Pestaña "Solicitudes recibidas" de Ana | Solo solicitudes `pending` de sus proyectos |
| 28 | Notificaciones de Beto | Muestra enviada / aceptada / rechazada |
| 29 | Botón "Solicitar participar" | Oculto para el dueño y para quien ya es miembro o tiene `pending` |
| 30 | Salida HTML del mensaje con `<script>` | Se muestra escapado |
