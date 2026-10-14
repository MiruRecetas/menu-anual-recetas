# MiruRecetas — Guía de imágenes de menús para Bring!

Versión 1.0 · 14/10/2026. Complementa el Maestro Bring! v2.0 y los protocolos de imágenes de recetas. Este documento prepara el encargo; no acredita generación ni publicación de las futuras imágenes.

## Misión y diferencia respecto de fotos de recetas

Generar UNA imagen principal cuadrada por menú real de MiruRecetas, reutilizada por su página de lista de compra y por `imageUrl` de la receta/menú importada en Bring!. El menú no se convierte en una nueva PREPARACIÓN ni en una receta canónica del recetario.

Las fotos de recetas existentes continúan en `imagenes/<slug>.webp` y se reutilizan en ficha, recetario y Batch cooking. No modificarlas, no cambiar el campo imagen de recetas y no crear imágenes en `imagenes/batchcooking/`. La imagen de menú es un uso distinto y tiene carpeta propia.

## Ruta canónica para la implementación

- Repositorio: `MiruRecetas/menu-anual-recetas`.
- Archivo: `imagenes/menus/MM-N.webp`, con mes numérico de dos cifras y número de menú real. Ejemplo: `imagenes/menus/10-1.webp`.
- URL: `https://mirurecetas.github.io/menu-anual-recetas/imagenes/menus/10-1.webp` para ese archivo, SOLO cuando publicado y verificado.
- No crear `octubre-final`, sufijos -2 ni copias por número de personas. Una imagen por menú; la cantidad seleccionada no cambia la composición editorial.
- Esta convención es nueva; inspeccionar main y coordinar cualquier ruta ya implementada antes de crear una segunda. No introducir un campo imagen en datos/menus sin coordinación de contrato. La implementación puede resolver la ruta determinista por MM-N y verificar su existencia sin cambiar el JSON culinario.

## Fuentes y selección

Leer main, `datos/menus/MM-N.json`, todos sus componentes reales y los JSON de recetas enlazadas, incluyendo subpreparaciones. El grafo de ingredientes de compra ayuda a verificar alimentos, pero no sustituye pasos, guarniciones y presentación del plato. Releer fuentes actuales: el snapshot de un experimento no acredita el menú de hoy.

Generar solo menús realmente registrados/publicados y dentro del encargo. No rellenar automáticamente las cuarenta posiciones septiembre–junio con platos inventados. Menú incompleto: identificar lo pendiente y no representarlo como completo; no inventar comidas para llenar la imagen. Las recetas repetidas pueden representarse una vez o en recipientes proporcionados, manteniendo reconocibles todas las comidas y cenas distintas. Desayuno de oficina y viernes cena libre no son platos que haya que inventar. Los postres reales pueden incluirse si caben sin quitar protagonismo a comidas/cenas.

Antes de generar, elaborar internamente una lista de platos y guarniciones, fuentes/SHA y qué aparecerá. No duplicar preparaciones internas como si fueran comidas aparte: el sofrito debe verse dentro de su elaboración, no como plato independiente obligatorio.

## Estilo aprobado

Referencia visual aportada por la usuaria y probada en Bring!: PNG cenital de menú de octubre, publicado en `experimentos/bring/prueba-8-10-1/menu-octubre-1.png`. Imagen de prueba original: 1254 × 1254, SHA-256 `c7952019f9e9b24a3c1bba2f376e5b354a91c518464b2e85d6276a48252c62c7`.

- Cámara cenital, perpendicular a la superficie; relación 1:1.
- Una escena continua sobre encimera o mesa clara crema/piedra suave; platos y recipientes distribuidos con orden doméstico y suficiente margen. No mosaico de fotografías ni collage con separadores.
- Platos cocinados y recipientes transparentes de batch cooking, vajilla cerámica crema, composición cálida, apetecible y editorial.
- Luz natural suave, colores fieles, sombras delicadas, fondos discretos, estilo coherente con MiruRecetas.
- Mostrar todos o casi todos los platos reales del menú, mínimo comidas y cenas distintas, según lo permita la legibilidad; no sustituir por bodegón de ingredientes en este encargo.
- Sin personas/manos, texto, logos, marcas de agua, envases con marcas, interfaz Bring! ni alimentos de decoración ajenos al menú.

