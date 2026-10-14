# Prueba 7 — Octubre · Menú 1 · nombres y descripciones

## Estado final de evidencia · 14/10/2026

La usuaria confirmó físicamente: Garbanzos separados en receta y reunidos en cesta conservando ambas descripciones, iconos Huevos/Higos correctos, Yogur y despensa correctos. Escalado tanto desde web como dentro de Bring! comprobado; el segundo multiplica compra ya redondeada.

Referencia vigente: [Maestro Bring! v2.0](../../../docs/bring/MAESTRO.md) y [guías de implementación](../../../docs/bring/README.md). El contenido inferior conserva el protocolo y estado en la fecha del ensayo; los pendientes históricos quedan actualizados por este apartado. No se cambian aquí generadores, snapshots ni payloads.

Último ensayo autorizado el 14/10/2026. URL: https://mirurecetas.github.io/menu-anual-recetas/experimentos/bring/prueba-7-10-1/

Carpeta autónoma y eliminable mediante rama/PR. No modifica Airtable, producción, exportador de menús, web/PWA, recetas, nutrición, fotos ni otras pruebas. No registra SW ni carga recursos compartidos. Comparte origen Pages, por lo que el SW existente podría cachear visitas; no se purga almacenamiento.

Se reutiliza literalmente entrada.json y calcular_base.py de prueba 6. Instantánea congelada, no sincronización: expansión recursiva y sumas exclusivamente por ID Airtable/unidad; cantidades exactas, escalado previo, envases al entero superior y g/ml a decena superior. stock y yield se conservan. Selector 1–20 porciones.

DISPLAY en generar.py es un mapa local por ID que propone nombres y características. Solo cambia la presentación de nueve IDs. spec empieza con cantidad y unidad y añade características separadas por comas. Los garbanzos mantienen dos artículos y cantidades distintas por ID. La fuente registra el ingrediente genérico cocido sin sal, no un envase comercial en conserva: no se inventa ese formato ni su equivalencia. La etiqueta es «cocidos, sin sal».

Pruebas reales previas: la usuaria confirma prueba 6 a 1 y 3 porciones; su receta ficticia «Garbanzos» une las descripciones «500g, secos + 200g, conserva» y escala cantidades con características por comas. Esto no valida todavía el JSON de prueba 7 ni sus iconos.

## Comprobación física pendiente

Abrir esta URL nueva; elegir 1 porción, importar y después repetir con 3 porciones en una lista de prueba. Comprobar iconos de Huevos, Higos y Garbanzos; ambos Garbanzos deben mantener cantidad/variante y, al añadirlos, comprobar la unión de descripciones. Yogur debe conservar vasitos, marca y formato. Aceite de oliva, Miel, Tahini y Salsa de soja deben aparecer en despensa. El selector de la web ya calcula el redondeo: cambiar porciones dentro de Bring! escala cantidades redondeadas y no sustituye ese cálculo.

A 1 porción: Garbanzos 90 g cocidos y 30 g secos; Huevos 2 huevos; Higos 100 g; Yogur 2 vasitos. A 3: Garbanzos 270 g cocidos y 90 g secos; Huevos 6 huevos; Higos 300 g; Yogur 5 vasitos. Descripciones técnicas y nombres originales permanecen en la auditoría y vista.json.

## Verificación

python generar.py; python generar.py --check; python -m unittest discover -s . -p 'test_*.py' -v

Comparar los 20 payloads contra prueba 6: misma cantidad inicial, stock, orden de artículos y yield; solo nombres/descripciones/enlaces de prueba cambian. CI Validar web y QA navegador acreditan regresión de producción, no importación física. Publicar mediante PR y verificar HTTP contra archivos locales. Retirada: eliminar únicamente esta carpeta y comprobar 404; favoritos Bring! permanecen.

