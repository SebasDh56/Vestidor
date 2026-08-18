# KILLAÉ — elegancia de raíz

E-commerce editorial de piezas andinas únicas, con catálogo, solicitudes por WhatsApp, panel administrativo y probador AR procesado localmente en el navegador.

## Tecnología

- Vinext, React y Vite sobre Cloudflare Workers.
- Cloudflare D1 para catálogo y solicitudes.
- Cloudflare R2 para fotografías cargadas desde el panel.
- MediaPipe en el navegador para el seguimiento corporal del probador.
- Sin API de OpenAI, generación pagada ni Cloudflare Images durante el uso del sitio.

## Desarrollo local

Requiere Node.js 22.13 o superior.

```bash
npm install
Copy-Item .dev.vars.example .dev.vars
npm run dev
```

Cambia `ADMIN_PASSWORD` dentro de `.dev.vars` antes de abrir `/admin`. Ese archivo está ignorado por Git y nunca debe subirse al repositorio.

Verificaciones:

```bash
npm run build
npm run lint
npm test
```

## Primer despliegue en Cloudflare

La aplicación ya no depende de GPT Sites. `wrangler.jsonc` contiene la configuración de Worker, D1 y R2. En el primer despliegue Cloudflare puede aprovisionar y enlazar los recursos declarados sin identificadores.

1. Sube el repositorio a GitHub.
2. En Cloudflare abre **Workers & Pages > Create > Import a repository**.
3. Conecta el repositorio y selecciona `main` como rama de producción.
4. Usa `npm run build` como **Build command**.
5. Usa `npm run deploy:worker` como **Deploy command**.
6. Ejecuta el primer despliegue.
7. En el Worker abre **Settings > Variables and Secrets**, crea `ADMIN_PASSWORD` como **Secret** y usa una contraseña de al menos 12 caracteres.
8. Opcionalmente enlaza el dominio propio desde **Settings > Domains & Routes**.

`keep_vars` está habilitado en `wrangler.jsonc`, por lo que los siguientes despliegues conservan el secreto configurado en el panel.

Después de esa configuración inicial, cada cambio publicado en `main` se despliega automáticamente:

```bash
git add .
git commit -m "describe el cambio"
git push origin main
```

Un `git commit` solamente local no despliega; Cloudflare recibe el cambio cuando haces `git push`.

## Despliegue manual opcional

Si prefieres desplegar desde tu equipo:

```bash
npx wrangler login
npm run deploy
```

## Base de datos

El MVP crea de forma idempotente sus tablas al recibir las primeras solicitudes. Las migraciones versionadas también se pueden aplicar manualmente:

```bash
npm run db:migrate:local
npm run db:migrate:remote
```

## Administración

- Ruta: `/admin`
- Correo autorizado: `quimbiulcoerika@gmail.com`
- Contraseña: el secreto `ADMIN_PASSWORD` definido por el propietario.
- La sesión usa una cookie `HttpOnly`, `SameSite=Strict` y firmada con HMAC.

Desde el panel se pueden publicar piezas, cargar imágenes, cambiar disponibilidad y revisar solicitudes. Los pagos, facturación y envíos continúan fuera del sitio en esta etapa.

## Costos y privacidad

La web no consume tokens de ChatGPT ni de la API de OpenAI. El video del probador no se sube al servidor: MediaPipe procesa los fotogramas en el dispositivo. Cloudflare solo contabiliza el uso normal de Workers, D1, R2 y transferencia de archivos conforme al plan de la cuenta.

## Estructura principal

```text
app/                    páginas, autenticación y rutas API
src/components/         tienda, administración y cámara
src/engines/            tracking, talla y render de prenda
src/services/           catálogo, D1, R2 y solicitudes
drizzle/                migraciones SQL
public/images/          fotografías editoriales y de catálogo
worker/                 entrada del Cloudflare Worker
wrangler.jsonc          infraestructura y bindings de Cloudflare
```

Consulta [ARCHITECTURE.md](./ARCHITECTURE.md) para el flujo técnico y las limitaciones reales del probador.
