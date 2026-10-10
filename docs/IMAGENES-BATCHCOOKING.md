# Imágenes de batch cooking · contrato de publicación

La galería de la portada recorre exclusivamente las preparaciones etiquetadas `batchcooking` en los JSON de `datos/recetas/`, incluidas dependencias N0. Cuenta las apariciones sin duplicar una preparación dentro de una COMIDA.

**Ruta fija por slug:** `imagenes/batchcooking/<slug>.webp`. No se requiere editar menús, generador ni HTML tras subir una imagen.

**Entrega:** fotografía 1:1, WebP RGB/sRGB, 1024×1024 px recomendado, peso optimizado < 350 KB, sin texto ni marca de agua. Un archivo por slug, por ejemplo:
- `imagenes/batchcooking/bacalao-a-la-vizcaina.webp`
- `imagenes/batchcooking/carrilleras-de-cerdo-al-vino.webp`

Si la foto específica no existe, la web usa la imagen existente de la receta cuando la hay; en caso contrario, muestra un recuadro neutro con icono hasta recibirla. Nunca sustituir las imágenes existentes en `imagenes/` sin permiso. Cada miniatura enlaza a `/recetas/<slug>/`.

La disposición es automática según el número de preparaciones identificadas: una centrada, 2 en dos columnas, 3 en tres columnas, 4 en dos columnas y 5 o más en tres columnas, también en móvil. El título de la preparación permanece bajo la foto.

**Importante:** el conector GitHub de archivos de texto no sirve para guardar bytes de imagen. Para subir WebP binario debe usarse un flujo que acepte subida binaria (por ejemplo ChatGPT Work con navegador de GitHub y permisos del repositorio), y verificar que el archivo sea un WebP real y no un texto Base64.

**Gobierno de etiquetas:** `batchcooking` y las demás etiquetas funcionales son metadatos exclusivos del JSON de la web (`datos/recetas/`), no campos que deban leerse ni corregirse directamente desde Airtable. El chat específico de creación de recetas se encarga de crearlas y sincronizar la receta entre Airtable y la web según sus protocolos, pero las etiquetas funcionales de la web se gestionan exclusivamente en el repositorio. No pedir cambios de etiquetas funcionales en Airtable.
