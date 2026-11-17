<?php
/**
 * Vista provisional de inicio (se rehace con el layout Sovix en la Fase 5b).
 * @var string $title
 */
?>
<!doctype html>
<html lang="es" data-sx-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($title) ?> · <?= e(config('app.name')) ?></title>
  <link rel="icon" href="<?= e(asset('img/favicon.png')) ?>">
  <link rel="stylesheet" href="<?= e(asset('vendor/bootstrap/css/bootstrap.min.css')) ?>">
  <link rel="stylesheet" href="<?= e(asset('css/style.css')) ?>">
</head>
<body>
  <main class="container py-5" id="main">
    <section class="sx-panel sx-panel__body">
      <h1><?= e(config('app.name')) ?></h1>
      <p class="sx-meta mb-0">Núcleo MVC funcionando. El layout de Sovix llega en la Fase 5b.</p>
    </section>
  </main>
</body>
</html>
