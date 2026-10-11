# MiruRecetas · Incorporación y publicación de recetas

**Guía operativa del flujo de creación/edición de recetas.** Contrato vigente de octubre de 2026.  
Repositorio: [MiruRecetas/menu-anual-recetas](https://github.com/MiruRecetas/menu-anual-recetas) · [Recetario](https://mirurecetas.github.io/menu-anual-recetas/recetario/).

Esta guía describe **recetas**, no la exportación de menús. Consulta primero la versión actual de [README](../README.md), [datos/FORMATO.md](../datos/FORMATO.md), `scripts/generar.py`, las fichas `datos/recetas/*.json` y [el contrato de imágenes](IMAGENES-BATCHCOOKING.md). Contrasta con `plantillas/receta.html` y `.github/workflows/publicar-recetas.yml` antes de publicar. No te bases en ejemplos o manuales históricos que contradigan `main`.

## Responsabilidades y fuentes de verdad

- **Flujo de recetas:** recopila o adapta la elaboración; registra/verifica ingredientes, cantidades y preparaciones N0/N1 en Airtable; obtiene de allí la nutrición calculada cuando proceda; crea/edita el JSON web; decide **categoría y etiquetas web** y verifica su publicación.
- **Airtable:** conserva las referencias nutricionales trazables y los vínculos entre preparaciones; no gestiona las etiquetas funcionales de las fichas web. La publicación web **no recalcula por sí misma** kcal/macronutrientes.
- **Agente de imágenes:** genera y publica **directamente en GitHub** la única fotografía principal de cada receta; tras verificar el archivo binario, actualiza **solo** `imagen` en el JSON. No pedir a la usuaria que descargue o suba fotografías manualmente; tampoco encargar al agente de imágenes modificaciones de recetas, etiquetas o nutrición.
- **Menús:** flujo independiente. Sus JSON `datos/menus/MM-N.json` usan **esquema v2** y se validan con `scripts/validar_menus.py`. Este procedimiento no los crea, edita ni cambia sus reglas de exportación.

## Alta o modificación de una receta

1. **Leer el estado de `main` y evitar duplicados.** Comprobar el slug, la receta actual si existe, sus referencias en Airtable y las subpreparaciones. No sobrescribir cambios concurrentes: releer el fichero y su SHA justo antes de modificarlo.
2. **Confirmar la receta real.** Nombre, raciones, ingredientes totales de la elaboración, pesos (por defecto **en crudo salvo indicación**), unidades, pasos y técnicas. Preguntar solo por datos esenciales ausentes; no inventar cantidades, tiempos, acompañamientos ni instrucciones no confirmadas. Las marcas comerciales verificadas permanecen en los registros internos; en el JSON visible usar denominaciones genéricas sin marca. Mostrar el aceite de oliva virgen extra como **AOVE** y la sal como «Sal» cuando corresponda.
3. **Registrar y calcular en Airtable.** Reutilizar fichas de ingredientes genéricos/comerciales y las preparaciones existentes. Documentar internamente equivalencias, estimaciones y fuentes, sin incluirlas en las notas visibles. En una receta N1, enlazar sus componentes N0/N1 como **una ración de la preparación** y evitar recalcular o duplicar esos ingredientes.
4. **Crear o editar `datos/recetas/<slug>.json`.** Respetar el contrato y el catálogo exacto de [datos/FORMATO.md](../datos/FORMATO.md). El `slug` debe coincidir con el nombre del archivo. Publicar nutrición `kcal`, `proteinas_g`, `hidratos_g`, `grasas_g` **por ración**, únicamente si está calculada/auditada. Si no, omitir `nutricion` y declarar el estado pendiente sin inventar valores. `descripcion`, `notas`, tiempos e `imagen` son opcionales.
5. **Clasificar la receta.** Una categoría culinaria de las diez vigentes y **exactamente una etiqueta de ingrediente principal** entre las siete disponibles; las etiquetas funcionales, si las hay, se colocan **antes** de la principal. Las etiquetas funcionales pueden estar ausentes: no atribuir «microondas», «congelable», «batchcooking» o «rápida» solo por posibilidad teórica. «Se puede comer frío» se reserva para preparaciones normalmente calientes que resultan agradables frías, no para salsas frías por naturaleza.
6. **Mantener notas de cocina, no de auditoría.** `notas` solo recoge consejos breves de elaboración, textura, presentación, conservación, recalentamiento o servicio. No insertar códigos de Airtable, referencias BEDCA/USDA, cálculos de aceite o alcohol, marcas, historia de decisiones, comentarios de la conversación ni estado de imágenes. Si no hay consejo útil, omitirla.
7. **Publicar los datos sin esperar fotografía.** El campo `imagen` se deja ausente o nulo **hasta que el archivo exista realmente** en `imagenes/`; la ficha mostrará «Fotografía pendiente». Avisar al flujo/agente de imágenes del slug. El agente publica el WebP binario, comprueba que está disponible y después enlaza su nombre simple, por ejemplo `hummus.webp`. **Una imagen sirve para ficha, recetario y Batch cooking**; no generar copias en `imagenes/batchcooking/`. Respetar fotos existentes.
8. **Validar y verificar publicación.** Usar el flujo de rama/pull request con comprobaciones, cuando corresponda. Tras fusionar en `main`, el workflow [publicar-recetas.yml](../.github/workflows/publicar-recetas.yml) regenera las páginas mediante `scripts/generar.py`. Comprobar el JSON, `recetas/<slug>/index.html`, la entrada del [recetario](https://mirurecetas.github.io/menu-anual-recetas/recetario/), el índice público autogenerado del README y la URL pública `https://mirurecetas.github.io/menu-anual-recetas/recetas/<slug>/`. Distinguir commit creado, HTML generado y acceso público real. No editar HTML generado manualmente.

## Ingredientes, subpreparaciones y salida web

Cada elemento de `ingredientes` tiene `nombre`, `cantidad` (número positivo) y `unidad` (texto). Para sal, hierbas o especias sin cantidad indicada se admite `{"nombre":"Pimienta negra","cantidad":null,"unidad":""}`: Bring! recibe solo el nombre. Un componente elaborado enlazado utiliza, por ejemplo:

```json
{"nombre":"Hummus","cantidad":1,"unidad":"ración","preparacion":"hummus"}
```

Así está registrada la dependencia en [Tostas de hummus y sardinillas](../datos/recetas/tostas-de-hummus-y-sardinillas.json), que apunta a [Hummus](../datos/recetas/hummus.json). La ficha enlaza la subreceta y el generador valida que exista; el JSON no expande ni duplica sus ingredientes. Las cantidades totales son para las **raciones base** de la receta; el selector web escala únicamente cantidades visibles. La importación vía **Compartir → Bring!** aprovecha Schema.org Recipe, pero depende del comportamiento de Bring!: no hay sincronización automática ni lista de compra expandida garantizada.

## Contrato de imagen único y coordinación

- Solo **una fotografía principal** por receta, almacenada preferentemente como `imagenes/<slug>.webp` (WebP binario auténtico, no texto Base64). Se reutiliza en ficha, recetario y miniatura de Batch cooking.
- `imagen` en JSON contiene **solo el nombre del archivo**, nunca `imagenes/` ni una URL. También se admiten archivos existentes `.jpg`, `.jpeg` y `.png` correctamente enlazados. El generador falla si se referencia un archivo inexistente.
- La fotografía se genera y sube mediante el **agente de imágenes**, no mediante una carga manual requerida a la usuaria. Primero subir/comprobar el archivo; **después** establecer `imagen`, sin tocar otros campos ni sobrescribir fotos existentes sin autorización.
- La selección de recetas de la galería Batch cooking utiliza la etiqueta exacta `batchcooking` de los JSON web y sus dependencias; **el agente de imágenes no asigna etiquetas**. Consultar [IMAGENES-BATCHCOOKING.md](IMAGENES-BATCHCOOKING.md).

## Comprobaciones antes de cerrar

- JSON válido; slug correcto; nombres y cantidades fieles; referencias a subpreparaciones existentes; categoría y etiquetas en vocabulario vigente; macros oficiales por ración; ninguna marca comercial en campos visibles.
- `notas` exclusivamente culinarias; imágenes ausentes o **realmente** enlazadas; fotografía única compartida por los tres usos.
- HTML generado sin errores, iconos de categoría/etiquetas, escalado de raciones, pasos, modo cocina/temporizador y Schema.org Recipe; comprobar móvil/tablet cuando las pruebas lo permitan.
- Enlace público comprobado; si la imagen está pendiente, informar **al agente de imágenes**, no solicitar subida manual. Comunicar bloqueos y verificaciones pendientes con precisión.

**Resultado al informar a la usuaria:** nombre, raciones, nutrición por ración y procedencia de cálculo, categoría/etiquetas, enlace público (solo si verificado) y estado de la fotografía («pendiente del agente de imágenes» o «publicada y verificada»). No tratar el estado de fotografía como dato culinario en `notas`.

Para el vocabulario completo, las condiciones de validación y la frontera respecto de menús v2, consulta [datos/FORMATO.md](../datos/FORMATO.md).
