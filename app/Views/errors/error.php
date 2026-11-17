<?php
/**
 * Página de error genérica (404, 403, 405, 419, 500). Se estiliza con 404.html en la Fase 5b.
 * @var int         $code
 * @var string      $title
 * @var string      $message
 * @var string|null $detail  Solo en modo debug.
 */
?>
<!doctype html>
<html lang="es" data-sx-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title><?= e((string) $code) ?> · <?= e($title) ?> · <?= e(config('app.name', 'Praxia')) ?></title>
  <link rel="stylesheet" href="<?= e(asset('vendor/bootstrap/css/bootstrap.min.css')) ?>">
  <link rel="stylesheet" href="<?= e(asset('css/style.css')) ?>">
</head>
<body>
  <main class="container py-5" id="main">
    <section class="sx-panel sx-panel__body text-center">
      <p class="sx-meta mb-1"><?= e((string) $code) ?></p>
      <h1><?= e($title) ?></h1>
      <p class="sx-meta"><?= e($message) ?></p>
      <?php if (!empty($detail)): ?>
        <pre class="text-start small mt-3 mb-3"><?= e($detail) ?></pre>
      <?php endif; ?>
      <a class="btn btn-brand btn-sm" href="<?= e(url('/')) ?>">Volver al inicio</a>
    </section>
  </main>
</body>
</html>
