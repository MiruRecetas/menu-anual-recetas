# MiruRecetas · Menú anual

**MiruRecetas** es la web personal de planificación alimentaria del proyecto **Menú anual**: menús de lunes a viernes reutilizables, recetario, resúmenes nutricionales y preparaciones de batch cooking. Está construida como sitio estático, generado desde archivos JSON y publicado en GitHub Pages.

**[Abrir MiruRecetas](https://mirurecetas.github.io/menu-anual-recetas/)** · [Recetario](https://mirurecetas.github.io/menu-anual-recetas/recetario/) · [Repositorio](https://github.com/MiruRecetas/menu-anual-recetas)

> **Estado (octubre de 2026):** están publicados **Octubre · Menú 1** y 14 fichas de receta/preparación. El selector permite otros meses y los menús 1–4, pero las opciones sin datos publicados muestran un aviso: **no está completo todavía el año**.

## Qué ofrece la web

### 1. Menús semanales

- Cinco tarjetas, de lunes a viernes, **sin fechas**: los menús de un mismo mes están pensados para poder intercambiarse.
- Desayuno, comida, cena y postre cuando esté registrado. El **viernes tiene cena libre**, fuera del total nutricional mostrado; los postres no se inventan cuando no existen.
- Nombres breves e iconos en las tarjetas, y anillo de kcal del día frente a la **referencia visual de 1600 kcal**.
- Al tocar un día se abre un **resumen desplegable**: anillo de energía, gramos de proteínas/hidratos/grasas, barras de reparto energético y nombres simplificados de las ingestas.
- Desde ese resumen es posible **abrir directamente las recetas que tienen ficha**, sin ampliar la vista. El icono `maximize-2` lleva a la página completa del día; la X cierra el panel.

### 2. Día completo

Las rutas `menus/MM-N/<día>/` muestran las ingestas y sus valores registrados, además de los **grupos culinarios y componentes** de cada comida cuando constan en los datos. Las preparaciones enlazan a su ficha y hay navegación entre días.

La agrupación de componentes respeta la presentación registrada para cada **COMIDA**: no se deducen agrupaciones ni recetas a partir del texto.

### 3. Batch cooking

En la portada se construye automáticamente una **galería de fotografías** a partir de las preparaciones del menú con etiqueta funcional web `batchcooking` y, cuando corresponda, sus dependencias. Se evita duplicar una preparación dentro de una misma comida.

- Las miniaturas llevan a su receta.
- El nombre no ocupa una línea bajo la foto: aparece **sobre la imagen atenuada** al pasar el ratón, al enfocar con teclado o con el primer toque en pantallas táctiles; el segundo toque abre la receta.
- La disposición es adaptable: en vertical se aplica la regla editorial de 1, 2 o 3 columnas según cantidad; en escritorio y en móvil/tablet **horizontales** se usan hasta cinco miniaturas por fila, con ancho limitado y filas incompletas centradas.
- **No hay una colección de imágenes de batch cooking distinta de las fotografías principales.**

### 4. Recetario y fichas

- [Recetario](https://mirurecetas.github.io/menu-anual-recetas/recetario/) con búsqueda por nombre, descripción y etiquetas; carga inicial de diez resultados y opción de mostrar más.
- **Una ficha por receta** en `recetas/<slug>/`, con fotografía, ingredientes, raciones, elaboración, categoría, etiquetas y nutrición cuando exista.
- Selector de raciones para **escalar las cantidades visibles**, anverso/reverso en **modo cocina**, pasos marcables y temporizador.
- Marcado estructurado **Schema.org Recipe** para facilitar compartir/importar recetas desde el navegador, incluido el flujo de **Compartir → Bring!** en Android. La importación depende del comportamiento de Bring!; no existe una integración propia ni sincronización automática de listas de compra.

## Nutrición: significado de los indicadores

La web **presenta los valores publicados en los JSON**, sin sustituir los totales oficiales por cálculos nuevos.

| Elemento | Qué significa |
| --- | --- |
| Anillo de kcal | Kcal registradas del día frente a la referencia de **1600 kcal**. |
| Barras de proteínas, hidratos y grasas | **Porcentaje de energía calculada a partir de macronutrientes**, no porcentaje de una meta individual. |
| Gramos junto a cada barra | Cantidades de macros registradas para ese día. |
| Viernes | La cena libre **no** está incluida en las kcal y macros mostradas. |

Los porcentajes de las barras se obtienen aplicando **4 kcal/g** a proteínas e hidratos y **9 kcal/g** a grasas; se normalizan para que el reparto sume el 100 % de la energía calculada a partir de esos tres macronutrientes. Por ello, ese total energético puede no coincidir exactamente con las kcal oficiales registradas. **No hay objetivos independientes de P/HC/G** configurados.

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
  generar.py                 # Generador estático
  validar_menus.py           # Contrato de menús v2 y nutrición
  agrupar_componentes.py     # Agrupación editorial de COMIDA_ELEMENTOS
  exportar_airtable.py       # Exportación autenticada de menús calculados
tests/                       # Tests de datos y navegador
docs/
  NUEVA-RECETA.md
  IMAGENES-BATCHCOOKING.md
.github/workflows/
  validar-web.yml
  qa-navegador.yml
  publicar-recetas.yml

# Resultados generados: NO editar manualmente
index.html
recetario/index.html
recetas/<slug>/index.html
menus/MM-N/<día>/index.html
```

La **fuente de verdad de la publicación web** son los JSON de `datos/`, los archivos de `imagenes/`, las plantillas, el CSS/JS y el generador. El HTML generado se vuelve a crear a partir de esas fuentes.

## Cómo se actualiza el contenido

### Añadir o modificar una receta

1. Crear o actualizar `datos/recetas/<slug>.json`, respetando el contrato y los datos realmente disponibles. El `slug` debe coincidir con el nombre del archivo.
2. La categoría y las **etiquetas funcionales de la web** (por ejemplo, `batchcooking`, `congelable`, `tupper`, `rapida`) se asignan y mantienen en el **flujo especializado de creación/edición de recetas**. **No las gestiona Airtable ni el agente de imágenes**.
3. Generar y subir **una sola fotografía principal** a `imagenes/`. El campo `imagen` del JSON contiene **solo su nombre de archivo**, por ejemplo `bacalao-a-la-vizcaina.webp`. Se admiten JPG, PNG y WebP; la imagen referenciada debe existir para que la generación valide.
4. Esa foto se reutiliza automáticamente en la **ficha, el recetario y Batch cooking**. Sin imagen, la web puede mostrar un marcador provisional. No subir nuevas fotos a `imagenes/batchcooking/`: allí solo pueden quedar archivos históricos sin uso.
5. Validar y publicar el cambio mediante el flujo de GitHub. Revisar la ficha y sus enlaces públicos.

**Documentación relacionada:** [contrato de recetas](datos/FORMATO.md), [guía para incorporar recetas](docs/NUEVA-RECETA.md) y [contrato actualizado de imágenes](docs/IMAGENES-BATCHCOOKING.md). **Nota:** la guía de incorporación y el apartado histórico de menús de `datos/FORMATO.md` contienen indicaciones anteriores; para las **imágenes** prevalece el contrato único actual y para los **menús v2** prevalecen `scripts/validar_menus.py` y el JSON publicado.

### Añadir o modificar un menú

1. El contenido y los totales nutricionales se preparan/calculan en la base de trabajo correspondiente. Este repositorio **no recalcula por su cuenta** el valor nutricional de las comidas.
2. Publicar el menú como `datos/menus/MM-N.json`. El **formato vigente v2** contiene `schema_version: 2`, mes, número, ID del menú, estado calculado, **Lunes–Viernes**, desayuno, COMIDA, cena, postre opcional, nutrición de cada ingesta, totales diarios/semanales y componentes de presentación.
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
```

**Flujo habitual de publicación:**

1. Crear una rama, realizar cambios sobre archivos fuente y abrir un **pull request** hacia `main`.
2. Esperar las comprobaciones de [Validar web](.github/workflows/validar-web.yml) y [QA navegador MiruRecetas](.github/workflows/qa-navegador.yml). El QA ejecuta **Chromium/Playwright**, comprueba navegación y diseños en escritorio, tablet y móvil, vertical/horizontal, y adjunta capturas.
3. Fusionar tras las pruebas y verificar los archivos publicados. [Publicar recetas](.github/workflows/publicar-recetas.yml) se activa con cambios en datos, plantillas, scripts, CSS/JS, imágenes o su propio workflow: **regenera y guarda** `index.html`, recetario, fichas y menús en `main`.
4. GitHub Pages sirve los archivos generados en el [sitio público](https://mirurecetas.github.io/menu-anual-recetas/). Puede existir un pequeño retraso de publicación o caché del navegador. En cambios visuales puede requerirse renovar la versión de CSS/JS referenciada por las plantillas.

**Importante:** un cambio **solo en `README.md`** no dispara por sí mismo el workflow de regeneración HTML; esta documentación se consulta directamente en GitHub.

## Principios del proyecto

- **No inventar** recetas, ingredientes, cantidades, calorías, macros, grupos culinarios, enlaces o fotografías.
- Tratar los datos nutricionales oficiales como fuente; distinguir las **representaciones visuales** de los valores registrados.
- Mantener la separación de responsabilidades: **recetas/etiquetas**, **menús/nutrición**, **fotografías** y **web/publicación**.
- Priorizar una web **legible en móvil**, accesible, con menús intercambiables, fotografías coherentes y el mínimo mantenimiento duplicado.
- Comprobar la generación, las pruebas y la publicación antes de dar por terminada una modificación.
