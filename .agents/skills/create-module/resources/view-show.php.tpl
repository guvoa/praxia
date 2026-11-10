<?php
/**
 * Vista: {{module}}/show
 * @var array $item
 * Marcado: copiar de _template/ con el skill convert-template-page.
 */
?>
<section class="sx-panel">
  <div class="sx-pagehead">
    <h1><?= e($title ?? '') ?> #<?= e((string) $item['id']) ?></h1>
  </div>
</section>

<section class="sx-panel sx-panel__body">
  <a class="btn btn-quiet btn-sm" href="<?= e(url('/{{module}}')) ?>">Volver</a>
</section>
