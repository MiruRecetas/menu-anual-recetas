# MiruRecetas · Protocolo maestro de registro y publicación incremental de menús

**Versión 2.0 · 11 de octubre de 2026.** Sustituye las partes obsoletas del «Protocolo maestro de registro de comidas y cenas» (v1.0) que indicaban que MENÚS aún no existía o que la publicación no correspondía a este flujo. Complementa, sin sustituir, el [protocolo de recetas](PROTOCOLO-MAESTRO-RECETAS.md), el [contrato web](../datos/FORMATO.md) y el código vigente de `main`.

## 1. Responsabilidad autónoma de este chat

El responsable de comidas/menús **ejecuta**, sin pedir una segunda autorización por cada operación ordinaria: interpretar la ingesta, consultar datos vivos, reutilizar o crear COMIDAS/COMIDA_ELEMENTOS, asignarla en MENÚS, comprobar cálculos en Airtable, actualizar `datos/menus/MM-N.json` en GitHub, validar y revisar la página generada. **Cada ingesta confirmada se publica individualmente**, sin esperar a completar el resto de la semana. Una corrección nutricional en ingredientes o preparaciones obliga a revisar y actualizar todos los menús publicados que dependan de ella. No asumir que los cambios de Airtable se reflejan automáticamente en GitHub.

La ejecución de recetas completas (PREPARACIONES y `datos/recetas/*.json`) también puede realizarse de manera autónoma cuando la usuaria aporta una receta definida, conforme al [protocolo de recetas](PROTOCOLO-MAESTRO-RECETAS.md). Las altas/auditorías de productos comerciales siguen el catálogo especializado: **nunca fabricar una ficha comercial ni sus macros**. Preguntar únicamente cuando falte información esencial o exista conflicto real de fuentes; no pedir confirmación de operaciones ya autorizadas por el procedimiento.

## 2. Fuentes, estructura y estado real

- Airtable, base `apprzwAwMVhkn3oHh`: MENÚS `tblBdMnjwXtWMEdNk`, COMIDAS `tblSv4yTF3731fclg`, COMIDA_ELEMENTOS `tblmIe4WuNWF6aRLE`, PREPARACIONES `tbl82iVr3ysnzTUit`, PREPARACION_ELEMENTOS `tbl2FpmTvBgbzjZ1T`, INGREDIENTES `tblJ7cjOhGBHLMWxv`.
- Repositorio `MiruRecetas/menu-anual-recetas`: fuente de menús en `datos/menus/MM-N.json`, exportador `scripts/exportar_airtable.py`, agrupación `scripts/agrupar_componentes.py`, validador `scripts/validar_menus.py`, generador `scripts/generar.py`, despliegue mediante `.github/workflows/publicar-recetas.yml`.
- Las fuentes de productos propios verificadas se consultan en `MiruRecetas/datos-productos/productos.json`. El registro web de recetas se rige por su protocolo separado.
- **Inspeccionar esquema y registros vivos antes de escribir**. Los campos y nombres históricos pueden quedar obsoletos. La publicación GitHub y el cálculo Airtable son sistemas distintos; reconciliarlos sin sobrescribir cambios concurrentes.

## 3. Calendario y desayuno universal

Se administran **40 menús**: septiembre a junio, cuatro menús intercambiables por mes y sin fechas fijas. Lunes a jueves: desayuno, comida, cena y postre opcional; viernes: desayuno, comida, postre opcional, **cena libre**. Fines de semana libres y fuera de las nueve comidas/cenas de planificación.

**Todos los desayunos de lunes a viernes, de todos los menús, enlazan al mismo ingrediente `Café con leche` de Octubre · Menú 1**, Airtable `recIa7zpasm2s0mgH`. La representación web vigente usa **130 ml** y los macros del registro verificado; reutilizar exactamente esa ficha, no crear otros cafés ni asignar una ingesta distinta. Comprobar que los nuevos menús heredan los cinco vínculos de desayuno. No alterar unilateralmente su composición nutricional.

Los postres se asignan por día al campo específico de MENÚS, **no** se cuentan de nuevo dentro de COMIDA_ELEMENTOS. Un postre ausente permanece `null`; no es obligatorio para cerrar las nueve comidas/cenas.

