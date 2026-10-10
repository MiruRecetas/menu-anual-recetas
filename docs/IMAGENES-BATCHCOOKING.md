# Fotografía principal y miniaturas de Batch cooking

Actualizado: 10 de octubre de 2026.

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
