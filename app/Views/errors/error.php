<?php
/**
 * Página de error (marcado de 404.html: main.sx-404). Sin layout para no depender de la BD.
 * @var int         $code
 * @var string      $title
 * @var string      $message
 * @var string|null $detail  Solo en modo debug.
 */
$appName = (string) config('app.name', 'Praxia');
?>
<!doctype html>
<html lang="es" data-sx-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="#4b34d9">
  <title><?= e((string) $code) ?> · <?= e($title) ?> · <?= e($appName) ?></title>
  <link rel="icon" href="<?= e(asset('img/favicon.png')) ?>" type="image/png">
  <link rel="stylesheet" href="<?= e(asset('vendor/bootstrap/css/bootstrap.min.css')) ?>">
  <link rel="stylesheet" href="<?= e(asset('css/style.css')) ?>">
</head>
<body>

  <a class="sx-skip-link" href="#main">Saltar al contenido principal</a>

  <main class="sx-404" id="main">
    <div>
      <a class="sx-brand" href="<?= e(url('/')) ?>">
        <img class="sx-brand__mark" src="<?= e(asset('img/logo.svg')) ?>" alt="" width="36" height="36">
        <span class="sx-brand__word"><?= e($appName) ?></span>
      </a>
      <p class="sx-404__code"><?= e((string) $code) ?></p>
      <h1 class="sx-404__title"><?= e($title) ?></h1>
      <p class="sx-404__body"><?= e($message) ?></p>
      <?php if (!empty($detail)): ?>
        <pre class="text-start small mb-4"><?= e($detail) ?></pre>
      <?php endif; ?>
      <div class="sx-404__links">
        <a class="btn btn-brand" href="<?= e(url('/')) ?>">Volver al inicio</a>
        <a class="btn btn-quiet" href="<?= e(url('/explore')) ?>">Explorar proyectos</a>
        <a class="btn btn-quiet" href="<?= e(url('/help')) ?>">Centro de ayuda</a>
      </div>
    </div>
  </main>

  <?= \App\Core\View::make('partials/footer') ?>

  <script src="<?= e(asset('vendor/bootstrap/js/bootstrap.bundle.min.js')) ?>"></script>
  <script src="<?= e(asset('vendor/lucide/lucide.min.js')) ?>"></script>
  <script src="<?= e(asset('js/main.js')) ?>"></script>
</body>
</html>