La imagen aportada es REFERENCIA DE ESTILO y ensayo técnico. No copiar automáticamente sus frutas, guarniciones, hierbas, semillas o proporciones si no figuran en el menú real. El bowl, pescado, carrilleras, quiche, wraps, canelones, tostas y wok deben ajustarse a sus fichas vigentes; el aspecto de una patata no permite reemplazar un boniato registrado. No asumir que el éxito de la importación confirma fidelidad culinaria de aquella imagen.

## Formato y publicación

Referencia de salida: WebP auténtico, sRGB, 1024 × 1024, 1:1. Objetivo <350 KB sin degradación apreciable; calidad y legibilidad prevalecen sobre compresión extrema. Respetar formatos legítimos existentes si hay una imagen canónica ya aprobada: no convertirla o sustituirla por iniciativa propia. El PNG de prueba 8 no debe editarse ni moverse para este encargo.

Usar la herramienta de generación/edición de imágenes disponible y sus instrucciones. Revisar visualmente ingredientes, formas, número razonable de platos, coherencia y ausencia de artefactos. La representación es generada, no fotografía tomada por la usuaria.

Publicar binarios reales mediante rama y PR, revisar cambios simultáneos, CI y Pages. Comprobar MIME, dimensiones, decodificación, hash de origen frente a remoto y URL anónima. Una cadena Base64 como texto dentro de .webp no es una imagen. Verificar visualmente la imagen abierta en navegador cuando sea posible y declarar qué no se verificó.

Si la implementación de compra aún no existe, publicar solo el archivo y entregar MM-N, ruta, URL y fuentes al responsable; no tocar el generador, PWA, recetas o menús para enlazarlo por cuenta propia. Si existe, seguir exactamente el contrato de enlace vigente y solo las modificaciones autorizadas. El campo Bring! es `imageUrl`, no `image` de Schema.org.

## Existencias, continuidad y cierre

Inventariar `imagenes/menus/` antes de generar. Reutilizar imágenes válidas y fieles; generar ausentes. Si cambió la composición de un menú y la imagen quedó obsoleta, documentar la discrepancia y tramitar la actualización dentro del alcance recibido. No sustituir automáticamente una imagen aprobada por mero cambio de estilo.

No crear o modificar una automatización de imágenes de menú sin encargo; no reutilizar el horario del agente de recetas. Mantener responsabilidades separadas.

Entregar por menú: MM-N y ID Airtable si disponible, fuente/SHA del menú y recetas, ruta, dimensiones/formato/tamaño, hash, PR, estado de Pages, HTTP y comprobación visual. Separar generada, subida, desplegada, visible y validada dentro de Bring!. La imagen en Bring! requiere prueba física, aunque imageUrl y HTTP sean correctos.

## Prompt breve de apertura

Actúa como responsable de imágenes de menús de MiruRecetas. Lee esta guía y el Maestro Bring! v2.0; contrástalos con main. Genera una imagen cuadrada 1:1 por menú real publicado, cenital de sus platos sobre una superficie crema, fiel a recetas y guarniciones y al estilo aportado. Guarda una única imagen en imagenes/menus/MM-N.webp mediante rama, PR, CI y verificación pública. Reutiliza imágenes válidas; no inventes menús, sobrescribas fotos aprobadas ni cambies Airtable, recetas, nutrición, web/PWA o el exportador. Entrega rutas y URLs verificadas para enlazarlas desde la compra. Continúa con el encargo concreto de menús que indique la usuaria.
