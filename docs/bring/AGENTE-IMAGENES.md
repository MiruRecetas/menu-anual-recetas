# MiruRecetas — Agente de imágenes de páginas de lista de compra

Versión 2.0 · 16/10/2026. Traspaso específico y autónomo. Repositorio: https://github.com/MiruRecetas/menu-anual-recetas . Leer main actual y los contratos vigentes; un SHA histórico nunca autoriza restaurar archivos.

## Misión y estado

Crear y publicar UNA portada por menú real publicado que indique la usuaria, para la página de lista de compra y su receta importada en Bring!. El menú no es una nueva receta ni preparación. La integración permanente existe y usa `imagenes/menus/MM-N.webp`; octubre 1 conserva su PNG aprobado original. A 16/10/2026 tienen portada octubre 1 y septiembre 1–4. Inventariar siempre main antes de generar.

La usuaria confirma que las importaciones de septiembre 3 y 4 funcionan según lo esperado; no volver a presentarlas como prueba física pendiente. Las pruebas históricas 7/8 conservan resultados/procedimiento. La visibilidad de una imagen en Bring! no puede acreditarse por HTTP o navegador; para menús nuevos registrar la confirmación real cuando llegue. No inventar porciones/dispositivos que ella no haya especificado.

## Alcance

La selección de menú autoriza leer fuentes, generar la imagen ausente, optimizarla, publicarla mediante rama/PR/CI/fusión y verificar HTTP y navegador. No pedir permiso otra vez para esos pasos. No generar otros menús, sustituir aprobadas por estética, crear automatizaciones o mandar mensajes a otros chats. Bloqueos indispensables se comunican con el trabajo ya realizado.

No modificar Airtable, ingredientes, cantidades, nutrientes, recetas, menús, etiquetas, fotografías de recetas, PWA, diseño o cálculo. No crear `imagenes/batchcooking/` ni imágenes por número de porciones. Las fotografías de recetas existentes siguen siendo únicas para ficha, recetario y Batch cooking.

## Lecturas y fuentes

Leer `docs/bring/IMAGENES-MENUS.md`, `AGENTE-INTEGRACION.md`, `OPERACION.md`, `MAESTRO.md`, identidad visual y protocolos vigentes de imágenes. Revisar PR abiertas y SHA de main. Usar un worktree/rama propia para respetar cambios simultáneos.

Para cada MM-N, leer `datos/menus/MM-N.json`, comidas/cenas, guarniciones y ambos postres; recorrer recetas/subpreparaciones y sus ingredientes Y elaboración. El grafo de compra ayuda, pero no sustituye los pasos. Leer fotos actuales como referencia culinaria cuando aclaren forma/apariencia. Menús incompletos no se representan como completos; no rellenar comidas inventadas.

Preparar inventario de platos distintos y sus fuentes/huellas. Mostrar todas o casi todas las comidas/cenas distintas; repetir una elaboración una vez es suficiente. Bases internas se ven dentro del plato, no como un plato separado. Café de oficina y cena libre no se inventan. Incluir postres reales si caben, sin quitar legibilidad a las comidas.

## Dirección visual vinculante

Cenital perpendicular, cuadrada 1:1. Una superficie continua de piedra o mesa crema clara; cerámica crema y recipientes transparentes de batch cooking. Luz natural suave y cálida, sombras delicadas, colores fieles, textura apetecible y realismo editorial. Distribución doméstica ordenada, margen y separación reconocible entre platos. Sin collage, mosaico, separadores, manos/personas, texto, logos, marcas de agua o envases comerciales.

Referencias de estilo: `imagenes/menus/10-1.png` (aprobada original), `09-3.webp`, `09-4.webp`; las nuevas `09-1.webp` y `09-2.webp` corresponden a sus platos reales. Usar SOLO estilo de otra portada: nunca copiar sus alimentos, fruta, hierbas, semillas o guarniciones si no pertenecen al nuevo menú.

Ejemplos de fidelidad: gambones del menú 1 se hornean enteros con cabeza y cáscara; pollo al limón en tiras; dos pastas distintas (ensalada fría de atún y boloñesa); berenjena frita en rodajas enharinadas, sin rebozado grueso. En menú 2 la dorada va entera, el salmón cocinado lleva ralladura pero se retiran rodajas de naranja, el bocadillo lleva rúcula y solomillo, y el pa amb tomàquet con jamón es otra cena que debe aparecer. Tres galletas y leche son el postre actual del miércoles. Releer fuentes si cambian; estos ejemplos no fijan menús eternamente.

## Archivo y generación

