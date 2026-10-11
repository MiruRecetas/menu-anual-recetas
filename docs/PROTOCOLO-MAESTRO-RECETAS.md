# MiruRecetas · Protocolo maestro de procesamiento integral de recetas

**Versión 1.2 · 11 de octubre de 2026.** Fuente operativa del flujo de **creación, auditoría, actualización y publicación de recetas** del proyecto *Menú anual*. Esta versión incorpora las decisiones posteriores al documento maestro de 10/10/2026 y **sustituye sus instrucciones contradictorias**. Leer siempre las versiones de `main` de [NUEVA-RECETA.md](NUEVA-RECETA.md), [FORMATO.md](../datos/FORMATO.md), [IMAGENES-BATCHCOOKING.md](IMAGENES-BATCHCOOKING.md) y el código real del generador; las preferencias expresas más recientes de la usuaria prevalecen en su receta.

## 1. Alcance y fuentes de verdad

El flujo de recetas ejecuta el trabajo completo, no solo lo propone: interpreta la receta, audita referencias, registra ingredientes y preparaciones en Airtable, calcula las macros allí, publica el JSON en GitHub y verifica los resultados generados. **No** modifica menús, COMIDAS, fotografía binaria, diseños web ni catálogo comercial salvo una petición explícita que amplíe su alcance.

- Airtable: base `apprzwAwMVhkn3oHh`; INGREDIENTES `tblJ7cjOhGBHLMWxv`, PREPARACIONES `tbl82iVr3ysnzTUit`, PREPARACION_ELEMENTOS `tbl2FpmTvBgbzjZ1T`. Los esquemas, campos y fórmulas se consultan **en vivo** antes de escribir.
- GitHub: `MiruRecetas/menu-anual-recetas` publica fichas fuente en `datos/recetas/<slug>.json`; `scripts/generar.py` y `.github/workflows/publicar-recetas.yml` generan HTML e índice. No hay sincronización automática Airtable ↔ JSON.
- Productos específicos: `MiruRecetas/datos-productos/productos.json` es el catálogo comercial verificado. **No** dar de alta o alterar productos allí desde este flujo; sí enlazar un artículo verificado como INGREDIENTE en Airtable con su referencia `PROPIOS:<id>` y ficha de trazabilidad. Diferenciar ingrediente genérico de producto comercial realmente identificado.
- Fuentes nutricionales de consulta: BEDCA, USDA, AESAN y los protocolos de `MiruRecetas/motor-nutricional` y `datos-productos`. No alterar originales; no interpretar valores ausentes como cero ni completar micronutrientes sin fuente comprobable. BEDCA tiene prioridad para genéricos adecuados y USDA se emplea cuando no existe equivalencia BEDCA o como complemento validado.
- El agente **de imágenes**, separado de este flujo, genera el único `imagenes/<slug>.webp`, lo publica y después modifica **solo** `imagen`. La usuaria no tiene que descargar ni subir las fotografías. Conservar las existentes y no encargar al agente cambios nutricionales, ingredientes o etiquetas.

## 2. Interpretación fiel de recetas, cantidades y envases

