/**
 * Labs 24K — Failover Worker para crm.labs24k.com
 *
 * Qué hace:
 *   Intercepta las peticiones a crm.labs24k.com. Si el origen (el CRM real)
 *   no responde o responde con un error de conexión/TLS (521/522/525/526,
 *   timeout, DNS, etc.), redirige al visitante al portal estático de
 *   respaldo en https://acceso.labs24k.com en vez de dejarle ver una
 *   pantalla de error de Cloudflare o del navegador.
 *
 * Requisitos para que esto funcione:
 *   1. El registro DNS de crm.labs24k.com debe estar "Proxied" (nube
 *      naranja) en Cloudflare. Si está en modo "DNS only" (nube gris),
 *      Cloudflare no intercepta el tráfico y este Worker nunca se ejecuta.
 *   2. El modo SSL/TLS de la zona debe ser "Full" o "Full (strict)" para
 *      que Cloudflare valide el certificado de origen y genere el error
 *      526 cuando ese certificado falle (que es justo el caso que se
 *      quiere cubrir).
 *   3. ORIGIN_HOSTNAME abajo debe apuntar al host real del CRM tal y como
 *      lo resuelve Cloudflare (normalmente el mismo crm.labs24k.com si el
 *      registro DNS ya apunta al servidor del CRM).
 *
 * Cómo desplegarlo (resumen, ver cloudflare/README.md para el detalle):
 *   Dashboard de Cloudflare → Workers & Pages → Create Worker → pega este
 *   código → Deploy → en el Worker, pestaña "Triggers" → Add Route →
 *   crm.labs24k.com/*  (zona: labs24k.com).
 *
 * Nota: no tengo acceso a la cuenta de Cloudflare del cliente, así que no
 * puedo desplegar ni confirmar esta configuración por mi cuenta — este
 * archivo es el entregable de código; la puesta en producción y la
 * confirmación (captura de pantalla de la regla activa) las debe hacer
 * quien tenga acceso al panel de Cloudflare.
 */

const FALLBACK_URL = 'https://acceso.labs24k.com/';
const ORIGIN_HOSTNAME = 'crm.labs24k.com';

// Códigos de error que Cloudflare devuelve cuando el origen falla
// (incluye 526: certificado SSL de origen inválido, el caso que motiva este Worker).
const ORIGIN_FAILURE_STATUS = new Set([521, 522, 523, 524, 525, 526, 530]);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = ORIGIN_HOSTNAME;

    try {
      const response = await fetch(url.toString(), request);

      if (ORIGIN_FAILURE_STATUS.has(response.status)) {
        return Response.redirect(FALLBACK_URL, 302);
      }

      return response;
    } catch (err) {
      // fetch() lanza excepción ante fallos de red/TLS que Cloudflare no
      // convierte en una respuesta HTTP (p. ej. handshake TLS roto).
      return Response.redirect(FALLBACK_URL, 302);
    }
  },
};
