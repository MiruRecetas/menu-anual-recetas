# MiruRecetas · Contrato de datos

Este documento describe **fichas web de recetas**, no la exportación de menús. En el proyecto, Airtable conserva la base alimentaria, las preparaciones y los cálculos nutricionales; `datos/recetas/*.json` es la fuente estructurada de publicación de recetas en la web. No existe una sincronización automática continua Airtable ↔ JSON. El flujo especializado de recetas edita categorías y etiquetas **en los JSON web**; no las gestiona Airtable ni el agente de imágenes.

Contratos vigentes: [README principal](../README.md), [alta de recetas](../docs/NUEVA-RECETA.md), [fotografía principal y Batch cooking](../docs/IMAGENES-BATCHCOOKING.md) y el generador `scripts/generar.py`. Antes de modificar, comprobar `main`.

## Receta: `datos/recetas/<slug>.json`

**Obligatorios para el generador:** `slug`, `nombre`, `raciones` (entero positivo), `ingredientes` (lista no vacía) y `pasos` (lista no vacía de textos). El `slug` coincide con el nombre del archivo y sigue `[a-z0-9]+(?:-[a-z0-9]+)*`. Cada ingrediente tiene `nombre` (texto), `cantidad` (número positivo o `null` para aromáticos sin cantidad) y `unidad` (texto; vacío solo con `cantidad: null`). Las cantidades son **totales para las raciones base**, en crudo salvo indicación expresa; no deben confundirse con cantidades por ración. El generador permite escalar las cantidades visibles.

**Campos adicionales de publicación:** `categoria` (una del catálogo culinario vigente), `etiquetas` (lista de slugs del catálogo), `descripcion`, `imagen`, `preparacion_min`, `coccion_min`, `notas` y `nutricion`. Los tiempos, si se incluyen, deben ser enteros no negativos y se exportan a Schema.org como minutos. Las etiquetas son gestionadas por el **flujo de recetas**, no por Airtable. La convención editorial exige **una categoría y una etiqueta principal de ingrediente**, y admite cero o varias etiquetas funcionales **antes** de la principal; el generador valida el vocabulario, aunque no impone por sí mismo esa unicidad.

**Nutrición:** `nutricion` es opcional hasta disponer de cálculo auditado en Airtable; cuando se publica debe contener los cuatro números no negativos `kcal`, `proteinas_g`, `hidratos_g` y `grasas_g` **por ración**. La web muestra estas cifras tal cual: el anillo usa 4/4/9 para el reparto porcentual de energía de macros, **no** para sustituir las kcal oficiales. No inventar valores ni presentar estimaciones no verificadas como definitivas.

**Preparaciones anidadas N0/N1:** si un ingrediente es una subpreparación publicada, añadir `preparacion` con el slug existente y expresar su consumo en `ración` o `raciones` según proceda, por ejemplo `{"nombre":"Hummus","cantidad":1,"unidad":"ración","preparacion":"hummus"}`. El generador verifica que la subreceta existe y enlaza a ella; el cálculo nutricional en Airtable debe evitar contar dos veces sus ingredientes. Ejemplo real: [tostas de hummus y sardinillas](recetas/tostas-de-hummus-y-sardinillas.json) enlaza a [hummus](recetas/hummus.json). La web no expande automáticamente subpreparaciones en la importación a Bring!.

**Ingredientes visibles:** no mostrar marcas comerciales en las fichas públicas, aunque se conserven referencias verificadas en Airtable; para el aceite de oliva virgen extra utilizar `AOVE`. Para especias, sal y hierbas sin peso confirmado, `{"nombre":"Pimienta negra","cantidad":null,"unidad":""}`. El nombre de la sal visible es «Sal»; su condición de yodada se trata en la base nutricional cuando corresponda.

**Uso editorial de `notas` (visible en la web):** únicamente consejos prácticos relativos a la preparación, cocción, textura, presentación, conservación, congelación o recalentado de la receta. Debe ser breve y útil para quien cocina; no repetir los pasos salvo una advertencia culinaria importante. Si no aporta información adicional, omitir el campo o dejarlo vacío. **No incluir** referencias a la conversación, confirmaciones, Airtable, BEDCA/USDA, IDs, conversiones nutricionales, balances de aceite/alcohol, fuentes comerciales, estado de fotografías, justificaciones de etiquetas o auditorías. Toda trazabilidad técnica debe permanecer en los registros/catálogos internos correspondientes o en el historial de Git, nunca en `notas`.

## Límite del contrato: menús v2

