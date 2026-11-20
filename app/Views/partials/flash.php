<?php
/**
 * Contenedor de toasts de Sovix (.sx-toast-wrap) con los mensajes flash del servidor.
 * Claves: success, error, info. app.js los oculta tras unos segundos.
 */
$icons = ['success' => 'circle-check', 'error' => 'circle-alert', 'info' => 'info'];
?>
<div class="sx-toast-wrap" aria-live="polite" data-sx-toasts>
  <?php foreach ($icons as $key => $icon): ?>
    <?php $message = flash($key); ?>
    <?php if (is_string($message) && $message !== ''): ?>
      <div class="sx-toast" role="<?= $key === 'error' ? 'alert' : 'status' ?>" data-app-flash>
        <i data-lucide="<?= e($icon) ?>" class="ic-18"></i>
        <span class="sx-toast__msg"><?= e($message) ?></span>
      </div>
    <?php endif; ?>
  <?php endforeach; ?>
</div>
