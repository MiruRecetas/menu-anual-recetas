# MiruRecetas · PWA

Implementación sobre main ef0e9b63a36b7fd00f156a61a4822a6d835fe266 (13/10/2026).
Una única web y publicación en https://mirurecetas.github.io/menu-anual-recetas/.

## Arquitectura y auditoría

Cuatro familias de plantillas, generador Python, JS/CSS sin empaquetador. Sin PWA previa ni PR abiertas al iniciar. HTTPS y portada pública HTTP 200. Se preservan datos, fotos, menús, SEO de recetas y UI; no se consulta ni modifica Airtable. El repositorio de redirección no cambia.

Fuentes afectadas: `scripts/generar.py`, nuevo `scripts/pwa.py`, cuatro `plantillas/*.html`, `plantillas/sw.js`, `assets/pwa.js`, `assets/pwa.css`, `assets/pwa/*.png`, `assets/lucide.min.js` y su licencia, `manifest.webmanifest`, `offline.html`, tests PWA, los tres workflows y esta documentación. `sw.js` y HTML son generados. Los seis iconos PNG proceden **sin modificar sus bytes** del paquete corregido `MiruRecetas_identidad_visual.zip`, entregado el 13/10/2026; sustituyen el monograma provisional. El [manual de marca](IDENTIDAD-MARCA.md) conserva su referencia y criterios. Esta intervención aplica la identidad a instalación y favicon; la cabecera pertenece al Work web.

## Instalación

Android Chrome: menú del navegador → Instalar aplicación / Añadir a pantalla de inicio. Escritorio Chrome/Edge: opción de instalación en barra de direcciones o menú. El botón al pie aparece únicamente con `beforeinstallprompt`. iPhone/iPad Safari: Compartir → Añadir a pantalla de inicio → abrir como app, cuando la versión del sistema lo permita. No se ofrece botón universal ni se requiere cuenta.

`manifest.webmanifest`: id, scope y start_url `/menu-anual-recetas/`, standalone, español, iconos PNG 192/512 transparentes, maskable 512 y Apple 180 sólidos; favicon 16/32. Las URLs de iconos incorporan SHA-256 de sus bytes y se regeneran de forma idempotente. Esto permite detectar el cambio del manifest; la renovación de iconos ya instalados depende del navegador y del sistema, y no se garantiza inmediata. `sw.js` registrado en esa misma base, con `updateViaCache: none`. Nunca controla `/` ni terceros.

## Offline y coherencia

Precaché: **solo offline.html, manifest y los tres iconos del manifest** (192/512/maskable). No precarga todas las recetas, fotografías ni la portada. Tras la primera activación natural (volver a abrir/recargar), guarda páginas visitadas cuando todas sus dependencias JS/CSS locales han sido verificadas. Lucide 1.55.0 se sirve localmente con licencia; las fuentes externas no se cachean, utilizan sustitutos system-ui/Georgia offline.

Network-first para páginas, índice, assets versionados e imágenes. Se evita la caché HTTP con no-store. HTTP 200, MIME, HTML completo, estructura del índice y SHA-256 de assets se validan antes de reemplazar copias. Los hashes propios de cada CSS/JS se generan automáticamente en **todas** las familias, sin editar fechas a mano. El generador conserva copias inmutables en `assets/revisions/<sha256>/<archivo>` y las publica junto al HTML; una publicación parcial no obliga a servir bytes nuevos para una URL antigua. Un asset con bytes distintos no sustituye la versión de esa URL. Las revisiones no cambian al publicar recetas ni disparan ciclos de Actions; revisar su tamaño si se acumulan muchas versiones de código. Antes de guardar HTML se descargan sus dependencias exactas. Si estas se han expulsado, se ofrece fallback offline en lugar de una ficha rota. El HTML guardado incluye aviso y reintento; la recuperación de red no lo presenta como vigente ni recarga automáticamente.

Límites compartidos: 40 páginas, 64 assets, 40 fotos, 2 índices JSON; caducidad 30 días. Máximo 1 MiB por página/asset/JSON y 2 MiB por imagen; tope teórico de runtime aproximadamente 186 MiB, normalmente muy inferior. Escrituras y expulsión serializadas. Cuota real del navegador puede expulsar antes. Sin persistencia garantizada ni descarga seleccionada. Navegación no visitada ofrece pantalla explícita; el recetario offline puede enlazar fichas no guardadas, que muestran ese fallback. Solo GET de rutas públicas permitidas del origen, sin Authorization ni cookies de sesión. No se interceptan rutas de perfiles, API, autenticación ni recursos de terceros.

Raciones, pasos, temporizador, paneles y gestos usan el JS existente. Estado de cocina **en memoria**, no guardado permanente: se pierde al recargar/cerrar. La PWA no provoca recargas automáticas.

## Actualización

