# Bring! — Implementación y mantenimiento vigentes

Versión 2.0 · 16/10/2026. La integración permanente está implementada. Leer AGENTE-INTEGRACION.md para el procedimiento completo, OPERACION.md para ejecución/recuperación y ESTADO.md para activaciones y validaciones. Este documento sustituye el plan de implementación pendiente del 14/10; no altera contratos culinarios/PWA.

Sistema Python/HTML/CSS/JS existente, sin backend nuevo: registro activos, fuente v1, imagen canónica, generar.py, compra.py, exportar_compra.py, plantilla compra.html y assets/compra.*. Cada menú tiene página permanente menus/MM-N/compra y veinte JSON de 1–20 porciones. Inicio usa el mapa compras para el acceso contextual; query mes/menu prevalece sobre selección recordada. Las salidas se generan, no se editan a mano.

UI: cabecera/logo/paleta/tipografías actuales; imagen única; selector previo +/- y entrada entera; tabla de necesidad real, cantidad exportada, variantes y compra/despensa; condimentos sin cantidad; regreso al menú. Errores/ausencia de red/JSON o porciones inválidas bloquean enlace y ofrecen reintento. Detalles técnicos quedan en expedientes, fuera de la experiencia ordinaria. Estructura visual editable en plantilla/CSS, sin rediseño general.

JSON propio: author/name/tagline/yield/linkOutUrl/imageUrl/items. yield como texto N; deeplink con JSON N, source web, baseQuantity N y requestedQuantity N. Imagen/payloads públicos sin sesión y misma URL absoluta de imagen. El importador no ejecuta el estado local del selector. El escalado en Bring! multiplica compra ya redondeada; recalcular mínimos exige volver a MiruRecetas y hacer nueva importación.

Misma publicación PWA, manifest, iconos y service worker. No nueva instalación/scope, cachés masivas ni promesa de Bring! offline. La lista ya abierta puede seguir consultándose sin red; no garantizar reapertura offline ni importación. Mantener regresiones reales de PWA y diseño responsive. Las nuevas imágenes WebP optimizadas no autorizan cambios del SW.

Publicación: rama/PR → Validar web + QA navegador → fusión → Publicar recetas + Pages → HTTP/MIME/bytes de todas las rutas activas → navegador público. El workflow ya incluye datos/compra, guarda menus y ejecuta verificar_compra_publica.py. Revisar main concurrente sin revertir cambios ajenos. Registrar evidencia real; CI/HTTP no equivalen a prueba en Bring! Android.

Mantenimiento: nuevas extracciones autenticadas, doble lectura y huellas; invalidar fuentes afectadas por menú/subpreparación/producto, revisar portada si cambian platos. No sincronización automática de Airtable. Recuperación por PR corrigiendo origen o retirando clave activa; eliminar salidas antiguas solo si se solicita. Preservar recetas, macros, campos y experimentos; no borrar caches/favoritos. AGENTE-INTEGRACION contiene comandos y criterios de aceptación.

Validación real vigente: históricas 7/8 y confirmación expresa de importaciones septiembre 3/4 el 16/10/2026. No reabrirlas. Septiembre 1/2 es nuevo despliegue con comprobación física pendiente.

## Regla de diseño — portadas en móvil vertical · 16/10/2026

En las listas de compra, la portada debe quedar centrada horizontalmente en móvil y PWA en vertical dentro de la disposición apilada (ancho de viewport hasta 540 px). Se mantiene su tamaño y posición anterior al texto. En horizontal, tablet y escritorio se conserva la disposición existente, con portada a la derecha cuando hay dos columnas. Aplicar la regla en `assets/compra.css` para todos los menús actuales y futuros; no editar ni regenerar las fotografías para corregir alineación.

Verificar el centrado por geometría en móvil vertical y la columna derecha en horizontal/escritorio mediante `tests/compra_qa.cjs`. La misma página y CSS sirven a web y PWA; una prueba automatizada no acredita una prueba física en el dispositivo.
