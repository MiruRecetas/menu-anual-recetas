# Expediente — Septiembre · Menú 3

> **Cierre físico comunicado · 16/10/2026:** la usuaria confirma «Sus importaciones en bring están correctas y funcionando según lo esperado» para septiembre 3 y 4. La importación general queda validada. No se especifican porciones, versión ni cada recorrido; el procedimiento propuesto abajo se conserva como referencia histórica, sin afirmar su ejecución detallada.

15/10/2026. Solicitud expresa «Septiembre menú 3». Base main `a2bc44b`, conservando el trabajo simultáneo de Pollo Madrás (#91/#93). Menú `recoroSa93XtdWN8C` calculado, contrastado con su fuente pública sin modificar recetas, menús, cantidades ni nutrición. Catálogo comercial blob `d5e7abcf219c30ad3e6f55cc855b0c89c59f3afd`.

Extracción autenticada de las seis tablas y segunda lectura: proyección completa de dependencias idéntica semánticamente. Durante la lectura aparecen nuevas comidas ajenas a este menú; no se incorporan ni se revierten. Se reutilizan dos campos existentes de presentación para diez ingredientes adicionales, comprobando nombre y referencia conservados. Expediente AIRTABLE-SEPTIEMBRE3-2026-10-15.json.

33 filas cuantificadas, 9 preparaciones recorridas (incluidos sofrito y tzatziki), 40 artículos Bring! (32 compra y 8 despensa). Albóndigas dos apariciones: 1000/3 g de ternera; salchichas dos: 1000/3 g; puré tres: 360 g de calabaza. Patata total 690 g y uvas 300 g. Arroz crudo y cocido conservan IDs y artículos separados. Nata 200 ml por envase, arroz cocido 125 g por vasito, huevo 50 g comestibles según criterio existente. Escalado racional antes de redondear; ningún dato comercial genérico inventado.

Imagen nueva propia `imagenes/menus/09-3.webp`, herramienta integrada image_gen y referencia solo estética de septiembre 4. WebP 1024 × 1024, 341.548 bytes. Prompt y huellas en IMAGEN-SEPTIEMBRE3.json. Ninguna imagen previa se sustituye.

Pruebas locales: 59 tests Python correctos, incluyendo repeticiones, bases internas, variantes de arroz, formatos individuales, selección previa, stock y reproducción del exportador. Se añade QA de móvil/tablet/escritorio. Generación reproducible y comprobación de diff antes de PR. CI y publicación verificadas en los enlaces siguientes.

## Procedimiento físico propuesto originalmente (ver cierre superior)

Importaciones NUEVAS de esta ruta a 1 y 3 porciones en Bring! Android, incluida entrada desde la PWA: portada y título; dos artículos Arroz independientes en JSON aunque Bring! los agrupe; vasitos, nata, huevos, despensa y vuelta a la selección. Usar una importación nueva, no favoritos antiguos. Las pruebas 7/8 históricas mantienen su resultado y procedimiento, pero no certifican físicamente esta nueva ruta. CI, HTTP y navegador no sustituyen esa comprobación.


## Publicación y verificaciones realizadas

- [PR #94](https://github.com/MiruRecetas/menu-anual-recetas/pull/94), código `437f18617b0c03ea0092caa4cde6d9d4e394844c`, fusionada en `bd64ce824c5027c76cc7f28b5236b35bcdda5857`.
- [Validar web](https://github.com/MiruRecetas/menu-anual-recetas/actions/runs/38650921804): success. [QA navegador](https://github.com/MiruRecetas/menu-anual-recetas/actions/runs/38650921784): success, con acceso/selector/retorno de septiembre 3 en 390/820/1440 px y regresiones web/PWA con service worker real.
- [Publicar recetas](https://github.com/MiruRecetas/menu-anual-recetas/actions/runs/38651152093): success. Paso compra: HTTP anónimo 200, MIME y bytes verificados en 69 archivos, incluidas las 60 selecciones e imágenes de los tres menús activos. Verificación pública del índice y PWA también correcta.
- [Pages](https://github.com/MiruRecetas/menu-anual-recetas/actions/runs/38651151650): success.
- Navegador público: entrada contextual desde mes 9/menú 3; imagen cargada y decodificada de 1024 px; tabla de 33 filas; selector 1 → 3, JSON 3.json y baseQuantity/requestedQuantity 3. Arroz crudo 150 g y cocido 3 vasitos independientes; nata 540 ml → 3 envases; huevos 700 g → 14 huevos. Regreso mantiene mes 9 y menú 3; nueva entrada abre compra con una porción. Diseño público revisado visualmente.
- URL operativa verificada: https://mirurecetas.github.io/menu-anual-recetas/menus/09-3/compra/?porciones=1 .
- Se conserva además el cambio concurrente #95 de berenjenas a la miel y sus páginas generadas, entrado mientras pasaba CI. Esa receta no es dependencia de ninguna compra activa; el workflow sobre main combinado termina correctamente. Este trabajo no modifica la receta ni revierte sus cantidades/nutrición.

Estas pruebas son automáticas, de publicación HTTP y de navegador. No acreditan una importación física nueva ni una instalación nueva en Bring! Android. El procedimiento pendiente descrito arriba permanece abierto; los resultados físicos históricos 7/8 se conservan.