1. Respetar nombre, raciones, ingredientes, reparto de aceite, tiempos, técnica, temperaturas y orden indicados. Admitir mejoras de redacción sin alterar la receta. El peso es **crudo** salvo indicación expresa; los gramos de pescado o conserva son comestibles/escurridos cuando así se documente.
2. Las cantidades son **totales para las raciones base** de la preparación, mientras que nutrición equivale a **una ración**. Evitar confundir una ración de una base interna con el rendimiento de la receta que la usa.
3. Unidades culinarias de la ficha web y masas del cálculo interno son distintas. **Dos dientes de ajo = 6 g comestibles estimados** en los ejemplos actuales: en Airtable se enlaza ajo por 6 g; en el JSON visible, `{"nombre":"Ajo","cantidad":2,"unidad":"dientes"}`. Nunca `"unidad":"g (2 dientes)"`: el selector escala números, no cadenas entre paréntesis. La elaboración puede mencionar «2 dientes (6 g)». La convención de 3 g/diente es una estimación y se revisa si la receta da otro tamaño.
4. Latas: recuperar el **formato exacto y peso escurrido por unidad** de la ficha comercial validada. Ejemplos del catálogo: atún claro al natural Mari Marinera (DIA), **60 g escurridos por lata**; aceitunas verdes rellenas de anchoa Vegcampo (DIA), **50 g escurridos por lata**. Airtable computa 60 g/50 g con `PROPIOS:<id>`; la ficha pública escribe `1 lata` y nombres genéricos, sin marcas. No deducir estos pesos para otros formatos.
5. El selector web de raciones debe concordar: `1 diente / 2 dientes`, `1 lata / 2 latas`, `1 ración / 2 raciones`, `1 unidad / 2 unidades`. Revisar `assets/cocina.js` y su comportamiento real. Los pasos y el Schema.org `recipeIngredient` conservan **cantidades base**: el selector solo altera cantidades visibles.
6. **Norma confirmada sobre condimentos deliberadamente sin cantidad:** sal, vinagre, especias, hierbas u otros condimentos expresamente citados sin dosificación permanecen visibles en la receta web como `cantidad:null, unidad:""` y en la elaboración; **no se crean como INGREDIENTES ni PREPARACION_ELEMENTOS en Airtable y se excluyen del cálculo nutricional**, sin suponer una cantidad, ni preguntar por ella. Excluirlos no equivale a afirmar que su aporte intrínseco sea cero. Los ingredientes cuantificados, incluido el ajo cuando está pesado, **sí** entran en Airtable. Ejemplo definitivo: vinagreta con 10 ml AOVE, 20 g pimiento verde, 20 g pimiento rojo y **20 g cebolla**; vinagre y sal sin cantidad.
7. Dividir el aceite en varias fases no implica añadirlo otra vez al cálculo. Ejemplo «Huevos rotos»: 20 ml AOVE totales, 10 ml patatas en airfryer a 180 °C durante 25 min y 10 ml huevos a la plancha; dos huevos M equivalen a **100 g comestibles estimados** en el cálculo, aunque la web muestra `2 unidades`.
8. Si un ingrediente comercial no está validado, no inventar marca, EAN, etiqueta o macros. Solo crear una ficha genérica con fuente válida cuando el alimento esté inequívocamente identificado como genérico; documentar la suposición y avisar si corresponde confirmar. Ejemplo: jamón serrano curado genérico no es una referencia comercial verificada.

## 3. Cálculo en Airtable y trazabilidad

- **N0**: ingredientes simples; **N1**: puede consumir preparaciones N0; **N2**: puede consumir preparaciones N1. **Los tres niveles ya se calculan** en Airtable. N3/superiores no están admitidos sin extender y probar fórmulas. No reutilizar la regla antigua de que N2 sea «necesita nivel 2».
- Cada PREPARACION_ELEMENTO debe vincular una sola preparación principal y **o** un ingrediente **o** una subpreparación, nunca ambos. Si el ingrediente existe, reutilizar ID; si se crea, guardar macros por 100 g/100 ml, procedencia exacta, estado, base de cálculo y ficha JSON trazable. Verificar que todos los elementos indiquen `Calculado`, que PREPARACIONES marque `Calculado`, que raciones y nivel sean correctos y que las cuatro macros se recomputen.
- **Bases internas**: «Sofrito clásico» es N0 en Airtable pero «N−1» es solo un apodo editorial. No tiene JSON ni slug de publicación. Rinde 4 raciones desde 300 g pimiento verde, 300 g rojo, 300 g cebolla y 30 ml AOVE: una ración son 75 g de cada verdura + 7,5 ml AOVE. El salteado de pollo usa 2 raciones de esa base + 300 g de pechuga (N1). Fajitas, cuscús y arroz con pollo pueden consumir el salteado publicado como subreceta (N2).
- Cambios autorizados de proporciones: Chili con carne (5 raciones) usa **3 raciones completas** de Sofrito: 225 g de cada verdura y 22,5 ml AOVE. Pisto (6 raciones) usa **6 raciones**: 450 g de cada verdura y 45 ml AOVE. Propagar cambios desde chili hasta burritos/pasta y desde pisto hasta wok, siempre tanto en Airtable como en los JSON públicos dependientes.
- **Alcohol de guiso**: conservar la ficha del vino; poner el tiempo de cocción con alcohol de la **preparación**. La fórmula aplica retención USDA aproximada y descuenta **solo** las kcal del etanol evaporado (7 kcal/g), nunca gramos de proteínas/hidratos/grasas; no descontar de nuevo en subpreparaciones. El ejemplo «Guisantes con jamón» usa 125 ml vino y 15 min de reducción **estimados**, no demuestra evaporación del 100 % del alcohol: que desaparezca el líquido libre no significa que haya desaparecido todo el etanol.
- Ante cualquier modificación, recorrer las preparaciones descendientes y sus JSON para evitar valores antiguos. No asumir que GitHub se actualiza al editar Airtable ni viceversa.

