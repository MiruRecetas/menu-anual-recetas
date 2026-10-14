# Prueba 4 — Septiembre · Menú 1

## Estado final de evidencia · 14/10/2026

La usuaria rechazó las tres variantes 4A/4B/4C: Bring! escalaba la cantidad inicial, pero las cantidades secundarias permanecían fijas. Se adoptó selector previo y necesidad real solo en página desde prueba 5. No reutilizar estos formatos como solución final.

Referencia vigente: [Maestro Bring! v2.0](../../../docs/bring/MAESTRO.md) y [guías de implementación](../../../docs/bring/README.md). El contenido inferior conserva el protocolo y estado en la fecha del ensayo; los pendientes históricos quedan actualizados por este apartado. No se cambian aquí generadores, snapshots ni payloads.

Autorizada el 14/10/2026: experimentación pública aislada con identidades Airtable, expansión recursiva, stock y unidades comerciales. URL: https://mirurecetas.github.io/menu-anual-recetas/experimentos/bring/prueba-4-09-1/

## Contrato y fuente

`entrada.json` es una instantánea obtenida mediante lecturas de MENÚS, COMIDAS, COMIDA_ELEMENTOS, PREPARACIONES, PREPARACION_ELEMENTOS e INGREDIENTES. Contiene únicamente vínculos, cantidades, unidades y referencias necesarias. `main_sha` identifica los JSON culinarios; `catalogo_blob` identifica la ficha comercial registrada de `MiruRecetas/datos-productos/productos.json`. No hay conexión, escritura ni sincronización automática con Airtable.

`generar.py` lee esa instantánea y escribe exclusivamente los cinco archivos generados de esta carpeta. No modifica generadores, fuentes, estilos, workflows, fotografías, nutrición, navegación o PWA de producción. No modifica las pruebas 1–3.

Expansión: cantidad del elemento × raciones solicitadas / raciones base en cada nivel. Agrupación de cantidades exclusivamente por `(ID del INGREDIENTE Airtable, unidad literal)`. No convertir g/ml, ni deducir equivalencias entre IDs distintos. Los nombres exportados son los de las fichas vinculadas; `itemId` del JSON nativo Bring! es el nombre, mientras el ID Airtable y toda trazabilidad permanecen en `calculo.json`.

El menú está incompleto: miércoles comida y cena ausentes. Sí incluye los dos postres de melón. Café de oficina excluido según la decisión previa; viernes cena libre no genera ingredientes. El ragú y el sofrito son dependencias culinarias expandidas, no artículos finales.

## Presentaciones y redondeo

Sumar cantidades exactas antes de calcular unidades y aplicar techo matemático. Mini tortillas: 25 g/unidad, arroz: 125 g/vasito, pan: 36,5 g aproximados/rebanada. Una burrata: 150 g escurridos aunque el envase con líquido sea 326 g; piquillos: usar 220 g escurridos/frasco y no 225 g netos. Las otras fichas comerciales usan su contenido registrado, incluido tarro Maille de 215 g. Los huevos (50 g comestibles/unidad) y ajo (3 g/diente) usan equivalencias documentadas por la tortilla y el pollo al limón; no es una conversión universal ni una equivalencia g/ml.

Las cantidades comerciales enteras conservan su unidad; las fracciones se redondean hacia arriba. Se conserva siempre la cantidad culinaria exacta en auditoría. Las cantidades de ingredientes genéricos en g/ml no se redondean a unidades de envase ficticias.

- 4A: `1 tarrina (17.5 g necesarios; 250 g por tarrina)`.
- 4B: `1 tarrina; necesario: 17.5 g; formato: 250 g`.
- 4C: `1 tarrina (0.07 tarrina necesarios; 17.5 g)`.

Los tres JSON declaran `yield: "1"` y usan enlaces con `baseQuantity=1&requestedQuantity=1`. Sus ingredientes y stock son idénticos; solo varía `spec`.

**Limitación deliberada:** el selector de Bring! puede multiplicar la compra ya redondeada. Para dos personas podría mostrar dos tarrinas y necesitar solo 35 g. No se implementa redondeo posterior en Bring!, ni se promete que el texto entre paréntesis o separadores escale. Esa es la prueba física pendiente. Importar cada variante como nueva receta, no reutilizar favoritos.

## Despensa

Sal, Pimienta negra, Salsa Worcestershire, Ajo en polvo y la etiqueta literal «Condimentos al gusto» proceden de los ingredientes no cuantificados de los JSON culinarios recorridos. Todos reciben `stock: true` y omiten `spec`; no se asigna cero. «Condimentos al gusto» no se traduce a especias inventadas.

Conforme al protocolo de recetas esos elementos no tienen enlaces Airtable: no se les inventan IDs ni se agregan aportes numéricos. Las etiquetas idénticas repetidas se reúnen en un único elemento de despensa por coincidencia literal, manteniendo los orígenes en la auditoría. Es una lista de comprobación sin cantidades, no agrupación numérica por nombre.

## Verificación

Desde la raíz del repositorio:

```sh
python experimentos/bring/prueba-4-09-1/generar.py
python experimentos/bring/prueba-4-09-1/generar.py --check
python -m unittest discover -s experimentos/bring/prueba-4-09-1 -p 'test_*.py' -v
```

Los tests verifican sumas de control, recursión/ciclos, identidad independiente del nombre, unidades incompatibles, stock, envases y reproducibilidad. CI existente de la PR comprueba regresión de la web/PWA; no ejecuta estos tests experimentales automáticamente ni acredita la lectura en Bring!. Se ejecutan también localmente. Antes del merge esperar «Validar web» y «QA navegador MiruRecetas» en verde. Después verificar HTTP público y comparar los tres JSON publicados con sus binarios locales.

No se cargan manifiesto, assets PWA ni service worker. La carpeta comparte origen con Pages: el service worker existente podría cachear una visita dentro de su ámbito. El aislamiento es de código, fuentes y navegación, no una política de caché en otro origen. No se borra ni modifica almacenamiento del usuario.

## Retirada

Eliminar exclusivamente `experimentos/bring/prueba-4-09-1/` mediante rama y PR; comprobar 404 público y continuidad de producción. Los favoritos guardados en Bring! permanecen en la app.

Estado inicial: prueba 4 física en Bring! pendiente; no confundir publicación HTTP ni tests automáticos con resultados reales.

