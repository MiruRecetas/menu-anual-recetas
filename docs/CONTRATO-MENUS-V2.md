# Menús MiruRecetas: contrato v2 (octubre de 2026)

Los menús completos proceden de Airtable: MENÚS → COMIDAS → COMIDA_ELEMENTOS. No se inventan datos faltantes ni se publican menús incompletos.

## Archivo estático

`datos/menus/MM-N.json` con `schema_version: 2`, `mes` (septiembre-junio), `menu` (1-4), `airtable_menu_id` real, `estado: "Calculado"`, `dias` (solo Lunes-Viernes) y `nutricion_semana`. Cada día aporta `desayuno`, `comida`, `cena`, `postre` (objeto o null), `nutricion`.

Desayuno es un objeto de INGREDIENTE con `tipo: "ingrediente"`, `nombre`, `cantidad`, `unidad`, `nutricion`. Comida y cena contienen `comida_id`, `nombre`, `estado: "Calculado"`, `nutricion`, y `presentacion`. Viernes: `cena: {"estado":"libre"}`. Sin postre: `postre: null`.

Cada `nutricion`: `kcal`, `proteinas_g`, `hidratos_g`, `grasas_g` numéricos oficiales de Airtable. Los totales diarios y semanales se **verifican**, no se reemplazan ni se recalculan como fuente de verdad.

`presentacion` contiene `grupos` y `elementos_sin_grupo`. Cada grupo tiene `id`, `nombre`, `orden`, `elementos`; cada elemento posee `id` real de COMIDA_ELEMENTOS, `tipo` (preparacion o ingrediente), `referencia_id` real, `nombre`, `cantidad`, `unidad`; solo las preparaciones tienen `slug` de ficha existente.

El exportador debe usar `scripts/agrupar_componentes.py` con los metadatos visuales reales de Airtable:
- Grupo ID: `fldw2WYRbyzv9qZmQ`
- Nombre grupo: `fldcYMsUDmXNRnJfI`
- Orden grupo: `fldXXebPlYFQh33co`
- Orden elemento: `fldJdc8nbkoesAe6k`

Se valida con `scripts/validar_menus.py`. No debe agregarse a GitHub ningún JSON parcial, de muestra o con IDs inventados. No habilitar tokens en assets públicos.

## Compatibilidad

El generador sigue reconociendo v1 para no romper archivos heredados; las vistas nuevas solo presentan datos compuestos completos v2. Las fichas web `/recetas/<slug>/` continúan siendo independientes de las COMIDAS. Los datos de nutrición de la receta son diferentes de los totales de una COMIDA.

## Postres: contrato no excluyente vigente

`postre: null` si no hay ninguno; si existen, `postre: {"componentes": [...]}` con como máximo un `tipo: "ingrediente"` y un `tipo: "preparacion"`. Pueden coexistir. Se admiten objetos únicos históricos por compatibilidad.

El ingrediente usa cantidad y unidad g/ml y nutrición proporcional a su base de 100 g/ml. La preparación usa `raciones`, `estado: "Calculado"`, nutrición por ración × raciones y slug opcional de receta publicada. Se consultan ambos vínculos y Estado postre; ningún estado de error se publica como válido. Totales diarios y semanales integran ambos componentes una vez y siguen siendo los oficiales de Airtable.

En web se muestran Fruta/apple y Postre/dessert como secciones opcionales independientes (sin iconos en ampliada). La nomenclatura de campos y JSON se conserva.

## Aportes y enlaces de presentación

Los elementos pueden incluir su nutrición oficial de COMIDA_ELEMENTOS. El generador puede enriquecer únicamente la copia de presentación con aportes verificados de `presentacion/aportes-componentes.json` y enlaces exactos únicos a recetas existentes. No reescribe el JSON canónico ni reemplaza totales. Consultar el protocolo de mantenimiento para condiciones de validez y fallback pendiente.

## Publicación vigente

En menús parciales (`estado: "Pendiente"`), las cuatro fórmulas semanales de
Airtable permanecen vacías hasta completar las nueve comidas/cenas.
`nutricion_semana` contiene entonces exclusivamente el **subtotal** de los cinco
totales diarios oficiales leídos de Airtable, sin imputar ingestas pendientes.
No es un total semanal emitido por Airtable ni un menú completo. Al cerrar el
menú se exigen y conservan los cuatro totales semanales oficiales. Esta regla
no modifica fórmulas ni permite recalcular nutrientes de comidas en la web.

El exportador auténtico y menús calculados ya están publicados. Otros menús permanecen Pendiente: no confundir posiciones del calendario con semanas completas. Consultar los JSON actuales en cada sesión. Antes de fusionar comprobar estados, numeración, nutrición, grupos, enlaces, accesibilidad y aspecto visual con datos reales.

## Actualización de coordinación Bring! · 14/10/2026

Las pruebas aisladas 1–8 están consolidadas en [Maestro Bring! v2.0](bring/MAESTRO.md). La usuaria ha validado en Android la compra por ID con expansión recursiva, selector previo y redondeo final; nombres sencillos con características por comas, unión de variantes en cesta, stock e imagen de menú. El estado técnico, evidencia real y límites se documentan allí.

Esta actualización es documental. La integración permanente sigue pendiente de ejecución específica y coordinación de esquema/exportación/UI. No cambia cantidades, nutrientes, fórmulas, recetas, fotos canónicas o PWA por sí sola. La afirmación histórica de ausencia de integración propia se refiere a producción; los experimentos sí están publicados y validados.

El exportador actual también contempla menús parciales con estado Pendiente; no inventar sus ingestas para compra ni presentarlos como completos. Propuesta separada datos/compra/MM-N.json: versión propia, IDs, cantidades exactas, formatos, presentación y auditoría. No modificar schema_version 2 ni nutrientes del menú para introducir compra.


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
