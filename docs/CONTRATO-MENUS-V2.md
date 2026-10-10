# Menús MiruRecetas: contrato v2 (octubre de 2026)

Los menús completos proceden de Airtable: MENÚS → COMIDAS → COMIDA_ELEMENTOS. No se inventan datos faltantes ni se publican menús incompletos.

## Archivo estático

`datos/menus/MM-N.json` con `schema_version: 2`, `mes` (septiembre-junio), `menu` (1-4), `airtable_menu_id` real, `estado: "Calculado"`, `dias` (solo Lunes-Viernes) y `nutricion_semana`. Cada día aporta `desayuno`, `comida`, `cena`, `postre` (objeto o null), `nutricion`.

Desayuno y postre son objetos de INGREDIENTE con `tipo: "ingrediente"`, `nombre`, `cantidad`, `unidad`, `nutricion`. Comida y cena contienen `comida_id`, `nombre`, `estado: "Calculado"`, `nutricion`, y `presentacion`. Viernes: `cena: {"estado":"libre"}`. Sin postre: `postre: null`.

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

## Publicación pendiente

Falta la exportación auténtica, con mapeo comprobado de las columnas de MENÚS, COMIDAS y vínculos reales; el menú de octubre n.º 1 no se sustituirá por datos ilustrativos. Antes de fusionar: comprobar numeración, nutrición, grupos, enlaces, accesibilidad y aspecto visual con un menú exportado real.
