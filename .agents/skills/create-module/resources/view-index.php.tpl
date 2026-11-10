<?php
/**
 * Vista: {{module}}/index
 * @var array $items
 * Marcado: copiar de _template/ con el skill convert-template-page.
 */
?>
<section class="sx-panel">
  <div class="sx-pagehead">
    <h1><?= e($title ?? '') ?></h1>
  </div>
</section>

<?php if (empty($items)): ?>
  <section class="sx-panel sx-panel__body">
    <p class="sx-meta mb-0">Todavía no hay registros.</p>
  </section>
<?php else: ?>
  <ul class="sx-cardgrid sx-cardgrid--3 sx-list-plain">
    <?php foreach ($items as $item): ?>
      <li class="sx-panel sx-panel__body">
        <a class="sx-name d-block sx-truncate" href="<?= e(url('/{{module}}/' . $item['id'])) ?>">
          #<?= e((string) $item['id']) ?>
        </a>
      </li>
    <?php endforeach; ?>
  </ul>
<?php endif; ?>
