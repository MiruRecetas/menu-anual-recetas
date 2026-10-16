# Bring! — Exportador y formatos comerciales

Versión 2.0 · 16/10/2026. Contrato implementado. Guía completa de ejecución: AGENTE-INTEGRACION.md; operación/recuperación: OPERACION.md. No confundir el exportador culinario de menús con el adaptador de compra.

`scripts/exportar_airtable.py` sigue exportando menús v2 y sus macros oficiales. `scripts/exportar_compra.py` lee seis tablas, incluida PREPARACION_ELEMENTOS; `make_source` valida correspondencia con el menú ya publicado, componentes y ambos postres. `scripts/compra.py` expande recursivamente, cuenta repeticiones y reconstruye fuente v1 de compra. Producción no importa generadores experimentales.

Flujo autenticado: grafo actual + catálogo privado vigente → fuente validada → suma exacta ID/unidad → selección N → presentación → techo → página/payloads estáticos. AIRTABLE_TOKEN, PRODUCTOS_JSON y PRODUCTOS_BLOB_SHA solo en entorno seguro. Si se usa conector, normalizar a la misma estructura y ejecutar make_source. Segunda lectura semántica de dependencias antes de escribir; cambios concurrentes ajenos no alteran la proyección. No existe escucha continua de Airtable.

Fuente `datos/compra/MM-N.json`: schema_version 1, completo, pendientes vacíos, grafo mínimo, productos proyectados, condimentos, cálculo exacto/cobertura/exclusiones y huellas de menú, ingredientes/raciones de recetas, imagen y grafo; SHA del catálogo. Cantidades como fracciones canónicas en texto. Extensiones opcionales compatibles: complementos culinarios sin ID y aclaraciones de usos por preparación, documentadas en AGENTE-INTEGRACION. No crear IDs para literales, no sumar sus cantidades por nombre y no inventar nutrientes. Ambos postres y bases internas se expanden; estado/enlace/cantidad inválidos bloquean.

Referencias comerciales exactas PROPIOS; DERIVED explícito para boquerones/sardinillas históricos, sin heurísticas de sufijos. La ficha verificada no garantiza formato conocido. Si cantidad_envase.valor es null, conservar g/ml a decena, como chorizo artesanal. Si existe formato incompatible, bloquear en vez de asumir conversión. Sin densidades 1:1.

Prioridad: individual escurrido documentado; escurrido de envase; contenido individual/neto cuando corresponde. `formato_unidades.escurrido_por_unidad_g` separa lata de pack. `presentacion.contenido_unidad` separa monodosis de caja. Atún 60 g/lata; aceitunas 50 g/lata; caballa 85 g/lata; tomate Iberitos 22 g/tarrina; arroz 125 g/vasito; nata 200 ml/envase. Mini tortilla 25 g, yogur 125 g, Oroweat 36,5 g aproximados, burrata 150 g escurridos, piquillos 220 g escurridos. La referencia concreta de chipotles usa 220 g netos con adobo porque se cocina el adobo. Releer siempre catálogo/fuentes; no generalizar formatos por alimento.

Dorada ID `recfn122yYJmxuETA`: equivalencia culinaria específica de 192,5 g comestibles por pieza de compra de 350 g, rendimiento FEN estimado 55 % documentado en PREPARACION_ELEMENTOS. Se compra por dorada, sin alterar cantidades comestibles ni nutrientes. Huevos 50 g comestibles por unidad según criterio previo. No extender estas equivalencias sin evidencia.

Suma exacta antes de escalar; ceil de envases/unidades después. Sin presentación: ceil(q/10)*10 g/ml, conservando decenas exactas. Necesidad visible ≤1 decimal; precisión interna intacta. Stock por ID, variantes independientes, características por comas. Contrato JSON propio con yield N y parámetros N/N, no doble escalado.

Productos nuevos o falta de identidad: derivar al responsable comercial con ID/referencia y dato que falta; no duplicar productos ni reabrir fichas válidas sin motivo. Este agente no modifica el catálogo privado ni la nutrición. Las limitaciones de tamaño comercial no impiden una compra honesta en gramos.

Pruebas en tests/test_compra*.py y QA navegador: recursión, repeticiones, postre dual, ID/unidad, formatos individuales, referencias, ciclos, escalado, stock, complementos y reproducibilidad. Las instantáneas 7/8 controlan algoritmo histórico, no sustituyen fuentes nuevas. Publicación exige CI, Pages, HTTP/MIME/bytes y navegador; Bring! real solo por confirmación física.
