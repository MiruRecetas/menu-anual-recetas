# Bring! permanente — operación y recuperación

Contrato de implementación del 14/10/2026. Esta guía describe el código permanente; el expediente de publicación registra sus verificaciones. Los resultados físicos históricos 7/8 del Maestro permanecen vigentes. No son una prueba física de la nueva ruta.

## Alcance y rutas

Están habilitados `10-1` y `09-4` en `datos/compra/activos.json`. Lucía solicitó Septiembre · Menú 4 el 15/10/2026. No añadir otros menús sin su autorización.

- Fuente: `datos/compra/10-1.json`, contrato v1 independiente de nutrición y menú v2.
- Página: `menus/10-1/compra/`; entrada contextual junto al selector del menú semanal.
- Payloads: `menus/10-1/compra/exports/1.json` a `20.json`.
- Imagen única: `imagenes/menus/10-1.png`, copia binaria del PNG aprobado; 1254 × 1254, SHA-256 `c7952019f9e9b24a3c1bba2f376e5b354a91c518464b2e85d6276a48252c62c7`. No regenerada, convertida ni recortada; el experimento original permanece intacto. La extensión PNG es una excepción documentada al WebP previsto para nuevas imágenes.
- Cálculo: `scripts/compra.py`; exportador: `scripts/exportar_compra.py`; plantilla: `plantillas/compra.html`; presentación: `assets/compra.css`; interacción: `assets/compra.js`.

54 filas cuantificadas por ID/unidad, 15 preparaciones recorridas, 59 artículos Bring! (48 compra, 11 despensa). Variantes Garbanzos independientes. El cálculo actual coincide exactamente con los totales del fixture histórico 8, tras releer Airtable y catálogo. El generador de producción nunca importa módulos experimentales.

## Fuente y precisión

`grafo` contiene únicamente el menú y dependencias necesarias: comidas, elementos, preparaciones e ingredientes con metadatos de compra. `productos` contiene una proyección de formatos y procedencia, sin tablas privadas completas ni nutrientes. `calculo` se reconstruye íntegramente desde `grafo`, `productos` y condimentos; no se edita a mano. `fuentes` identifica blob comercial, huella del grafo, menú, ingredientes/raciones de fichas culinarias y bytes de imagen. Las fotografías de recetas y otros campos ajenos a compra no invalidan esa huella culinaria.

`cantidad_exacta` y contenido de presentación son fracciones racionales canónicas como texto: `100`, `73/2`, `340/3`. Se suman con Fraction, se escala una sola vez y se redondea al final. Nunca se lee el número visual para calcular. `aportes` conserva origen e itinerario de cada contribución. `estado: completo`, cobertura por ingesta y exclusiones permiten auditar la compra; un enlace ausente o una ingesta pendiente bloquea la generación completa.

Campos Airtable verificados: INGREDIENTES `tblJ7cjOhGBHLMWxv`; Nombre de visualización `fldr6piAwwi3gHG7x`; Descripción de compra `fldXb73P5SLE5syZe`, ambos singleLineText. Expediente por registro en `AIRTABLE-OCTUBRE-2026-10-14.json`. Nombre técnico, referencias y nutrición se conservan. El exportador consume los dos campos por nombre estable en REST; no hay fallback silencioso a etiquetas técnicas en una lista activada.

Stock fijo por IDs en `compra.STOCK`; exclusión del café únicamente por `recIa7zpasm2s0mgH` en el desayuno de oficina. Un desayuno distinto requiere política explícita. Condimentos sin cantidad proceden de las fichas de preparaciones realmente recorridas, sin ceros ni nutrientes. Solo se colapsan literales de checklist idénticos, nunca sumas numéricas por nombre.

Formatos comerciales se resuelven por referencia exacta o el mapa DERIVED de dos IDs verificados. Se prioriza peso escurrido y contenido individual documentado. Huevos: equivalencia culinaria verificada de quiche, 50 g comestibles por huevo. Sin formato, g/ml a decena superior; no se convierten densidades ni tamaños por texto. Para nuevos productos, revisar expresamente unidades, neto/escurrido y referencias; ampliar el mapa de sustantivos NO acredita por sí solo una equivalencia.

## Actualización autenticada

No existe sincronización automática de Airtable con GitHub. Esta primera fuente se obtuvo mediante herramientas autenticadas, con segunda lectura sin cambios de las seis tablas; el mismo adaptador permanente se probó reconstruyéndola desde su grafo. Para la siguiente extracción REST:

1. Crear rama desde main y revisar PR concurrentes. Obtener fuera del navegador el catálogo vigente `MiruRecetas/datos-productos/productos.json` y su SHA de blob. No subir el catálogo privado ni credenciales.
2. Si cambió la estructura del menú, actualizar primero su fuente v2 con el exportador existente dentro de su flujo autorizado. Compra no modifica ese menú ni sus macros. `make_source` compara comidas, componentes y ambos postres contra la revisión pública y falla si no corresponden.
3. Con AIRTABLE_TOKEN en entorno seguro, PRODUCTOS_JSON apuntando al catálogo local y PRODUCTOS_BLOB_SHA a su blob, ejecutar `python scripts/exportar_compra.py`. El token no se imprime ni se escribe. Hace dos lecturas y compara la proyección necesaria antes de guardar; si varía, cancela y se reintenta. Los campos leídos tienen los nombres y enlaces del esquema verificado.
4. Ejecutar `python scripts/generar.py`, `python -m unittest discover -s tests -v`, comprobaciones JS y QA navegador del CI. Repetir generación para comprobar idempotencia. Revisar fuente y diff; no editar HTML ni payloads.
5. Abrir PR, esperar Validar web y QA navegador, reconciliar main si avanza, fusionar y esperar Publicar recetas/Pages. La modificación de `datos/compra/**` dispara generación. El workflow guarda `menus/**` y revisiones de assets, y ejecuta verificación pública específica de compra.
6. Ejecutar `python scripts/verificar_compra_publica.py` sobre la revisión desplegada: compara bytes, MIME y HTTP anónimo de página, fuente, 20 payloads e imagen. La comprobación PWA existente conserva manifest/SW/iconos.
7. Registrar PR, SHA, CI, publicación y comprobaciones físicas reales en el expediente. Airtable posterior a la extracción no cambia la web hasta repetir este flujo.

