<?php
/**
 * Procesa el formulario de admisión ("Solicitud de exclusividad de zona").
 * Envía la solicitud por email y, si el envío es correcto, un acuse de
 * recibo al propio solicitante. Pensado para hosting compartido (Hostalia)
 * usando la función mail() nativa de PHP: no requiere librerías externas
 * ni composer.
 */

declare(strict_types=1);

// ---------------------------------------------------------------------
// Configuración — edita estos valores si cambian los datos de contacto.
// ---------------------------------------------------------------------
const TO_EMAIL   = 'info@labs24kfranquicias.com';
const FROM_EMAIL = 'info@labs24kfranquicias.com'; // debe ser un buzón del propio dominio
const FROM_NAME  = 'Labs24k Franquicias — Web';
const SITE_NAME  = 'Labs24k Franquicias';
const HOME_URL   = '../index.html';

function isAjaxRequest(): bool
{
    return (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')
        || (isset($_SERVER['HTTP_ACCEPT']) && str_contains($_SERVER['HTTP_ACCEPT'], 'application/json'));
}

/**
 * Página HTML mínima (mismos tokens de marca que el sitio) para el
 * fallback sin JavaScript, donde no hay SPA que interprete un JSON.
 */
function renderHtmlPage(bool $success, string $message): void
{
    header('Content-Type: text/html; charset=utf-8');
    $title = $success ? 'Solicitud recibida' : 'No se pudo enviar la solicitud';
    $safeMessage = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    $accent = $success ? '#20ecfc' : '#ff3b30';
    $homeUrl = HOME_URL;
    echo <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{$title} | Labs 24K</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:#00030a;color:#f3f8fb;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
    padding:24px;text-align:center;}
  .card{max-width:480px;border:1px solid rgba(32,236,252,.25);border-radius:20px;padding:40px 32px;background:rgba(255,255,255,.03);}
  h1{font-size:1.4rem;margin:0 0 14px;color:{$accent};}
  p{font-size:.96rem;line-height:1.6;color:rgba(243,248,251,.75);margin:0 0 26px;}
  a{display:inline-block;padding:13px 26px;border-radius:999px;background:#20ecfc;color:#00131c;
    font-weight:700;text-decoration:none;}
</style>
</head>
<body>
  <div class="card">
    <h1>{$title}</h1>
    <p>{$safeMessage}</p>
    <a href="{$homeUrl}#admision">Volver al inicio</a>
  </div>
</body>
</html>
HTML;
    exit;
}

function respond(bool $success, string $message): void
{
    if (isAjaxRequest()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($success ? 200 : 422);
        echo json_encode(['success' => $success, 'message' => $message], JSON_UNESCAPED_UNICODE);
        exit;
    }

    renderHtmlPage($success, $message);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Método no permitido.');
}

// ---------------------------------------------------------------------
// Antispam: honeypot. Los bots suelen rellenar cualquier campo visible
// en el DOM; este está oculto para personas mediante CSS pero presente
// en el marcado, así que si llega relleno descartamos silenciosamente.
// ---------------------------------------------------------------------
if (!empty($_POST['sitio_web'] ?? '')) {
    respond(true, 'Solicitud recibida.'); // respuesta "éxito" falsa para no delatar el filtro
}

// ---------------------------------------------------------------------
// Recogida y saneado de campos
// ---------------------------------------------------------------------
function clean(string $value): string
{
    // Elimina saltos de línea/retorno de carro para evitar inyección de
    // cabeceras de correo, y recorta espacios.
    return trim(str_replace(["\r", "\n"], ' ', $value));
}

$nombre     = clean($_POST['nombre'] ?? '');
$email      = clean($_POST['email'] ?? '');
$telefono   = clean($_POST['telefono'] ?? '');
$zona       = clean($_POST['zona'] ?? '');
$inversion  = clean($_POST['inversion'] ?? '');
$motivacion = trim($_POST['motivacion'] ?? ''); // permite saltos de línea en el cuerpo del email

$inversionLabels = [
    'capital-propio' => 'Sí, dispone de capital propio.',
    'financiacion'   => 'Sí, con vía de financiación abierta.',
    'no'             => 'No por el momento.',
];

// ---------------------------------------------------------------------
// Validación server-side (defensa en profundidad frente a la del cliente)
// ---------------------------------------------------------------------
$errors = [];

if (mb_strlen($nombre) < 2) {
    $errors[] = 'nombre';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'email';
}
if (!preg_match('/^[+\d][\d\s()-]{6,}$/', $telefono)) {
    $errors[] = 'telefono';
}
if (mb_strlen($zona) < 2) {
    $errors[] = 'zona';
}
if (!array_key_exists($inversion, $inversionLabels)) {
    $errors[] = 'inversion';
}
if (mb_strlen($motivacion) < 10) {
    $errors[] = 'motivacion';
}

if (!empty($errors)) {
    respond(false, 'Revisa los campos del formulario: ' . implode(', ', $errors) . '.');
}

// ---------------------------------------------------------------------
// Construcción y envío del email a la central
// ---------------------------------------------------------------------
$fecha = date('d/m/Y H:i');

$body = "Nueva solicitud de exclusividad de zona — {$fecha}\n";
$body .= str_repeat('-', 48) . "\n\n";
$body .= "Nombre y apellidos: {$nombre}\n";
$body .= "Email: {$email}\n";
$body .= "Teléfono: {$telefono}\n";
$body .= "Zona solicitada: {$zona}\n";
$body .= "Inversión mínima (50.000€): {$inversionLabels[$inversion]}\n\n";
$body .= "Por qué Labs24k debería elegirle:\n{$motivacion}\n\n";
$body .= str_repeat('-', 48) . "\n";
$body .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'desconocida') . "\n";

$subject = '=?UTF-8?B?' . base64_encode("Nueva solicitud de zona — {$zona}") . '?=';

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>';
$headers[] = 'Reply-To: ' . $nombre . ' <' . $email . '>';
$headers[] = 'X-Mailer: PHP/' . phpversion();

$sent = @mail(TO_EMAIL, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    respond(false, 'No se ha podido enviar la solicitud. Inténtalo de nuevo en unos minutos o escribe a ' . TO_EMAIL . '.');
}

// ---------------------------------------------------------------------
// Acuse de recibo al solicitante (no bloqueante: si falla, no afecta
// al resultado ya que la solicitud principal se ha enviado igualmente).
// ---------------------------------------------------------------------
$ackSubject = '=?UTF-8?B?' . base64_encode('Hemos recibido tu solicitud — ' . SITE_NAME) . '?=';
$ackBody  = "Hola {$nombre},\n\n";
$ackBody .= "Gracias por tu interés en Labs24k. Tu candidatura para la zona \"{$zona}\" entra ahora en proceso de cualificación.\n";
$ackBody .= "El comité de expansión revisará tu perfil y, si tu solicitud es aprobada, pasarás a una entrevista directa con Dirección General.\n\n";
$ackBody .= "Un saludo,\nEquipo Labs24k\n";

$ackHeaders   = [];
$ackHeaders[] = 'MIME-Version: 1.0';
$ackHeaders[] = 'Content-Type: text/plain; charset=UTF-8';
$ackHeaders[] = 'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>';

@mail($email, $ackSubject, $ackBody, implode("\r\n", $ackHeaders));

respond(true, 'Solicitud enviada correctamente. En breve nos pondremos en contacto contigo.');
