# MiruRecetas · Procedimiento de estimación del aceite retenido en frituras

**Versión 1.0 · 12 de octubre de 2026**  
**Ámbito:** PREPARACIONES / PREPARACION_ELEMENTOS de Airtable y publicación nutricional de recetas.  
**Caso piloto:** «Tortilla de patata y cebolla», PREPARACIÓN `recSXvtjlxhcr6r2L`.

## 1. Principio y limitaciones

Cuando se fríen alimentos en aceite y se escurren, **ni el volumen inicial de la sartén ni todo el aceite sobrante equivalen al aceite ingerido**. En la receta se contabiliza una estimación explícita de la **fracción que permanece en el alimento una vez escurrido**, sin exigir que la persona pese el aceite antes o después de freír.

El aceite retenido varía con el alimento, grosor/corte, temperatura, tiempo, pérdida de agua, empanado/rebozado y escurrido/enfriamiento. **No existe un porcentaje universal que deba aplicarse a cualquier fritura**. Los estudios sobre patata crujiente, chips y patatas fritas emplean productos y denominadores de masa distintos, y **no validan directamente** la cifra para una tortilla doméstica.

La estimación es un **supuesto documentado y revisable**, no un resultado analítico medido.

## 2. Cálculo

```
masa_aceite_retenido_g = masa_cruda_frita_g * factor_retencion_pct / 100

cantidad_aceite_para_Airtable_ml =
    masa_aceite_retenido_g / densidad_aceite_g_ml
```

- `masa_cruda_frita_g`: suma de masas crudas comestibles de los alimentos tratados por esa fritura. No incluir huevos u otros alimentos que no se fríen en ese baño.
- `factor_retencion_pct`: estimación explícita para **ese alimento y esa técnica de escurrido**, expresada como porcentaje de la masa **cruda**, no de masa final frita.
- `densidad_aceite_g_ml`: necesaria si el INGREDIENTE aceite de Airtable está basado en `100 ml`. Aproximación práctica para AOVE: **0,91 g/ml**, revisable si se dispone de dato más pertinente.
- Cuando la ficha del aceite se exprese en `100 g`, registrar gramos, sin transformar a ml.
- Conservar el valor sin redondeo prematuro en el motor nutricional; `Cantidad` permite tres decimales.

Este método **estima la cantidad retenida**. No registrar además un segundo aporte de «aceite inicial» o «aceite sobrante». Los fritos industriales/comerciales que ya incluyen grasa en su composición no reciben automáticamente otro aporte por fritura.

## 3. Campos reales implementados en Airtable

Base `apprzwAwMVhkn3oHh`, tabla `PREPARACION_ELEMENTOS` (`tbl2FpmTvBgbzjZ1T`). Los campos siguientes se usan **solo en la fila de INGREDIENTE que representa el aceite retenido**:

| Campo | ID | Contenido |
|---|---|---|
| `Fritura · Masa cruda tratada (g)` | `fldIOKjqzadlO0b98` | Peso total crudo de alimentos fritos en esa operación |
| `Fritura · Retención estimada (%)` | `fldQd6M8oPAnSKUil` | Porcentaje estimado y justificado |
| `Fritura · Densidad aceite (g/ml)` | `fldMpI3DRXYB6VlQP` | Conversión a ml si corresponde |
| `TEC_Fritura · Aceite retenido calculado` | `fldzxf5xB98lVSd9w` | Resultado automático expresado en la unidad del elemento |
| `TEC_Fritura · Control aceite retenido` | `fldLIGgWQP5013kzs` | `No aplica`, `Coincide` o `Error: revisar aceite retenido` |

La fórmula `TEC_Ingrediente válido N0` (`fldtR5L07W39Q1OWx`) ahora exige `Coincide` para las filas con datos de fritura o `No aplica` para las demás. **Una discordancia superior a 0,05 unidades invalida el elemento de cálculo** en lugar de publicar nutrientes parciales.

