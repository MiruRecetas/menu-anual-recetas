# Expediente — Septiembre · Menú 4

> **Cierre físico comunicado · 16/10/2026:** la usuaria confirma «Sus importaciones en bring están correctas y funcionando según lo esperado» para septiembre 3 y 4. La importación general queda validada. No se especifican porciones, versión ni cada recorrido; el procedimiento propuesto abajo se conserva como referencia histórica, sin afirmar su ejecución detallada.

15/10/2026. Solicitud expresa de Lucía: «Septiembre menú 4». Ampliación de la integración permanente existente; octubre se conserva y no se activan otros menús.

Base: main `7be454c`, sin PR abiertas al iniciar. Menú `recavOScUQHdfVwro`, completo, leído en Airtable y contrastado con `datos/menus/09-4.json`. Fuente comercial actual: blob `008a62690aafffc40711a347eb9d95b180e51ceb` de productos.json.

35 ingredientes agregados, 12 preparaciones, 41 artículos Bring! (33 compra y 8 despensa). Repeticiones completas: bonito 300 g por los dos marmitakos; ternera 200 g por dos usos del chili; pechuga cruda 300 g por fajitas y cuscús. Pechuga cruda y pechuga loncheada mantienen dos registros aunque compartan nombre visible.

Airtable: reutilizados los dos campos existentes de presentación, poblados para 18 ingredientes adicionales. No se escribieron nombres técnicos, cantidades, referencias, nutrientes, fórmulas ni enlaces. Relectura de los cambios y segunda extracción de seis tablas: fuente completa semánticamente idéntica. Expediente AIRTABLE-SEPTIEMBRE4-2026-10-15.json.

Formatos verificados: lata individual de atún 60 g escurridos, aceitunas 50 g escurridos, alubias 400 g escurridos/frasco; chipotles con adobo 220 g netos/envase. Sin convertir el maíz USDA genérico en producto comercial. Los postres simples v2 previos se aceptan sin migrar datos culinarios. Laurel del marmitako incluido como checklist sin ID inventado, conservando procedencia y cantidad culinaria original en la fuente.

Imagen nueva generada con herramienta integrada, referencia exclusivamente estética de octubre, platos de las fichas actuales y postres reales. `imagenes/menus/09-4.webp`, 1024 × 1024, 334.994 bytes; detalle, hash y fuentes en IMAGEN-SEPTIEMBRE4.json. No se sustituyen fotos existentes ni la imagen aprobada de octubre.

Pruebas locales: 55 tests Python correctos; generación repetida; sintaxis JavaScript y diff check. Añadidos tests de repetición, postres simples, formatos individuales, adobo y variantes; QA navegador para septiembre en móvil/tablet/escritorio.

## Publicación y verificaciones realizadas

- [PR #90](https://github.com/MiruRecetas/menu-anual-recetas/pull/90), fusionada en `fe9424ad37a292d1408630d6b7375827f1b75fe7`; código `d755e887a7878ab68ea3e7758918885b14bcec27`.
- [Validar web](https://github.com/MiruRecetas/menu-anual-recetas/actions/runs/38648824907): success. [QA navegador](https://github.com/MiruRecetas/menu-anual-recetas/actions/runs/38648824883): success, incluidos septiembre en 390/820/1440 px y regresión web/PWA existente.
- [Publicar recetas](https://github.com/MiruRecetas/menu-anual-recetas/actions/runs/38649040053): success. Su paso de compra confirma HTTP anónimo, MIME y bytes de 46 archivos: páginas/fuentes de ambos menús, cuarenta selecciones e imágenes. Los pasos de índice y PWA también finalizaron correctamente.
- Navegador sobre la página pública: imagen WebP decodificada con naturalWidth 1024, selector 1 → 3, JSON seleccionado y baseQuantity/requestedQuantity 3; tabla de 35 filas y latas individuales coherentes. Regreso al menú selecciona mes 9 y menú 4; el acceso contextual vuelve a la lista. Captura pública revisada visualmente.
- URL operativa verificada: https://mirurecetas.github.io/menu-anual-recetas/menus/09-4/compra/?porciones=1 .
- El cierre documental toma main `ff2a4b3`, conservando la incorporación simultánea de Pollo Madrás (#91) y sus páginas generadas. La receta nueva no es dependencia de este menú y no se modifica ni se revierte.

Son verificaciones técnicas y de navegador; no se ha simulado una importación física en Bring! Android.

## Procedimiento físico propuesto originalmente (ver cierre superior)

Importación nueva desde `menus/09-4/compra/` a 1 y 3 porciones en Bring! Android, incluida entrada por la PWA: imagen, título, latas, variantes de pollo, despensa y vuelta con porciones conservadas. No usar favoritos viejos. Las pruebas 7/8 históricas permanecen validadas pero no prueban esta ruta. No se afirma instalación o prueba física nueva por CI/HTTP.
