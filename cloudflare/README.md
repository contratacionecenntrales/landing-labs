# Failover de crm.labs24k.com → acceso.labs24k.com

Este Worker resuelve el requisito de "Escudo de Marca": si `crm.labs24k.com`
falla (certificado SSL inválido, origen caído, timeout), el visitante es
redirigido a `https://acceso.labs24k.com` en vez de ver una pantalla de
error del navegador o de Cloudflare.

**Importante — límite de lo que puedo entregar desde aquí:** no tengo acceso
a la cuenta de Cloudflare ni al gestor DNS de labs24k.com. Puedo escribir y
dejar listo el código (`failover-worker.js`) y esta guía, pero el
despliegue, la creación de la ruta y la confirmación (captura de pantalla
de la regla activa) tiene que hacerlos alguien con acceso al panel de
Cloudflare del dominio. Abajo tienes los pasos exactos para hacerlo en
~5 minutos.

## Pre-requisitos

1. `labs24k.com` debe estar gestionado como zona en Cloudflare.
2. El registro DNS de `crm.labs24k.com` debe estar en modo **Proxied**
   (nube naranja). Si está en "DNS only" (nube gris), Cloudflare no ve el
   tráfico y el Worker nunca se dispara — cámbialo a Proxied primero.
3. SSL/TLS de la zona en modo **Full** o **Full (strict)** (Dashboard →
   SSL/TLS → Overview). Con "Flexible" no se generan los errores 526 que
   este Worker detecta.
4. El portal estático debe estar ya desplegado en `acceso.labs24k.com`
   (ver `../acceso/README.md`).

## Pasos de despliegue

1. Dashboard de Cloudflare → selecciona la zona `labs24k.com`.
2. Menú lateral → **Workers & Pages** → **Create Application** → **Create Worker**.
3. Ponle un nombre, p. ej. `crm-failover`, y pulsa **Deploy** para crear el
   esqueleto inicial.
4. Abre **Edit code** y sustituye todo el contenido por el de
   `failover-worker.js` de esta carpeta. **Save and Deploy**.
5. Dentro del Worker, ve a la pestaña **Triggers** → **Routes** → **Add route**.
   - Route: `crm.labs24k.com/*`
   - Zone: `labs24k.com`
6. Guarda. A partir de aquí todo el tráfico a `crm.labs24k.com` pasa por el Worker.

## Verificación

- Con el CRM funcionando con normalidad: `crm.labs24k.com` debe comportarse
  exactamente igual que antes (el Worker solo actúa cuando detecta un
  fallo de origen).
- Para simular el fallo sin tocar el CRM real: cambia temporalmente
  `ORIGIN_HOSTNAME` en el Worker a un host que no exista y despliega; deberías
  ser redirigido a `acceso.labs24k.com`. Revierte el cambio al terminar la prueba.

## Alternativa sin código: Cloudflare Load Balancing

Si la cuenta tiene el add-on de **Load Balancing** (de pago, fuera del
plan Free), es la opción "oficial" de Cloudflare para esto: configuras un
pool primario (el CRM) y un pool de respaldo (el portal estático), con
health checks pasivos/activos que conmutan automáticamente sin añadir
latencia en el camino feliz (el Worker de arriba sí añade una petición
`fetch` extra en cada request). Si os interesa esa vía en vez del Worker,
decídmelo y preparo la configuración de health check + pools en lugar de
este script.

## Estado actual

- [x] Código del Worker listo (`failover-worker.js`).
- [ ] Desplegado en Cloudflare — pendiente de alguien con acceso al panel.
- [ ] Ruta `crm.labs24k.com/*` confirmada activa — pendiente.
- [ ] Captura de pantalla de la regla en producción — pendiente, la debéis
      generar vosotros tras el despliegue.
