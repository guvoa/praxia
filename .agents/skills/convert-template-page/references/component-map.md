# Sovix → Praxia: mapa de componentes

## 1. Esqueleto de página (layout `main`)

Todas las páginas internas comparten esta estructura (líneas aprox. de `groups.html`):

| Bloque en la plantilla | Marcador / selector | Destino en Praxia |
|---|---|---|
| `<head>` (meta, Bootstrap, `style.css`) | líneas 5–27 | `layouts/main.php` (título dinámico `$title`) |
| Skip link | `.sx-skip-link` | `layouts/main.php` |
| Topbar | `<!-- TOPBAR -->` · `header.sx-topbar` | `partials/topbar.php` |
| Rail izquierdo | `<!-- LEFT RAIL -->` · `aside.col-lg-4.col-xl-3` | `partials/rail-left.php` |
| Contenido | `<main class="col-lg-8 col-xl-6" id="main">` | vista de la página |
| Rail derecho | `<!-- RIGHT RAIL -->` · `aside.col-xl-3` | `partials/rail-right.php` o bloque propio de la vista |
| Footer | `footer.sx-foot` | `partials/footer.php` |
| Tabbar móvil | `<!-- MOBILE TABBAR -->` · `nav.sx-tabbar` | `partials/tabbar.php` |
| Volver arriba + toasts | `.sx-totop`, `.sx-toast-wrap` | `layouts/main.php` |
| Modales | `<!-- MODALS -->` | `partials/modals/*.php` (solo los usados) |
| Scripts | `bootstrap.bundle.min.js`, `lucide.min.js`, `main.js` | `layouts/main.php` |

Variantes de ancho:
- Con rail derecho: `<main class="col-lg-8 col-xl-6">` (`groups.html`).
- Ancho, sin rail derecho: `<main class="col-lg-8 col-xl-9">` + `.sx-feed--wide`
  (`spaces.html`). El layout debe aceptar `$wide = true`.

Páginas de acceso (`login.html`, `register.html`, `forgot-password.html`) usan
otro esqueleto: `main.sx-auth` > `.sx-auth__panel` + `aside.sx-auth__aside`, sin
topbar ni rails → `layouts/auth.php`.

## 2. Topbar: qué conservar

| Elemento | Acción |
|---|---|
| `.sx-brand` (logo + palabra) | Conservar; "Sovix" → "Praxia", enlace a `/` |
| `.sx-search` | Conservar; `action` → `url('/search')`, placeholder en español |
| `.sx-topbar__nav` | Inicio, Proyectos, Vacantes, Red, (Mensajes: después). Quitar "Assistant" |
| `.sx-pagesmenu` / `.sx-mega` | **Eliminar** (menú demo de páginas) |
| Minicart (`.sx-minicart`) | **Eliminar** |
| Notificaciones (`.sx-notemenu`) | Conservar; datos reales de `notifications` |
| `.sx-theme-toggle` | Conservar |
| Menú de usuario (dropdown) | Perfil, Guardados, Ajustes, Ayuda, Cerrar sesión (POST + CSRF) |

## 3. Rail izquierdo

- `.sx-panel.sx-me`: tarjeta del usuario (cover, avatar, nombre, headline). Stats
  → Proyectos · Solicitudes · Equipos.
- `.sx-nav` (atajos): Inicio, Proyectos, Explorar, Vacantes, Red, Guardados,
  Notificaciones. Quitar Assistant, Create, Creations, Store, Calendar, To do, Events.
- Panel "Your spaces" → "Mis proyectos" (lista corta con `.sx-person`).
- Enlace activo: `is-active` + `aria-current="page"` según la ruta actual.

## 4. Componentes reutilizables

| Componente | Clases | Uso en Praxia |
|---|---|---|
| Panel | `.sx-panel`, `.sx-panel__head`, `.sx-panel__title`, `.sx-panel__body`, `.sx-panel__foot` | Contenedor base |
| Encabezado de página | `.sx-pagehead` (+ `h1`, `p`, botón `btn btn-brand btn-sm`) | Título de cada vista |
| Pestañas | `.sx-tabs[data-sx-tabs]`, `.sx-tab-btn`, `.sx-tab-btn__count`, `[data-sx-tabpanel]` | Mis proyectos / Explorar / Solicitudes |
| Rejilla de tarjetas | `ul.sx-cardgrid.sx-cardgrid--3.sx-list-plain` > `li.sx-panel.sx-panel__body` | `partials/project-card.php` |
| Persona en lista | `.sx-person`, `.sx-person__ident`, `.sx-person__action` | Miembros, solicitantes, directorio |
| Invitación / solicitud | `.sx-invite`, `.sx-invite__ident`, `.sx-invite__actions` | Solicitudes recibidas (Aceptar/Rechazar) |
| Avatar | `.sx-avatar` (`--sm` 34px, normal 42px, `--lg` 56px) | Usuarios y proyectos |
| Texto | `.sx-name`, `.sx-meta`, `.sx-truncate`, `.sx-clamp-1`, `.sx-tnum` | Nombres, metadatos |
| Agrupación | `.sx-cluster`, `.sx-cluster--tight`, `.sx-stack`, `.sx-minw0` | Layout interno |
| Botones | `btn btn-brand` (primario), `btn btn-soft`, `btn btn-quiet`, `btn-sm` | Acciones |
| Iconos | `<i data-lucide="nombre" class="ic-16|ic-18|ic-20|ic-22">` | Lucide |
| Accesibilidad | `.sx-sr-only` | Etiquetas ocultas |

Tarjeta de proyecto (base: tarjeta de `groups.html`):
avatar/cover → `cover_image`; `.sx-name` → `title`; `.sx-meta` → "Sector · Etapa ·
N vacantes"; `p.sx-meta` → `summary`; botones → "Solicitar participar" (si aplica) y
"Ver proyecto".

## 5. Atributos JS de simulación que hay que quitar

`assets/js/main.js` simula acciones en el navegador. En formularios y botones que
pasen a ser reales (POST al servidor), **elimina** estos atributos:

- Formularios: `data-sx-auth-form`, `data-sx-auth-next`, `data-sx-auth-busy`,
  `data-sx-cp-form`, `data-sx-applyform`, `data-sx-checkout-form`, `data-sx-contact`.
- Botones de acción simulada: `data-sx-action="join"`, `"invite-accept"`,
  `"invite-ignore"`, `data-sx-follow`, `data-sx-on` / `data-sx-off`,
  `data-sx-dismissable` (en elementos que deben persistir).
- Contadores falsos: `data-sx-note-count`, `data-sx-cart-count` → valor real o quitar.

Conserva los que solo son UI: `data-sx-tabs`/`data-sx-tab`/`data-sx-tabpanel`,
`data-sx-theme-toggle`, `data-sx-search-*`, `data-sx-totop`, `data-bs-*`.

## 6. Fuera de alcance (eliminar de la UI)

Minicart y `cart/checkout/purchases/order-confirmation/store/product`, historias
(`story*`, modal `#sxAddStory`), IA (`assistant`, `ai-tools`, `creations`,
`creation`, `create` como estudio IA), `gallery`, `blog*`, `art-*`, modales
`#sxReactors`, `#sxAudience` (salvo que se implementen).

## 7. Modales útiles

| Modal | Uso en Praxia |
|---|---|
| `#sxCreateGroup` (`groups.html`, 2 pasos) | Publicar proyecto |
| `#sxConfirm` | Confirmar aceptar/rechazar/retirar solicitud |
| `#sxShare` | Compartir proyecto |
| `#sxReport` | Reportar (después) |
