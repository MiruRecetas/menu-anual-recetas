# Prueba 8 — Octubre · Menú 1 · imagen de menú

URL: https://mirurecetas.github.io/menu-anual-recetas/experimentos/bring/prueba-8-10-1/

Ensayo autorizado el 14/10/2026. Imagen aportada por la usuaria desde las fuentes del proyecto: menu-octubre-1.png, PNG original de 1254 × 1254, sin editar, recortar ni regenerar. El hash SHA-256 figura en calculo-base.json. Imagen ilustrativa de prueba elegida por la usuaria, no fotografía canónica de recetas.

La página muestra la imagen y cada exports/N.json incluye imageUrl con su URL pública absoluta. El campo imageUrl está documentado en el ejemplo JSON de la guía oficial https://sites.google.com/getbring.com/bring-import-dev-guide/web-to-app-integration/alternative-button-integration . No es Schema.org ni una propiedad inventada.

Se mantiene la instantánea y el cálculo exacto de prueba 7: sumas por ID Airtable/unidad, expansión recursiva, selector previo de 1–20 porciones, redondeos, nombres, descripciones y stock. No se modifica Airtable, recetas, menús, nutrición, fotos canónicas, exportador, web/PWA, otras pruebas ni workflows. Solo esta carpeta nueva. No usa SW, almacenamiento ni recursos compartidos; comparte origen Pages y el SW existente podría cachear visitas.

Prueba 7 validada físicamente por la usuaria en Android: garbanzos separados en receta y unidos en compra con descripciones; iconos Huevos/Higos correctos; yogur y despensa correctos; escalado desde web y dentro de Bring! correcto. Este último multiplica cantidades ya redondeadas. Esta prueba 8 acredita imagen solo después de observarla en Bring!, no por tests ni HTTP.

## Verificar en Bring!

Abrir el enlace nuevo e importar desde la página, evitando un favorito anterior. Comprobar que la imagen aparece como portada de la receta/menú en Bring! y que cantidades, variantes y despensa se conservan. Puede comprobarse para 1 o 3 porciones; la imagen es la misma en todos los JSON.

## Reproducción y retirada

python generar.py; python generar.py --check; python -m unittest discover -s . -p 'test_*.py' -v

Publicación rama/PR, CI Validar web y QA navegador en verde, Pages y HTTP comparando imagen binaria y JSON. CI es regresión de producción, no prueba física. Retirar borrando únicamente esta carpeta mediante PR y verificar 404. Favoritos de Bring! permanecen.