## 4. Registro de COMIDAS y agrupación visual

1. Buscar la COMIDA completa existente con **composición equivalente**. Si existe, reutilizar su enlace; si falta, crear COMIDA y sus COMIDA_ELEMENTOS.
2. Para cada elemento, usar **exactamente una referencia**: un INGREDIENTE cuantificado o una PREPARACIÓN calculada. Raciones de preparaciones: una ración significa cantidad `1`, unidad `ración`. No duplicar los ingredientes internos de una PREPARACIÓN en la misma COMIDA.
3. Registrar la presentación por grupos sin recalcular macros: `Visual · Grupo ID`, `Visual · Nombre grupo`, `Visual · Orden grupo`, `Visual · Orden elemento`.
4. Grupo principal: `principal` (orden 1); acompañamientos: `acompanamiento-1` (orden 2), `acompanamiento-2` (orden 3), etc. Para dos platos independientes completos pueden utilizarse `plato-1`, `plato-2`. Cada elemento dentro de un grupo comparte identificador/nombre/orden del grupo; el orden de elementos es individual.
5. Una COMIDA puede mezclar PREPARACIONES e ingredientes cuantificados con múltiples grupos. **Nunca crear PREPARACIONES artificiales solo para agrupar visualmente**. Si el usuario define una receta reutilizable completa, el protocolo de recetas indica cuándo crearla como PREPARACIÓN.
6. No inferir métodos culinarios, cantidades ni grupos no indicados. Pesos de ingredientes en crudo salvo indicación contraria. Dos huevos M pueden equivaler a ~100 g comestibles según el criterio documentado, manteniendo dos unidades en las instrucciones de la receta.

## 5. Condimentos deliberadamente sin cantidad

**Norma expresa y transversal del 11/10/2026:** si la usuaria incluye sal, vinagre, especias, hierbas u otros condimentos **sin cantidad**, esa omisión es deliberada.
- Mantenerlos en la receta web como `{"nombre":"Vinagre","cantidad":null,"unidad":""}` (análogo para Sal, especias y hierbas), y conservarlos en los pasos.
- **No** crear registros de INGREDIENTES, PREPARACION_ELEMENTOS o COMIDA_ELEMENTOS para estos condimentos; **no** imputar cantidades, calorías ni macros, ni exigir una dosificación.
- No afirmar científicamente que su aporte es cero; simplemente quedan **excluidos del cálculo por no estar cuantificados**, según decisión de la usuaria.
- Si posteriormente se facilita una cantidad, evaluar su incorporación nutricional normal.
- Ingredientes sí cuantificados (p. ej., AOVE, cebolla, pimientos, ajo pesado) deben conservar su aporte.

Ejemplo aprobado: **Vinagreta de pimientos y cebolla**, 1 ración: 10 ml AOVE, 20 g pimiento verde, 20 g pimiento rojo y **20 g cebolla**; vinagre y sal visibles sin cantidad y excluidos del cálculo. No utilizar los 29 g de cebolla inicialmente escritos y después corregidos.

## 6. Publicación incremental y cálculo

Tras enlazar la COMIDA en MENÚS, **volver a leer** PREPARACIÓN, COMIDA, elementos y menú; comprobar estado `Calculado`, cantidades, macros y total diario. Actualizar `datos/menus/MM-N.json` esquema v2 sin borrar ingestas previas ni otros cambios recientes. En un menú parcial, representar las ingestas no confirmadas por `{"estado":"pendiente"}`; la cena del viernes siempre por `{"estado":"libre"}`. Los totales diarios/semanales parciales suman **solo las ingestas confirmadas**, con aviso claro de que no es un balance completo; jamás inferir los valores faltantes. El campo `estado` del menú es `Pendiente` hasta que se cubran las nueve comidas/cenas; pasar a `Calculado` cuando Airtable confirme completitud. Postres opcionales sin asignar pueden permanecer `null`.

