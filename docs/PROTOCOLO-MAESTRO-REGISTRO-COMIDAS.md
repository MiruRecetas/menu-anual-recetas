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
