# MiruRecetas — Traspaso al agente de integración Bring!

Estado: 13 de octubre de 2026. Documento de resultados y continuidad; no autoriza nuevas funcionalidades de producción.

## Prompt para abrir el agente

Actúa como responsable de la integración Bring! de MiruRecetas. Lee íntegramente este documento y `experimentos/bring/README.md` en la versión actual de main de `MiruRecetas/menu-anual-recetas`. Revisa el código y los resultados reales antes de actuar. Conserva el entorno de pruebas aislado y fácilmente eliminable; trabaja mediante ramas, PR, CI y verificación HTTP. No modifiques producción, Airtable, nutrición, recetas, menús, fotografías o PWA sin encargo específico. No confundas pruebas automáticas con resultados reales en Bring!. Continúa exclusivamente el siguiente encargo de la usuaria.

## Entorno y publicación

- Repositorio: https://github.com/MiruRecetas/menu-anual-recetas
- Prueba: https://mirurecetas.github.io/menu-anual-recetas/experimentos/bring/10-1/
- Carpeta autónoma: `experimentos/bring/`. No está enlazada desde portada, recetario, recetas o navegación normal.
- `generar.py` lee los JSON públicos y escribe exclusivamente en `experimentos/bring/10-1/`. No modifica el generador de producción ni workflows.
- `calculo.json` conserva cantidades exactas y huellas SHA-256 de las 15 fuentes usadas. Es una instantánea, no una sincronización automática con Airtable.
- La página tiene `noindex, nofollow`; sigue siendo pública y visitable. No registra service worker ni carga recursos PWA compartidos. El service worker existente puede cachear una visita dentro de su alcance: aislamiento no significa otro origen ni otra política de caché.
- `linkOutUrl` devuelve a la página de prueba. Desde ella, «Ver Octubre · Menú 1» guarda la selección existente `miru-menu` y abre la portada. No se ha incorporado selección de menú por URL a producción.

## Evidencia y cronología

1. PWA publicada mediante PR #58; iconos definitivos mediante #60, según el trabajo previo. El presente agente no debe atribuirse pruebas físicas de instalación.
2. PR #70: página de menú como receta única, ingredientes anidados expandidos, base 1 persona. Merge `45cd64cb5b019f6067f7405264150ccfea479675`. HTTP público verificado.
3. Prueba real de la usuaria en Android: título, fuente MiruRecetas, expansión, escalado y enlace directo funcionan; descripción no se importa; nombres de ingredientes generan duplicados. Fotos de menú no se inventaron.
4. PR #71: tagline breve y JSON propio de Bring! con stock. Merge `ee4e76400eecb2d3675f5aedfc1efd6d912c11cd`. HTML y JSON públicos verificados.
5. Prueba real de la usuaria: **JSON funciona con descripción, stock, escalado incluso de stock, iconos y enlace**. Capturas muestran 1 y 4 porciones con cantidades proporcionales. Esto acredita ese flujo en su Android, no todas las plataformas ni todos los ingredientes.
6. PR #72: descripción en cinco líneas y variante con cantidades duplicadas/base 2. Merge `8dd572d58f56dcf4fccfff58493a503554c3622a`; ambas variantes JSON públicas verificadas.
7. Resultado real comunicado por la usuaria a las 22:43 del 13/10/2026 en Android: Bring! conserva todo el texto del tagline pero elimina los saltos de línea originales; el ajuste visual de líneas depende del ancho. La variante base 2 reconoce 2 porciones y cantidades correctas (bacalao 800 g y huevos 4). Al bajar a 1 muestra bacalao 400 g, huevos 2 y yogur 1,5 unidades de 125 g. Las capturas muestran ajo 13,666667 dientes a 2 y 6,833333 a 1: no se aplica redondeo general a unidades de compra.

## Contrato técnico probado

El JSON propio de Bring! no es JSON-LD de Schema.org. Incluye:

```json
{
  "author": "MiruRecetas",
  "linkOutUrl": "https://mirurecetas.github.io/menu-anual-recetas/experimentos/bring/10-1/",
  "name": "Menú 1 - Octubre",
  "tagline": "Menú de octubre de lunes a viernes para una persona.",
  "yield": "1",
  "items": [
    {"itemId": "Bacalao", "spec": "400 g", "stock": false},
    {"itemId": "Sal", "stock": true}
  ]
}
```

Importación directa mediante enlace, sin necesidad de widget externo:
`https://api.getbring.com/rest/bringrecipes/deeplink?url=URL_JSON_CODIFICADA&source=web&baseQuantity=1&requestedQuantity=1`.

Para cantidades desconocidas se omite `spec`, sin inventar ceros. Stock significa **necesario para cocinar, pero probablemente ya lo tienes**, nunca ingrediente prescindible. Bring! permite desmarcar artículos antes de añadirlos a la compra.

La documentación antigua de Bring! desaconseja JSON por limitaciones de iconos y cantidades solicitadas. El ensayo real demuestra que en este caso el selector dentro de Android sí escala y hay iconos. No extrapolar ese resultado al escalado inicial por parámetros ni afirmar que todas las etiquetas tienen icono de catálogo: AOVE conserva un icono genérico.

## Archivos de comparación

- `bring-v2.json`: frase breve, base 1, cantidades exactas; control validado por la usuaria.
- `bring-v3.json`: mismas cantidades y stock de v2; cambia únicamente tagline a cinco líneas con las comidas reales del menú.
- `bring-v3-2.json`: mismo tagline multilínea y artículos; cantidades conocidas multiplicadas por 2 y `yield: "2"`. Enlace con `baseQuantity=2&requestedQuantity=2`; no volver a duplicarlas en el enlace.
- HTML conserva control mediante Schema.org y microdato `tagline`. Compartir la URL HTML no es lo mismo que importar el JSON; stock explícito está en JSON.

Descripción de prueba 3, con caracteres de salto de línea reales en el texto JSON, serializados como `\n`:

```text
LUNES: Bacalao a la vizcaína con patatas panadera
MARTES: Carrilleras al vino con boniato al horno
MIÉRCOLES: Bacalao a la vizcaína con patatas panadera
JUEVES: Canelones de carrilleras
VIERNES: Wok de gambones y pisto
```

Prueba 3: texto completo y base 2 validados por la usuaria, pero los saltos explícitos no se conservan. El texto se presenta como un párrafo. Para futuras descripciones puede probarse un separador visible como « · » o « | » entre días; es una propuesta, no un cambio implementado.

**No atribuir redondeo especial de huevos a Bring! con esta evidencia:** 4 huevos × 1/2 = 2 huevos, sin redondeo. Para distinguir una regla propia sería necesaria una prueba con resultado fraccionario, por ejemplo 3 huevos para 2 porciones al pasar a 1. No se ha ejecutado ni autorizado esa prueba. Ajo fraccionario y 1,5 yogures demuestran que no hay redondeo universal a unidades/envases. Sigue pendiente calcular redondeo de compra en MiruRecetas si la usuaria lo solicita.

Las pruebas reales no acreditan iOS ni todos los ingredientes. No usar un favorito antiguo para valorar cambios posteriores: iniciar una importación nueva del enlace correspondiente.

## Cálculo actual y límites

- Se expanden preparaciones recursivamente por `raciones utilizadas / raciones base`, con detección de ciclos y referencias ausentes. Se cuentan usos repetidos en varios días; no se deduplica una preparación culinaria para la lista de compra.
- Se incluyen comidas, cenas y postres registrados. Viernes noche libre no añade ingredientes. El café de oficina está excluido sin sustitución por leche; el resto de leche usado al cocinar permanece.
- Se suman nombres exactos normalizados y unidades compatibles. Ajo singular/plural y anotación de 2,7 g se unifican como dientes. No hay equivalencias automáticas de productos ni conversiones g/ml.
- Se mantienen separados los aportes conocidos y «al gusto»: de ahí duplicados de sal y pimienta. La agrupación final por identidad está pendiente.
- Stock experimental: Sal, Pimienta negra, Comino en polvo, Laurel, Nuez moscada, Romero, Tomillo. Los demás reciben false. No se ha deducido automáticamente una despensa universal.
- No se añadieron fotografías ficticias, tiempos ni nutrición de menú como receta. Tampoco cuenta de usuario, carrito, backend ni sincronización de dispositivos.

