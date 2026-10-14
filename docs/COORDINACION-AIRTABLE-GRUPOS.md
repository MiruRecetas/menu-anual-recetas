# Agrupaciones visuales — esquema confirmado

Los campos ya están creados y gestionados por el chat Airtable. Esta versión reemplaza la solicitud anterior de crearlos.

Tabla COMIDA_ELEMENTOS: `tblmIe4WuNWF6aRLE`.

| Campo real | ID |
|---|---|
| Visual · Grupo ID | `fldw2WYRbyzv9qZmQ` |
| Visual · Nombre grupo | `fldcYMsUDmXNRnJfI` |
| Visual · Orden grupo | `fldXXebPlYFQh33co` |
| Visual · Orden elemento | `fldJdc8nbkoesAe6k` |

Casos ya configurados en Airtable: bacalao con patatas panadera y carrilleras al vino con boniato al horno.

El módulo `scripts/agrupar_componentes.py` organiza elementos por COMIDA, conserva no agrupados, admite cualquier número de grupos y orden estable, y rechaza identificadores duplicados o nombres contradictorios. No modifica nutrientes. Las pruebas están en `tests/test_agrupar_componentes.py`.

Pendiente: conectar extracción auténtica de Airtable, validar referencias y construir el JSON v2 y su interfaz. No publicar valores ejemplificativos como reales ni modificar la estructura de Airtable desde la web.

## Actualización de coordinación Bring! · 14/10/2026

Las pruebas aisladas 1–8 están consolidadas en [Maestro Bring! v2.0](bring/MAESTRO.md). La usuaria ha validado en Android la compra por ID con expansión recursiva, selector previo y redondeo final; nombres sencillos con características por comas, unión de variantes en cesta, stock e imagen de menú. El estado técnico, evidencia real y límites se documentan allí.

Esta actualización es documental. La integración permanente sigue pendiente de ejecución específica y coordinación de esquema/exportación/UI. No cambia cantidades, nutrientes, fórmulas, recetas, fotos canónicas o PWA por sí sola. La afirmación histórica de ausencia de integración propia se refiere a producción; los experimentos sí están publicados y validados.

Los grupos visuales ya son consumidos por el exportador auténtico actual; el pendiente histórico anterior no invalida su implementación posterior. Los nuevos campos de compra son Nombre de visualización y Descripción de compra en INGREDIENTES, descritos en [guía Airtable](bring/AIRTABLE-INGREDIENTES.md), pendientes de ejecución por su gestor. No crear nuevos grupos ni duplicar tablas para Bring!.