**Procedimiento de registro para un nuevo caso:**
1. Seleccionar la ficha de INGREDIENTE del aceite empleado, respetando su base real (100 g o 100 ml).
2. Determinar masa cruda de los alimentos que se fríen, tipo de fritura y escurrido. Elegir un factor defendible *específico de ese caso*; anotar el criterio de estimación en la trazabilidad del procesamiento, no en las notas culinarias de la ficha.
3. Crear la fila de aceite en PREPARACION_ELEMENTOS con los tres campos de fritura, vínculo de INGREDIENTE y unidad compatible.
4. Leer `TEC_Fritura · Aceite retenido calculado`, copiar esa cantidad estimada (a tres decimales) a `Cantidad`; **nunca copiar el aceite inicialmente vertido en la sartén**.
5. Confirmar `TEC_Fritura · Control aceite retenido = Coincide`, `TEC_Estado elemento = Calculado`, `Estado cálculo = Calculado` en la PREPARACIÓN; comprobar los cuatro macros por ración.
6. Si cambia la masa cruda, el coeficiente o la densidad, **actualizar también `Cantidad` con la nueva estimación**. El control impide dar por correcto un desfase, pero esta sincronización no es automática; no afirmar lo contrario.
7. Comprobar repercusiones en preparaciones N1/N2, COMIDAS y MENÚS dependientes, así como en los JSON web publicados. Las fórmulas generales y la corrección del alcohol siguen siendo independientes.

Para una receta con varios grupos de fritura, usar una fila de aceite retenido por operación que requiera **factores distintos**. No aplicar el porcentaje dos veces si los mismos alimentos se escurren o doran posteriormente sin aceite nuevo.

## 4. Caso piloto: Tortilla de patata y cebolla

- Patata cruda: **500 g**.
- Cebolla cruda: **100 g**.
- Peso conjunto frito: **600 g**.
- Fritura seguida de **doble escurrido** y dorado/cuajado **sin aceite nuevo**.
- Factor de retención **provisional por convención de receta: 5 % del peso crudo conjunto**. No es una cifra experimentalmente demostrada para esta tortilla.
- Aceite estimado retenido: **30 g**.
- AOVE equivalente con densidad de 0,91 g/ml: **32,967 ml** (≈33 ml en la ficha web).
- El aceite registrado en el motor nutricional es solo esta cantidad retenida. No se anota el volumen usado para freír ni se presupone que todo el aceite vertido acaba en la tortilla.
- Cinco huevos M equivalen a **250 g comestibles** según la convención del proyecto.
- Dos raciones. La receta es N0, con patata, cebolla, huevo y una única fila de AOVE estimado; la sal sin dosificar es culinaria, no registro nutricional.

**Estimación calculada por Airtable en el alta:** por ración **513,05 kcal; 21,69 g de proteínas; 41,55 g de hidratos; 29,42 g de grasas**. Estos valores son una referencia del estado inicial; para futuras exportaciones consultar Airtable en vivo.

### Cómo expresar el aceite en la ficha pública

En el JSON visible se puede indicar «AOVE retenido tras la fritura (estimado) · aproximadamente 33 ml». Es una **estimación del consumo**, no una instrucción para cocinar solo con ese volumen. Los pasos de elaboración deben decir que se fríe en el aceite necesario y se escurre; no indicar una cantidad inicial inventada. No reflejar dos veces el AOVE en los ingredientes.

## 5. Investigación de respaldo y cautelas

Las publicaciones sobre la absorción de aceite en fritura destacan su dependencia de la estructura, del tiempo y del escurrido. Se utilizaron como contexto, **no** para presentar el 5 % de esta tortilla como coeficiente certificado:

- Ufheil, G. y Escher, F. (1996), *Dynamics of Oil Uptake during Deep-Fat Frying of Potato Slices*, LWT, DOI: 10.1006/fstl.1996.0097. https://www.sciencedirect.com/science/article/pii/S0023643896900973
- Pedreschi, F. y Moyano, P. (2005), *Oil uptake and texture development in fried potato slices*, Journal of Food Engineering, DOI: 10.1016/j.jfoodeng.2004.10.010. https://www.sciencedirect.com/science/article/abs/pii/S0260877404005059
- *Characterization of Oil Uptake and Fatty Acid Composition of Pre-treated Potato Slices Fried in Sunflower and Olive Oils*, PubMed PMID 32051358: https://pubmed.ncbi.nlm.nih.gov/32051358/
- *Modeling of oil dripping during deep-frying: New highlights to reduce oil uptake in fried products drastically* (2023), DOI: 10.1016/j.fbp.2023.02.005. https://www.sciencedirect.com/science/article/pii/S0960308523000160

**Regla de integridad:** si el factor no puede justificarse para un alimento distinto, no transferir automáticamente el 5 % de la tortilla. Investigar el caso y documentar el carácter estimado. La validación por masa y coeficiente garantiza coherencia aritmética, **no precisión empírica absoluta**.