**Este archivo no define ni modifica el esquema de menús.** Los menús publicados en `datos/menus/MM-N.json` utilizan actualmente `schema_version: 2` y su contrato vigente está en `scripts/validar_menus.py`, `scripts/exportar_airtable.py`, los JSON de menú publicados y el [README](../README.md). Su contenido, nutrición, componentes de COMIDA, días, campos y reglas de exportación pertenecen al flujo de **menús**, independiente del de recetas. **No reutilizar las instrucciones de menús antiguos** basadas solo en slugs de comida/cena ni confundirlas con `datos/recetas/*.json`. La galería de Batch cooking consulta etiquetas de las recetas web y las dependencias reales según el código vigente, no se decide por una etiqueta de Airtable.

## Fotografía principal: contrato y agente responsable

Cada receta tiene **una sola fotografía principal**, reutilizada en su ficha, en la miniatura del recetario y en Batch cooking. El agente de imágenes la genera y publica directamente en GitHub; **no se requiere que la usuaria descargue ni suba archivos**. Para fotografías nuevas se prefiere `imagenes/<slug>.webp`, archivo binario real. `imagen` almacena **solo** `<slug>.webp`, sin ruta; se admiten también nombres existentes con extensión `.jpg`, `.jpeg` o `.png`. Si `imagen` se informa, el archivo **debe existir previamente** en `imagenes/`, o la generación fallará. Si aún no hay foto, omitir `imagen` o asignarle `null`: la web mostrará el marcador «Fotografía pendiente».

El agente de imágenes primero comprueba el archivo y después actualiza **únicamente** el campo `imagen`, sin cambiar ingredientes, nutrición, categorías ni etiquetas y sin sustituir fotografías existentes sin autorización. No crear fotos separadas en `imagenes/batchcooking/`. Consultar [IMAGENES-BATCHCOOKING.md](../docs/IMAGENES-BATCHCOOKING.md).

## Bring!

La ficha incluye Schema.org Recipe, `image` solo cuando existe un archivo real, y `recipeIngredient` con las cantidades **base**, sin depender de JavaScript. El selector de raciones solo cambia las cantidades visibles en la ficha. La opción de compartir/importar a Bring! depende de las capacidades del servicio externo; **no existe integración propia ni sincronización automática**. Los artículos opcionales pueden editarse después en Bring!.

Las preparaciones enlazadas se muestran como ingredientes y enlaces a su ficha, sin expansión automática de sus componentes en Bring!. Los huevos y otras unidades indivisibles pueden requerir redondeo culinario.


## Vocabulario cerrado de categorías y etiquetas (Lucide)

**Categorías culinarias (10; slug — nombre visible — icono):**

| Slug | Nombre visible | Icono |
| --- | --- | --- |
| `guisos-legumbres` | Guisos y estofados | `cooking-pot` |
| `arroces-pastas` | Arroces y pastas | `wheat` |
| `asados-horno` | Asados y horno | `ham` |
| `ensaladas-frios` | Ensaladas y platos fríos | `salad` |
| `sopas-cremas-pures` | Sopas, cremas y purés | `soup` |
| `huevos-tortillas` | Huevos y tortillas | `egg-fried` |
| `tostas-bocadillos-wraps` | Tostas, bocadillos y wraps | `sandwich` |
| `postres` | Postres | `cupcake` |
| `aperitivos-guarniciones` | Aperitivos, bocados y guarniciones | `hand-platter` |
| `salsas-aderezos` | Salsas y aderezos | `paint-bucket` |

**Etiquetas funcionales (6, opcionales):** `congelable` (`snowflake`), `microondas` (`waves-vertical`), `tupper` (`paper-bag`), `batchcooking` (`calendar-check`), `rapida` (`zap`), `consumo-frio` (`refrigerator`). `microondas` exige buen resultado de recalentado, no solo poder calentarse; `consumo-frio` se aplica a platos normalmente calientes que se comen bien fríos, no a preparaciones frías por naturaleza. `batchcooking` se asigna en la ficha web solo si tiene sentido adelantar la preparación como parte del sistema de menús.

**Etiquetas de ingrediente protagonista (7, una por receta):** `carne` (`beef`), `huevos` (`egg`), `pescado` (`fish`), `marisco` (`shrimp`), `verduras` (`carrot`), `legumbres` (`bean`), `lacteos` (`carton`). Si una receta tiene funcionales, se ordenan **antes** de la etiqueta principal. No se fuerzan etiquetas funcionales cuando ninguna corresponde.

**Ejemplo vigente:** [Quiche de puerro, champiñones y pavo](recetas/quiche-de-puerro-champinones-y-pavo.json) se clasifica como `huevos-tortillas` con `["tupper", "consumo-frio", "huevos"]`. Los iconos y nombres públicos los aplica `scripts/generar.py`.
