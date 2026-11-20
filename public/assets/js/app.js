/*
 * Praxia — comportamiento propio (se carga después de assets/js/main.js de Sovix).
 * 1. Oculta los toasts flash del servidor.
 * 2. Confirmación de formularios con data-confirm usando el modal #sxConfirm.
 */
(function () {
  "use strict";

  /* 1. Toasts flash -------------------------------------------------------- */
  document.querySelectorAll("[data-app-flash]").forEach(function (node, i) {
    window.setTimeout(function () {
      node.classList.add("is-leaving");
      window.setTimeout(function () { node.remove(); }, 240);
    }, 4000 + i * 400);
  });

  /* 2. Formularios con confirmación --------------------------------------- */
  var modalEl = document.getElementById("sxConfirm");
  var pending = null;

  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.hasAttribute("data-confirm")) return;
    if (form.dataset.confirmed === "1" || !modalEl || !window.bootstrap) return;

    event.preventDefault();
    pending = form;

    modalEl.querySelector("[data-sx-confirm-title]").textContent = form.dataset.confirmTitle || "¿Estás seguro?";
    modalEl.querySelector("[data-sx-confirm-body]").textContent = form.dataset.confirm || "";

    var go = modalEl.querySelector("[data-sx-confirm-go]");
    var danger = form.hasAttribute("data-confirm-danger");
    go.textContent = form.dataset.confirmButton || "Confirmar";
    go.classList.toggle("btn-danger", danger);
    go.classList.toggle("btn-brand", !danger);

    window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }, true);

  if (modalEl) {
    modalEl.querySelector("[data-sx-confirm-go]").addEventListener("click", function () {
      if (!pending) return;
      var form = pending;
      pending = null;
      window.bootstrap.Modal.getOrCreateInstance(modalEl).hide();
      form.dataset.confirmed = "1";
      if (typeof form.requestSubmit === "function") form.requestSubmit(); else form.submit();
    });
    modalEl.addEventListener("hidden.bs.modal", function () { pending = null; });
  }
})();
