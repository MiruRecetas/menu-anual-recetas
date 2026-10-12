# MiruRecetas · Protocolo vigente de mantenimiento y mejora de diseño web

**Revisado:** 11 de octubre de 2026 · **Ámbito:** nuevo chat especializado en desarrollo web del proyecto «Menú anual».
**Web:** https://mirurecetas.github.io/menu-anual-recetas/
**Repositorio:** https://github.com/MiruRecetas/menu-anual-recetas (rama `main`).
**Fuente pública del Investigador:** https://mirurecetas.github.io/menu-anual-recetas/indice-recetas.json

> **Prioridad documental:** este manual recoge decisiones ya implantadas y validadas durante la evolución de la web. Sustituye, para **mantenimiento y diseño del sitio**, las propuestas históricas del «Manual maestro de gestión y desarrollo web» del 10/10/2026 que contradigan el código actual. **Siempre se debe revisar `main`, sus contratos y sus tests antes de actuar.** Las cifras de inventario aquí mencionadas son fotografías del 11/10/2026, no constantes.

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

A 11/10/2026: hay 40 posiciones de menús v2 (septiembre a junio, cuatro por mes); **09-4** y **10-1** están **Calculado**, las demás **Pendiente**; `indice-recetas.json` contiene **26 recetas**. Consultar la publicación actual antes de repetir números.

La publicación pública es estática, sobre GitHub Pages. `scripts/exportar_airtable.py` **no sincroniza en continuo**: la exportación de menús se ejecuta a demanda y bajo autorización. Los datos nutricionales oficiales no se recalculan en el navegador.

## 3. Normas de producto que no se deben romper

### 3.1 Portada y tarjetas semanales

- Página `/`: «TU COCINA, A TU RITMO», «¿Qué cocinamos esta semana?», selectores de mes y menú, cinco días y galería de Batch cooking; el recetario completo está separado en `/recetario/`.
- Cinco tarjetas en escritorio con **anchura y altura idénticas**. Cabeceras **todas arriba**, de igual altura, con el nombre del día y anillo kcal alineados; comidas inmediatamente debajo, alineadas arriba. En días cortos puede sobrar espacio **abajo**. **Miércoles** debe caber en una línea sin aumentar la anchura de su tarjeta; aplicar reducción tipográfica coherente a todos los días.
- Adaptación responsive: **5 columnas** en escritorio ancho y en móvil/tablet horizontal desde 600 px, con cabeceras/anillos/textos compactos hasta 1090 px. Entre 600 y 799 px horizontales, el anillo va debajo del nombre del día. En vertical se conservan **2 columnas** en anchuras intermedias y **1 columna** en móvil; por debajo de 600 px horizontal se mantiene la disposición anterior para no forzar columnas ilegibles. Sin scroll horizontal. El panel individual conserva sus estilos y comportamiento.
- El anillo **monocolor** de las tarjetas semanales refleja `kcal registradas / 1600` y utiliza progreso **gris carbón `#454b4b`**, pista **`#dcddda`**, **no** terracota de hidratos. La tarjeta abre el resumen rápido. Desayuno, comida, cena y postre **solo si existe**; viernes noche libre.

Las frutas registradas como ingredientes directos se muestran con nombres breves en la semana y el resumen compacto: «Uvas», «Ciruelas» e «Higos». La abreviación se aplica por ID en la presentación, sin cambiar nombres canónicos, cantidades o nutrición. Los nombres de recetas y grupos culinarios se conservan.

En móvil vertical hasta 700 px, las tarjetas semanales usan tres columnas: día girado 90° a la izquierda con separador terracota; centro con cuatro posiciones de desayuno/comida/cena/postre, sin inventar ingestas ausentes; derecha con anillo y `panel-bottom-open` abajo. El centro se alinea en vertical. Las cinco tarjetas igualan automáticamente su altura a la mayor del menú, recalculando al cambiar anchura, tipografía o menú. Pulsar el icono o la tarjeta abre la misma ficha individual con animación desde abajo (sin animación con movimiento reducido). Horizontal, tablet vertical ancha y escritorio conservan el diseño anterior.

### 3.2 Ficha diaria compacta: diseño ya validado

Se abre en panel/bottom sheet, con cierre accesible, devolución de foco y botón «Ver día completo». Conservar **solo los nombres de platos**, sin desplegables ni cantidades de ingredientes. Para las preparaciones **realmente publicadas**, incluir una flecha **↗ independiente** enlazada a la receta, no convertir todo el nombre en hipervínculo. La visualización respeta los grupos y el orden exportados de Airtable.

Anillo nutricional idéntico al de la vista ampliada: progreso de kcal registradas frente a **1600 kcal** y, dentro del arco pintado, proporciones de energía calculadas por macros (P 4 kcal/g, HC 4 kcal/g y GR 9 kcal/g). Tres barras inferiores de **cumplimiento sobre objetivos diarios**: **93 g proteínas**, **147 g hidratos**, **65 g grasas**. La anchura visual de cada barra no supera 100 %, pero el porcentaje textual sí puede ser mayor de 100 %. No representar en estas barras porcentajes del reparto energético ni convertir las kcal oficiales en energía estimada por macros.

### 3.3 Ficha diaria ampliada

En `/menus/MM-N/<día>/`: línea de título con «OCTUBRE · MENÚ 1» **izquierda** y día **derecha**, sin párrafo redundante «Valores correspondientes...». Misma representación tricolor nutricional de la compacta; fichas de ingestas con nutrición registrada y **grupos/ingredientes desplegables** y enlaces de recetas.

Navegación táctil **limitada**: deslizar **derecha→izquierda** para avanzar de lunes a viernes, **izquierda→derecha** para retroceder de viernes a lunes. **No es circular**: al llegar a los extremos se detiene. No interferir con desplazamiento vertical ni interacción con controles. Mantener enlaces inferiores accesibles por ratón/teclado con nombres de los días.

### 3.4 Orden y contenido de COMIDA_ELEMENTOS

El grupo es **presentación editorial**, no una nueva preparación ni fuente nutricional. Agrupar por **`Visual · Grupo ID` dentro de cada COMIDA**. Ordenar grupos por **`Visual · Orden grupo`** y elementos por **`Visual · Orden elemento`**. Mostrar **`Visual · Nombre grupo`**. No ordenar por la cadena del ID ni deducir grupos por intuición.

**Caso obligatorio: cena del lunes de Octubre · Menú 1**, en este orden: 1) `plato-1`: **Carpaccio con parmesano y AOVE**, producto comercial completo con aceite incluido, sin duplicarlo; 2) `acompanamiento-1`: **Puerros con mayonesa**, 175 g de puerros escurridos + 10 g de mayonesa (desplegables solo en ampliada); 3) `plato-2`: **Bowl de yogur con miel y granola**, una ración **dentro de CENA**, no en Postre. Referencia de regresión: cena 847,04 kcal y semana 6685,88 kcal, salvo modificación posterior **autorizada** en la fuente oficial. No tocar valores por arreglos de interfaz.

### 3.5 Recetario y fichas

- `/recetario/`: buscador por título, descripción, etiquetas, 10 resultados iniciales + «Mostrar 10 más», miniaturas de fotografía principal, cabecera con **icono Lucide calendar-days** junto a «Mis menús» y **book-open** junto a «Recetario», igual que la portada y fichas de receta. **El script de Lucide debe estar cargado e inicializado**.
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
