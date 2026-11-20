<?php
/**
 * Tabbar móvil (nav.sx-tabbar). "Post" → Publicar proyecto, "Chat" → Proyectos.
 */
$user = auth();
$tabs = [
    ['/',                'house',       'Inicio',    false],
    ['/explore',         'compass',     'Explorar',  true],
    ['/projects/create', 'square-plus', 'Publicar',  false],
    ['/projects',        'rocket',      'Proyectos', false],
    [$user ? '/profile' : '/login', 'user', $user ? 'Tú' : 'Entrar', false],
];
?>
<!-- ================================================ MOBILE TABBAR ==== -->
<nav class="sx-tabbar" aria-label="Principal, móvil">
  <?php foreach ($tabs as [$path, $icon, $label, $prefix]): ?>
    <?php $active = is_active($path, $prefix); ?>
    <a class="sx-tabbar__link<?= $active ? ' is-active' : '' ?>" href="<?= e(url($path)) ?>"<?= $active ? ' aria-current="page"' : '' ?>>
      <i data-lucide="<?= e($icon) ?>" class="ic-22"></i><?= e($label) ?>
    </a>
  <?php endforeach; ?>
</nav>