## 4. Fichas web: contrato estricto

- Solo editar `datos/recetas/<slug>.json`, no `recetas/<slug>/index.html`, `recetario/index.html`, `index.html` o `indice-recetas.json` generados. Campos obligatorios: `slug`, `nombre`, `raciones`, `ingredientes`, `pasos`. Campos opcionales según contrato: categoría, etiquetas, descripción, tiempos, notas, nutrición, imagen.
- **Nutrición**: publicar `kcal`, `proteinas_g`, `hidratos_g`, `grasas_g` **por ración**, a partir del cálculo auditado de Airtable. **Redondear cada cifra a dos decimales en el JSON público**; no copiar 15 decimales como ocurrió con la primera vinagreta. No redondear, alterar ni reescribir para ello las fórmulas/datos nutricionales internos de Airtable. Verificar también las cifras de Schema.org Recipe y la ficha HTML.
- **Interna ≠ pública**: las bases internas deben desplegarse en el JSON de la receta que las consume, agregando ingredientes iguales y sus cantidades; nunca enlazar `Sofrito clásico` sin ficha. Las **subpreparaciones publicadas** sí se muestran con `{"nombre":"Vinagreta de pimientos y cebolla","cantidad":1,"unidad":"ración","preparacion":"vinagreta-de-pimientos-y-cebolla"}`, o «Salteado de pollo y verduras» con su slug existente. La web no expande automáticamente subingredientes en Bring!.
- La elaboración debe indicar de forma coherente cantidades reales y técnicas (p. ej. si se cambia guisantes de 200 a 100 g, corregir **también** el paso). No añadir pasos o tiempos inventados; los que sean orientativos deben identificarse.
- La sección `notas` es **solo culinaria** (servicio, textura, conservación, recalentado), no auditorías de fuentes, marcas, IDs, cálculos ni estados de foto.
- No exhibir marcas comerciales en la ficha; AOVE es la denominación pública. El dato `imagen` solo se establece cuando el WebP/JPG/PNG binario ya existe. Una sola fotografía sirve ficha, recetario y Batch cooking.
- La categoría y los slugs de etiquetas se escogen exclusivamente del catálogo cerrado del contrato `datos/FORMATO.md`: **10 categorías**, **6 funcionales** y **7 principales**. Debe haber **exactamente una principal** y cero o varias funcionales, siempre antes de la principal.

## 5. Etiquetas: criterios y excepciones ya decididas

Las funcionales son `congelable`, `microondas`, `tupper`, `batchcooking`, `rapida`, `consumo-frio`. Son **independientes**:
- `batchcooking` significa poder preparar la receta o su base de modo útil para la organización; **no obliga** a `congelable`, `microondas` ni `tupper`.
- `microondas` exige un recalentado aceptable y no se deduce de «se puede calentar»; si la usuaria confirma expresamente su adecuación para una receta concreta, respetar su decisión.
- `tupper` indica adecuación para transportar y comer como táper; `consumo-frio` se reserva para platos habitualmente calientes que **también** se comen bien fríos, no para ensaladas normalmente frías.
- `rapida` se decide por el trabajo práctico y contexto culinario, sin inventar un umbral rígido solo con minutos de cocción; el tiempo pasivo de cocción puede coexistir con preparación rápida. **Una rectificación expresa de la usuaria prevalece** sobre la clasificación inicial.
- No asignar todas las etiquetas por defecto: cada una requiere justificación culinaria o confirmación explícita. Cambiar etiquetas implica actualizar **solo** el JSON fuente y verificar la ficha HTML, recetario y galería de Batch cooking cuando proceda.

