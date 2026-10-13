# MiruRecetas · Menú anual

**MiruRecetas** es la web personal de planificación alimentaria del proyecto **Menú anual**: menús de lunes a viernes reutilizables, recetario, resúmenes nutricionales y preparaciones de batch cooking. Está construida como sitio estático, generado desde archivos JSON y publicado en GitHub Pages.

**[Abrir MiruRecetas](https://mirurecetas.github.io/)** · [Recetario](https://mirurecetas.github.io/menu-anual-recetas/recetario/) · [Repositorio](https://github.com/MiruRecetas/menu-anual-recetas)

> **Revisión de diseño y publicación: 13/10/2026.** El contenido evoluciona en paralelo: consultar `datos/menus/` y el índice público para saber qué menús y recetas están publicados, sin tratar cifras antiguas del README como inventario vigente.

**Índice público de recetas:** [consultar `indice-recetas.json`](https://mirurecetas.github.io/menu-anual-recetas/indice-recetas.json). Se actualiza automáticamente desde las fichas JSON originales.


## Qué ofrece la web

### 1. Menús semanales

- Cinco tarjetas, de lunes a viernes, **sin fechas**: los menús de un mismo mes están pensados para poder intercambiarse.
- Desayuno, comida, cena y las secciones independientes **Fruta** y **Postre** cuando existan. El **viernes tiene cena libre**, fuera del total nutricional mostrado; los postres no se inventan cuando no existen.
- Nombres breves e iconos en las tarjetas. En escritorio, las cinco tarjetas tienen **igual altura y ancho**, con encabezados y comidas **alineados arriba**, día en una sola línea (incluido «Miércoles») y espacio libre al final de las más cortas. El anillo semanal de kcal es **gris carbón** (`#454b4b`), no un color de macronutriente, frente a la referencia de **1600 kcal**.
- Al tocar un día se abre la **ficha diaria compacta**: anillo tricolor de avance energético, gramos de proteínas/hidratos/grasas y **barras de cumplimiento de objetivos**, además de **solo los nombres de los platos**. Los ingredientes **no** se despliegan en esta vista.
- Los platos con receta publicada ofrecen una **flecha `↗` independiente** para abrirla, manteniendo el nombre como texto. El icono `maximize-2` lleva al día completo y la X cierra el panel. Se conserva acceso por teclado y retorno del foco al origen.

En móvil y tablet horizontal desde 600 px, los cinco días se muestran en una misma fila, con elementos más compactos. En pantallas horizontales de 600–799 px, el anillo de kcal queda debajo del nombre del día. La ficha individual mantiene su comportamiento.

### Gráficos semanales

Debajo de los selectores aparecen barras apiladas de kcal por día (L/M/X/J/V), con los colores de macros y una línea discontinua a **1600 kcal**, sin texto ni fondo de etiqueta. Las cifras se muestran dentro de las barras. Solo el viernes con cena libre añade un tramo gris `#e4ded8` de `Math.max(0, 1600 - kcalRegistradas)`: es referencia visual, no nutrición. La cifra real permanece dentro de los colores y la restante dentro del gris; no se suma a totales ni a los circulares. A la derecha hay dos gráficos circulares semanales: **variedad nutricional provisional por protagonista** y **energía por ingesta**, ambos con leyenda a su derecha. En móvil vertical estrecho se presentan en una tarjeta: barras compactas delante y dos círculos detrás, accesibles mediante el botón de giro superior derecho. Las kcal oficiales se conservan; las ingestas pendientes o libres no se inventan.

La variedad es una **aproximación**, todavía no el aporte real de cada ingrediente. El [contrato y plan de evolución](docs/GRAFICOS-SEMANA.md) explica el cálculo actual y los datos que requerirá el desglose real. Esta primera versión no cambia el procedimiento de publicación de recetas o menús.

### 2. Día completo

Las rutas `menus/MM-N/<día>/` presentan el mes/menú y el día **en una misma línea**, con el nombre del día a la derecha, **sin párrafo explicativo redundante**. Reutilizan el anillo tricolor y las barras nutricionales del panel compacto y muestran cada ingesta, sus valores oficiales, grupos culinarios **desplegables** y enlaces a las recetas realmente publicadas.

En móvil, **deslizar de derecha a izquierda** avanza lunes→viernes y **de izquierda a derecha** retrocede; la navegación **se detiene en los extremos**, sin vuelta circular. El desplazamiento vertical y los desplegables no deben quedar bloqueados; existen enlaces inferiores accesibles con el nombre del día de destino.

Los grupos se identifican por `Visual · Grupo ID` **dentro de cada COMIDA**, se ordenan por `Visual · Orden grupo`, y sus ingredientes por `Visual · Orden elemento`; se muestran con `Visual · Nombre grupo`. **No** ordenar los IDs lexicográficamente. Ejemplo vigente de cena del lunes de Octubre · Menú 1: **Carpaccio con parmesano y AOVE → Puerros con mayonesa**. El bowl de yogur actualmente está registrado como **Postre**, independiente de Cena; respetar su ubicación real en el JSON y no restaurar agrupaciones históricas; el carpaccio comercial incluye su AOVE (no duplicar aceite). La agrupación **no cambia nutrición, referencias ni cantidades**.

### 3. Batch cooking

En la portada se construye automáticamente una **galería de fotografías** a partir de las preparaciones del menú con etiqueta funcional web `batchcooking` y, cuando corresponda, sus dependencias. Se evita duplicar una preparación dentro de una misma comida.

- Las miniaturas llevan a su receta.
- El nombre no ocupa una línea bajo la foto: aparece **sobre la imagen atenuada** al pasar el ratón, al enfocar con teclado o con el primer toque en pantallas táctiles; el segundo toque abre la receta.
- La disposición es adaptable: en móvil vertical hasta 700 px se muestran siempre 3 columnas; en tablet vertical ancha se aplica la regla editorial de 1, 2 o 3 columnas según cantidad; en escritorio y en móvil/tablet **horizontales** se usan hasta cinco miniaturas por fila, con ancho limitado y filas incompletas centradas.
- **No hay una colección de imágenes de batch cooking distinta de las fotografías principales.**

### 4. Recetario y fichas

- [Recetario](https://mirurecetas.github.io/menu-anual-recetas/recetario/) con búsqueda por nombre, descripción y etiquetas; el buscador ocupa todo el ancho del conjunto de tarjetas en móvil, tablet y escritorio; carga inicial de diez resultados y opción de mostrar más.
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

### Postres: ingrediente, preparación o ambos

El exportador consulta `<Día> · Postre` (INGREDIENTE) y `<Día> · Postre preparación` (PREPARACIÓN) de forma **no excluyente**. Se admite como máximo un vínculo de cada tipo: ninguno, ingrediente, preparación o ambos. `Estado postre` debe ser `Calculado`, o `Sin postre` con ambos vínculos y cantidades vacíos. Los estados de error bloquean la exportación antes de escribir menús.

El JSON v2 nuevo contiene `postre: {"componentes": [...]}` si hay uno o dos postres, y `postre: null` si no existe ninguno. Cada componente conserva identidad, tipo y nutrición propios:

- Ingrediente: `tipo: "ingrediente"`, `referencia_id`, `nombre`, `cantidad`, `unidad` (`g`/`ml`) y `nutricion`. Los rollups por 100 g/ml se escalan a la cantidad registrada.
- Preparación: `tipo: "preparacion"`, `referencia_id`, `nombre`, `raciones`, `estado: "Calculado"` y `nutricion` por las raciones consumidas. `slug` es opcional y se exporta solo si el enlace de Airtable corresponde a una receta publicada.

La colección no almacena un segundo total nutricional: el validador comprueba cada componente y contrasta la suma de ingestas con los totales oficiales de Airtable. Estos totales diarios y semanales nunca se sustituyen, también en menús parciales. La web y el validador siguen aceptando el postre único del formato v2 anterior para conservar los menús publicados.

Semana, resumen compacto y día completo muestran cada postre por separado, con `apple` para ingrediente y `dessert` para preparación. Las tres vistas distinguen **Fruta** (INGREDIENTE, `apple`) y **Postre** (PREPARACIÓN, `dessert`). Cada sección se omite si falta su componente; pueden aparecer ambas, una o ninguna. El contrato JSON y los campos de Airtable mantienen sus nombres actuales. La ampliada muestra cantidad/raciones y nutrición de cada componente; la compacta conserva los nombres y la flecha a receta. Batch cooking consulta las preparaciones de postre etiquetadas y sus dependencias; los gráficos suman ambas aportaciones una sola vez. Esta actualización no modifica ni reexporta menús existentes.

### Día ampliado: componentes y aportaciones

Cada ingesta lleva un **lateral girado 90°**, con nombre abajo, kcal oficiales arriba y separador terracota. Las kcal laterales usan **Geist regular al 78 %** del tamaño del título. Se omiten los títulos completos redundantes de COMIDA/CENA: la ficha muestra sus componentes en orden. Una preparación única se presenta como nombre enlazado, cantidad/raciones y nutrición, sin desplegable. Los grupos de varios elementos conservan un desplegable con composición y cantidades; sus aportes permanecen visibles al cerrarlo. Kcal de componentes en negrita y cantidades de macros con sus colores oficiales; los aportes tienen menor tamaño/peso que el nombre del plato. Café y frutas usan las mismas abreviaciones por ID que la ficha compacta. Fruta/Postre no llevan iconos en esta vista. Los bordes exteriores se conservan; no se dibujan divisores internos.

Los valores por componente proceden de las fórmulas `Kcal/Proteínas/Hidratos/Grasas aportadas` de COMIDA_ELEMENTOS. El exportador los incluye en `nutricion` de cada elemento en exportaciones futuras, sin cambiar cantidades ni totales. Para los menús anteriores, `presentacion/aportes-componentes.json` conserva una instantánea mínima de estas aportaciones oficiales, vinculada a ID de elemento, COMIDA, referencia, tipo, cantidad y unidad. No es un catálogo nutricional de ingredientes ni modifica los JSON canónicos de menús. El generador trabaja sobre una copia y suma únicamente esos aportes para representar un grupo.

`scripts/presentacion_diaria.py` solo utiliza la instantánea cuando coincide la identidad completa y el desglose de la comida concuerda con sus cuatro totales oficiales. Prefiere aportes ya incluidos en el JSON exportado; si faltan o dejan de coincidir, muestra el desglose pendiente en lugar de inventar cifras o reemplazar los totales. Al actualizar un menú antiguo, el flujo operativo puede reexportarlo con el exportador vigente para incorporar sus aportes directamente; el equipo web no reexporta menús sin encargo. Cambios en `presentacion/` también activan la generación de páginas.


### Cena libre en las vistas diarias

Solo cuando `cena.estado === "libre"`, el panel compacto conserva el encabezado Cena y su icono moon, con «Noche libre» sobre una banda salvia redondeada. La ampliada conserva el lateral Cena y el separador terracota, reduce la altura de la tarjeta y muestra Lucide `moon-star`, «Noche libre» y «Sin planificación nutricional». No aporta kcal, macros ni cantidades. El diseño aprobado de las tarjetas semanales de viernes permanece intacto.

### Nombres, cantidades visibles y enlaces

La ampliada abrevia alimentos y elimina marcas por ID, incluso en desplegables, conservando el tipo de producto y sus datos originales. Equivalencias visuales confirmadas: pan de molde de 36,5 g → **1 rebanada**; huevo de 100 g → **2 unidades**. No generalizar estas conversiones a cantidades o productos no verificados. Café con leche, Uvas, Ciruelas e Higos usan nombres breves.

El generador enlaza una preparación sin `slug` solo si su nombre coincide exactamente, tras normalizar acentos, mayúsculas y espacios, con una única receta del catálogo publicado. Trabaja sobre una copia de presentación; no cambia el menú ni enlaza ingredientes o coincidencias ambiguas/parciales. «Tostas de hummus y sardinillas» es una sola receta, tanto en la semana como en el día ampliado, con enlace a su ficha y 1 ración en el caso publicado de Octubre · Menú 1 · Jueves.

## Dirección raíz y futura landing

| Repositorio | Función y dirección |
| --- | --- |
| [`MiruRecetas/mirurecetas.github.io`](https://github.com/MiruRecetas/mirurecetas.github.io) | Entrada por `https://mirurecetas.github.io/`; actualmente redirige automáticamente al sitio de menús. Lugar recomendado para una futura landing independiente. |
| [`MiruRecetas/menu-anual-recetas`](https://github.com/MiruRecetas/menu-anual-recetas) | Aplicación existente, datos, generador, recetario y menús bajo `/menu-anual-recetas/`. Sigue siendo el repositorio principal del producto. |

GitHub Pages requiere el nombre exacto `mirurecetas.github.io` para el sitio de usuario en la raíz; una rama main de otro repositorio no elimina su prefijo de URL. El repositorio raíz publica `main` → `/(root)` y contiene `index.html` y `.nojekyll`. Su redirección conserva parámetros y fragmento con JavaScript, reemplaza el historial y ofrece meta refresh/enlace sin JavaScript. La barra de direcciones pasa a la URL canónica actual.

Una futura landing sustituirá la redirección del repositorio raíz y enlazará a menús/recetario existentes. No está implementada todavía. Mantener una sola fuente de datos y evitar copias de la aplicación. La configuración raíz vigente se mantiene en aquel repositorio; `hosting/github-pages-root/` de este repositorio conserva el modelo preparado y su prueba de redirección, no despliega automáticamente el otro sitio.

Ambos repositorios usan rama y PR. Aquí se esperan Validar web y QA navegador; en el sitio raíz, Validar acceso raíz comprueba seis casos (390/820/1440 px, con/sin JavaScript). Después de fusionar, esperar Pages y verificar por HTTP público la página real y su destino. Los cambios solo de documentación se verifican en GitHub y no necesitan regeneración HTML.

## PWA

Instalación, actualización consentida, consulta offline limitada y recuperación: [contrato técnico PWA](docs/PWA.md). Los iconos de instalación y favicon usan la [identidad definitiva entregada](docs/IDENTIDAD-MARCA.md). Las pruebas automáticas no acreditan instalación física en Android, iOS o escritorio.