La nutrición oficial se obtiene de Airtable: kcal y gramos de proteínas, hidratos y grasas. El gráfico puede representar 4/4/9 para porcentajes energéticos, sin reemplazar el valor de kcal oficial. La web **no recalcula nutrición**. Al actualizar una PREPARACIÓN ya usada, **releer** la COMIDA y el menú dependiente, corregir los cuatro macros de comida, día y semana, y publicar el JSON actualizado. No deducir nuevos macros a partir de las kcal.

Antes de informar de publicación, comprobar el JSON fuente, los estados, las agrupaciones y los archivos HTML/índice generados en GitHub; intentar verificar GitHub Pages. Distinguir expresamente entre **JSON confirmado**, **HTML generado confirmado** y **página pública confirmada**. Si la generación aún está pendiente, no comunicar que la web pública está actualizada sin pruebas. La generación del sitio se activa desde cambios a datos/menús mediante su workflow. No modificar HTML generado manualmente ni asumir que la mera escritura del JSON lo ha regenerado.

## 7. Caso de control (Septiembre · Menú 4)

Menú Airtable `recavOScUQHdfVwro`, fuente `datos/menus/09-4.json`. Fue construido incrementalmente y completado con **1 ración de Ensalada campera** en la comida del viernes. Desayuno universal todos los días; cena viernes libre. La cena del lunes agrupa **Tortilla francesa de queso y pollo**, **Ensalada de tomate y cebolleta** (usar cebolla cruda como equivalencia autorizada) y **Patatas al horno**. La cena del miércoles agrupa **1 ración de Huevos rotos** como principal y **1 ración de Guisantes con jamón** como acompañamiento. Cuando se corrigió esa preparación, se actualizó la cena a **778,497106 kcal**, 37,94375 g proteína, 49,428 g hidratos y 45,7138 g grasas, y se propagó a los totales del día y la semana. Estos valores documentan el caso, pero **las cifras actuales deben volver a leerse en Airtable** ante cambios posteriores.

## 8. Lista mínima de verificación por acción

- Confirmar objeto exacto y existencia previa; conservar productos comerciales verificados, no duplicar.
- Registrar vínculos y grupos; releer estados y macros de Airtable.
- Conservar condimentos sin cantidades solo en la receta web.
- Actualizar JSON del menú afectado y referencias reales a slugs de recetas, sin inventar enlaces.
- Validar datos y revisar generación y disponibilidad; reportar exactamente qué se comprobó.
- Comunicar resumen de altas, nutrición, modificaciones y lo que permanece pendiente; no solicitar permiso para proseguir con operaciones ordinarias.

## Actualización de coordinación Bring! · 14/10/2026

Las pruebas aisladas 1–8 están consolidadas en [Maestro Bring! v2.0](bring/MAESTRO.md). La usuaria ha validado en Android la compra por ID con expansión recursiva, selector previo y redondeo final; nombres sencillos con características por comas, unión de variantes en cesta, stock e imagen de menú. El estado técnico, evidencia real y límites se documentan allí.

Esta actualización es documental. La integración permanente sigue pendiente de ejecución específica y coordinación de esquema/exportación/UI. No cambia cantidades, nutrientes, fórmulas, recetas, fotos canónicas o PWA por sí sola. La afirmación histórica de ausencia de integración propia se refiere a producción; los experimentos sí están publicados y validados.

La compra reúne ingredientes de todas las ingestas registradas, ambos postres y preparaciones recursivas. Los grupos visuales de COMIDA_ELEMENTOS no son nuevas entidades nutricionales ni claves de sumas de compra. Preservar ID, raciones, ingredientes y estados oficiales.


## Consolidación vinculante · 15 de octubre de 2026

Estas decisiones posteriores prevalecen sobre las reglas históricas incompatibles. Aplicarlas dentro del alcance del rol de cada documento: no convierten al planificador de solo lectura en agente operativo ni eliminan la validación inicial propia de productos comerciales.

