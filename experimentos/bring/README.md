# Prueba temporal Bring! — Octubre · Menú 1

Autorización: página pública aislada para probar importación con Bring!, sin diseño definitivo y sin modificar las pantallas, fuentes de recetas/menús, fotografías ni comportamiento PWA.

URL: https://mirurecetas.github.io/menu-anual-recetas/experimentos/bring/10-1/

Base consultada: `02d81e09f2d1eb071e201fa4537a92ccfb456347` (main).

## Alcance y reproducción

- `generar.py` es independiente del generador de producción. Lee exclusivamente los JSON públicos del menú y sus recetas; escribe únicamente `experimentos/bring/10-1/index.html` y `calculo.json`.
- La prueba es una instantánea: no se regenera automáticamente con publicaciones de recetas. `calculo.json` identifica las fuentes mediante SHA-256 y permite detectar cambios.
- Título importable: **Menú 1 - Octubre**; autor MiruRecetas; descripción con las ingestas de cada día; rendimiento **1**: menú semanal completo para una persona. Se incluyen desayuno, comida, cena y los postres presentes; viernes noche libre no añade ingredientes.
- Recorrer cada ingesta y preparación por las raciones reales del menú, expandiendo referencias con `cantidad × raciones_solicitadas / raciones_base`. Detectar ciclos y preparaciones inexistentes. Una preparación repetida en dos días aporta ambos usos; una preparación anidada aporta solo los ingredientes requeridos por esa referencia.
- Resolver el slug ausente de las tostas del jueves por nombre completo normalizado y único en las recetas publicadas.
- Sumar nombres exactos y unidades compatibles; única equivalencia de unidades de conteo aplicada: dientes de ajo, singular/plural y anotación publicada de 2,7 g. No convertir g/ml ni inferir sinónimos/productos. Conservar aparte cantidades conocidas y desconocidas. Los productos compuestos comerciales y el café de oficina siguen siendo ingredientes, no preparaciones web desglosables.
- JSON-LD y microdatos describen los mismos ingredientes visibles. No se inventan una imagen de menú, tiempos de cocina ni nutrición. Los pasos importables son el resumen de las ingestas reales, enlazados a los días publicados.
- No se carga CSS/JS compartido, manifiesto o registro PWA; no se inserta en recetario, portada ni navegación principal. `noindex, nofollow` evita solicitar indexación; la URL sigue siendo pública.
- No existe todavía un enlace público directo que seleccione octubre/1 en portada: la selección de producción usa `localStorage`. **Ver receta en Bring! tiene como destino previsto esta página de prueba.** Su enlace «Ver Octubre · Menú 1» guarda la selección existente y abre la portada. Se debe observar si Bring! conserva la URL y abre el navegador/PWA. No se modifica la selección hasta pulsar ese enlace.

Desde la raíz del repositorio:

```sh
python experimentos/bring/generar.py
python experimentos/bring/generar.py --check
python -m unittest discover -s experimentos/bring -p 'test_*.py' -v
```

La publicación usa el Pages existente desde `main`, después de una PR y los checks actuales. No necesita modificar workflows ni regenerar páginas de producción para incluir esta carpeta.

## Prueba real pendiente en Bring!

1. Abrir URL en el navegador y compartir **la URL** con Bring!, usando Compartir del navegador. Probar por separado el botón Compartir de la página y el enlace directo oficial con `baseQuantity=1&requestedQuantity=1`.
2. Comprobar fuente MiruRecetas, título, descripción y **1 porción** inicial. Guardar en favoritos.
3. Confirmar que no aparecen Salsa vizcaína, Hummus, Pisto, Falafel, Tzatziki, Bechamel o Carrilleras al vino como artículos: deben figurar sus ingredientes reales.
4. Referencias de control a 1 persona: bacalao 400 g (lunes+miércoles), carrilleras 400 g (martes+canelones), patata directa 400 g, huevos M 2 unidades (dos raciones de quiche), leche semidesnatada 83,333333 ml (bechamel), yogur 1,5 unidades de 125 g; AOVE 55 ml y 12,5 g permanecen separados. Aceite de oliva virgen extra 15 ml tiene nombre distinto en la fuente y se mantiene aparte.
5. Pasar a 2 porciones: bacalao y carrilleras 800 g cada uno, patata 800 g, huevos M 4, yogur 3 unidades de 125 g; observar redondeos y unidades de Bring!.
6. Añadir a una lista de compra de prueba; comprobar todos los artículos y que condimentos sin cantidad no reciben números ficticios.
7. «Ver receta»: registrar URL destino y comportamiento navegador/PWA; pulsar «Ver Octubre · Menú 1» y verificar selección.
8. Editar descripción/ingredientes opcionales en Favoritos: esto es una capacidad de Bring! y no una marca de opcionalidad exportada por el schema.

No declarar la integración validada hasta estas comprobaciones reales. No introducir botones en producción a raíz de esta prueba sin el siguiente encargo.

## Retirada

Eliminar exclusivamente `experimentos/bring/` mediante rama y PR. Comprobar que Pages devuelve 404 para la URL y que recetas/menús continúan accesibles. Una copia guardada en Favoritos en Bring! no se borra al retirar la página web. La PWA existente podría haber guardado una visita a la URL; no se ha añadido al precaché y no se cambia ni purga el almacenamiento del usuario.
