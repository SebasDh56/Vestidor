# Raíz — catálogo artesanal con probador virtual

Prototipo web responsive para exhibir una colección limitada de chaquetas y abrigos, administrarla sin funciones de stock y probar las prendas mediante cámara con seguimiento corporal local.

## Qué incluye

- Portada editorial y catálogo responsive basado únicamente en las prendas de referencia.
- Detalle de cada prenda con color, material, tallas y acceso directo al probador.
- Cámara frontal, selector de dispositivo y manejo de permisos/errores.
- Pose Landmarker de MediaPipe ejecutado en el navegador.
- Seguimiento estabilizado de hombros, codos, muñecas y cadera.
- Render de prenda deformable: torso, mangas, ancho y largo reaccionan al cuerpo y a la talla.
- Recomendación orientativa S/M/L/XL basada en la tabla de cada prenda.
- Vista debug de landmarks, contador de FPS y captura local.
- Panel de administración autenticado para publicar información e imágenes.
- D1 para datos estructurados y R2 para imágenes subidas.

No incluye inventario, carrito, pagos, pedidos ni precisión biométrica.

## Ejecución local

Requiere Node.js 22 o superior.

```bash
npm install
npm run dev
```

Abrir la URL local indicada por el servidor. El acceso a cámara exige `localhost` o HTTPS.

Verificaciones:

```bash
npm run build
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js . --ignore-pattern dist --ignore-pattern .next
npm test
```

## Administración

La ruta `/admin` utiliza el inicio de sesión administrado por la plataforma. En una instalación nueva, el primer usuario autenticado queda registrado en D1 como administrador inicial; los siguientes usuarios autenticados son rechazados. El catálogo público no requiere cuenta.

El formulario permite cargar:

- nombre, categoría y descripción;
- material y color;
- colores del render virtual;
- imagen JPG, PNG o WebP de hasta 5 MB.

## Privacidad y cámara

Los frames se procesan temporalmente en el dispositivo. No se envía ni se guarda video. La captura solo se descarga cuando la persona pulsa `Capturar`.

MediaPipe y su modelo se cargan desde los endpoints públicos oficiales/CDN al activar el probador. La inferencia se limita aproximadamente a 15 FPS para equilibrar estabilidad y rendimiento; el render continúa con `requestAnimationFrame`.

## Limitaciones reales del MVP

- El render es AR 2D deformable anclado a landmarks; no es aún una simulación física 3D de tela.
- La oclusión de manos/brazos y la segmentación de persona quedan para una siguiente fase.
- La talla es una estimación visual orientativa, no una medición clínica.
- La fidelidad del color y el ajuste dependen de iluminación, encuadre y cámara.
- Para producción conviene versionar localmente el modelo MediaPipe y mover inferencia a un Web Worker.

## Estructura principal

```text
app/                    rutas, páginas y API
src/components/         storefront, administración y cámara
src/engines/            tracking, talla y render de prenda
src/services/           catálogo, D1, R2 y autorización
src/data/               catálogo inicial
src/types/              contratos del dominio
db/                     esquema Drizzle
drizzle/                migraciones SQL
public/images/          referencias y editoriales generadas
tests/                  render y lógica de talla
```

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para el flujo técnico y el roadmap.
