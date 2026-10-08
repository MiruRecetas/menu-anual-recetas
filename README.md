# MiruRecetas · Menú anual

Recetario estático para consultar recetas y **compartir una receta individual con Bring!** desde el navegador Android. Publicado mediante GitHub Pages en https://mirurecetas.github.io/menu-anual-recetas/.

## Organización

- `datos/recetas/<slug>.json`: fuente estructurada de cada receta (a futuro, exportada desde Airtable).
- `imagenes/<archivo>.jpg`: imagen real alojada en este repositorio, servida directamente por GitHub Pages; también admite PNG y WebP.
- `plantillas/receta.html`: plantilla HTML de presentación y marcado de receta.
- `assets/estilo.css`: diseño compartido, adaptable a móvil e impresión.
- `scripts/generar.py`: generador sin librerías externas.
- `recetas/<slug>/index.html`: página estática generada; nunca editarla a mano.
- `index.html`: portada/catálogo generado.
- `.github/workflows/publicar-recetas.yml`: regenera las páginas al añadir/modificar datos o plantillas.

## Añadir una receta

1. Crear `datos/recetas/<slug>.json` siguiendo la referencia `datos/FORMATO.md`. El `slug` debe coincidir con el nombre del archivo.
2. Subir la fotografía definitiva a `imagenes/` y escribir **solo el nombre del archivo** en el campo `imagen`. Se valida que exista.
3. Hacer commit. GitHub Actions ejecuta `python scripts/generar.py` y publica el resultado en Pages.
4. Abrir `https://mirurecetas.github.io/menu-anual-recetas/recetas/<slug>/` en Chrome Android y usar Compartir → Bring!. En Bring! pueden ajustarse una vez los ingredientes opcionales de despensa.

Para generar localmente: `python scripts/generar.py`.

**Importante:** no hay recetas de demostración publicadas ni se inventan pesos, valores nutricionales o fotografías reales. El ingrediente que se marca opcional para la compra **permanece en la fuente nutricional**, pues Bring! y el cálculo nutricional tienen finalidades distintas. Toda receta debe contener todos sus ingredientes y cantidades, incluidos aceite y sal.

La integración automática Airtable → datos/recetas **todavía no está configurada**. El formato es un contrato de exportación provisional, no una duplicación manual obligatoria futura.
