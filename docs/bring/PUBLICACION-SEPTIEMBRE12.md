# Expediente — Septiembre · Menús 1 y 2

16/10/2026. Encargo expreso de generar ambos menús y preparar traspasos de integración completa e imágenes. Base main f86fdfd; sin modificación de datos culinarios, menús, nutrientes, fotos existentes o PWA. Airtable actual releído (seis tablas), dos campos existentes de presentación para 24 ingredientes; relectura y proyección semánticamente idéntica. Catálogo blob 6c53a3aac1117b1f96e1a7509cf33fdbfb1332b0.

Menú 1 recfpo1qbRxBv4GqD: 41 ingredientes agregados, 12 preparaciones, 49 artículos/10 despensa. Ragú cuenta para berenjenas y pasta; pollo suma César y limón; piquillos suman ensalada de pasta y tostas; melón en ambos días.

Menú 2 recszLULYqeN04sPl: 41 ingredientes por ID/unidad + cuatro complementos sin ID, 45 filas visibles, 12 preparaciones, 53 artículos/12 despensa. Lentejas dos usos: 500/3 g secas y 400/3 g chorizo. Solomillo 360 g en dos usos; pimientos 850 g totales, incluyendo tres usos de asados. Postre del miércoles conserva leche 200 ml y galletas 1,5 raciones, con chocolate 15 g.

Casos adaptados: chorizo comercial verificado con peso desconocido → g a decena; dorada 192,5 g comestibles/pieza de compra registrada → una dorada; tomate 22 g monodosis → tres tarrinas; mostazas antigua/Dijon separadas; azúcar blanco+moreno agrupado por ID ya autorizado, con aclaración culinaria; jamón ibérico con proxy nutricional serrano preservado. Cítricos aromáticos, vainilla y levadura se conservan desde ficha sin ID/nutrientes inventados, escalados por preparación y sin sumas por nombre.

Portadas propias WebP 1024 cuadrado: 09-1 338.250 bytes; 09-2 319.454 bytes. Herramienta integrada, prompts, fuentes y huellas en IMAGENES-SEPTIEMBRE12.json. La primera composición de menú 2 se editó para incluir la cena de pa amb tomàquet, manteniendo el bocadillo como plato separado.

67 pruebas Python locales correctas; QA responsive amplía ambos menús; generación idempotente y diff/sintaxis verificados antes de PR. Fuentes y salidas se generan, nunca se retocan manualmente. Expedientes previos 3/4 se actualizan con validación real comunicada por la usuaria; históricas 7/8 intactas. Publicación y comprobaciones públicas se completan en el cierre de este expediente.

## Pendiente físico de estas rutas nuevas

Nueva importación de septiembre 1 y 2 en Bring! Android desde web/PWA, preferentemente 1 y 3 porciones: portada, título, cantidades/envases, variantes, despensa y retorno. Menú 2: revisar dorada, chorizo en g, monodosis de tomate y cítricos; ambos componentes del postre deben contribuir a la compra. CI/HTTP/navegador no acreditan estas acciones físicas. Septiembre 3 y 4 ya están confirmados por la usuaria y no se reabren.
