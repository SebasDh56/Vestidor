# Arquitectura

## Flujo del probador

```text
Camera MediaStream
      ↓
BodyTrackingEngine
MediaPipe Pose Landmarker + filtro exponencial
      ↓
NormalizedLandmark[]
      ├──→ SizeRecommendationEngine
      │    tabla específica de la prenda + altura aproximada
      │
      └──→ VirtualTryOnEngine
           hombros + codos + muñecas + cadera
                    ↓
              Canvas AR Overlay
```

`BodyTrackingEngine` solo conoce la cámara y landmarks. `SizeRecommendationEngine` solo conoce proporciones y tablas. `VirtualTryOnEngine` solo conoce landmarks, talla y parámetros visuales de la prenda. Esta separación permite reemplazar Canvas por Three.js/GLB sin reescribir captura, catálogo o recomendación.

## Flujo del catálogo

```text
Storefront público ── GET/listGarments ── D1 garments
                                            ↑
Admin autenticado ── POST /api/garments ────┤
                    └─ imagen WebP ───────── D1 garment_media
```

Cuando D1 todavía no está disponible, el storefront conserva el catálogo inicial incluido en el proyecto. En despliegue, la primera petición crea las tablas de forma idempotente y carga las prendas iniciales; la migración Drizzle deja el esquema versionado.

## Autorización

El administrador inicia sesión con el correo autorizado y el secreto `ADMIN_PASSWORD` configurado en Cloudflare. El servidor firma una cookie `HttpOnly` con HMAC y vuelve a comprobar la sesión y la membresía antes de cada escritura.

## Decisiones del MVP

- MediaPipe Pose Landmarker: 33 landmarks, ejecución web local y coordenadas normalizadas/3D.
- Canvas 2D deformable: permite validar seguimiento y comparación de tallas antes de invertir en rigging GLB.
- D1 único: elimina la activación obligatoria de R2 para el MVP. Las fotos se comprimen a WebP y cada fila queda por debajo de 1.4 MB.
- Sin e-commerce: no existen entidades de stock, pedido, carrito o pago.

## Próximas fases

1. Empaquetar modelo y WASM localmente; ejecutar inferencia en Web Worker.
2. Integrar segmentación de persona para oclusión de brazos y manos.
3. Añadir `GarmentRenderer3D` con GLB, skeleton, morph targets y materiales PBR.
4. Crear calibración multiframe más robusta y tablas de talla editables desde admin.
5. Medir FPS y memoria en Chrome Android de gama media.
