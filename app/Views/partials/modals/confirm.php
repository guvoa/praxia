<?php
/**
 * Modal de confirmación (#sxConfirm de Sovix).
 * Uso: <form method="post" data-confirm="¿Rechazar la solicitud?" data-confirm-title="Rechazar"
 *            data-confirm-button="Rechazar" data-confirm-danger> ... </form>
 * app.js abre el modal y envía el formulario al confirmar.
 */
?>
<div class="modal fade" role="dialog" id="sxConfirm" tabindex="-1" aria-labelledby="sxConfirmTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-sm">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title" id="sxConfirmTitle" data-sx-confirm-title>¿Estás seguro?</h2>
        <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body">
        <p class="mb-0" data-sx-confirm-body></p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-quiet" type="button" data-bs-dismiss="modal">Cancelar</button>
        <button class="btn btn-brand" type="button" data-sx-confirm-go>Confirmar</button>
      </div>
    </div>
  </div>
</div>