### Fruta y postre simultáneos
MENÚS permite por día: ninguno, solo INGREDIENTE, solo PREPARACIÓN o ambos. Máximo un ingrediente y una preparación en sus campos respectivos. Queda revocada la exclusión mutua anterior.
- INGREDIENTE: `<Día> · Postre`, `Postre cantidad`, `Postre unidad` (g/ml); composición por 100 g/ml × cantidad/100.
- PREPARACIÓN: `<Día> · Postre preparación`, `Postre raciones`; composición por ración × raciones.
- Ambos se suman una sola vez en las fórmulas oficiales de Airtable. No crear una COMIDA artificial para unirlos ni sustituir fruta por preparación.
- JSON vigente: `postre: null` si faltan ambos; en otro caso `postre.componentes` contiene los componentes con `tipo: "ingrediente"` o `tipo: "preparacion"`, cantidades/unidad o raciones y nutrición oficial. Comprobar el contrato y exportador de main antes de escribir; no regresar al formato histórico excluyente.
- Web: secciones independientes **Fruta** (ingrediente, icono `apple` donde la vista use iconos) y **Postre** (preparación, `dessert` donde corresponda). Omitir cada sección sin componente. Enlazar una preparación solo si existe su ficha publicada. El cambio de presentación no cambia campos, cantidades ni totales.
- Comprobar `Estado postre` y la preparación calculada: nunca exportar como válido un estado de error.

### Registro, fuentes y reutilización
El agente operativo comprueba esquema y registros vivos, reutiliza ingredientes, preparaciones y COMIDAS de composición idéntica, y publica incluso menús parciales. Si falta un ingrediente genérico o fresco, debe resolverlo y crear su ficha trazable y su registro en Airtable: BEDCA primero y USDA cuando la referencia BEDCA falte o sea incompleta; equivalencias documentadas y datos desconocidos sin inventar ceros. No detenerse tras consultar solo BEDCA. Los productos comerciales propios pendientes de identificación/auditoría siguen su Work especializado; cuando estén registrados, releerlos e importarlos sin pedir que la usuaria repita datos.

Una preparación se contabiliza por sus raciones sin volver a sumar sus ingredientes. Los acompañamientos de ingredientes son COMIDA_ELEMENTOS independientes y se agrupan solo para presentación. Para platos independientes usar `plato-1`, `plato-2`, nombres y órdenes propios; no crear nuevas preparaciones para agruparlos.

### Cambios y dependencias
Al trasladar una preparación de cena a postre, conservar la fruta existente, retirar únicamente el elemento de esa cena y registrar las mismas raciones en el postre preparación. Revisar si la COMIDA está compartida antes de modificarla; conservar el total diario/semanal cuando solo cambia la ubicación. Releer cuatro macros en comida, día y semana y propagar cambios nutricionales reales a todas las dependencias publicadas. No reemplazar fórmulas ni recalcular los totales oficiales en la web.

La ficha de melón conserva su identidad técnica y nutrición; el nombre visible aprobado es **Melón**, sin «crudo (parte comestible)». Distinguir presentación de nombres técnicos, IDs, enlaces y cantidades.

No publicar una ingesta incompleta como calculada. Si una preparación está pendiente, registrar su composición y explicar la dependencia; publicar las ingestas ya validadas sin atribuirles macros parciales engañosos. El aceite de fritura retenido es un dato nutricional pendiente, no un condimento excluido deliberadamente. No extrapolar factores entre alimentos ni modificar la receta desde una cifra histórica.

### Autorización operativa y publicación
La usuaria confirmó expresamente el 15/10/2026 autorización continuada para registrar, validar y publicar comidas y menús en Airtable y `MiruRecetas/menu-anual-recetas`, mediante ramas, PR, comprobaciones, fusión y verificación pública. No volver a solicitar autorización para ese cometido. No amplía permisos a cambios ajenos, a otros repositorios ni a desactivar controles. Un rechazo automático real se explica con precisión; no se elude y se distingue de falta de autorización de la usuaria.

Continuar desde main y registros existentes, respetando trabajos concurrentes. Usar conector GitHub si el git local carece de autenticación. Verificar por separado Airtable, JSON GitHub, HTML generado, CI y HTTP público; commit o generación no prueban por sí solos publicación efectiva. Nunca afirmar pruebas físicas no realizadas. Mantener viernes cena libre, desayunos universales y postres opcionales.
