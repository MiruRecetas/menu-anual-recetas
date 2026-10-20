# MiruRecetas · Protocolo vigente de mantenimiento y mejora de diseño web

**Revisado:** 13 de octubre de 2026 · **Ámbito:** nuevo chat especializado en desarrollo web del proyecto «Menú anual».
**Entrada corta:** https://mirurecetas.github.io/
**Web de menús y recetario:** https://mirurecetas.github.io/menu-anual-recetas/
**Repositorio:** https://github.com/MiruRecetas/menu-anual-recetas (rama `main`).
**Fuente pública del Investigador:** https://mirurecetas.github.io/menu-anual-recetas/indice-recetas.json

> **Prioridad documental:** este manual recoge decisiones ya implantadas y validadas durante la evolución de la web. Sustituye, para **mantenimiento y diseño del sitio**, las propuestas históricas del «Manual maestro de gestión y desarrollo web» del 10/10/2026 que contradigan el código actual. **Siempre se debe revisar `main`, sus contratos y sus tests antes de actuar.** El inventario se consulta en los JSON vigentes y en el índice público, no en cifras históricas de este manual.

## 1. Instrucciones para el nuevo chat

La usuaria espera ejecución real de cambios **autorizados** en la web: inspeccionar el estado actual del repositorio, modificar fuentes, probar, fusionar/publicar y verificar. **No limitarse a dar un prompt o ejemplos para que otro chat programe.** Preguntar únicamente por decisiones nuevas no aclaradas, por cambios que afecten datos o por bloqueos reales. Si solo se solicitan propuestas de diseño (p. ej. varias opciones de fondo), presentar opciones **antes** de editar GitHub y nunca tocar Airtable sin autorización.

El equipo web gestiona **HTML/CSS/JS, arquitectura de navegación, componentes, accesibilidad, rendimiento, generador estático, tests, documentación y despliegue**. Los equipos especializados gestionan recetas/etiquetas, menús/Airtable/nutrición y fotografías. El chat web puede **leer** dichos datos, pero **no** debe editar por su cuenta ingredientes, cantidades, aportes nutricionales, fórmulas, menús, slugs, categorías, etiquetas funcionales ni fotografías. La fuente real del contenido prevalece sobre la memoria conversacional.

## 2. Arquitectura y fuentes de verdad

| Área | Fuentes |
|---|---|
| Recetas | `datos/recetas/<slug>.json`, `datos/FORMATO.md`, `docs/NUEVA-RECETA.md` |
| Menús y agrupaciones | `datos/menus/MM-N.json`, `scripts/validar_menus.py`, `scripts/exportar_airtable.py`, `scripts/agrupar_componentes.py` |
| Fotografías | `imagenes/`, `docs/IMAGENES-BATCHCOOKING.md` |
| Generación | `scripts/generar.py`, `scripts/indice_publico.py`, `plantillas/*.html` |
| Diseño y comportamiento | `assets/estilo.css`, `assets/inicio.js`, `assets/dia.js`, `assets/recetario.js`, `assets/cocina.js` |
| Publicación y pruebas | `.github/workflows/validar-web.yml`, `qa-navegador.yml`, `publicar-recetas.yml`, `tests/` |

**No editar directamente HTML generado** (`index.html`, `recetario/index.html`, `recetas/<slug>/index.html`, `menus/MM-N/<día>/index.html`) ni el archivo **autogenerado** `indice-recetas.json`. Cambiar plantillas, assets o datos autorizados, regenerar y verificar.

No fijar como constantes el número de recetas ni las semanas calculadas. Los datos publicados y sus estados son la referencia; no presentar posiciones pendientes como menús completos.

La publicación pública es estática, sobre GitHub Pages. `scripts/exportar_airtable.py` **no sincroniza en continuo**: la exportación de menús se ejecuta a demanda y bajo autorización. Los datos nutricionales oficiales no se recalculan en el navegador.

## 3. Normas de producto que no se deben romper

### 3.1 Portada y tarjetas semanales

