<?php
/**
 * Vista: auth/login (basada en _template/login.html).
 */
$emailError = error('email');
$passError = error('password');
?>
<h1 class="sx-auth__title">Iniciar sesión</h1>
<p class="sx-auth__sub">Retoma tus proyectos, vacantes y solicitudes en <?= e(config('app.name', 'Praxia')) ?>.</p>

<form method="post" action="<?= e(url('/login')) ?>" novalidate>
  <?= csrf_field() ?>

  <div class="sx-field">
    <label for="login-email">Correo electrónico</label>
    <input class="form-control<?= $emailError ? ' is-invalid' : '' ?>" id="login-email" name="email" type="email"
           required autocomplete="email" value="<?= e((string) old('email')) ?>" placeholder="nombre@ejemplo.com">
    <?php if ($emailError): ?>
      <div class="invalid-feedback"><?= e($emailError) ?></div>
    <?php endif; ?>
  </div>

  <div class="sx-field">
    <label for="login-pass">Contraseña</label>
    <div class="sx-passwrap">
      <input class="form-control<?= $passError ? ' is-invalid' : '' ?>" id="login-pass" name="password" type="password"
             required autocomplete="current-password" placeholder="Tu contraseña">
      <button class="sx-passtoggle" type="button" data-sx-pass-toggle aria-label="Mostrar contraseña">
        <i data-lucide="eye" class="ic-18"></i>
      </button>
    </div>
    <?php if ($passError): ?>
      <div class="invalid-feedback d-block"><?= e($passError) ?></div>
    <?php endif; ?>
  </div>

  <button class="btn btn-brand w-100 mt-2" type="submit">Iniciar sesión</button>
</form>

<p class="sx-auth__foot mt-4">¿Aún no tienes cuenta? <a href="<?= e(url('/register')) ?>">Crear cuenta</a></p>
