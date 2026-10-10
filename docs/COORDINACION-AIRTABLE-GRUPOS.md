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
