> **Vigencia reconciliada · 21/10/2026.** [Estado actual, aclaraciones y pendientes](../ESTADO-RECONCILIADO-2026-10-21.md) prevalece sobre propuestas históricas incompatibles de esta guía. Se conserva su contenido operativo y su trazabilidad. No autoriza cambios funcionales durante la sincronización documental.

# Bring! — Imágenes de menús

Versión 2.0 · 16/10/2026. La carpeta canónica y su integración están implementadas. Procedimiento completo y prompt autónomo en AGENTE-IMAGENES.md. Lectura conjunta con ESTADO.md, MAESTRO.md y la identidad visual vigente.

Una sola portada por menú publicado autorizado en imagenes/menus/MM-N.webp. Página y los veinte JSON reutilizan la misma imageUrl absoluta. WebP binario sRGB, 1024 cuadrado, objetivo <350 KB con calidad. Octubre 1 conserva el PNG aprobado original 1254 cuadrado y su SHA documentado: no convertir/regenerar. Mantener fotos de recetas y experimentos históricos.

Cenital sobre una superficie crema continua, cerámica clara y recipientes transparentes, luz natural cálida, editorial y realista. Platos reales de comidas/cenas y guarniciones; repetidos pueden aparecer una vez; postres reales si caben. No copiar alimentos de la referencia estética, inventar guarniciones, collage, texto, manos, personas, logos o marcas. Leer ingredientes y pasos, no solo nombres ni lista de compra. Bases internas se ven dentro del plato. La imagen es generada, no fotografía de la usuaria.

Inventariar antes; reutilizar aprobadas fieles. Si falta, generar con herramienta de imágenes e inspeccionar; editar de forma dirigida si falta un plato relevante. No sustituir por gusto ni automatizar nuevas imágenes sin encargo. Septiembre 2 requirió añadir el pa amb tomàquet omitido en la primera composición; la escena final incluye esa cena independiente.

Publicar binario real y expediente de fuente/huellas/prompt mediante rama/PR/CI/fusión. Si aún no existe compra, entregar imagen al integrador sin activar menús. Si se sustituye una imagen activa con autorización, coordinar su hash en fuente y regeneración, sin alterar cálculos ni huellas culinarias. No crear un segundo archivo canónico.

Verificar Pages, HTTP anónimo, MIME, bytes/hash, dimensiones y decodificación; abrir públicamente y revisar. Para enlazadas, imageUrl de todos los payloads coincide. Separar generada/subida/desplegada/visible/confirmada en Bring!. La usuaria confirma importaciones correctas de septiembre 3/4 el 16/10/2026; septiembre 1/2 siguen pendientes de esa comprobación física.

Expedientes vigentes: IMAGEN-SEPTIEMBRE3.json, IMAGEN-SEPTIEMBRE4.json, IMAGENES-SEPTIEMBRE12.json. No crear imágenes en imagenes/batchcooking ni editar campos imagen de recetas desde este rol.

## Regla de diseño — portadas en móvil vertical · 16/10/2026

En las listas de compra, la portada debe quedar centrada horizontalmente en móvil y PWA en vertical dentro de la disposición apilada (ancho de viewport hasta 540 px). Se mantiene su tamaño y posición anterior al texto. En horizontal, tablet y escritorio se conserva la disposición existente, con portada a la derecha cuando hay dos columnas. Aplicar la regla en `assets/compra.css` para todos los menús actuales y futuros; no editar ni regenerar las fotografías para corregir alineación.

Verificar el centrado por geometría en móvil vertical y la columna derecha en horizontal/escritorio mediante `tests/compra_qa.cjs`. La misma página y CSS sirven a web y PWA; una prueba automatizada no acredita una prueba física en el dispositivo.
