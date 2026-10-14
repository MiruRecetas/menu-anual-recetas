# Expediente — Septiembre · Menú 4

15/10/2026. Solicitud expresa de Lucía: «Septiembre menú 4». Ampliación de la integración permanente existente; octubre se conserva y no se activan otros menús.

Base: main `7be454c`, sin PR abiertas al iniciar. Menú `recavOScUQHdfVwro`, completo, leído en Airtable y contrastado con `datos/menus/09-4.json`. Fuente comercial actual: blob `008a62690aafffc40711a347eb9d95b180e51ceb` de productos.json.

35 ingredientes agregados, 12 preparaciones, 41 artículos Bring! (33 compra y 8 despensa). Repeticiones completas: bonito 300 g por los dos marmitakos; ternera 200 g por dos usos del chili; pechuga cruda 300 g por fajitas y cuscús. Pechuga cruda y pechuga loncheada mantienen dos registros aunque compartan nombre visible.

Airtable: reutilizados los dos campos existentes de presentación, poblados para 18 ingredientes adicionales. No se escribieron nombres técnicos, cantidades, referencias, nutrientes, fórmulas ni enlaces. Relectura de los cambios y segunda extracción de seis tablas: fuente completa semánticamente idéntica. Expediente AIRTABLE-SEPTIEMBRE4-2026-10-15.json.

Formatos verificados: lata individual de atún 60 g escurridos, aceitunas 50 g escurridos, alubias 400 g escurridos/frasco; chipotles con adobo 220 g netos/envase. Sin convertir el maíz USDA genérico en producto comercial. Los postres simples v2 previos se aceptan sin migrar datos culinarios. Laurel del marmitako incluido como checklist sin ID inventado, conservando procedencia y cantidad culinaria original en la fuente.

Imagen nueva generada con herramienta integrada, referencia exclusivamente estética de octubre, platos de las fichas actuales y postres reales. `imagenes/menus/09-4.webp`, 1024 × 1024, 334.994 bytes; detalle, hash y fuentes en IMAGEN-SEPTIEMBRE4.json. No se sustituyen fotos existentes ni la imagen aprobada de octubre.

Pruebas locales: 55 tests Python correctos; generación repetida; sintaxis JavaScript y diff check. Añadidos tests de repetición, postres simples, formatos individuales, adobo y variantes; QA navegador para septiembre en móvil/tablet/escritorio.

Estado inicial del expediente: preparado para PR, CI, Pages y verificación pública. Completar el cierre con resultados efectivos; este párrafo no acredita una publicación anterior a su ejecución.

## Pendiente físico

Importación nueva desde `menus/09-4/compra/` a 1 y 3 porciones en Bring! Android, incluida entrada por la PWA: imagen, título, latas, variantes de pollo, despensa y vuelta con porciones conservadas. No usar favoritos viejos. Las pruebas 7/8 históricas permanecen validadas pero no prueban esta ruta. No se afirma instalación o prueba física nueva por CI/HTTP.
