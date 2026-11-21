<?php
/**
 * Vista: auth/register (basada en _template/register.html).
 *
 * @var array<string, string> $profileTypes
 */
$nameError = error('name');
$emailError = error('email');
$passError = error('password');
$termsError = error('terms');
$oldProfiles = old('profiles', []);
if (!is_array($oldProfiles)) {
    $oldProfiles = [];
}
$profileDescriptions = [
    'professional' => 'Postúlate a vacantes abiertas en proyectos.',
    'investor'     => 'Manifiesta interés en fondear proyectos.',
    'mentor'       => 'Acompaña y asesora a emprendedores.',
];
?>
<h1 class="sx-auth__title">Únete a <?= e(config('app.name', 'Praxia')) ?></h1>
<p class="sx-auth__sub">Publica tu idea de proyecto o súmate a uno como profesionista, inversor o mentor.</p>

<form method="post" action="<?= e(url('/register')) ?>" novalidate>
  <?= csrf_field() ?>

  <div class="sx-field">
    <label for="reg-name">Nombre completo</label>
    <input class="form-control<?= $nameError ? ' is-invalid' : '' ?>" id="reg-name" name="name" type="text"
           required autocomplete="name" value="<?= e((string) old('name')) ?>" placeholder="Tu nombre y apellido">
    <?php if ($nameError): ?>
      <div class="invalid-feedback"><?= e($nameError) ?></div>
    <?php endif; ?>
  </div>

  <div class="sx-field">
    <label for="reg-email">Correo electrónico</label>
    <input class="form-control<?= $emailError ? ' is-invalid' : '' ?>" id="reg-email" name="email" type="email"
           required autocomplete="email" value="<?= e((string) old('email')) ?>" placeholder="nombre@ejemplo.com">
    <?php if ($emailError): ?>
      <div class="invalid-feedback"><?= e($emailError) ?></div>
    <?php endif; ?>
  </div>

  <div class="sx-field">
    <label for="reg-pass">Contraseña</label>
    <div class="sx-passwrap">
      <input class="form-control<?= $passError ? ' is-invalid' : '' ?>" id="reg-pass" name="password" type="password"
             required autocomplete="new-password" placeholder="Mínimo 8 caracteres" data-sx-strength>
      <button class="sx-passtoggle" type="button" data-sx-pass-toggle aria-label="Mostrar contraseña">
        <i data-lucide="eye" class="ic-18"></i>
      </button>
    </div>
    <div class="sx-strength" data-sx-strength-meter>
      <span class="sx-strength__bar"></span>
      <span class="sx-strength__bar"></span>
      <span class="sx-strength__bar"></span>
      <span class="sx-strength__bar"></span>
    </div>
    <span class="form-text" data-sx-strength-label>Usa al menos 8 caracteres difíciles de adivinar.</span>
    <?php if ($passError): ?>
      <div class="invalid-feedback d-block"><?= e($passError) ?></div>
    <?php endif; ?>
  </div>

  <div class="sx-field">
    <label for="reg-pass-confirm">Confirmar contraseña</label>
    <div class="sx-passwrap">
      <input class="form-control" id="reg-pass-confirm" name="password_confirmation" type="password"
             required autocomplete="new-password" placeholder="Repite tu contraseña">
      <button class="sx-passtoggle" type="button" data-sx-pass-toggle aria-label="Mostrar contraseña">
        <i data-lucide="eye" class="ic-18"></i>
      </button>
    </div>
  </div>

  <div class="sx-field">
    <label class="d-block mb-1">¿Cómo quieres participar? <span class="sx-meta">(opcional, puedes cambiarlo después)</span></label>
    <p class="sx-meta mb-2">Cualquier cuenta puede publicar proyectos.</p>
    <div class="d-grid gap-2">
      <?php foreach ($profileTypes as $type => $label): ?>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" name="profiles[]" value="<?= e($type) ?>"
                 id="reg-role-<?= e($type) ?>"<?= in_array($type, $oldProfiles, true) ? ' checked' : '' ?>>
          <label class="form-check-label" for="reg-role-<?= e($type) ?>">
            <strong><?= e($label) ?></strong>
            <span class="sx-meta d-block"><?= e($profileDescriptions[$type] ?? '') ?></span>
          </label>
        </div>
      <?php endforeach; ?>
    </div>
  </div>

  <div class="sx-switchrow ps-0 mb-3">
    <input class="form-check-input<?= $termsError ? ' is-invalid' : '' ?>" type="checkbox" name="terms" value="1"
           id="reg-terms"<?= old('terms') ? ' checked' : '' ?> required>
    <label for="reg-terms">Acepto los <a href="<?= e(url('/terms')) ?>">términos</a> y el
      <a href="<?= e(url('/privacy')) ?>">aviso de privacidad</a></label>
    <?php if ($termsError): ?>
      <div class="invalid-feedback d-block"><?= e($termsError) ?></div>
    <?php endif; ?>
  </div>

  <button class="btn btn-brand w-100" type="submit">Crear cuenta</button>
</form>

<p class="sx-auth__foot">¿Ya tienes una cuenta? <a href="<?= e(url('/login')) ?>">Iniciar sesión</a></p>