- Página `/`: «TU COCINA, A TU RITMO», «¿Qué cocinamos esta semana?», selectores de mes y menú, cinco días y galería de Batch cooking; el recetario completo está separado en `/recetario/`.
- Cinco tarjetas en escritorio con **anchura y altura idénticas**. Cabeceras **todas arriba**, de igual altura, con el nombre del día y anillo kcal alineados; comidas inmediatamente debajo, alineadas arriba. En días cortos puede sobrar espacio **abajo**. **Miércoles** debe caber en una línea sin aumentar la anchura de su tarjeta; aplicar reducción tipográfica coherente a todos los días.
- Adaptación responsive: **5 columnas** en escritorio ancho y en móvil/tablet horizontal desde 600 px, con cabeceras/anillos/textos compactos hasta 1090 px. Entre 600 y 799 px horizontales, el anillo va debajo del nombre del día. En vertical se conservan **2 columnas** en anchuras intermedias y **1 columna** en móvil; por debajo de 600 px horizontal se mantiene la disposición anterior para no forzar columnas ilegibles. Sin scroll horizontal. El panel individual conserva sus estilos y comportamiento.
- El anillo **monocolor** de las tarjetas semanales refleja `kcal registradas / 1600` y utiliza progreso **gris carbón `#454b4b`**, pista **`#dcddda`**, **no** terracota de hidratos. La tarjeta abre el resumen rápido. Desayuno, comida, cena, Fruta y Postre **solo si existen**; viernes noche libre.

Las frutas registradas como ingredientes directos se muestran con nombres breves en la semana y el resumen compacto: «Uvas», «Ciruelas» e «Higos». La abreviación se aplica por ID en la presentación, sin cambiar nombres canónicos, cantidades o nutrición. Los nombres de recetas y grupos culinarios se conservan.

En móvil vertical hasta 700 px, las tarjetas semanales usan tres columnas: día girado 90° a la izquierda con separador terracota; centro con cuatro posiciones de desayuno/comida/cena/postre, sin inventar ingestas ausentes; derecha con anillo y `panel-bottom-open` abajo. El centro se alinea en vertical. Las cinco tarjetas igualan automáticamente su altura a la mayor del menú, recalculando al cambiar anchura, tipografía o menú. Pulsar el icono o la tarjeta abre la misma ficha individual con animación desde abajo (sin animación con movimiento reducido). Horizontal, tablet vertical ancha y escritorio conservan el diseño anterior.

### 3.2 Ficha diaria compacta: diseño ya validado

Se abre en panel/bottom sheet, con cierre accesible, devolución de foco y botón «Ver día completo». Conservar **solo los nombres de platos**, sin desplegables ni cantidades de ingredientes. Para las preparaciones **realmente publicadas**, incluir una flecha **↗ independiente** enlazada a la receta, no convertir todo el nombre en hipervínculo. La visualización respeta los grupos y el orden exportados de Airtable. La regla de texto sin enlace y flecha independiente se aplica también a preparaciones sin grupo visual y al formato histórico de resumen; no conservar rutas alternativas con nombres subrayados.

Anillo nutricional idéntico al de la vista ampliada: progreso de kcal registradas frente a **1600 kcal** y, dentro del arco pintado, proporciones de energía calculadas por macros (P 4 kcal/g, HC 4 kcal/g y GR 9 kcal/g). Tres barras inferiores de **cumplimiento sobre objetivos diarios**: **93 g proteínas**, **147 g hidratos**, **65 g grasas**. La anchura visual de cada barra no supera 100 %, pero el porcentaje textual sí puede ser mayor de 100 %. No representar en estas barras porcentajes del reparto energético ni convertir las kcal oficiales en energía estimada por macros.

### 3.3 Ficha diaria ampliada

En `/menus/MM-N/<día>/`: línea de título con «OCTUBRE · MENÚ 1» **izquierda** y día **derecha**, sin párrafo redundante «Valores correspondientes...». Misma representación tricolor nutricional de la compacta. Las fichas muestran únicamente componentes, sin el título largo redundante de COMIDA/CENA. Un grupo de un solo elemento se presenta directamente con nombre, cantidad/raciones y aportes; una preparación publicada enlaza a su ficha sin desplegable. Los grupos de varios elementos despliegan composición y cantidades, manteniendo visibles sus aportes al cerrarlos.

