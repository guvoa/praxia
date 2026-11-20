<footer class="sx-foot">
  <div class="container-xxl sx-foot__inner">
    <p class="sx-foot__copy">© <?= e(date('Y')) ?> <strong><?= e(config('app.name', 'Praxia')) ?></strong>. Todos los derechos reservados.</p>
    <nav class="sx-foot__nav" aria-label="Pie de página">
      <a href="<?= e(url('/about')) ?>">Acerca de</a>
      <a href="<?= e(url('/privacy')) ?>">Privacidad</a>
      <a href="<?= e(url('/terms')) ?>">Términos</a>
      <a href="<?= e(url('/help')) ?>">Ayuda</a>
      <a href="<?= e(url('/contact')) ?>">Contacto</a>
    </nav>
  </div>
</footer>