Una única ruta `imagenes/menus/MM-N.webp`, WebP binario auténtico sRGB, 1024 × 1024. Objetivo <350 KB con calidad visual; no extremar compresión. No guardar Base64 textual como WebP. No crear sufijos final/v2 o duplicados por porciones en producción. Para una sustitución expresamente autorizada se conserva la ruta canónica y se actualiza trazabilidad.

Excepción: `10-1.png`, 1254 × 1254, SHA-256 `c7952019f9e9b24a3c1bba2f376e5b354a91c518464b2e85d6276a48252c62c7`. No regenerar, convertir, recortar o sustituir. Archivo experimental de prueba 8 también se conserva.

Usar la habilidad/herramienta de imágenes disponible, leer sus instrucciones e inspeccionar referencias locales antes de usarlas. Etiquetar el papel de cada imagen en el prompt: estilo, objetivo de edición o referencia culinaria. No usar dibujos SVG o montajes de código como sustituto de la generación solicitada. Tras generar, revisar visualmente cada plato; si falta uno relevante, editar de forma dirigida y volver a revisar. La imagen es una representación editorial generada, no fotografía tomada por la usuaria. La conversión técnica de resolución/formato se hace después, sin redibujar la escena mediante código.

Guardar dentro del repositorio; el archivo de generación original puede quedar fuera, pero nunca dejar el asset de producción solo en una carpeta temporal. Registrar `docs/bring/IMAGEN-SEPTIEMBREN.json` o expediente equivalente con menú/ID, fecha, main, fuente SHA, prompt final y revisiones, herramienta, ruta, formato, dimensiones, bytes y SHA-256. La nomenclatura del expediente puede generalizarse; mantener referencias existentes.

## Publicación y coordinación

1. Si aún no hay fuente de compra activa: publicar binario y expediente, sin activar la lista ni modificar menús. Entregar al integrador ruta, URL, SHA y fuentes.
2. Si la imagen canónica ya existe y es válida/fiel: reutilizar y entregar su verificación. No regenerar por iniciativa propia.
3. Si hay sustitución autorizada de una imagen ya enlazada: su hash en `datos/compra/MM-N.json` se valida estrictamente. Coordinar con el integrador una actualización controlada de `fuentes.imagen_sha256`, regeneración de página/payloads y comprobación de fuentes. No saltarse validaciones ni actualizar cantidades, catálogo o huellas culinarias para hacer pasar CI. La extensión puede cambiar solo dentro del alcance autorizado y sin crear dos imágenes canónicas.
4. PR con fuente y revisión visual, esperar Validar web y QA navegador, fusionar dentro de autorización, y esperar Pages/publicación. Reconciliar main y conservar cambios simultáneos.
5. HTTP anónimo 200, MIME real image/webp (o PNG aprobado), bytes/hash idénticos, decodificación y dimensiones correctas. Abrir imagen/página pública en navegador y revisar aspecto; distinguir comprobación visual de CI.
6. Si ya está enlazada, revisar misma imageUrl absoluta en los veinte payloads y en página, sin variantes por porciones. La comprobación completa de compra corresponde al integrador y a `scripts/verificar_compra_publica.py`.

No afirmar «publicada» solo por haber generado/subido. Entregar estados: generada, PR, desplegada, HTTP verificado, visible en navegador y validada en Bring! si existe confirmación física. Anotar lo realmente pendiente.

## Recuperación y mantenimiento

Cambios de menú que alteren platos pueden invalidar portada; señalar la discrepancia y actualizar dentro del encargo. Cambios solo de personas no requieren otra imagen. No automatizar reemplazos de aprobadas ni reutilizar la automatización de fotos de recetas. Para recuperar, revertir únicamente el binario/expediente propio y su hash coordinado mediante PR, sin tocar fotos/menús ajenos ni borrar cachés o favoritos. Las importaciones antiguas de Bring! pueden conservar portadas anteriores; comprobar con importación nueva.

## Prompt breve de apertura

Actúa como responsable de imágenes de listas de compra de MiruRecetas. Lee íntegramente el documento adjunto AGENTE-IMAGENES v2.0 y docs/bring vigentes en main. Para el menú publicado que indique, verifica fuentes y portadas existentes; genera solo la ausente, cenital cuadrada de sus platos reales sobre superficie crema, fiel a recetas y guarniciones. Publica WebP 1024 en imagenes/menus/MM-N.webp mediante rama, PR, CI, fusión, HTTP y revisión visual. Conserva fotos aprobadas, recetas, Airtable, nutrientes, diseño y PWA; coordina el hash de imagen con la fuente de compra si ya está activa. Entrega URL, archivo, fuentes, PR y verificaciones; separa visibilidad técnica de confirmación real en Bring!. Menú: [MES · NÚMERO].
