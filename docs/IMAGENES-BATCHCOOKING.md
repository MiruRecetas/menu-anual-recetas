# Fotografía principal y miniaturas de Batch cooking

Actualizado: 11 de octubre de 2026.

## Contrato único de imagen

Cada receta tiene **una sola fotografía principal**. La ficha completa, la miniatura del recetario y la miniatura de Batch cooking reutilizan el mismo archivo.

- Archivo nuevo: `imagenes/<slug>.webp`.
- Enlace: campo `imagen` en `datos/recetas/<slug>.json`, con el nombre simple `<slug>.webp`, sin prefijo de carpeta.
- Sube primero el binario y confirma su existencia; después actualiza exclusivamente `imagen`.
- **No generes ni publiques imágenes independientes en `imagenes/batchcooking/`.** Los archivos históricos pueden permanecer sin uso; no los borres por iniciativa propia.
- Respeta fotografías existentes válidas y sus nombres/formatos admitidos. No sobrescribas sin autorización expresa.

## Calidad y estilo

WebP binario auténtico, sRGB, 1:1 y 1024 × 1024 px como referencia; optimiza hacia menos de 350 KB sin degradación apreciable. Mantén calidad para la ficha completa: la web adapta automáticamente la imagen a sus miniaturas.

Fotografía editorial culinaria realista, luminosa y cálida; luz natural suave, fondos neutros crema, vajilla discreta, lino y madera clara. Mantén iluminación, color e identidad gastronómica coherentes en toda la colección. Consulta ingredientes y pasos reales; no añadas guarniciones inexistentes, texto, marcas de agua, logos, manos, personas o collages. Las imágenes generadas son representaciones editoriales, sin atribuirles procedencia fotográfica de la usuaria.

## Selección de Batch cooking

La galería recorre exclusivamente las preparaciones con etiqueta funcional exacta `batchcooking` en los JSON web, incluidas dependencias N0 cuando correspondan. Deduplica por slug y comprueba sus vínculos desde las COMIDAS del menú. Las etiquetas funcionales se gestionan por el chat de creación de recetas en el repositorio; no se gestionan desde Airtable ni las modifica el agente de imágenes.

La selección de la galería no limita la responsabilidad de fotografías principales: completa también las fichas publicadas sin imagen, respetando las existentes. La web determina composición y recorte de miniaturas; el agente de imágenes no modifica CSS, JavaScript, menús ni el generador.

## Publicación y verificación

Usa una subida que almacene bytes reales, nunca cadenas Base64 como archivos de texto WebP. Publica en la rama servida por GitHub Pages, con commits identificables y comprobación del despliegue. Verifica el archivo en GitHub, su resolución/formato, la URL pública, el campo `imagen` y la foto de la ficha. Comprueba también recetario y Batch cooking cuando la receta esté seleccionada: sus imágenes deben apuntar al mismo archivo principal. Comprueba escritorio y móvil cuando el entorno lo permita, declarando las verificaciones no disponibles.

No modifiques Airtable, ingredientes, cantidades, pasos, nutrición, categorías, slugs ni etiquetas. Continúa autónomamente y solicita intervención solo ante bloqueos reales o decisiones fuera del alcance autorizado.


## 11. Actualización vinculante · 11 de octubre de 2026

Esta actualización prevalece sobre ejemplos de primer encargo, fechas y reglas antiguas incompatibles. La responsabilidad cubre **todas las fichas publicadas**, no solo las seleccionadas en Batch cooking. Una única fotografía principal por receta en `imagenes/` sirve para ficha, recetario y Batch cooking. No crear archivos independientes en `imagenes/batchcooking/`.

### Referencias de la usuaria y correcciones

Las referencias visuales explícitas de la usuaria tienen prioridad para la forma, textura y presentación del plato, siempre que respeten su JSON. Úsalas como guía culinaria; no copies marcas, composición exacta, guarniciones ajenas, envases o textos de terceros. Registra la decisión en estos protocolos y en `docs/IMAGENES-BATCHCOOKING.md` para preservar la continuidad.

**Tortilla de bacalao:** la usuaria autorizó sustituir la fotografía el 11 de octubre de 2026. Debe ser alargada, ovalada o plegada, fina, de bordes irregulares, superficie suavemente dorada y textura jugosa. Evitar un disco alto, perfectamente circular y uniforme como una tortilla de patatas. Representar dos huevos, 100 g de bacalao desmigado, 30 g de cebolla, 25 g de puerro, AOVE y perejil según la ficha; sin patata, salsa de tomate ni guarniciones añadidas. Mantener luz natural suave, vajilla crema y estética editorial del resto de la colección. La sustitución de prueba de Carrilleras también fue autorizada; ninguna de estas autorizaciones permite reemplazar otras fotos válidas automáticamente.

### Revisión horaria y continuidad

La usuaria autorizó una vigilancia indefinida una vez por hora. Antes de afirmar que está programada o se ha ejecutado, consulta la automatización real: distingue regla guardada, activación, próxima ejecución confirmada e historial. No deduzcas una ejecución real de la RRULE. No crees duplicados; conserva la tarea existente y no la desactives por ausencia de pendientes. Si no hay cambios ni bloqueos nuevos, no notifiques.

Cada ejecución debe leer `main` y el documento técnico vigente, inventariar todas las recetas, validar archivos y enlaces, completar únicamente pendientes y verificar publicación. No depender de rutas scratch ni recuerdos de ejecuciones anteriores. Evitar solapamientos; leer de nuevo el archivo/SHA antes de escribir y conservar cambios ajenos. Si ya hay una imagen legítima publicada pero sin enlazar, enlazarla en vez de regenerarla.

### Cierre verificable

Separar «generada», «subida», «enlazada», «desplegada» y «visible». Validar WebP real sRGB, 1:1, referencia 1024 × 1024 y objetivo <350 KB; la calidad de ficha prevalece sobre compresión extrema. Comprobar todas las URLs públicas y uso compartido en ficha/recetario/Batch cooking cuando corresponda. La revisión HTTP o HTML no equivale a una inspección visual: declarar expresamente escritorio o móvil no comprobados. Entregar enlaces reales y pendientes concretos.
