# MiruRecetas · Contrato de datos

Las recetas se generarán desde Airtable cuando esté conectado. Los archivos JSON son el formato de publicación; no se requieren recetas ficticias.

## Receta: datos/recetas/slug.json

Campos obligatorios: slug, nombre, raciones (número entero), ingredientes (lista), pasos (lista de textos). Cada ingrediente: nombre, cantidad numérica positiva y unidad; si es una preparación, añadir preparacion con el slug de la receta enlazada. Las cantidades son totales para las raciones base y deben ser numéricas para poder escalarse.

Opcionales: descripcion, imagen (nombre de archivo real en imagenes/), preparacion_min, coccion_min, etiquetas (lista), notas, nutricion. Nutricion, una vez auditada, tendrá kcal, proteinas_g, hidratos_g y grasas_g por ración. El anillo reparte la energía de macros mediante 4/4/9, no representa un cálculo alternativo de calorías. No inventar datos nutricionales.

## Menú: datos/menus/MM-N.json

Mes de 1 a 12, menu de 1 a 4. dias contiene exactamente Lunes, Martes, Miércoles, Jueves, Viernes. Cada día incluye comida y cena, con slug de receta existente o null. batchcooking es una lista opcional de slugs existentes. No se usan fechas. Los cuatro menús de cada mes son intercambiables.

## Bring!

La página conserva Schema.org Recipe, image apuntando al repositorio, recipeIngredient con cantidades *base* sin JavaScript y microdatos de imagen. El selector de raciones solo cambia las cantidades visibles para cocinar. Bring! permite escalar sus propias cantidades al importar y guardar cada receta. Los artículos opcionales se editan posteriormente en Bring!.

La expansión de preparaciones anidadas para la compra final necesita definirse con Airtable; esta versión las enlaza y muestra como ingredientes, sin sumarlas automáticamente a Bring!. Los huevos y otras unidades indivisibles pueden requerir redondeo culinario.


## Vocabulario cerrado de iconos (Lucide)

`categoria`: `guisos-legumbres` (cooking-pot; visualmente «Guisos y estofados»), `arroces-pastas` (wheat), `asados-horno` (ham), `ensaladas-frios` (salad), `sopas-cremas-pures` (soup), `huevos-tortillas` (egg-fried), `tostas-bocadillos-wraps` (sandwich), `postres` (cupcake), `aperitivos-guarniciones` (hand-platter), `salsas-aderezos` (paint-bucket).

`etiquetas`: `congelable` (snowflake), `microondas` (waves-vertical), `tupper` (paper-bag), `batchcooking` (calendar-check), `rapida` (zap), `carne` (beef), `pescado` (fish), `marisco` (shrimp), `verduras` (carrot), `legumbres` (bean), `lacteos` (carton).

Los ingredientes aromáticos sin cantidad tienen `cantidad: null`, `unidad: ""` y se exportan a Bring! únicamente por nombre. Las cantidades numéricas se escalan en la interfaz. La categoría es única, las etiquetas pueden ser varias.
