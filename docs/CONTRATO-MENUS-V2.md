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

El exportador auténtico y menús calculados ya están publicados. Otros menús permanecen Pendiente: no confundir posiciones del calendario con semanas completas. Consultar los JSON actuales en cada sesión. Antes de fusionar comprobar estados, numeración, nutrición, grupos, enlaces, accesibilidad y aspecto visual con datos reales.

## Actualización de coordinación Bring! · 14/10/2026

Las pruebas aisladas 1–8 están consolidadas en [Maestro Bring! v2.0](bring/MAESTRO.md). La usuaria ha validado en Android la compra por ID con expansión recursiva, selector previo y redondeo final; nombres sencillos con características por comas, unión de variantes en cesta, stock e imagen de menú. El estado técnico, evidencia real y límites se documentan allí.

Esta actualización es documental. La integración permanente sigue pendiente de ejecución específica y coordinación de esquema/exportación/UI. No cambia cantidades, nutrientes, fórmulas, recetas, fotos canónicas o PWA por sí sola. La afirmación histórica de ausencia de integración propia se refiere a producción; los experimentos sí están publicados y validados.

El exportador actual también contempla menús parciales con estado Pendiente; no inventar sus ingestas para compra ni presentarlos como completos. Propuesta separada datos/compra/MM-N.json: versión propia, IDs, cantidades exactas, formatos, presentación y auditoría. No modificar schema_version 2 ni nutrientes del menú para introducir compra.