Cada tarjeta lleva título abajo y kcal oficiales arriba en un lateral girado 90°, con separador terracota. Las kcal laterales usan Geist regular al 78 % del título. Los nombres destacan sobre los aportes pequeños; kcal de componentes en negrita y PR/HC/GR con sus colores oficiales. No incluir iconos de Fruta/Postre ni líneas divisorias internas.

Navegación táctil **limitada**: deslizar **derecha→izquierda** para avanzar de lunes a viernes, **izquierda→derecha** para retroceder de viernes a lunes. **No es circular**: al llegar a los extremos se detiene. No interferir con desplazamiento vertical ni interacción con controles. Mantener enlaces inferiores accesibles por ratón/teclado con nombres de los días.

### 3.4 Orden y contenido de COMIDA_ELEMENTOS

El grupo es **presentación editorial**, no una nueva preparación ni fuente nutricional. Agrupar por **`Visual · Grupo ID` dentro de cada COMIDA**. Ordenar grupos por **`Visual · Orden grupo`** y elementos por **`Visual · Orden elemento`**. Mostrar **`Visual · Nombre grupo`**. No ordenar por la cadena del ID ni deducir grupos por intuición.

**Caso de regresión según el JSON vigente de Octubre · Menú 1:** Cena del lunes contiene Carpaccio con parmesano y AOVE, seguido de Puerros con mayonesa. El producto comercial ya incluye su aceite; no duplicarlo. El bowl de yogur ahora está en Postre. La orden antigua de mantenerlo en Cena y sus totales históricos quedaron superados por los datos publicados; no trasladar alimentos por recuperar un ejemplo documental. El jueves, Tostas de hummus y sardinillas es una sola preparación, no dos platos independientes.

### 3.5 Recetario y fichas

- `/recetario/`: buscador por título, descripción, etiquetas, 10 resultados iniciales + «Mostrar 10 más», buscador alineado con ambos bordes del conjunto de tarjetas en móvil/tablet/escritorio (`catalog-search-tools`), miniaturas de fotografía principal, cabecera con **icono Lucide calendar-days** junto a «Mis menús» y **book-open** junto a «Recetario», igual que la portada y fichas de receta. **El script de Lucide debe estar cargado e inicializado**.
- `/recetas/<slug>/`: conservar selector de raciones, anverso/reverso, modo cocina, pasos y temporizador, etiquetas, fotografías válidas, enlaces entre preparaciones, nutrición por ración cuando exista y Schema.org Recipe; importación a Bring! dependiente del servicio, **no una integración propia**.
- Batch cooking: galería deducida de las etiquetas **web** `batchcooking` y dependencias reales, con deduplicación. **Una foto principal por receta** en `imagenes/`, compartida por ficha, recetario y Batch cooking. No crear imágenes independientes en `imagenes/batchcooking/`; no pedir a la usuaria que realice subidas que corresponden al agente de imágenes.
- Pie de **portada y recetario**: **«MiruRecetas · Menús estacionales, siempre reutilizables»**. Las fichas de día/receta tienen de momento otros textos explicativos; no afirmar que todos los pies están unificados.

## 4. Sistema visual y colores de nutrición

Paleta cálida y sobria: fondo crema `#f6f2eb`, superficies `#fffcf7`, tinta `#29352e`, verde de marca `#516f5d`, acento terracota de interfaz `#b96c4a`, tipografías **Bricolage Grotesque** para títulos y **Geist** para texto, tarjetas suaves redondeadas e iconos **Lucide**. Revisar legibilidad de móvil y contraste.

**Identidad inmutable de macros**, definida como variables CSS en `assets/estilo.css`:

| Macro | Color | Variable |
|---|---|---|
| Proteínas | Verde **`#748d76`** | `--macro-protein` |
| Hidratos | Terracota **`#b86f54`** | `--macro-carbs` |
| Grasas | Mostaza **`#d0a36e`** | `--macro-fat` |

Usar la misma asignación en **anillos y barras de las dos vistas diarias** y en **anillos y leyendas de las recetas**. **No usar malva ni intercambiar el mostaza/terracota**. No confundir los anillos de recetas, que representan **todo el reparto energético por ración** sin meta de kcal, con los del día, que representan avance a 1600 kcal.

