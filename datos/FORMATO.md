# Formato de cada receta (JSON)

Crear un fichero `datos/recetas/<slug>.json`. No añadir recetas ficticias al catálogo.

```json
{
  "slug": "identificador-de-la-receta",
  "nombre": "Nombre de la receta",
  "descripcion": "Breve descripción opcional",
  "raciones": 4,
  "imagen": "identificador-de-la-receta.jpg",
  "preparacion_min": 15,
  "coccion_min": 35,
  "ingredientes": [
    "500 g de ingrediente",
    "10 g de aceite de oliva",
    "2 g de sal"
  ],
  "pasos": [
    "Primer paso de la receta.",
    "Segundo paso de la receta."
  ],
  "notas": "Consejos opcionales para conservar o recalentar."
}
```

**El ejemplo es solo documentación, no es una receta real.**

Obligatorios: `slug`, `nombre`, `raciones`, `ingredientes` y `pasos`. `imagen` es opcional al redactar, pero recomendable para importar la foto a Bring!. El archivo de imagen debe existir en `imagenes/`.

`preparacion_min` y `coccion_min` son opcionales; si se incluyen, deben ser enteros no negativos y se publican como tiempos Schema.org.

Los ingredientes son cadenas ya preparadas para Bring! con **peso o volumen por la cantidad total de raciones**; el generador no calcula escalados ni valores nutricionales. No separar ingredientes de despensa en otro bloque, ni omitirlos. El marcado de opcionales se puede ajustar después de importar la receta a Bring!.

Cuando Airtable sea la fuente principal, la exportación deberá componer/expandir preparaciones anidadas y entregar aquí la lista final de compra sin duplicar cantidades. No se debe trasladar a esta web una receta provisional sin revisión.
