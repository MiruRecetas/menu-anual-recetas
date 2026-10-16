# MiruRecetas · Continuidad del agente operativo


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

## Estado de traspaso (histórico, verificar en vivo)

Septiembre · Menú 1, Airtable `recfpo1qbRxBv4GqD`, `datos/menus/09-1.json`: completo, Calculado y publicación HTTP verificada el 15/10/2026; PR #98 fusionada. Miércoles comida: Ensalada de pasta `rec7cskguZjENUCs9`; cena: `recYdSbO2NDeFYqWP`, con Gambones al horno (`plato-1`) y Berenjenas a la miel (`plato-2`), 1 ración de cada preparación. Melón 200 g lunes y miércoles; martes y jueves sin fruta ni postre; viernes cena libre. No duplicar estos registros. Septiembre · Menú 3 también quedó completo en este flujo. Octubre · Menú 1 lunes conserva 100 g de ciruela y 1 ración de bowl de yogur en campos separados de postre; el bowl ya salió de la cena. Todos estos estados requieren nueva lectura antes de cualquier cambio.

La corrección del 18 % de retención de aceite de berenjenas fue efectuada en el Work de recetas; en este flujo solo se releyó y propagó su cálculo. No asumir el 18 % como regla universal.

Septiembre · Menú 2: cierre registrado el 16/10/2026, Airtable `recszLULYqeN04sPl` Calculado. Viernes comida `recXcoZlCwROMqEVo`: 1 ración de «Bocadillo de solomillo y pimientos asados» `rec3tCt6wL2FcGwzt`, grupo principal. Miércoles conserva 1,5 raciones (3 galletas) y 200 ml de leche. Sin ingestas pendientes; viernes cena libre. Detalle y cuatro macros oficiales en `docs/REGISTRO-SEPTIEMBRE-2.md`.
