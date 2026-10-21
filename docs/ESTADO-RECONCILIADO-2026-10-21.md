# MiruRecetas · Estado operativo reconciliado

**Versión 1.0 · 21/10/2026.** Aclaraciones documentales de la implementación existente. No cambian datos, código ni publicación. Las reglas actuales de este documento prevalecen sobre una propuesta antigua incompatible en las guías; los expedientes experimentales y de publicación se conservan como evidencia temporal.

## AS IS · Web y datos

La web/PWA se construye y publica desde este repositorio público: contiene fuentes, generador, plantillas y pruebas. La raíz se redirige desde mirurecetas.github.io. La separación privada no está implementada.

- Airtable es canónico para composición y cantidades; la web no sustituye los nutrientes oficiales. Reutilizar identidades, revisar descendientes y usos compartidos.
- El postre admite INGREDIENTE y PREPARACIÓN simultáneos, uno de cada tipo, con aportes contados una vez. Leche y galletas se muestran en Postre; no presentar esa leche como Fruta. El bowl ya trasladado a postre no vuelve a cena.
- Se permite publicación incremental de menús parciales, con estados y subtotales explícitos. No presentar una ingesta incompleta como calculada ni un subtotal como total semanal oficial. Para compra completa se exigen fuentes suficientes.
- La etiqueta principal `dulces`, icono `candy`, forma parte de las ocho familias actuales. No restaurar listas históricas de siete protagonistas.
- Notas culinarias se muestran siempre, también vacías; el agente puede redactar notas útiles justificadas. No insertar auditorías técnicas o trazabilidad económica en ellas.

## AS IS · Diseño, temporizador e imágenes

- Tarjeta de gráficos semanales inicialmente oculta, control Ver información nutricional / Ocultar información nutricional junto al selector. La tarjeta agrupa los tres gráficos también en tablet. La variedad por protagonista es aproximada; el reparto real por ingredientes sigue TO BE.
- Tablet vertical: cuatro columnas de miniaturas batch cooking. Logo a la izquierda de MiruRecetas con altura visual igual a la M; no cambiar el isotipo por estaciones.
- Temporizador: título único Temporizador con icono y estilo del anterior encabezado; sin el título redundante Herramientas de cocina. Se preservan esfera, cuenta atrás central, play/pause, reinicio a cero, sonido y parada de alarma. Validación comunicada por la usuaria el 19/10, sin extrapolación universal a dispositivos no probados.
- Fotos aprobadas se conservan; una foto por receta, una portada por menú, sin regeneración estética de aprobadas. La cadencia solicitada de revisión automática es cada 12 h indefinidamente; la automatización observada estaba desactivada y conservaba regla diaria. Esa divergencia está pendiente, no se corrige con Markdown ni se activa aquí.

## AS IS · Bring! permanente

Fuentes datos/compra/MM-N.json, páginas menus/MM-N/compra/, veinte payloads por menú y portadas en imagenes/menus/. Claves activas del corte: 10-1 y 09-1/2/3/4. El registro activo del código y fuentes vigentes manda sobre este recuento temporal.

La exportación recorre preparaciones, conserva cantidades racionales, suma por ID/unidad y escala antes del redondeo; no combina por semejanza de nombre. Fruta y preparación de postre coexisten. La despensa y exclusión del café de oficina siguen sus reglas por identidad. Los campos Nombre de visualización y Descripción de compra ya existen; no volver a crearlos.

La imagen se centra en móvil/PWA vertical. En horizontal y escritorio se conserva la disposición aprobada a la derecha. No sustituir fotos aprobadas para aplicar una regla de alineación. Septiembre 3/4 cuenta con importación física confirmada; la comprobación física de las nuevas rutas septiembre 1/2 continúa pendiente según expediente.

Los experimentos 1–8 explican decisiones y pruebas antiguas: no son las rutas operativas actuales ni una integración pendiente de construir. Los roles de integración, imágenes y gestor de productos mantienen sus límites.

## AS IS · Economía

Fase 3.3 publicada mediante PR #125; atribución corregida en PR #126. 57 fichas visibles, 58 preparaciones canónicas incluido sofrito interno, sin convertir esas cifras en límites permanentes. Contrato público `mirurecetas.public-recipe-costs/1`, en presentacion/costes-recetas.json; validación íntegra del lote y correspondencia con slug/nombre/raciones/huella culinaria antes de generar. No publicar lotes inválidos.

Coste consumido por ración, precio comercial y coste de compra por envases se distinguen. El selector de raciones escala cantidades y no multiplica el precio por ración. Nutrición, cantidades y raciones canónicas no se cambian para cuadrar costes. Catálogos, fuentes comerciales internas y correspondencias económicas permanecen privados.

Atribución vigente: **«Estimaciones de costes elaboradas con datos de OpenCesta (ODbL 1.0) y referencias comerciales documentadas».** Los ensayos privados 3.1/3.2 y sus flags false son históricos, no el estado de publicación del producto.

## TO BE y preservación

Desarrollo/fuentes y construcción/validación privados, artefactos públicos mínimos manteniendo URL del producto, PWA/offline, compra, costes y reversión. El código entregado al navegador y las copias/historial ya publicados no se vuelven secretos por mover el generador. Resolver aparte el destino de URL técnicas existentes. No ejecutar el plan por leerlo.

## Fuentes y autorización

La colección completa de 18 fuentes reside en el proyecto; su espejo Markdown está en motor-precios privado, con los requisitos técnicos de preservación y Actions. Las decisiones explícitas vigentes delimitan permisos. Consultar el protocolo del rol y main vivo antes de operar. Esta sincronización es solo documental: no autoriza Airtable, generación, despliegues ni privatización.

[Revisión local de triggers y puerta de integración](SINCRONIZACION-DOCUMENTAL-2026-10-21.md).