## Decisiones para fases futuras, todavía NO implementadas

1. Agrupar por ID de ingrediente vinculado en Airtable. Las fichas comerciales de productos propios contienen formato de compra, peso escurrido y unidades/pack según la usuaria. Leerlas cuando se autorice; no inventar tamaños de envase.
2. Los ingredientes de recetas GitHub no siempre incluyen IDs, aunque los componentes de menús tienen `referencia_id`. Hace falta trasladar la identidad con un exportador o mapa verificable; no agrupar por intuición de nombres. Para registros distintos equivalentes, definir equivalencia explícita de compra.
3. AOVE debería expresarse siempre en ml. La usuaria prevé pedir al exportador de recetas que actualice los g desde Airtable. No convertir g a ml 1:1 ni corregir datos canónicos desde este ensayo. Hoy AOVE 55 ml, AOVE 12,5 g y Aceite de oliva virgen extra 15 ml siguen separados.
4. Redondear después de sumar y escalar. Unidades/envases enteros para compra, pesos/volúmenes con precisión práctica; preservar las cantidades culinarias y nutricionales exactas.
5. La usuaria acepta redondeo completo porque el menú tiene objetivo energético fijo y quizá no necesita escalado Bring. Alternativa: elegir personas en MiruRecetas y calcular/redondear antes de exportar con rendimiento correcto. No implementado; tampoco un selector arbitrario en prueba 3.
6. Al redondear la base y escalar luego en Bring!, puede comprarse de más: 1,2 yogures → 2 para una persona; multiplicarlos por 2 da 4, aunque el redondeo de 2,4 sería 3. Documentar ese comportamiento si se elige esa vía.
7. Unificar sal/pimienta con cantidad y al gusto, conservando ambas informaciones sin asignar cantidad falsa. Excluir agua de compra o ampliar stock no está autorizado todavía.
8. Descripción con todas las ingestas, estilo final, botones en recetas/semana y publicación permanente requieren siguiente encargo. Prueba 3 solo contiene comidas por día.
9. Programa de recipe partners / Inspiration Stream es distinto del botón técnico: no se ha solicitado adhesión ni demostrado tráfico orgánico o elegibilidad en España.

## Comprobaciones y retirada

```sh
python experimentos/bring/generar.py
python experimentos/bring/generar.py --check
python -m unittest discover -s experimentos/bring -p 'test_*.py' -v
```

Esperar Validar web y QA navegador MiruRecetas en verde antes de fusionar. Pages sirve esta carpeta desde main; no requiere cambiar workflows ni regenerar producción. Comparar HTTP público con los archivos locales. CI existente valida regresión de producción; no acredita la UI de Bring! ni incluye automáticamente la página experimental en su navegador.

Eliminar exclusivamente `experimentos/bring/` mediante rama y PR. Comprobar 404 público y continuidad de producción. Favoritos existentes en Bring! no se eliminan con la web; tampoco se purga almacenamiento del usuario. Ningún archivo de esta carpeta se usa como fuente en producción.

## Fuentes oficiales consultadas

- https://sites.google.com/getbring.com/bring-import-dev-guide/web-to-app-integration
- https://sites.google.com/getbring.com/bring-import-dev-guide/web-to-app-integration/alternative-button-integration
- https://www.getbring.com/en/recipe-partners

El JSON documenta `tagline`, `linkOutUrl`, `items`, `itemId`, `spec` y `stock`. No suponer que son propiedades Schema.org equivalentes. Mantener por separado evidencia documental, verificación automatizada y resultados reales de la usuaria.