Cambios en preparaciones internas también requieren nueva extracción. Las huellas impiden regenerar una compra con un menú o ingredientes/raciones de ficha diferentes; si solo cambió Airtable, el operador debe ejecutar la extracción. Ningún programa está escuchando Airtable de forma continua. Si falta información, corregir la fuente autorizada o desactivar el menú afectado en una PR; no inventar cantidades para pasar validaciones.

## Incorporar otro menú tras autorización

Verificar completitud, política de desayuno y campos de sus ingredientes. Revisar formatos contra fichas actuales y preparar su imagen única fiel en `imagenes/menus/MM-N.webp` (o formato legítimo aprobado existente, solo un archivo). Añadir la clave al registro de activos, exportar fuente con grafo actual, generar 20 selecciones y ejecutar la misma matriz. No reutilizar los snapshots 7/8 ni la imagen de octubre para otro menú. Hasta tener datos e imagen verificados, no fusionar la activación. El acceso contextual aparece únicamente para claves activas.

## Web/PWA, red y diseño

Misma web, scope, manifest, iconos y registro SW. La nueva familia pasa por decorate y versionado SHA de CSS/JS. El SW no cambia ni precachea payloads o recursos de Bring!. Las exportaciones se comprueban online antes de habilitar el enlace; yield, baseQuantity y requestedQuantity coinciden con N. Falta de red/archivo o cantidad inválida bloquea el enlace y ofrece reintento. No se afirma éxito de importación al hacer clic.

La página contiene las 20 vistas ya calculadas para el selector. Puede seguir consultándose si se pierde conexión con ella abierta. No se garantiza reapertura offline: las URLs con query de porciones y la imagen PNG >2 MiB no entran en las reglas/límites actuales del SW; no se amplió caché por este encargo. Importar a Bring! siempre exige red.

Ajustes visuales se concentran en compra.css y compra.html. La tabla muestra nombre, variante, necesidad real (máximo un decimal), compra y despensa. Cambiar personas en Bring! multiplica compras ya redondeadas; para recalcular mínimos, regresar a MiruRecetas e importar de nuevo.

## Recuperación

Si hay error de compra: corregir origen, reexportar, regenerar y publicar mediante PR. Para retirar temporalmente el acceso, quitar `10-1` de activos y regenerar; los enlaces ya guardados seguirán accesibles hasta retirar explícitamente sus salidas. Para retirar también la página y JSON, incluir su eliminación en esa PR. No borrar ingredientes, campos Airtable, recetas, fotos o experimentos. Los favoritos importados en Bring! mantienen la versión previa: hacer nueva importación para comprobar la corrección.

Para revertir toda integración, revertir la PR mediante otra PR y restaurar el generador y acceso a su versión anterior, manteniendo cambios simultáneos. El SW no ha cambiado: no es necesario borrar ni desregistrar la PWA. Si en un futuro se toca, aplicar docs/PWA.md. Nunca borrar almacenamiento/cachés ajenos ni forzar recargas de cocina.


## Ampliación Septiembre · Menú 4 · 15/10/2026

Nueva fuente `datos/compra/09-4.json`, página `menus/09-4/compra/` y veinte JSON de exportación. Imagen única nueva `imagenes/menus/09-4.webp` de 1024 × 1024 y menos de 350 KB, sin cambiar octubre ni fotografías de recetas. Contrato generado desde las seis tablas leídas actualmente; 35 filas por ID/unidad, 12 preparaciones y 41 artículos Bring! (33 compra, 8 despensa). La repetición semanal del marmitako, chili y salteado aporta todas sus cantidades. Las dos pechugas de pollo conservan IDs, características y cantidades independientes.

El exportador admite tanto el postre simple de los menús v2 previos como el envoltorio de componentes, sin reescribir menús ni nutrientes. Consume además `formato_unidades`: atún 6 × 60 g escurridos y aceitunas 3 × 50 g escurridos se compran por lata individual; las cantidades totales del pack no se confunden con una unidad. La referencia exacta de chipotles La Costeña usa sus 220 g netos porque la preparación incorpora el adobo; no aplica 121 g escurridos a esa receta. Alubias Cidacos: 400 g escurridos por frasco. No se inventa formato para el maíz genérico USDA.

Pimentón dulce `recI8AwaRp7BOa9GZ` se añade explícitamente a despensa. El pimentón literal sin cantidad no duplica ese artículo cuantificado. El laurel del marmitako carece de vínculo a INGREDIENTES: se conserva como checklist literal de despensa sin inventar ID, gramos ni nutrientes, con procedencia y sus dos hojas culinarias originales en la fuente. Se trata del criterio por preparación verificada `recdhYBKhV8omXHcm`; no migra cantidades de otras recetas. Agua, guindilla, ras el hanout, sal y vinagre sin cantidad también quedan como checklist de despensa.

Dieciocho ingredientes nuevos recibieron únicamente los campos de presentación existentes: expediente en AIRTABLE-SEPTIEMBRE4-2026-10-15.json. La nueva imagen y sus fuentes están en IMAGEN-SEPTIEMBRE4.json. La prueba física Android de esta nueva ruta permanece pendiente, separada de CI, HTTP y navegador.