## 5. Índice público del Investigador y documentación

El único catálogo público agregado para **Investigador MiruRecetas** es `indice-recetas.json`, generado **automáticamente** desde `datos/recetas/*.json` por `scripts/indice_publico.py` y `scripts/generar.py`. Incluye versión de esquema, SHA de **datos de origen** (no del commit que contiene el índice generado), fecha UTC, número de recetas, slugs únicos, categorías, ingredientes/cantidades y URLs. UTF-8, orden determinista, idempotencia; evitar ciclos de workflows. **El README solo enlaza al JSON; no regenerar catálogo de recetas en README.** El Investigador es de lectura; este equipo no lo modifica.

Documentos de referencia: `README.md`, `datos/FORMATO.md`, `docs/NUEVA-RECETA.md`, `docs/IMAGENES-BATCHCOOKING.md`. Si existen fuentes de proyecto antiguas (por ejemplo manual web del 10/10/2026), contrastar **cada propuesta** con implementación actual antes de aplicarla.

## 6. Protocolo de desarrollo y publicación

1. Consultar el repositorio y el último SHA de `main`, identificar fuentes y pruebas asociadas. No pisar commits concurrentes de otros especialistas.
2. Crear una **rama** con cambio mínimo y concreto; editar fuente, no HTML generado; si se modifica diseño actualizar `?v=...` en plantillas afectadas para evitar CSS/JS en caché.
3. Añadir/regenerar pruebas sobre comportamiento/estilos **reales**: responsive, orden, anillos, colores computados RGB, enlaces, accesibilidad, iconos, alturas y swipes; evitar pruebas basadas en serialización CSS que no es estable entre navegadores.
4. Abrir PR con alcance y límites. Esperar **Validar web** y **QA navegador MiruRecetas** ambos **completed/success**. Leer logs y corregir antes de fusionar si fallan.
5. Fusionar (habitualmente squash), revisar SHA. Esperar a `Publicar recetas` y su commit `Publicar páginas generadas`; comprobar que los HTML servidos por el repositorio están regenerados y usan la nueva versión de CSS/JS.
6. Comprobar páginas públicas y/o HTTP anónimo cuando sea posible; **no confundir PR fusionado o archivo en main con Pages actualizado**. Comunicar errores/retrasos de caché honestamente.
7. Entregar URL pública, PR, SHA y pruebas realizadas. Actualizar documentación solo si se modificó el contrato. No realizar cambios de Airtable ni valores nutricionales sin autorización.

Comandos orientativos: `python scripts/generar.py`, `python -m unittest discover -s tests -v`, `node --check assets/inicio.js`, `node --check assets/dia.js`, `node --check assets/recetario.js`, `node --check assets/cocina.js`. CI ejecuta Chromium/Playwright en varios tamaños, incluido móvil/tablet horizontal. Los cambios exclusivamente en README/docs **no** obligan a regenerar HTML; tampoco deben activar bucles de publicación por archivos generados.

## 7. Pendiente identificado, NO afirmar que está hecho

Los tres gráficos semanales ya están implementados debajo de los selectores: barras apiladas de kcal por día con línea fina discontinua a 1600 kcal; circular de variedad provisional por protagonista; circular de energía por ingesta semanal. La variedad real por ingredientes sigue pendiente de ampliar y coordinar la exportación. Consultar [GRAFICOS-SEMANA.md](GRAFICOS-SEMANA.md) para cálculos, límites y evolución. Los anillos diarios conservan su función.

Los cambios visuales exploratorios —p. ej. tres fondos para elegir— requieren aprobación **antes de editar** web o Airtable. No sustituir fotografías ni rediseñar otras pantallas sin encargo.

## 8. Mensaje para arrancar un nuevo chat de mantenimiento web

