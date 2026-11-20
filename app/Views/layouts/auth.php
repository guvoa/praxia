<?php
/**
 * Layout de acceso (login.html / register.html / forgot-password.html).
 *
 * @var string      $content Formulario y textos del panel.
 * @var string|null $title
 */
$appName = (string) config('app.name', 'Praxia');
$pageTitle = isset($title) && $title !== '' ? $title . ' · ' . $appName : $appName;
?>
<!doctype html>
<html lang="es" data-sx-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Accede a Praxia, la red de proyectos de emprendimiento.">
  <meta name="theme-color" content="#4b34d9">

  <title><?= e($pageTitle) ?></title>

  <link rel="icon" href="<?= e(asset('img/favicon.png')) ?>" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com/">
  <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin>
  <link rel="stylesheet" href="<?= e(asset('vendor/bootstrap/css/bootstrap.min.css')) ?>">
  <link rel="stylesheet" href="<?= e(asset('css/style.css')) ?>">
</head>

<body>

  <a class="sx-skip-link" href="#main">Saltar al contenido principal</a>

  <main class="sx-auth" id="main">
    <div class="sx-auth__panel">
      <div class="sx-auth__inner">
        <a class="sx-brand" href="<?= e(url('/')) ?>">
          <img class="sx-brand__mark" src="<?= e(asset('img/logo.svg')) ?>" alt="" width="36" height="36">
          <span class="sx-brand__word"><?= e($appName) ?></span>
        </a>

        <?= $content ?>
      </div>
    </div>

    <aside class="sx-auth__aside">
      <p class="sx-auth__quote">“Una idea crece cuando encuentra a las personas correctas: talento que la
        construya, mentores que la guíen e inversores que la impulsen.”</p>
      <div class="sx-auth__by">
        <span class="sx-avatar sx-avatar--sm">
          <img src="<?= e(asset('img/logo.svg')) ?>" alt="" width="34" height="34">
        </span>
        <div>
          <span class="sx-strong d-block"><?= e($appName) ?></span>
          <span class="sx-meta">Red de proyectos de emprendimiento</span>
        </div>
      </div>
      <div class="sx-auth__proof">
        <div><strong>Ideas</strong><span>que buscan equipo</span></div>
        <div><strong>Talento</strong><span>profesionistas</span></div>
        <div><strong>Impulso</strong><span>mentores e inversores</span></div>
      </div>
    </aside>
  </main>

  <?= partial('flash') ?>

  <script src="<?= e(asset('vendor/bootstrap/js/bootstrap.bundle.min.js')) ?>"></script>
  <script src="<?= e(asset('vendor/lucide/lucide.min.js')) ?>"></script>
  <script src="<?= e(asset('js/main.js')) ?>"></script>
  <script src="<?= e(asset('js/app.js')) ?>"></script>
</body>
</html>
