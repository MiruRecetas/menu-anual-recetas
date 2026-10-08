# MiruRecetas: agregar una receta nueva

Guía operativa para cualquier chat del proyecto Menú anual. Repositorio: MiruRecetas/menu-anual-recetas. Web: https://mirurecetas.github.io/menu-anual-recetas/

## Fuente de verdad técnica
Antes de editar, leer los archivos actuales: `datos/FORMATO.md`, `scripts/generar.py`, `plantillas/receta.html`, `assets/estilo.css`, `.github/workflows/publicar-recetas.yml` y `datos/recetas/carrilleras-de-cerdo-al-vino.json`. Esta última es la receta real de referencia. No crear diseños HTML independientes.

## Procedimiento
1. Solicitar o extraer nombre, raciones base, ingredientes totales (pesos en crudo salvo indicación), elaboración, imagen real, tiempos y nutrición. No inventar valores; identificar estimaciones provisionales y datos de Lifesum sin auditar.
2. Crear `datos/recetas/<slug>.json` con `slug`, `nombre`, `descripcion`, `raciones`, `imagen`, `categoria`, `etiquetas`, `preparacion_min`, `coccion_min`, `ingredientes`, `pasos`, `notas` y, si existe, `nutricion` (kcal, proteinas_g, hidratos_g y grasas_g **por ración**). Usar estructura y criterios de la receta de carrilleras. El nombre del archivo debe coincidir con el slug.
3. Cada ingrediente tiene `nombre`, `cantidad` y `unidad`. Para sal y especias sin cantidad: `cantidad: null`, `unidad: ""`, de forma que Bring! reciba solo el nombre. Mostrar **Sal**, no Sal yodada; el hecho de ser yodada interesa para micronutrientes. Aceite y otros ingredientes calóricos deben tener cantidades y entrar en la nutrición. Si un ingrediente es una preparación registrada, agregar `preparacion` con el slug existente: enlace solo desde la receta consumidora a la preparación.
4. Poner fotografía verdadera en `imagenes/`, preferiblemente suficiente resolución para tablet, y referenciar solo su nombre desde el JSON. No inventar fotografías.
5. Asignar **una** categoría y varias etiquetas si corresponden, según catálogo siguiente. Las etiquetas de ingrediente se reservan para protagonistas.
6. Hacer commit de datos e imagen en `main`; el workflow `publicar-recetas.yml` ejecuta `python scripts/generar.py` y debería generar `recetas/<slug>/index.html` y `index.html`. **Verificar** que la automatización realmente ha producido ambos archivos y que GitHub Pages sirve la nueva ficha; corregir el workflow o generar/publicar explícitamente si falla. No anunciar publicación sin comprobar.
7. Comprobar Schema.org Recipe, foto en GitHub Pages, importación Bring! con cantidades base y condimentos sin «al gusto», escalado de raciones, pasos, anverso/reverso, iconos circulares, categoría sobre foto y diseño de móvil/tablet en vertical y horizontal. Ante estilos obsoletos, ajustar la versión de CSS en la plantilla y regenerar. Compartir enlace https://mirurecetas.github.io/menu-anual-recetas/recetas/<slug>/ .

## Categorías únicas (slug = icono Lucide)
- guisos-legumbres = cooking-pot
- arroces-pastas = wheat
- asados-horno = ham
- ensaladas-frios = salad
- sopas-cremas-pures = soup
- huevos-tortillas = egg-fried
- tostas-bocadillos-wraps = sandwich
- postres = cupcake
- salsas-guarniciones = paint-bucket

## Etiquetas prácticas
congelable = snowflake; microondas = waves-vertical; tupper = paper-bag; batchcooking = calendar-check; rapida = zap. No hay etiqueta airfryer.

## Ingrediente protagonista
carne = beef; pescado = fish; marisco = shrimp; verduras = carrot; legumbres = bean.

## Diseño validado (octubre 2026)
Título Bricolage Grotesque peso 600. Categoría como círculo en esquina superior derecha de la fotografía. Etiquetas solo iconos oficiales Lucide, en círculos; prácticas verdes, ingredientes protagonistas terracota. Vertical: bloques apilados. Horizontal tanto móvil como tablet: anverso foto izquierda y datos derecha; reverso pasos izquierda y temporizador/notas derecha, paneles con desplazamiento independiente. Mantener selector de raciones, temporizador, anillo de macros y marcado estructurado Bring!. **Pendiente menor:** centrar horizontalmente la fila inferior de iconos. Airtable será fuente central cuando se conecte, pero la sincronización aún no está configurada.
