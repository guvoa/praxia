<?php
/**
 * Rail izquierdo (tarjeta del usuario + atajos + mis proyectos).
 * Eliminados: Assistant, Create, Creations, Store, Calendar, To do, Events.
 *
 * @var array|null $myProjects   [{id, title, meta, cover}] (máx. 5)
 * @var array|null $profileStats ['projects' => n, 'requests' => n, 'teams' => n]
 */
$user = auth();
$myProjects = $myProjects ?? [];
$stats = array_merge(['projects' => 0, 'requests' => 0, 'teams' => 0], $profileStats ?? []);

$shortcuts = [
    ['/',              'house',     'Inicio',         false],
    ['/explore',       'compass',   'Explorar',       true],
    ['/projects',      'rocket',    'Proyectos',      true],
    ['/vacancies',     'briefcase', 'Vacantes',       true],
    ['/network',       'users',     'Red',            true],
];
if ($user) {
    $shortcuts[] = ['/notifications', 'bell',     'Notificaciones', false];
    $shortcuts[] = ['/saved',         'bookmark', 'Guardados',      false];
}
?>
<!-- ================================================ LEFT RAIL === -->
<aside class="col-lg-4 col-xl-3 d-none d-lg-block" aria-label="Tu cuenta y atajos">
  <div class="sx-rail sx-stack">

    <?php if ($user): ?>
      <section class="sx-panel sx-me">
        <h2 class="sx-sr-only">Tu cuenta</h2>
        <img class="sx-me__cover" src="<?= e(asset('img/cover/cover-city.png')) ?>" alt="" width="1200" height="320">
        <div class="sx-me__body">
          <a class="sx-avatar sx-avatar--lg sx-me__avatar" href="<?= e(url('/profile')) ?>">
            <img src="<?= e(avatar_url($user['avatar'] ?? null)) ?>" alt="<?= e($user['name'] ?? '') ?>" width="56" height="56">
          </a>
          <div class="sx-cluster sx-cluster--tight justify-content-center mt-2">
            <a class="sx-name" href="<?= e(url('/profile')) ?>"><?= e($user['name'] ?? '') ?></a>
          </div>
          <?php if (!empty($user['headline'])): ?>
            <p class="sx-meta mb-0"><?= e($user['headline']) ?></p>
          <?php endif; ?>

          <div class="sx-me__stats">
            <a class="text-decoration-none" href="<?= e(url('/projects')) ?>">
              <span class="sx-stat__num sx-tnum"><?= e((string) $stats['projects']) ?></span>
              <span class="sx-stat__label">Proyectos</span>
            </a>
            <a class="text-decoration-none" href="<?= e(url('/notifications')) ?>">
              <span class="sx-stat__num sx-tnum"><?= e((string) $stats['requests']) ?></span>
              <span class="sx-stat__label">Solicitudes</span>
            </a>
            <a class="text-decoration-none" href="<?= e(url('/projects')) ?>">
              <span class="sx-stat__num sx-tnum"><?= e((string) $stats['teams']) ?></span>
              <span class="sx-stat__label">Equipos</span>
            </a>
          </div>
        </div>
      </section>
    <?php else: ?>
      <section class="sx-panel sx-panel__body">
        <h2 class="sx-panel__title mb-2">Bienvenido a <?= e(config('app.name', 'Praxia')) ?></h2>
        <p class="sx-meta mb-3">Publica tu idea, arma tu equipo y conecta con mentores e inversores.</p>
        <div class="sx-cluster">
          <a class="btn btn-brand btn-sm" href="<?= e(url('/register')) ?>">Crear cuenta</a>
          <a class="btn btn-quiet btn-sm" href="<?= e(url('/login')) ?>">Iniciar sesión</a>
        </div>
      </section>
    <?php endif; ?>

    <nav class="sx-panel sx-panel__body--tight" aria-label="Atajos">
      <div class="sx-nav">
        <?php foreach ($shortcuts as [$path, $icon, $label, $prefix]): ?>
          <?php $active = is_active($path, $prefix); ?>
          <a class="sx-nav__link<?= $active ? ' is-active' : '' ?>" href="<?= e(url($path)) ?>"<?= $active ? ' aria-current="page"' : '' ?>>
            <i data-lucide="<?= e($icon) ?>" class="ic-20"></i><?= e($label) ?>
          </a>
        <?php endforeach; ?>
      </div>
    </nav>

    <?php if ($user): ?>
      <section class="sx-panel">
        <header class="sx-panel__head">
          <h2 class="sx-panel__title">Mis proyectos</h2>
          <a class="sx-meta ms-auto text-decoration-none" href="<?= e(url('/projects')) ?>">Ver todos</a>
        </header>
        <?php if ($myProjects === []): ?>
          <div class="sx-panel__body pt-0">
            <p class="sx-meta mb-0">Aún no publicas proyectos.</p>
          </div>
        <?php else: ?>
          <ul class="sx-list-plain">
            <?php foreach (array_slice($myProjects, 0, 5) as $project): ?>
              <li>
                <a class="sx-person text-decoration-none" href="<?= e(url('/projects/' . $project['id'])) ?>">
                  <span class="sx-avatar sx-avatar--sm"><img src="<?= e(avatar_url($project['cover'] ?? null)) ?>" alt="" width="34" height="34"></span>
                  <span class="sx-person__ident">
                    <span class="sx-name d-block sx-truncate"><?= e($project['title']) ?></span>
                    <span class="sx-meta"><?= e($project['meta'] ?? '') ?></span>
                  </span>
                </a>
              </li>
            <?php endforeach; ?>
          </ul>
        <?php endif; ?>
        <div class="sx-panel__foot">
          <a class="sx-panel__link" href="<?= e(url('/projects/create')) ?>">Publicar un proyecto<i data-lucide="arrow-right" class="ic-16"></i></a>
        </div>
      </section>
    <?php endif; ?>

  </div>
</aside>
