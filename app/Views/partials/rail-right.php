<?php
/**
 * Rail derecho por defecto (panel informativo de groups.html → "Cómo funciona Praxia").
 * Las vistas pueden reemplazarlo pasando $rightRail.
 */
?>
<section class="sx-panel sx-panel__body">
  <h2 class="sx-panel__title mb-2">Cómo funciona <?= e(config('app.name', 'Praxia')) ?></h2>
  <p class="sx-meta mb-2">Publica un <a href="<?= e(url('/projects')) ?>">proyecto</a> y abre
    <a href="<?= e(url('/vacancies')) ?>">vacantes</a> para los perfiles que necesitas.</p>
  <p class="sx-meta mb-2">Profesionistas, mentores e inversores te envían una solicitud;
    tú decides a quién sumar a tu equipo.</p>
  <p class="sx-meta mb-0">¿Tienes experiencia que ofrecer? Activa tu perfil y explora proyectos
    que buscan talento.</p>
</section>