> Eres el chat dedicado exclusivamente a desarrollo, diseño y mantenimiento de MiruRecetas. Aplica este protocolo, revisa la rama `main` y la documentación actual, y **ejecuta** los cambios web que te autorice con GitHub, PR y pruebas, sin derivarme a otros chats. Conserva la ficha compacta validada, la ficha ampliada con swipes limitados, la semana de cinco tarjetas alineadas, la paleta de macros, el recetario y el índice JSON. No modifiques menús/Airtable/nutrición/recetas/etiquetas/imágenes sin autorización específica. Distingue explícitamente funciones publicadas de tareas pendientes. Pregunta solo por decisiones nuevas verdaderamente ambiguas.

### Ajuste de ficha ampliada · 12/10/2026

Las ingestas llevan un lateral con nombre abajo, kcal oficiales arriba, ambos girados 90° y separador terracota. Los componentes tienen nombres más destacados que sus aportes nutricionales. Los alimentos se abrevian por ID únicamente al mostrarlos, incluidos los desplegables; se eliminan marcas conservando el tipo de producto. Equivalencias visuales autorizadas: el pan de molde registrado de 36,5 g se muestra como 1 rebanada; el huevo registrado de 100 g como 2 unidades (50 g comestibles/unidad). Otras cantidades conservan g/ml cuando no hay equivalencia confirmada. No cambian datos canónicos, nutrición ni registros de Airtable.


## 9. Contrato de postres y aportes de presentación

Consultar ambos vínculos de MENÚS: `<Día> · Postre` (ingrediente, cantidad/unidad g/ml) y `<Día> · Postre preparación` (preparación, raciones). Se admiten ambos simultáneamente, solo uno o ninguno; como máximo un ingrediente y una preparación. No volver a imponer exclusión mutua. El exportador verifica Estado postre y no publica estados de error como válidos. El JSON vigente usa `postre: null` o `postre: {"componentes": [...]}`, manteniendo compatibilidad con objetos únicos históricos.

La semana y compacta muestran **Fruta/apple** para ingredientes y **Postre/dessert** para preparaciones, omitiendo cada sección ausente. En ampliada son secciones independientes sin iconos. La preparación solo enlaza si la receta está publicada. El ingrediente aporta su nutrición proporcional a 100 g/ml y la preparación la nutrición oficial por ración × raciones. Los totales oficiales diarios/semanales de Airtable se leen y verifican; no sustituirlos con cálculos de interfaz ni contar dos veces el mismo componente.

`presentacion/aportes-componentes.json` es una instantánea de aportaciones calculadas de COMIDA_ELEMENTOS, vinculadas por elemento, COMIDA, referencia, tipo, cantidad y unidad. `scripts/presentacion_diaria.py` prefiere aportes exportados y usa esa instantánea solo cuando toda la identidad coincide y el desglose concuerda con los cuatro totales oficiales (tolerancia 0,11). En caso incompleto/obsoleto se muestra «Desglose nutricional pendiente». El generador trabaja sobre una copia: no modifica menús ni convierte esa instantánea en catálogo de ingredientes.

Si falta slug en una preparación, `enrich_day` puede añadir el enlace en esa copia mediante nombre exacto normalizado y único en el catálogo publicado. Nunca enlazar ingredientes o deducir coincidencias parciales/ambiguas. Caso validado: tostas del jueves de Octubre · Menú 1. Mantener coherencia con la flecha de la compacta.

## 10. Cena libre y gráfico Energía diaria

El nuevo tratamiento solo se activa con `cena.estado === "libre"`. En compacta se conserva Cena y su icono moon, con «Noche libre» en banda salvia redondeada. En ampliada se conserva el lateral y separador, una tarjeta de menor altura y banda salvia con Lucide moon-star, «Noche libre» y «Sin planificación nutricional». No mostrar kcal, macros ni cantidades ficticias. Conservar las tarjetas semanales de viernes aprobadas.

En Energía diaria, los segmentos de macros siguen exactamente sus proporciones originales sobre las kcal registradas. Solo el viernes con cena libre se apila un tramo de referencia `Math.max(0, 1600 - kcalRegistradas)` gris #e4ded8, idéntico a daily-energy-track. Ese tramo tiene `data-remaining-kcal`, separado de los aportes oficiales: no entra en totales, circulares ni registros.

