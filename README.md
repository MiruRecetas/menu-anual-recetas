# MiruRecetas · Menú anual

**MiruRecetas** es la web personal de planificación alimentaria del proyecto **Menú anual**: menús de lunes a viernes reutilizables, recetario, resúmenes nutricionales y preparaciones de batch cooking. Está construida como sitio estático, generado desde archivos JSON y publicado en GitHub Pages.

**[Abrir MiruRecetas](https://mirurecetas.github.io/menu-anual-recetas/)** · [Recetario](https://mirurecetas.github.io/menu-anual-recetas/recetario/) · [Repositorio](https://github.com/MiruRecetas/menu-anual-recetas)

> **Estado revisado el 11/10/2026:** hay dos menús v2 en estado **Calculado**: **Septiembre · Menú 4** y **Octubre · Menú 1**. Los restantes menús del calendario estacional están **Pendiente**, no preparados. El índice público lista **26 recetas** en esta revisión; consulta el JSON para el total y el SHA actuales, pues seguirán evolucionando.

**Índice público de recetas:** [consultar `indice-recetas.json`](https://mirurecetas.github.io/menu-anual-recetas/indice-recetas.json). Se actualiza automáticamente desde las fichas JSON originales.


## Qué ofrece la web

### 1. Menús semanales

- Cinco tarjetas, de lunes a viernes, **sin fechas**: los menús de un mismo mes están pensados para poder intercambiarse.
- Desayuno, comida, cena y postre cuando esté registrado. El **viernes tiene cena libre**, fuera del total nutricional mostrado; los postres no se inventan cuando no existen.
- Nombres breves e iconos en las tarjetas. En escritorio, las cinco tarjetas tienen **igual altura y ancho**, con encabezados y comidas **alineados arriba**, día en una sola línea (incluido «Miércoles») y espacio libre al final de las más cortas. El anillo semanal de kcal es **gris carbón** (`#454b4b`), no un color de macronutriente, frente a la referencia de **1600 kcal**.
- Al tocar un día se abre la **ficha diaria compacta**: anillo tricolor de avance energético, gramos de proteínas/hidratos/grasas y **barras de cumplimiento de objetivos**, además de **solo los nombres de los platos**. Los ingredientes **no** se despliegan en esta vista.
- Los platos con receta publicada ofrecen una **flecha `↗` independiente** para abrirla, manteniendo el nombre como texto. El icono `maximize-2` lleva al día completo y la X cierra el panel. Se conserva acceso por teclado y retorno del foco al origen.

En móvil y tablet horizontal desde 600 px, los cinco días se muestran en una misma fila, con elementos más compactos. En pantallas horizontales de 600–799 px, el anillo de kcal queda debajo del nombre del día. La ficha individual mantiene su comportamiento.

### Gráficos semanales

Debajo de los selectores aparecen barras apiladas de kcal por día (L/M/X/J/V), con los colores de macros y una línea discontinua a **1600 kcal**. A la derecha hay dos gráficos circulares semanales: **variedad nutricional provisional por protagonista** y **energía por ingesta**, ambos con leyenda a su derecha. En móvil vertical estrecho se presentan en una tarjeta: barras compactas delante y dos círculos detrás, accesibles mediante el botón de giro superior derecho. Las kcal oficiales se conservan; las ingestas pendientes o libres no se inventan.

La variedad es una **aproximación**, todavía no el aporte real de cada ingrediente. El [contrato y plan de evolución](docs/GRAFICOS-SEMANA.md) explica el cálculo actual y los datos que requerirá el desglose real. Esta primera versión no cambia el procedimiento de publicación de recetas o menús.

### 2. Día completo

Las rutas `menus/MM-N/<día>/` presentan el mes/menú y el día **en una misma línea**, con el nombre del día a la derecha, **sin párrafo explicativo redundante**. Reutilizan el anillo tricolor y las barras nutricionales del panel compacto y muestran cada ingesta, sus valores oficiales, grupos culinarios **desplegables** y enlaces a las recetas realmente publicadas.

En móvil, **deslizar de derecha a izquierda** avanza lunes→viernes y **de izquierda a derecha** retrocede; la navegación **se detiene en los extremos**, sin vuelta circular. El desplazamiento vertical y los desplegables no deben quedar bloqueados; existen enlaces inferiores accesibles con el nombre del día de destino.

Los grupos se identifican por `Visual · Grupo ID` **dentro de cada COMIDA**, se ordenan por `Visual · Orden grupo`, y sus ingredientes por `Visual · Orden elemento`; se muestran con `Visual · Nombre grupo`. **No** ordenar los IDs lexicográficamente. Ejemplo vinculante para la cena del lunes de Octubre · Menú 1: **Carpaccio con parmesano y AOVE → Puerros con mayonesa → Bowl de yogur con miel y granola**. El bowl permanece **dentro de CENA**, no pasa a Postre; el carpaccio comercial incluye su AOVE (no duplicar aceite). La agrupación **no cambia nutrición, referencias ni cantidades**.

### 3. Batch cooking

En la portada se construye automáticamente una **galería de fotografías** a partir de las preparaciones del menú con etiqueta funcional web `batchcooking` y, cuando corresponda, sus dependencias. Se evita duplicar una preparación dentro de una misma comida.

- Las miniaturas llevan a su receta.
- El nombre no ocupa una línea bajo la foto: aparece **sobre la imagen atenuada** al pasar el ratón, al enfocar con teclado o con el primer toque en pantallas táctiles; el segundo toque abre la receta.
- La disposición es adaptable: en móvil vertical hasta 700 px se muestran siempre 3 columnas; en tablet vertical ancha se aplica la regla editorial de 1, 2 o 3 columnas según cantidad; en escritorio y en móvil/tablet **horizontales** se usan hasta cinco miniaturas por fila, con ancho limitado y filas incompletas centradas.
- **No hay una colección de imágenes de batch cooking distinta de las fotografías principales.**

### 4. Recetario y fichas

- [Recetario](https://mirurecetas.github.io/menu-anual-recetas/recetario/) con búsqueda por nombre, descripción y etiquetas; carga inicial de diez resultados y opción de mostrar más.
- **Una ficha por receta** en `recetas/<slug>/`, con fotografía, ingredientes, raciones, elaboración, categoría, etiquetas y nutrición cuando exista.
- Selector de raciones para **escalar las cantidades visibles**, anverso/reverso en **modo cocina**, pasos marcables y temporizador.
- Marcado estructurado **Schema.org Recipe** para facilitar compartir/importar recetas desde el navegador, incluido el flujo de **Compartir → Bring!** en Android. La importación depende del comportamiento de Bring!; no existe una integración propia ni sincronización automática de listas de compra.

## Nutrición: significado de los indicadores

La web **presenta la nutrición registrada en los JSON**, sin recalcular ni reemplazar los valores oficiales de Airtable.

| Vista / elemento | Qué representa |
| --- | --- |
| Tarjeta semanal, anillo gris carbón | Progreso de **kcal registradas / 1600 kcal**, sin atribución a un macro. Color de progreso `#454b4b`; pista `#dcddda`. |
| Fichas diarias compacta y ampliada, anillo tricolor | La longitud del arco indica **kcal registradas / 1600 kcal** (limitada visualmente al 100 %). El arco coloreado se reparte por energía relativa de **proteínas, hidratos y grasas**. |
| Barras de macros en ambas fichas diarias | **Cumplimiento de objetivos diarios en gramos**: **93 g PR**, **147 g HC**, **65 g GR**; la barra no rebasa el 100 % de ancho, pero el porcentaje puede superar el 100 %. |
| Receta individual, anillo tricolor | **Distribución de energía por macronutrientes de una ración**; **no** indica porcentaje de la meta diaria de 1600 kcal. |
| Viernes | La **cena libre no se incluye** en los valores de las ingestas planificadas. |

Para distribuir la **energía calculada por macros**, aplicar **4 kcal/g** a proteínas e hidratos y **9 kcal/g** a grasas, normalizando las proporciones respecto de esa energía calculada. Puede haber diferencias frente a las kcal oficiales registradas; **no corregir** el dato oficial desde la interfaz.

### Colores únicos de macronutrientes

| Macros | Identidad obligatoria | Variable CSS |
| --- | --- | --- |
| Proteínas | **Verde** `#748d76` | `--macro-protein` |
| Hidratos | **Terracota** `#b86f54` | `--macro-carbs` |
| Grasas | **Mostaza** `#d0a36e` | `--macro-fat` |

Los anillos, barras y leyendas usan **las mismas variables** de `assets/estilo.css`; no introducir malva ni invertir hidratos y grasas. Distinguir el terracota de interfaz `--terra` de la codificación de hidratos.

### Diseño y navegación consistentes

La identidad visual emplea **crema** de fondo, superficie clara, acentos verde salvia y terracota, tipografías **Bricolage Grotesque** (títulos) y **Geist** (texto), bordes redondeados y **Lucide**. Tanto «Mis menús» como «Recetario» deben mostrar en su cabecera los iconos **calendar-days** y **book-open**, respectivamente. El pie de la portada y del recetario dice **«MiruRecetas · Menús estacionales, siempre reutilizables»**; las páginas de recetas y días aún conservan pies explicativos propios.

## Estructura del repositorio

```text
datos/
  recetas/<slug>.json        # Fuente estructurada de cada receta web
  menus/MM-N.json            # Menús publicados (p. ej., 10-1.json)
  FORMATO.md                  # Contrato básico de datos de recetas
imagenes/                    # Una fotografía principal por receta
plantillas/
  inicio.html                # Portada semanal y ventana diaria
  dia.html                   # Página completa del día
  recetario.html             # Índice del recetario
  receta.html                # Ficha de receta
assets/
  estilo.css                 # Diseño compartido y responsive
  inicio.js                  # Menú semanal, resumen y batch cooking
  dia.js                     # Contenido del día completo
  recetario.js               # Búsqueda y lista de recetas
  cocina.js                  # Raciones, modo cocina, pasos y temporizador
scripts/
  generar.py                 # Generador estático y alimentación del índice público
  indice_publico.py          # Generación automática de indice-recetas.json
  validar_menus.py           # Contrato de menús v2 y nutrición
  agrupar_componentes.py     # Agrupación editorial de COMIDA_ELEMENTOS
  exportar_airtable.py       # Exportación autenticada de menús calculados
tests/                       # Tests de datos y navegador
docs/
  NUEVA-RECETA.md
  PROTOCOLO-MAESTRO-RECETAS.md # Protocolo integral y matizaciones vigentes
  IMAGENES-BATCHCOOKING.md
  MANTENIMIENTO-DISENO-WEB.md # Manual operativo del chat web
.github/workflows/
  validar-web.yml
  qa-navegador.yml
  publicar-recetas.yml

# Resultados generados: NO editar manualmente
index.html
recetario/index.html
recetas/<slug>/index.html
menus/MM-N/<día>/index.html
indice-recetas.json         # Inventario público autogenerado, sin duplicación en README
```

La **fuente de verdad de la publicación web** son los JSON de `datos/`, los archivos de `imagenes/`, las plantillas, el CSS/JS y el generador. **No editar los HTML ni el índice JSON generados a mano**. La publicación automática regenera `indice-recetas.json` de forma determinista con esquema, SHA de origen (último commit que afectó `datos/recetas/`), fecha UTC y total; el README contiene únicamente su enlace, no un catálogo duplicado.

**Protocolo operativo de comidas y menús:** [registro autónomo, desayuno universal, grupos visuales, condimentos sin cantidad y publicación incremental](docs/PROTOCOLO-MAESTRO-REGISTRO-COMIDAS.md). La guía prevalece frente a las indicaciones históricas de esperar a completar la semana o de considerar inexistente la tabla MENÚS.

## Cómo se actualiza el contenido

### Añadir o modificar una receta

1. Crear o actualizar `datos/recetas/<slug>.json`, respetando el contrato y los datos realmente disponibles. El `slug` debe coincidir con el nombre del archivo.
2. La categoría y las **etiquetas funcionales de la web** (por ejemplo, `batchcooking`, `congelable`, `tupper`, `rapida`) se asignan y mantienen en el **flujo especializado de creación/edición de recetas**. **No las gestiona Airtable ni el agente de imágenes**.
3. Generar y subir **una sola fotografía principal** a `imagenes/`. El campo `imagen` del JSON contiene **solo su nombre de archivo**, por ejemplo `bacalao-a-la-vizcaina.webp`. Se admiten JPG, PNG y WebP; la imagen referenciada debe existir para que la generación valide.
4. Esa foto se reutiliza automáticamente en la **ficha, el recetario y Batch cooking**. Sin imagen, la web puede mostrar un marcador provisional. No subir nuevas fotos a `imagenes/batchcooking/`: allí solo pueden quedar archivos históricos sin uso.
5. Validar y publicar el cambio mediante el flujo de GitHub. Revisar la ficha y sus enlaces públicos.

**Documentación relacionada:** [protocolo maestro de procesamiento integral de recetas](docs/PROTOCOLO-MAESTRO-RECETAS.md), [manual operativo de mantenimiento y diseño web](docs/MANTENIMIENTO-DISENO-WEB.md), [contrato de recetas](datos/FORMATO.md), [guía para incorporar recetas](docs/NUEVA-RECETA.md) y [contrato de fotografía principal y Batch cooking](docs/IMAGENES-BATCHCOOKING.md). Los tres documentos están alineados con el contrato actual: las imágenes se publican por el agente de imágenes, las etiquetas web las gestiona el flujo de recetas y los **menús v2** se rigen por `scripts/validar_menus.py` y sus JSON publicados.

### Añadir o modificar un menú

1. El contenido y los totales nutricionales se preparan/calculan en la base de trabajo correspondiente. Este repositorio **no recalcula por su cuenta** el valor nutricional de las comidas.
2. Publicar el menú como `datos/menus/MM-N.json`. El **formato vigente v2** contiene `schema_version: 2`, mes, número, ID del menú, estado calculado, **Lunes–Viernes**, desayuno, COMIDA, cena, postre opcional (ingrediente en g/ml o preparación en raciones), nutrición de cada ingesta, totales diarios/semanales y componentes de presentación.
3. Validar el esquema con `scripts/validar_menus.py` y generar las páginas. La cena del viernes se registra como libre y no entra en sus totales.
4. Mantener los enlaces entre las preparaciones y los slugs reales del recetario; la vista diaria **solo enlaza recetas realmente publicadas**.

Existe un **exportador autenticado de Airtable** en `scripts/exportar_airtable.py` que obtiene menús **calculados** y valida su estructura antes de escribir JSON. Se ejecuta **a demanda** con `AIRTABLE_TOKEN` en el entorno; `AIRTABLE_MENU_IDS` permite limitar los menús a exportar. **No es una sincronización automática continua Airtable ↔ GitHub**, ni exporta las etiquetas funcionales de las fichas web. No incluir tokens ni credenciales en commits.

## Generación, pruebas y despliegue

Para regenerar las páginas a partir de los datos actuales, en la raíz del repositorio:

```bash
python scripts/generar.py
```

Para validar en local (Python y Node.js):

```bash
python -m py_compile scripts/generar.py scripts/validar_menus.py scripts/agrupar_componentes.py scripts/exportar_airtable.py
python -m unittest discover -s tests -v
node --check assets/inicio.js
node --check assets/dia.js
node --check assets/recetario.js
node --check assets/cocina.js
node --check assets/graficos-semana.js
node tests/test_graficos_semana.cjs
```

**Flujo habitual de publicación:**

1. Crear una rama, realizar cambios sobre archivos fuente y abrir un **pull request** hacia `main`.
2. Esperar las comprobaciones de [Validar web](.github/workflows/validar-web.yml) y [QA navegador MiruRecetas](.github/workflows/qa-navegador.yml). El QA ejecuta **Chromium/Playwright**, comprueba navegación y diseños en escritorio, tablet y móvil, vertical/horizontal, **incluidos los colores renderizados, alineación de los cinco encabezados, paneles compactos, barras/anillos, gestos horizontales limitados, enlaces e iconos**, y adjunta capturas.
3. Fusionar tras las pruebas y verificar los archivos publicados. [Publicar recetas](.github/workflows/publicar-recetas.yml) se activa con cambios en datos, plantillas, scripts, CSS/JS, imágenes o su propio workflow: **regenera y guarda** `index.html`, recetario, fichas y menús en `main`.
4. GitHub Pages sirve los archivos generados en el [sitio público](https://mirurecetas.github.io/menu-anual-recetas/). Puede existir un pequeño retraso de publicación o caché del navegador. En cambios visuales puede requerirse renovar la versión de CSS/JS referenciada por las plantillas.

**Importante:** un cambio **solo en `README.md`** no dispara por sí mismo el workflow de regeneración HTML; esta documentación se consulta directamente en GitHub.

## Principios del proyecto

- **No inventar** recetas, ingredientes, cantidades, calorías, macros, grupos culinarios, enlaces o fotografías.
- Tratar los datos nutricionales oficiales como fuente; distinguir las **representaciones visuales** de los valores registrados.
- Mantener la separación de responsabilidades: **recetas/etiquetas**, **menús/nutrición**, **fotografías** y **web/publicación**.
- Priorizar una web **legible en móvil**, accesible, con menús intercambiables, fotografías coherentes y el mínimo mantenimiento duplicado.
- Comprobar la generación, las pruebas y la publicación antes de dar por terminada una modificación.
- Tras fusionar un cambio de diseño, esperar el commit del bot **«Publicar páginas generadas»**, comprobar las plantillas y la **versión de caché** `?v=...` en los HTML generados y distinguir esa comprobación de una verificación externa en GitHub Pages.
- Para un nuevo chat web, usar [MANTENIMIENTO-DISENO-WEB.md](docs/MANTENIMIENTO-DISENO-WEB.md) y contrastarlo con `main` en cada sesión. Las propuestas antiguas del manual maestro web del 10/10/2026 pueden haber quedado superadas.

### Postres: ingrediente o preparación

El exportador consulta `<Día> · Postre` y `<Día> · Postre preparación` como alternativas excluyentes. Solo acepta `Estado postre = Calculado` (o `Sin postre` con ambos vínculos vacíos). Rechaza errores, vínculos múltiples, cantidades/raciones inválidas y preparaciones pendientes antes de escribir ningún menú.

- Ingrediente: `tipo: "ingrediente"`, `cantidad`, `unidad` (`g`/`ml`); los rollups por 100 g/ml se escalan a la cantidad registrada.
- Preparación: `tipo: "preparacion"`, `referencia_id`, `nombre`, `raciones`, `estado: "Calculado"` y `nutricion` por las raciones consumidas. `slug` es opcional y se exporta solo si el enlace de Airtable corresponde a una receta publicada.
- Ausencia de postre: `null`. No se crean ingestas ni valores ficticios.

El día completo muestra las raciones y el enlace de la preparación publicada; el resumen compacto conserva nombre y flecha independiente. Batch cooking incluye también los postres con etiqueta funcional y sus dependencias, sin duplicados por ingesta. Los totales diarios y semanales se conservan directamente de las fórmulas oficiales de Airtable, incluso en menús parciales; las sumas del validador solo comprueban coherencia y nunca los sustituyen. Esta actualización del contrato no modifica los menús existentes ni ejecuta una exportación automática.
