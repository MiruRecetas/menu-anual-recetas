# Prueba 6 — Octubre · Menú 1

URL: https://mirurecetas.github.io/menu-anual-recetas/experimentos/bring/prueba-6-10-1/

Autorizada el 14/10/2026 para contrastar con octubre el procedimiento adoptado después de prueba 5. Selector autónomo 1–20 porciones; no modifica registros, Airtable, recetas, menús, PWA, workflows o pantallas de producción. Todos los archivos están dentro de esta carpeta y pueden retirarse conjuntamente.

## Evidencia previa y correcciones

La usuaria confirma que prueba 5 funciona perfectamente en su Bring! y adopta ese procedimiento. Señala dos errores de salida: anchoas genéricas sin redondear y «Necesidad real» con seis decimales. Se corrigen en la carpeta experimental de septiembre: 4 porciones = 113,3 g visibles y 120 g exportados; 5 = 141,7 g visibles y 150 g exportados. La precisión interna sigue siendo exacta. La captura adjunta muestra el caso de 5 porciones.

La usuaria confirma la importación real de prueba 6 en Bring! para 1 y 3 porciones y aporta capturas. No extrapolar a otras plataformas. Solicita después que miel, tahini y salsa de soja sean siempre stock: true: se aplica por ID Airtable en esta carpeta experimental, conservando cantidades y nombres. Esta nueva clasificación requiere una nueva importación; no cambia listas ya importadas.

## Datos e identidad

`entrada.json` contiene una nueva instantánea de lectura de Airtable y referencias del catálogo comercial vigente. `main_sha`, `catalogo_blob` y `recetas_blobs` identifican las fuentes culinarias consultadas. No existe sincronización automática ni escritura en esos sistemas.

Se recorren todas las ingestas de lunes a viernes, también el postre de lunes compuesto por fruta y el bowl de yogur registrado, y la fruta del martes. Café de oficina excluido y viernes cena libre. Bacalao de lunes/miércoles se cuenta dos veces; carrilleras se consumen directamente y dentro de canelones. Quiche usa dos raciones. Las recetas anidadas se expanden hasta ingredientes; el sofrito interno también se abre aunque no tenga ficha web.

Sumar exclusivamente por ID de INGREDIENTES/unidad literal. No convertir g/ml ni unir IDs distintos por parecido de nombres. Cada componente se multiplica por raciones usadas/raciones base en todos los niveles. Ninguna subpreparación figura como artículo final.

## Cantidades y envases

Calcular cantidades exactas → sumar por ID/unidad → multiplicar por porciones seleccionadas → convertir a presentación comercial verificada → redondear al entero superior. Las cantidades ya enteras permanecen enteras. Para todo ingrediente en g/ml sin presentación unitaria verificada, aplicar decena superior tras el escalado, incluidas conservas genéricas; una decena exacta se conserva. «Necesidad real» tiene cero o un decimal solo para mostrar, sin alimentar cálculos.

Los formatos comerciales proceden de la ficha vinculada por `PROPIOS:<id>`. Las referencias derivadas de boquerones/sardinillas se resuelven con un mapa explícito por ID Airtable, no cortando sufijos para afirmar equivalencia por intuición: boquerones 100 g escurridos usan 250 g escurridos/envase, y sardinillas 58 g escurridos usan 163 g escurridos/lata. Se conserva el criterio nutricional previo de cada ficha derivada sin recalcularlo ni añadir su aceite de cobertura como nuevo ingrediente. El carpaccio completo usa el formato modelado 120 de la ficha original como un envase completo; no se suma otra vez su queso/aceite.

Pan Oroweat usa rebanadas de 36,5 g aproximados; mini tortillas 25 g/unidad; yogur 125 g/vasito. Los demás comerciales sin unidad individual usan el contenido del envase registrado. Huevos: cuatro huevos equivalen a 200 g comestibles en la quiche, por lo que 50 g/unidad es una equivalencia explícita. Ajo se mantiene en gramos: las recetas de octubre documentan tamaños de diente diferentes (2,7 y 3 g); no se impone una equivalencia universal.

Stock: AOVE, miel (`recGpy51QX8MYe0j9`), tahini (`rechMDQXS4hW2JBYg`) y salsa de soja (`recpst98trSqZIPSe`) siempre true, independientemente de las porciones y de su nombre. Condimentos sin cantidad true, sin spec. Comino y pimienta cuantificados se conservan como despensa con su cantidad de compra. Cuando la etiqueta literal «Pimienta negra» ya aparece como artículo cuantificado de despensa, se evita un segundo elemento sin cantidad: no se suma ni modifica su cantidad, y sus orígenes culinarios sin peso se conservan en auditoría.

## Selector y exportación

`exports/N.json` declara `yield: "N"` y el enlace correspondiente lleva `baseQuantity=N&requestedQuantity=N`. La lista ya corresponde a ese rendimiento; no hay multiplicación adicional en el enlace. Spec contiene solo número y unidad; la necesidad real permanece en la página para comprobar existencias domésticas. Para cambiar personas volver a la página e importar otra vez; cambiar dentro de Bring! puede multiplicar cifras ya redondeadas.

## Verificación y retirada

```sh
python experimentos/bring/prueba-6-10-1/generar.py
python experimentos/bring/prueba-6-10-1/generar.py --check
python -m unittest discover -s experimentos/bring/prueba-6-10-1 -p 'test_*.py' -v
```

Tests verifican sumas de control (400 g bacalao/carrilleras/patata; 2 huevos), expansión del bowl y bases internas, tamaños escurridos, escalado antes de redondear, necesidad visual de un decimal, stock, identidad y unidades, ciclos e inputs. CI existente acredita regresión de web/PWA, no el importador Bring! ni la página experimental automáticamente. Verificar selector público, HTTP y JSON tras PR/CI/merge.

No se cargan recursos, almacenamiento, manifiesto ni registro service worker compartidos. La prueba comparte origen Pages; el service worker existente podría cachear visitas dentro de su ámbito. No se cambia ni purga almacenamiento. Retirar eliminando solo esta carpeta mediante rama/PR y comprobar 404 y continuidad de producción; favoritos Bring! permanecen.
