# Prueba temporal Bring! — Octubre · Menú 1

Autorización: página pública aislada para probar importación con Bring!, sin diseño definitivo y sin modificar las pantallas, fuentes de recetas/menús, fotografías ni comportamiento PWA.

URL: https://mirurecetas.github.io/menu-anual-recetas/experimentos/bring/10-1/

Base consultada: `02d81e09f2d1eb071e201fa4537a92ccfb456347` (main).

## Alcance y reproducción

- `generar.py` es independiente del generador de producción. Lee exclusivamente los JSON públicos del menú y sus recetas; escribe únicamente `experimentos/bring/10-1/index.html` y `calculo.json`.
- La prueba es una instantánea: no se regenera automáticamente con publicaciones de recetas. `calculo.json` identifica las fuentes mediante SHA-256 y permite detectar cambios.
- Título importable: **Menú 1 - Octubre**; autor MiruRecetas; descripción breve para probar tagline; rendimiento **1**: menú semanal completo para una persona. Se incluyen comida, cena y los postres presentes; el desayuno de café de oficina aparece en el resumen pero se excluye de la lista de compra; viernes noche libre no añade ingredientes.
- Recorrer cada ingesta y preparación por las raciones reales del menú, expandiendo referencias con `cantidad × raciones_solicitadas / raciones_base`. Detectar ciclos y preparaciones inexistentes. Una preparación repetida en dos días aporta ambos usos; una preparación anidada aporta solo los ingredientes requeridos por esa referencia.
- Resolver el slug ausente de las tostas del jueves por nombre completo normalizado y único en las recetas publicadas.
- Sumar nombres exactos y unidades compatibles; única equivalencia de unidades de conteo aplicada: dientes de ajo, singular/plural y anotación publicada de 2,7 g. No convertir g/ml ni inferir sinónimos/productos. Conservar aparte cantidades conocidas y desconocidas. Los productos compuestos comerciales siguen siendo ingredientes, no preparaciones web desglosables. Se excluye el café de oficina sin añadir leche equivalente.
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

## Ensayo 2 — tagline y stock

Autorizado el 13/10/2026 tras la prueba real de la usuaria: título, desglose, escalado HTML y enlace directo funcionan; descripción ausente y despensa sin marcar.

- HTML conserva Schema.org con `description` breve y el párrafo visible `itemprop="tagline"` del ejemplo Bring!: «Menú de octubre de lunes a viernes para una persona.»
- Nuevo `bring-v2.json` usa el formato propio documentado de Bring! (no es JSON-LD): `author`, `name`, `tagline`, `yield`, `linkOutUrl`, e `items` con `itemId`, `spec` y `stock`. Se excluye el café de oficina en ambas vías.
- `stock: true` se aplica explícitamente a Sal, Pimienta negra, Comino en polvo, Laurel, Nuez moscada, Romero y Tomillo. Son ingredientes necesarios que probablemente ya se tienen; no opcionales culinarios. Los demás reciben `false`. Cantidades conocidas y desconocidas se conservan sin inventar valores.
- El enlace «Prueba 2» envía el JSON con `baseQuantity=1&requestedQuantity=1`. El enlace «Control» y Compartir envían el HTML. No se finge que Schema.org tenga un campo stock equivalente.
- La guía oficial advierte que el JSON no soporta cantidades solicitadas como el parser HTML y limita iconos de artículos fuera del catálogo. **No afirmar que la vía JSON mantiene el escalado:** observar tanto la importación como el selector posterior en Bring!. Si no lo mantiene, conservar HTML y analizar los dos sitios que facilitará la usuaria.
- `linkOutUrl` apunta a esta página de prueba. No se añade foto ficticia ni se cambian web, PWA o navegación de producción.
- Cantidades y agrupación siguen siendo las de la primera prueba salvo el café excluido. Identidad Airtable, conversión de AOVE y redondeo por personas/envases no se implementan en este ensayo. Los formatos de compra comerciales están en Airtable según la usuaria; no se deducen de los nombres.

Prueba real: pulsar Prueba 2, comprobar la frase, el apartado despensa y sal/pimienta; confirmar título, autor, ingredientes, cantidades a 1 y 2 porciones, iconos, Favoritos y Ver receta. Probar también Control para observar si el tagline HTML se importa conservando el escalado conocido. La web no valida el resultado dentro de la app.

Documentación: https://sites.google.com/getbring.com/bring-import-dev-guide/web-to-app-integration y https://sites.google.com/getbring.com/bring-import-dev-guide/web-to-app-integration/alternative-button-integration .

## Estado actualizado y prueba 3

Resultados reales confirmados por la usuaria el 13/10/2026: JSON importa descripción, stock, escalado también de stock, iconos y enlace en Android. Las advertencias documentales del ensayo 2 no sustituyen esta evidencia; no extrapolar a iOS o al escalado inicial por parámetros.

Prueba 3 añade solo descripción en cinco líneas con las comidas reales y una variante base 2 con cantidades duplicadas. No modifica v2, agrupación, redondeo, AOVE, stock o datos fuente. Usar los enlaces Prueba 3 de la página; la interpretación de saltos de línea y base 2 queda pendiente de prueba real.

Todo el expediente de traspaso, evidencia, límites, decisiones y prompt para nuevo agente está en [AGENTE-BRING.md](AGENTE-BRING.md).
