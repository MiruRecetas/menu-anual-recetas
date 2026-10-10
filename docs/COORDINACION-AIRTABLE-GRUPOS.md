# Coordinación Airtable → MiruRecetas (10-10-2026)

Este documento es un requerimiento para el chat responsable de Airtable. **No ejecutar modificaciones desde el equipo web.** Confirmar nombres/tipos actuales antes de añadir campos.

## Cambio solicitado: agrupaciones exclusivamente visuales

Tabla: `COMIDA_ELEMENTOS` (`tblmIe4WuNWF6aRLE`). Añadir campos **opcionales**:

| Campo propuesto | Tipo recomendado | Uso |
|---|---|---|
| Grupo visual | Texto corto | Clave estable idéntica en todos los elementos agrupados de una misma COMIDA; ejemplo `guarnicion-patatas-panadera` |
| Nombre grupo visual | Texto corto | Etiqueta culinaria consensuada, ejemplo `Patatas panadera` |
| Orden visual | Número entero | Orden estable de los componentes dentro de la COMIDA |
| Rol visual | Selección única, opcional | `principal`, `acompanamiento`, `otro` |

No crear tablas, COMIDAS, PREPARACIONES, ni duplicar INGREDIENTES. No cambiar relaciones, cantidades, unidades, fórmulas, rollups ni macros. Los metadatos afectan solamente al modo de mostrar la información en la web.

## Caso de aceptación prioritario

1. Localizar la COMIDA existente **Bacalao a la vizcaína con patatas panadera**.
2. Identificar los registros reales de COMIDA_ELEMENTOS para **200 g patata** y **5 ml AOVE**; comprobar sus IDs y vinculación a la misma COMIDA.
3. Asignar a ambos `Grupo visual = guarnicion-patatas-panadera` y `Nombre grupo visual = Patatas panadera`, con rol `acompanamiento` y orden coherente.
4. Mantener la PREPARACIÓN **Bacalao a la vizcaína** como entidad independiente, con su propio enlace a la ficha de receta.
5. Registrar las kcal/P/C/G antes y después de la modificación y demostrar que son **idénticas**.
6. Preparar un segundo caso explícito **Ensalada sencilla** (tomate, lechuga, cebolla, y aceite solo si está en los elementos). No atribuir nombres o agrupaciones inferidas sin confirmación.
7. Confirmar si se permite más de un grupo en una misma COMIDA y si hay grupos con un único elemento.

## Contrato de datos que necesita el exportador web

Por cada COMIDA: ID real, nombre, estado cálculo, macros oficiales, y lista ordenada de COMIDA_ELEMENTOS con: ID del elemento, tipo de entidad vinculada (exactamente una PREPARACIÓN o INGREDIENTE), ID original, nombre, cantidad y unidad, datos nutricionales calculados del elemento si están disponibles, además de los campos visuales anteriores. Preservar las referencias a PREPARACIONES anidadas. No ofrecer IDs ficticios, macros estimados o recetas inventadas.

Por cada MENÚ: ID, mes, número, estado, 5 desayunos, 5 comidas, 4 cenas, hasta 5 postres INGREDIENTE con cantidad/unidad y valores calculados de cada ingesta y día. Viernes cena **Libre**, y postres ausentes **null** (no 0). Comprobar el menú real `reci0EmSxZE2WlJ1K` (octubre · menú 1), sin copiar macros históricos como constantes.

## Entrega esperada del chat Airtable

Respuesta con nombres exactos y tipos de campos confirmados, IDs de los registros utilizados en los dos casos, valores anteriores/posteriores de los totales y cualquier particularidad del esquema. El equipo web implementará el exportador y representará los grupos sin modificarlos nutricionalmente.
