<?php
/**
 * Inicio (provisional hasta tener proyectos reales en la Fase 7).
 * Marcado: .sx-pagehead y .sx-cardgrid de groups.html.
 * @var string $title
 */
$user = auth();
$steps = [
    ['lightbulb', 'Publica tu idea',      'Describe tu proyecto, su sector y la etapa en la que está.'],
    ['briefcase', 'Abre vacantes',        'Indica los perfiles que necesitas para sacarlo adelante.'],
    ['handshake', 'Recibe solicitudes',   'Profesionistas, mentores e inversores se postulan; tú decides.'],
];
?>
<div class="sx-feed">

  <section class="sx-panel">
    <div class="sx-pagehead">
      <div class="sx-cluster justify-content-between">
        <h1><?= $user ? 'Hola, ' . e($user['name'] ?? '') : 'Ideas que encuentran equipo' ?></h1>
        <a class="btn btn-brand btn-sm" href="<?= e(url($user ? '/projects/create' : '/register')) ?>">
          <?= $user ? 'Publicar proyecto' : 'Crear cuenta' ?>
        </a>
      </div>
      <p><?= e(config('app.name', 'Praxia')) ?> conecta proyectos de emprendimiento con profesionistas,
        mentores e inversores. Publica tu idea o súmate a una que te apasione.</p>
    </div>
  </section>

  <ul class="sx-cardgrid sx-cardgrid--3 sx-list-plain">
    <?php foreach ($steps as $i => [$icon, $heading, $text]): ?>
      <li class="sx-panel sx-panel__body">
        <div class="sx-cluster">
          <span class="sx-avatar sx-avatar--lg d-inline-flex align-items-center justify-content-center">
            <i data-lucide="<?= e($icon) ?>" class="ic-22"></i>
          </span>
          <div class="sx-minw0">
            <span class="sx-meta">Paso <?= e((string) ($i + 1)) ?></span>
            <span class="sx-name d-block"><?= e($heading) ?></span>
          </div>
        </div>
        <p class="sx-meta mt-3 mb-0"><?= e($text) ?></p>
      </li>
    <?php endforeach; ?>
  </ul>

  <section class="sx-panel sx-panel__body">
    <h2 class="sx-panel__title mb-2">Proyectos recientes</h2>
    <p class="sx-meta mb-3">Muy pronto verás aquí los proyectos publicados por la comunidad.</p>
    <a class="btn btn-quiet btn-sm" href="<?= e(url('/explore')) ?>">Explorar proyectos</a>
  </section>

</div>
