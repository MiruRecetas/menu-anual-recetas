# Expediente — Septiembre · Menú 3

15/10/2026. Solicitud expresa «Septiembre menú 3». Base main `a2bc44b`, conservando el trabajo simultáneo de Pollo Madrás (#91/#93). Menú `recoroSa93XtdWN8C` calculado, contrastado con su fuente pública sin modificar recetas, menús, cantidades ni nutrición. Catálogo comercial blob `d5e7abcf219c30ad3e6f55cc855b0c89c59f3afd`.

Extracción autenticada de las seis tablas y segunda lectura: proyección completa de dependencias idéntica semánticamente. Durante la lectura aparecen nuevas comidas ajenas a este menú; no se incorporan ni se revierten. Se reutilizan dos campos existentes de presentación para diez ingredientes adicionales, comprobando nombre y referencia conservados. Expediente AIRTABLE-SEPTIEMBRE3-2026-10-15.json.

33 filas cuantificadas, 9 preparaciones recorridas (incluidos sofrito y tzatziki), 40 artículos Bring! (32 compra y 8 despensa). Albóndigas dos apariciones: 1000/3 g de ternera; salchichas dos: 1000/3 g; puré tres: 360 g de calabaza. Patata total 690 g y uvas 300 g. Arroz crudo y cocido conservan IDs y artículos separados. Nata 200 ml por envase, arroz cocido 125 g por vasito, huevo 50 g comestibles según criterio existente. Escalado racional antes de redondear; ningún dato comercial genérico inventado.

Imagen nueva propia `imagenes/menus/09-3.webp`, herramienta integrada image_gen y referencia solo estética de septiembre 4. WebP 1024 × 1024, 341.548 bytes. Prompt y huellas en IMAGEN-SEPTIEMBRE3.json. Ninguna imagen previa se sustituye.

Pruebas locales: 59 tests Python correctos, incluyendo repeticiones, bases internas, variantes de arroz, formatos individuales, selección previa, stock y reproducción del exportador. Se añade QA de móvil/tablet/escritorio. Generación reproducible y comprobación de diff antes de PR. La CI y publicación se registran tras completarse.

## Verificación física pendiente

Importaciones NUEVAS de esta ruta a 1 y 3 porciones en Bring! Android, incluida entrada desde la PWA: portada y título; dos artículos Arroz independientes en JSON aunque Bring! los agrupe; vasitos, nata, huevos, despensa y vuelta a la selección. Usar una importación nueva, no favoritos antiguos. Las pruebas 7/8 históricas mantienen su resultado y procedimiento, pero no certifican físicamente esta nueva ruta. CI, HTTP y navegador no sustituyen esa comprobación.
