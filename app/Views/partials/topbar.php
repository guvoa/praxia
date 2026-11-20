<?php
/**
 * Topbar (header.sx-topbar de Sovix).
 * Eliminados: menú demo de páginas (.sx-mega), minicart y "Assistant".
 *
 * @var int|null   $notificationCount No leídas.
 * @var array|null $notifications     Últimas notificaciones [{text, time, url, icon, unread}].
 */
$user = auth();
$notificationCount = (int) ($notificationCount ?? 0);
$notifications = $notifications ?? [];

$nav = [
    ['/',          'house',     'Inicio',     false],
    ['/explore',   'compass',   'Explorar',   true],
    ['/projects',  'rocket',    'Proyectos',  true],
    ['/vacancies', 'briefcase', 'Vacantes',   true],
    ['/network',   'users',     'Red',        true],
];
?>
<!-- ====================================================== TOPBAR ====== -->
<header class="sx-topbar" data-sx-topbar>
  <div class="container-xxl sx-topbar__inner">

    <a class="sx-brand" href="<?= e(url('/')) ?>">
      <img class="sx-brand__mark" src="<?= e(asset('img/logo.svg')) ?>" alt="" width="36" height="36">
      <span class="sx-brand__word"><?= e(config('app.name', 'Praxia')) ?></span>
    </a>

    <button class="sx-iconbtn sx-iconbtn--plain sx-searchtoggle" type="button"
            data-sx-search-toggle aria-expanded="false" aria-label="Buscar en Praxia">
      <i data-lucide="search" class="ic-22"></i>
    </button>

    <form class="sx-search" role="search" action="<?= e(url('/search')) ?>" method="get" data-sx-search-panel>
      <label class="sx-sr-only" for="q">Buscar en Praxia</label>
      <i class="sx-search__icon ic-18" data-lucide="search"></i>
      <input class="form-control sx-search__input" id="q" name="q" type="search"
             value="<?= e($_GET['q'] ?? '') ?>"
             placeholder="Buscar proyectos o personas" autocomplete="off" data-sx-search>
      <kbd class="sx-search__hint">/</kbd>
    </form>

    <nav class="sx-topbar__nav" aria-label="Principal">
      <?php foreach ($nav as [$path, $icon, $label, $prefix]): ?>
        <?php $active = is_active($path, $prefix); ?>
        <a class="sx-tab<?= $active ? ' is-active' : '' ?>" href="<?= e(url($path)) ?>"
           data-bs-toggle="tooltip" data-bs-title="<?= e($label) ?>"<?= $active ? ' aria-current="page"' : '' ?>>
          <i data-lucide="<?= e($icon) ?>" class="ic-22"></i><span class="sx-sr-only"><?= e($label) ?></span>
        </a>
      <?php endforeach; ?>
    </nav>

    <div class="sx-topbar__actions">
      <?php if ($user): ?>
        <div class="dropdown">
          <button class="sx-iconbtn sx-iconbtn--plain" type="button" data-bs-toggle="dropdown"
                  data-bs-offset="0,10" aria-expanded="false" aria-label="Notificaciones">
            <i data-lucide="bell" class="ic-22"></i>
            <?php if ($notificationCount > 0): ?>
              <span class="sx-dot sx-tnum"><?= e((string) min($notificationCount, 99)) ?></span>
            <?php endif; ?>
          </button>
          <div class="dropdown-menu dropdown-menu-end sx-menu sx-notemenu">
            <div class="sx-notemenu__head">
              <span class="sx-notemenu__title">Notificaciones</span>
            </div>
            <div class="sx-notemenu__list">
              <?php if ($notifications === []): ?>
                <p class="sx-meta px-3 py-2 mb-0">No tienes notificaciones nuevas.</p>
              <?php else: ?>
                <?php foreach ($notifications as $n): ?>
                  <a class="sx-noteitem<?= !empty($n['unread']) ? ' is-unread' : '' ?>" href="<?= e($n['url'] ?? url('/notifications')) ?>">
                    <span class="sx-avatar sx-avatar--sm">
                      <img src="<?= e(avatar_url($n['avatar'] ?? null)) ?>" alt="" width="34" height="34">
                      <span class="sx-noteitem__badge"><i data-lucide="<?= e($n['icon'] ?? 'bell') ?>" class="ic-12"></i></span>
                    </span>
                    <span class="sx-noteitem__ident">
                      <span class="sx-noteitem__text"><?= e($n['text'] ?? '') ?></span>
                      <span class="sx-noteitem__time"><?= e($n['time'] ?? '') ?></span>
                    </span>
                  </a>
                <?php endforeach; ?>
              <?php endif; ?>
            </div>
            <a class="sx-notemenu__all" href="<?= e(url('/notifications')) ?>">Ver todas las notificaciones</a>
          </div>
        </div>
      <?php endif; ?>

      <button class="sx-iconbtn sx-iconbtn--plain sx-theme-toggle" type="button"
              data-sx-theme-toggle aria-pressed="false" aria-label="Cambiar a tema oscuro">
        <i data-lucide="sun" class="ic-22 sx-theme-toggle__sun"></i>
        <i data-lucide="moon" class="ic-22 sx-theme-toggle__moon"></i>
      </button>

      <span class="sx-divider-y d-none d-sm-block"></span>

      <?php if ($user): ?>
        <div class="dropdown">
          <button class="sx-bare-btn sx-cluster sx-cluster--tight" type="button"
                  data-bs-toggle="dropdown" data-bs-offset="0,10" aria-expanded="false" aria-label="Menú de tu cuenta">
            <span class="sx-avatar sx-avatar--sm">
              <img src="<?= e(avatar_url($user['avatar'] ?? null)) ?>" alt="<?= e($user['name'] ?? '') ?>" width="34" height="34">
            </span>
            <i data-lucide="chevron-down" class="ic-16 d-none d-lg-block"></i>
          </button>

          <div class="dropdown-menu dropdown-menu-end">
            <h6 class="dropdown-header"><?= e($user['name'] ?? '') ?></h6>
            <a class="dropdown-item" href="<?= e(url('/profile')) ?>"><i data-lucide="user" class="ic-16"></i>Tu perfil</a>
            <a class="dropdown-item" href="<?= e(url('/projects')) ?>"><i data-lucide="rocket" class="ic-16"></i>Mis proyectos</a>
            <a class="dropdown-item" href="<?= e(url('/saved')) ?>"><i data-lucide="bookmark" class="ic-16"></i>Guardados</a>
            <a class="dropdown-item" href="<?= e(url('/settings')) ?>"><i data-lucide="settings" class="ic-16"></i>Ajustes</a>
            <hr class="dropdown-divider">
            <a class="dropdown-item" href="<?= e(url('/help')) ?>"><i data-lucide="circle-help" class="ic-16"></i>Centro de ayuda</a>
            <form method="post" action="<?= e(url('/logout')) ?>">
              <?= csrf_field() ?>
              <button class="dropdown-item" type="submit"><i data-lucide="log-out" class="ic-16"></i>Cerrar sesión</button>
            </form>
          </div>
        </div>
      <?php else: ?>
        <a class="btn btn-quiet btn-sm d-none d-sm-inline-flex" href="<?= e(url('/login')) ?>">Iniciar sesión</a>
        <a class="btn btn-brand btn-sm" href="<?= e(url('/register')) ?>">Crear cuenta</a>
      <?php endif; ?>
    </div>

  </div>
</header>
