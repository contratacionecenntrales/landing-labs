# landing-labs

Landing page + embudo de captura para **Labs24k** (tráfico de Instagram),
inspirada en el diseño de "7 Kits gratis" (fondo oscuro + dorado).

## Estructura

- `index.html` — landing principal con el formulario de captura (nombre, email, repetir email).
- `gracias.html` — página de confirmación tras enviar el formulario.
- `assets/css/style.css` — estilos (tema oscuro/dorado, responsive).
- `assets/js/main.js` — validación del formulario y envío del lead.

## Cómo probarla en local

Abre `index.html` en el navegador, o sirve la carpeta con cualquier servidor estático:

```bash
python3 -m http.server 8000
# luego visita http://localhost:8000
```

## Conectar el formulario (Formspree)

El formulario aún no envía datos a ningún sitio real. Para activarlo:

1. Crea un formulario en [Formspree](https://formspree.io) (o el ESP/CRM que uses).
2. Copia tu endpoint (algo como `https://formspree.io/f/xxxxxx`).
3. Pégalo en `assets/js/main.js`, en la constante `FORM_ENDPOINT`.

Mientras `FORM_ENDPOINT` siga con `YOUR_FORM_ID`, el formulario valida los
campos y te lleva directamente a `gracias.html` (útil para probar el diseño
sin backend).

## Personalización pendiente

- Sustituye el nombre de los 7 kits en `index.html` por tu oferta real.
- Sustituye los testimonios de ejemplo (marcados como "Ejemplo — sustituir") por testimonios reales.
- Actualiza el enlace de Instagram en `gracias.html`.
- Ajusta el contador "+2.700 personas" al dato real de tu comunidad.