**Precedentes expresos** (no generalizarlos a todas las recetas similares):
- Marmitako de bonito: `tupper`, `batchcooking`, `microondas`, `pescado`; el cambio de microondas fue solicitado expresamente, **no** se marcó congelable.
- Guisantes con jamón: `rapida`, `legumbres` **únicamente**; eliminar congelable, microondas, tupper, batchcooking por solicitud. Contenido vigente **100 g guisantes**, no 200 g, y volver a calcular macros.
- Ensalada campera: `tupper`, `batchcooking`, `rapida`, `pescado`. Su vinagreta es subreceta pública; las latas se muestran como unidades y se computan en gramos escurridos.
- Huevos rotos: solo etiqueta principal `huevos`; no asignar automáticamente etiquetas funcionales.
- Vinagreta de pimientos y cebolla: etiqueta principal `verduras`; una ración N0, 10 ml AOVE y 20 g de cada cebolla/pimiento, con sal/vinagre no cuantificados. Su ficha publica **95,47 kcal, 0,66 g PR, 2,89 g HC y 9,27 g GR** (dos decimales).

## 6. Fotografías, publicación y control de calidad

1. Leer la versión actual del JSON (y su SHA) **antes de modificar**, para no pisar actualizaciones concurrentes del agente de imágenes ni cambios de otras recetas. Alterar solo campos solicitados; conservar foto, nutrición, ingredientes, pasos y etiquetas cuando no se requiera cambiarlos.
2. Hacer el cambio en una rama y pull request cuando proceda; validar con los workflows de `main` y pruebas adecuadas. Tras merge, comprobar commit del JSON, HTML generado de la ficha, recetario, índice `indice-recetas.json` y, cuando sea accesible de verdad, GitHub Pages. El cambio solo documental no exige regenerar HTML.
3. Comprobar Schema.org `recipeIngredient` y `nutrition`, formato de unidades escalables, enlaces existentes y ausencia de foto inexistente. No decir «publicado y accesible en Pages» si únicamente se ha visto el archivo en GitHub; distinguir fuente guardada / página HTML generada / URL pública cargada en navegador.
4. Contar las recetas leyendo el índice **en ese momento**; no usar el último total como constante. Si una foto falta, dejar `imagen` ausente o `null` e informar «pendiente del agente de imágenes». No solicitar subidas manuales ni generar otra foto desde este flujo.
5. Si una receta dependiente cambia, verificar además que conserva correctamente el enlace a la subreceta y recibe las nuevas macros. Conservar trazabilidad y decisiones de equivalencia en Airtable/Git, no en notas visibles.

## 7. Cierre de cada tarea

Comunicar de forma breve y comprobable: receta y raciones; qué se creó o cambió realmente en Airtable (con nivel N0/N1/N2 y estado); nutrición por ración redondeada **para mostrar**; ingredientes o equivalencias pendientes; enlace web si existe; categoría y etiquetas; estado de fotografía y qué se verificó realmente (JSON, HTML, índice y/o Pages). Si algo falla, explicitarlo sin atribuirse verificaciones no efectuadas.

**Documento coordinado:** [Alta de recetas](NUEVA-RECETA.md) · [Contrato JSON](../datos/FORMATO.md) · [Fotografía y Batch cooking](IMAGENES-BATCHCOOKING.md) · [README](../README.md). La fuente de este protocolo es el repositorio; el documento antiguo adjuntado al Proyecto debe sustituirse por esta edición actualizada para evitar órdenes contradictorias.

## Integración con el flujo de menús

Cuando este chat también esté encargado de comidas y menús, aplicará el [protocolo v2 de registro y publicación incremental de menús](PROTOCOLO-MAESTRO-REGISTRO-COMIDAS.md): publicar cada comida completa tras validación en Airtable y GitHub, sin esperar a cerrar la semana. Las correcciones de preparaciones requieren revisar las COMIDAS/menús dependientes; no sustituir las cifras calculadas por estimaciones. La creación de recetas completas, su registro y publicación no debe esperar una solicitud adicional de la usuaria si ya ha facilitado los datos necesarios.