El contenido publicado se consulta en la red en cada navegación, sin reinstalar. Nueva versión del SW: espera; aviso accesible **al pie**, no overlay. Solo la aceptación activa skipWaiting y recarga esa pestaña. En una ficha se avisa de la pérdida de raciones/pasos/temporizador y permite cancelar. Las otras pestañas no se recargan; los assets anteriores se conservan sujetos a límites para mantenerlas coherentes. No hay clients.claim. Revisar al abrir, volver visible y recuperar red; una app cerrada no comprueba cambios instantáneamente.

La revisión determinista del SW depende de su plantilla y precaché/UI PWA; cambios de contenido no necesitan nueva revisión. HTML y assets propios tienen hashes independientes. Publicar recetas guarda el SW generado junto al HTML; sw.js no dispara otro ciclo. El índice y sus verificaciones habituales permanecen.

## Pruebas y mantenimiento

`python -m unittest discover -s tests -v`, `node tests/test_graficos_semana.cjs`, sintaxis JS/Python, generador repetido/idempotente. `QA navegador MiruRecetas` conserva regresiones responsive y añade `node tests/pwa_qa.cjs`: servidor aislado bajo ruta canónica, Chromium real headless, SW real, offline visitada/no visitada, cocina, fallback 500, cambio de catálogo/menú/foto, actualización esperando/aceptada/cancelada y múltiples pestañas, caducidad y rollback. Fixtures de prueba no escriben datos del repositorio.

**No equivale a instalación física.** Android/Chrome, escritorio/Chrome-Edge en modo standalone e iOS/iPadOS Safari reales pendientes de ensayo. Tampoco se promete Lighthouse perfecto ni offline de fuentes de Google. CI y HTTP público deben constar en la entrega tras fusionar; este documento describe el contrato, no acredita por sí mismo ese despliegue.

Toda modificación de rutas, generador, alojamiento, assets o cabeceras requiere revisar impacto PWA, ejecutar ambos QA y verificar manifest/SW/iconos/página profunda públicos. Futuro dominio: reevaluar id/origen/scope e instalación; no migra automáticamente almacenamiento.

## Rollback de emergencia

No basta borrar sw.js. `scripts/pwa-rollback.js` contiene un trabajador corrector, probado en fixture, sin interceptación de fetch, que activa inmediatamente por emergencia, elimina **solo** cachés `mirurecetas-pwa-*` y desregistra su registro. Las pestañas abiertas pueden conservar controlador hasta cerrarse/recargarse; no se fuerzan recargas de cocina.

En rama/PR de recuperación, hacer que `scripts/pwa.py:build` escriba esos bytes bajo **la misma URL sw.js**, desactivar el registro en `assets/pwa.js`, regenerar y publicar conjuntamente; mantener el corrector públicamente disponible para instalaciones antiguas. Revalidar y verificar HTTP del corrector antes de declarar recuperación. No borrar localStorage/IndexedDB ni cachés ajenas. Para reactivar posteriormente, restaurar el registro y generación normal con nueva revisión y probar actualización nuevamente.

## Actualización de coordinación Bring! · 14/10/2026

Las pruebas aisladas 1–8 están consolidadas en [Maestro Bring! v2.0](bring/MAESTRO.md). La usuaria ha validado en Android la compra por ID con expansión recursiva, selector previo y redondeo final; nombres sencillos con características por comas, unión de variantes en cesta, stock e imagen de menú. El estado técnico, evidencia real y límites se documentan allí.

Esta actualización es documental. La integración permanente sigue pendiente de ejecución específica y coordinación de esquema/exportación/UI. No cambia cantidades, nutrientes, fórmulas, recetas, fotos canónicas o PWA por sí sola. La afirmación histórica de ausencia de integración propia se refiere a producción; los experimentos sí están publicados y validados.

Seguir con misma publicación, manifest, iconos, scope y actualización consentida. Revisar rutas/caché/tamaños de página y JSON nuevos y bloquear promesas de importación offline: el importador remoto necesita red y JSON público. PNG de ensayo 8 >2 MiB no acredita cacheabilidad dentro de límites PWA. Validación de Bring! no es instalación/offline real de PWA.


## Compra Bring! permanente · Octubre · Menú 1

Nueva familia de página en `menus/10-1/compra/`, decorada por el mismo pipeline de assets/manifest/registro. Acceso contextual en el menú; misma PWA, iconos, scope y SW. No se precachean payloads. La importación requiere red y valida el JSON público seleccionado; pérdida de conexión bloquea el enlace. La consulta de la página abierta permanece disponible, sin garantizar reapertura offline de URLs con parámetros ni caché del PNG aprobado (>2 MiB). Contrato de operación y recuperación: [docs/bring/OPERACION.md](bring/OPERACION.md). Validación física de las rutas nuevas pendiente; el expediente Bring! distingue CI/HTTP de Android real.