Las cifras reales se sitúan dentro de las barras cerca de su extremo superior; el viernes dentro del tramo nutricional real y la diferencia dentro del gris. Centrar y ajustar para cuatro dígitos en móvil, sin duplicarlas encima. Las ayudas accesibles llaman al gris «kcal restantes hasta la referencia de 1.600 kcal». Con 1600 o más no hay diferencia negativa ni tramo gris. La línea discontinua conserva valor, posición y estilo, sin etiqueta ni fondo. Variedad y energía por ingesta permanecen independientes; variedad por protagonista sigue siendo provisional.

## 11. Dos repositorios: raíz pública y aplicación

| Repositorio | Responsabilidad |
| --- | --- |
| `MiruRecetas/menu-anual-recetas` | Fuentes de recetas/menús, fotografías, generador y aplicación bajo `/menu-anual-recetas/`. |
| `MiruRecetas/mirurecetas.github.io` | Dirección raíz `https://mirurecetas.github.io/`. Pages: Deploy from a branch, main, /(root). Actualmente redirige a la aplicación. |

La raíz requiere el repositorio con el nombre exacto del sitio de usuario; otra rama main del repositorio de aplicación no resuelve el prefijo. Se creó y activó Pages por la usuaria; la publicación posterior se realizó mediante rama y PR. La redirección fija conserva parámetros/fragmento y sustituye historial con JavaScript; tiene meta refresh y enlace sin JavaScript. Se comprobó HTTP 200, archivo público idéntico al probado y destino disponible. El navegador termina mostrando la ruta canónica de la aplicación.

**Futura landing:** implementarla en el repositorio raíz, sustituyendo allí la redirección y enlazando al recetario/menús existentes. Es una posibilidad futura, no una landing ya publicada. No duplicar datos ni mover slugs/enlaces de la aplicación sin encargo. Consultar ambos main antes de cambios relacionados. El código raíz vigente se mantiene allí; `hosting/github-pages-root/` en la aplicación es el modelo preparado, no una sincronización automática entre repositorios.

La raíz tiene su propio workflow Validar acceso raíz: seis casos Chromium (390, 820, 1440 px, con/sin JavaScript) hasta la web real. Cambiar la futura landing exigirá adaptar esas expectativas de redirección. Mantener branch/PR, pruebas y verificación de Pages en cada repositorio. El conector permite escribir en repositorios existentes, pero no ofrece crear repositorios o activar Pages; ante una operación no disponible explicar el bloqueo concreto y solicitar únicamente la intervención necesaria, respetando autorizaciones ya dadas.

## 12. Verificación y coordinación aprendidas

No dar por completado un cambio solo porque se fusionó: diferenciar SHA de la corrección, commit de páginas generadas y despliegue público. Comprobar versión de caché, contenido servido y rutas destino. Si Pages falla con error de servidor 500, revisar logs y reintentar el trabajo fallido; no alterar datos o diseño para solucionar un fallo externo.

Las pruebas de navegador deben comprobar comportamiento y estilos computados, también casos límite y rutas de enlace reales. Al abrir una receta, distinguir `h1[itemprop="name"]` del título duplicado dentro del modo cocina oculto. Un fallo de selector de prueba se corrige en el test, no rediseñando la ficha. No anunciar pruebas locales de navegador si Chromium solo se ejecutó en CI.

Preservar commits concurrentes de los especialistas. No reexportar Airtable, cambiar recetas o fotografías para corregir presentación. Las equivalencias de unidades visibles son específicas y verificadas; mantener g/ml si no existe evidencia. No ampliar alcance con mejoras no solicitadas.


### Tarjeta nutricional desplegable · 13/10/2026

Después del selector de menú, el botón salvia «Ver información nutricional» / «Ocultar información nutricional» controla toda la tarjeta con `aria-controls` y `aria-expanded`. Empieza oculta en cada visita; la elección se conserva al cambiar de menú durante esa visita, sin persistencia adicional. Si no hay gráficos disponibles, el botón se desactiva. En tablet, escritorio y horizontal, los tres gráficos comparten superficie, borde y márgenes de tarjeta, conservando barras a la izquierda y circulares a la derecha (o su apilado responsive). En móvil vertical se conserva la tarjeta de dos caras y su giro, sin añadir otro marco. Es el mismo componente en web y PWA.


