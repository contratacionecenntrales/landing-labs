# Portal de Acceso Estático — Oficina Virtual (Labs Command Center)

Página única, autocontenida (`index.html`, sin dependencias de build, sin
JS de terceros salvo la tipografía de Google Fonts) pensada para servir
como "Escudo de Marca" delante de `crm.labs24k.com`.

- Fondo negro puro `#0A0A0A`, acento cian neón `#00F0FF`.
- Tipografía Plus Jakarta Sans (títulos) + Inter (cuerpo), con fallback a
  fuentes del sistema si Google Fonts no carga — la página sigue siendo
  usable sin conexión a esa CDN.
- Isotipo de Labs 24K inline en SVG (cero peticiones extra para el logo).
- Un único CTA "Iniciar Sesión" que enlaza directo a `https://crm.labs24k.com`
  (enlace `<a href>` normal, funciona aunque JS esté desactivado).
- Sin lógica de autenticación local: la verificación de credenciales ocurre
  en el propio CRM. Esta página es solo la puerta de marca / fallback.

## Despliegue recomendado: subdominio independiente

El requisito pide alta disponibilidad separada del CMS principal, así que
lo correcto es desplegar **solo esta carpeta** (`acceso/`) como su propio
proyecto, no como parte del build del sitio principal.

### Opción A — Vercel

```
cd acceso
vercel deploy --prod
```

Después, en el dashboard de Vercel → Project → Settings → Domains, añade
`acceso.labs24k.com` y sigue las instrucciones para el registro CNAME que
Vercel te indique (lo añades en el DNS de Cloudflare como *DNS only*, para
no encadenar dos proxies).

### Opción B — Netlify

Arrastra la carpeta `acceso/` al dashboard de Netlify (Sites → Add new
site → Deploy manually), o conecta el repo y configura:

- Base directory: `acceso`
- Build command: *(ninguno — es HTML estático)*
- Publish directory: `acceso`

Luego añade el dominio personalizado `acceso.labs24k.com` en Site settings → Domain management.

### Opción C — Cloudflare Pages

Workers & Pages → Create → Pages → Connect to Git (o "Direct Upload" con
esta carpeta) → Build output directory: `acceso` (sin comando de build).
Añade el dominio personalizado `acceso.labs24k.com` en Custom domains.

Esta opción tiene la ventaja de vivir en la misma cuenta de Cloudflare que
el Worker de failover (ver `../cloudflare/README.md`), lo que simplifica
la gestión.

## Qué no puedo hacer yo

No tengo acceso a vuestras cuentas de Vercel/Netlify/Cloudflare ni al DNS
de `labs24k.com`, así que no puedo ejecutar el despliegue ni dar de alta
`acceso.labs24k.com` por mi cuenta. Esta carpeta es el entregable de
código listo para que quien tenga esos accesos lo despliegue siguiendo
los pasos de arriba.
