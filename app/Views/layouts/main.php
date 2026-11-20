<?php
/**
 * Layout principal (shell de Sovix: topbar + rail izquierdo + contenido + rail derecho).
 *
 * @var string      $content     HTML de la vista.
 * @var string|null $title       Título de la página.
 * @var string|null $description Meta description.
 * @var bool|null   $wide        true = contenido ancho sin rail derecho (spaces.html).
 * @var string|null $rightRail   HTML propio para el rail derecho (por defecto partials/rail-right).
 */
$wide = $wide ?? false;
$appName = (string) config('app.name', 'Praxia');
$pageTitle = isset($title) && $title !== '' ? $title . ' · ' . $appName : $appName;
?>
<!doctype html>
<html lang="es" data-sx-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="<?= e($description ?? 'Praxia: la red donde las ideas de emprendimiento encuentran equipo, mentores e inversión.') ?>">
  <meta name="theme-color" content="#4b34d9">
  <meta name="csrf-token" content="<?= e(csrf_token()) ?>">

  <title><?= e($pageTitle) ?></title>

  <link rel="icon" href="<?= e(asset('img/favicon.png')) ?>" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com/">
  <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin>
  <link rel="stylesheet" href="<?= e(asset('vendor/bootstrap/css/bootstrap.min.css')) ?>">
  <link rel="stylesheet" href="<?= e(asset('css/style.css')) ?>">
</head>

<body>

  <a class="sx-skip-link" href="#main">Saltar al contenido principal</a>

  <?= partial('topbar', $__data) ?>

  <!-- ======================================================= SHELL ====== -->
  <div class="sx-shell">
    <div class="container-xxl">
      <div class="row g-4 justify-content-center">

        <?= partial('rail-left', $__data) ?>

        <main class="col-lg-8 <?= $wide ? 'col-xl-9' : 'col-xl-6' ?>" id="main">
          <?= $content ?>
        </main>

        <?php if (!$wide): ?>
        <!-- ================================================ RIGHT RAIL == -->
        <aside class="col-xl-3 d-none d-xl-block" aria-label="Relacionado">
          <div class="sx-rail sx-stack">
            <?= $rightRail ?? partial('rail-right', $__data) ?>
          </div>
        </aside>
        <?php endif; ?>

      </div>
    </div>
  </div>

  <?= partial('footer') ?>
  <?= partial('tabbar') ?>

  <button class="sx-totop" type="button" data-sx-totop aria-label="Volver arriba">
    <i data-lucide="arrow-up" class="ic-20"></i>
  </button>
  <?= partial('flash') ?>

  <!-- ====================================================== MODALS ====== -->
  <?= partial('modals/confirm') ?>

  <script src="<?= e(asset('vendor/bootstrap/js/bootstrap.bundle.min.js')) ?>"></script>
  <script src="<?= e(asset('vendor/lucide/lucide.min.js')) ?>"></script>
  <script src="<?= e(asset('js/main.js')) ?>"></script>
  <script src="<?= e(asset('js/app.js')) ?>"></script>
</body>
</html>