### Batch cooking en tablet vertical · 13/10/2026

En orientación vertical entre 701 y 1099 px, Batch cooking utiliza siempre cuatro columnas de miniaturas iguales, con independencia de la cantidad de preparaciones. La quinta pasa a la fila siguiente. Se conservan las tres columnas de móvil vertical hasta 700 px y la disposición de horizontal/escritorio. Este ajuste solo afecta al CSS de la galería, sin cambiar recetas, fotografías ni selección de preparaciones.

## Actualización de coordinación Bring! · 14/10/2026

Las pruebas aisladas 1–8 están consolidadas en [Maestro Bring! v2.0](bring/MAESTRO.md). La usuaria ha validado en Android la compra por ID con expansión recursiva, selector previo y redondeo final; nombres sencillos con características por comas, unión de variantes en cesta, stock e imagen de menú. El estado técnico, evidencia real y límites se documentan allí.

Esta actualización es documental. La integración permanente sigue pendiente de ejecución específica y coordinación de esquema/exportación/UI. No cambia cantidades, nutrientes, fórmulas, recetas, fotos canónicas o PWA por sí sola. La afirmación histórica de ausencia de integración propia se refiere a producción; los experimentos sí están publicados y validados.

Futura página de compra integrada desde el menú, con selector previo y payload público por selección. Mantener diseño/navegación responsive y funcionalidades actuales. No implementar con una segunda PWA ni editar HTML generado; seguir [guía de implementación](bring/IMPLEMENTACION-MANTENIMIENTO.md). Imágenes de menú y campos de ingrediente pertenecen a sus responsables.


## Temporizador de cocina aprobado · 19/10/2026

La esfera redonda, capas terracota/mostaza/salvia, edición central y controles Lucide sustituyen al temporizador de intervalos exclusivamente predefinidos en todas las fichas. Contrato vinculante, comportamiento y pruebas: [TEMPORIZADOR.md](TEMPORIZADOR.md). No añadir campos de tiempo externos ni una frase visible «Quedan…». El botón de reinicio pone a cero y el botón para detener el aviso aparece en el centro. Preservar este contrato al adaptar responsive, cocina o PWA.


### Cierre de validación del temporizador · 19/10/2026
PR #122 publicada y verificada por HTTP; la usuaria confirma a las 09:35 (España peninsular) que realizó todas las pruebas y funciona exactamente como quería. Temporizador aceptado físicamente en el entorno probado por ella; no inventar una matriz de dispositivos no comunicada. Mantener esfera/capas, edición central, controles, cero y parada central del aviso. Evidencia completa y límites en [TEMPORIZADOR.md](TEMPORIZADOR.md). No seguir marcando esta validación inicial como pendiente.


## Encabezado único del temporizador · 20/10/2026

El panel de cocina muestra únicamente «Temporizador» con su icono Lucide `timer`, usando el estilo `eyebrow` del antiguo rótulo «Herramientas de cocina»: tipografía de texto, tamaño pequeño, negrita, espaciado y mayúsculas visuales en terracota. Se elimina el rótulo genérico y el título grande duplicado. Se conserva su función accesible de encabezado de nivel 2. La regla reside en `plantillas/receta.html` y se aplica al regenerar todas las fichas existentes y a las futuras, en web y PWA y en ambas orientaciones. No cambia esfera, controles, sonido ni la validación funcional del temporizador.


## Integración económica · Fase 3.3

Contrato vigente en [COSTES-RECETAS.md](COSTES-RECETAS.md). Conservar el distintivo estático por ración, atribución y proyección mínima durante regeneraciones. No recalcular economía desde nutrición ni modificar costes manualmente. Cambios culinarios/nombre/raciones de una ficha con precio requieren revalidación privada; imágenes/descripciones/etiquetas no invalidan su identidad económica. El selector no escala precios. Misma PWA, política offline y temporizador; sin catálogo económico ni solicitudes de precios en cliente. Ante un vínculo incompatible, corregir la entrada validada antes de publicar, sin retirar importes para pasar CI.
