# MiruRecetas — Contrato de traspaso al exportador de menús y al registrador de productos

> **Estado vigente · 14/10/2026:** integración permanente de Octubre · Menú 1 publicada mediante PR #86, CI y verificación HTTP/navegador correctos. Solo este menú está activo. [Operación y recuperación](OPERACION.md) · [Expediente de publicación](PUBLICACION-OCTUBRE.md). Las secciones de propuesta anteriores se conservan como antecedentes y no describen el estado de implementación actual. La prueba física de la nueva ruta está pendiente; pruebas históricas 7/8 validadas.


Versión 1.0 · 14/10/2026. Leer junto al Maestro Bring! v2.0. Especifica trabajo siguiente; el código de producción aún no implementa este contrato de compra.

## 1. Diagnóstico del exportador vigente

`scripts/exportar_airtable.py` exporta menús v2, NO las fichas JSON de recetas. Lee MENÚS, COMIDAS, COMIDA_ELEMENTOS, INGREDIENTES y PREPARACIONES. Usa IDs de vínculos como referencia_id, pero los nombres de ingredientes proceden de `Nombre`. No lee PREPARACION_ELEMENTOS, ni genera todavía la compra recursiva completa. Los JSON de recetas se publican por otro procedimiento; no asumir sincronización automática Airtable→todas las fichas.

Los postres pueden contener ingrediente y preparación simultáneamente, y el exportador inspeccionado ya los conserva como componentes. Su versión actual también exporta menús parciales con estado Pendiente y comidas/cenas pendientes: la frase histórica «no hay menús incompletos» no describe todo main. No eliminar ese soporte ni rellenar pendientes para Bring!. La compra debe declarar la cobertura o bloquear exportación completa si faltan ingestas.

El contrato v2 de menús y su nutrición oficial permanecen. La nueva información de compra debe ir en un contrato adicional versionado, validado y coordinado, sin reutilizar grupos visuales como identidad de ingrediente. No editar HTML generado manualmente.

## 2. Objetivo de extracción y generación

Fuente autenticada → grafo validado → agregados exactos por ID/unidad → datos estáticos de compra por menú. El cliente y Bring! no consultan Airtable ni el repositorio privado de productos. Tokens solo en entorno autorizado y nunca en logs, URLs públicas o assets.

Ampliar la lectura a PREPARACION_ELEMENTOS real y verificar todos sus enlaces. PREPARACIONES incluye raciones base y vínculos a ingredientes/subpreparaciones. Expandir bases internas sin slug, usos repetidos en días y ambos postres. Detectar ciclos, enlaces inexistentes, cantidades/raciones inválidas y estados incompatibles; fallar con diagnóstico preciso antes de publicar datos parciales como completos.

La publicación de la compra debe ser atómica respecto de una fuente validada: evitar menú de una revisión y snapshot de ingredientes de otra. Validar todos los archivos seleccionados antes de escribir; usar lecturas/versiones y huellas para registrar posibles cambios concurrentes. No cambiar fórmulas ni recalcular nutrientes como fuente alternativa.

La excepción café de oficina debe resolverse por su ID real verificado y alcance culinario, no por substrings ni borrado de todas las bebidas/leche. Registrar la exclusión y sus fuentes en auditoría.

## 3. Campos de presentación a consumir

Después del traspaso Airtable: `Nombre de visualización` y `Descripción de compra`, con nombres/IDs/tipos comprobados. Si aún no existen, no inventar IDs de campo ni escribir esquema desde este agente. Preparar el adaptador y pruebas con fixtures aislados hasta disponer del esquema autorizado.

Nombre editorial: genérico y legible; fallback controlado al nombre técnico si falta, con diagnóstico interno. No introducir marcas en fichas culinarias por reutilizar la descripción de compra. Mantener presentación específica ya aprobada de un uso (Tomate cherry, AOVE, etc.). La compra usa nombre corto común y descripción de variante; no fusiona por nombre.

Emitir los IDs reales y datos de presentación en el contrato de compra para que no se deduzcan desde el JSON visible de recetas. Si se migra metadata de ingredientes de fichas, actualizar sus validadores/generadores junto con el contrato; no añadir campos nuevos y afirmar que se consumen sin probarlos.

## 4. Contrato de compra propuesto para implementar

Ruta propuesta: `datos/compra/MM-N.json`, independiente de `datos/menus/MM-N.json`. Es una especificación nueva, no una ruta actualmente generada. Acordar el adaptador con implementación y mantener compatibilidad explícita; no crear una tercera copia divergente de las cantidades.

Contenido mínimo:

- Versión propia de esquema de compra, clave MM-N, ID real del menú y porciones base conocidas.
- Estado completo/parcial y cobertura por ingesta; exclusiones explícitas y lista de pendientes.
- Fuentes/versiones/huellas de menú, grafo de preparación, ingredientes y catálogo comercial; no secretos ni tablas privadas completas.
- Ingredientes agregados: ID Airtable, unidad de necesidad, cantidad exacta reproducible, nombre técnico para auditoría, nombre de visualización, descripción de compra y política de stock.
- Presentación de compra solo si verificada: unidad de compra singular/plural, contenido por unidad, unidad/base neta o escurrida, referencia del producto, fuente de equivalencia y estado de verificación.
- Orígenes por aporte: día/ingesta, elemento, cadena de preparación y factores de raciones, con aportes exactos que sumen el total.
- Condimentos sin cantidad con fuente y etiqueta; ID real cuando exista, sin ID falso cuando no exista. No confundir cantidad desconocida con cero.

En pruebas se usan fracciones exactas serializadas como texto (p. ej. `340/3`). El nuevo contrato debe definir esa representación o decimal exacto de manera única; el consumidor no debe convertir primero a una cifra visual de un decimal. JSON válido, sin NaN/Infinity, números o textos ambiguos, referencias a campos que no estén documentados, unidades incompatibles o cantidades comerciales supuestas.

La lista base exacta permite generar N porciones conservando el algoritmo del maestro. Las salidas Bring! no incluyen el ID como itemId: `itemId` es el nombre. El ID sigue en los datos de compra/auditoría. Los dos Garbanzos tienen dos filas aunque su itemId sea idéntico.

Imagen de menú: resolver `imagenes/menus/MM-N.webp` solo si existe y es válido; publicar `imageUrl` absoluta desde esa ruta. No reutilizar una foto de una receta como si cubriera un menú ni copiar la URL de prueba 8 a todos los menús. La ausencia de imagen no autoriza inventar archivo o menú.

## 5. Presentaciones comerciales: lo que ya existe

En las fichas consultadas aparecen `cantidad_envase`, `peso_escurrido`, `presentacion.unidades`, `presentacion.contenido_unidad`, `presentacion.cantidad_total_pack` y `componentes_envase`. Releer el esquema real y usar sus campos existentes; no imponer otra estructura sin migración explícita. El snapshot experimental no garantiza el catálogo actual.

Ejemplos verificados en los ensayos:

| Producto | Base para comprar |
|---|---|
| Gazpacho DIA 330 ml | Botella si la ficha exacta confirma 330 ml |
| Mini tortillas IFA | 25 g por tortilla, no 300 g como tortilla; pack de 12 |
| Yogur DIA Fidias | 125 g por vasito, pack de 6 |
| Pan Oroweat | 36,5 g por rebanada aproximados, con procedencia |
| Burrata | 150 g escurridos/envase, no 326 g con líquido |
| Piquillos | 220 g escurridos/frasco, no 225 g netos |
| Boquerones ArteIñaki | 250 g escurridos/envase, 310 g netos |
| Sardinillas Portonovo | 163 g escurridos/lata, 232 g netos |
| Tahini NaturGreen | 270 g/envase |
| Salsa de soja Salseo | 250 ml/envase |

Cada valor pertenece a su ficha y formulación/presentación, no a todo alimento de igual nombre. Los casos PROPIOS derivados de boquerones y sardinillas usan equivalencias explícitas por ID, no quitar sufijos de una referencia para presumir equivalencia. Mantener balance nutricional de la ficha derivada: no añadir nuevamente aceite de cobertura.

Carpaccio completo: ficha modelada como envase completo de 120 con 90 g carne, 15 g queso y 15 ml AOVE. Los ensayos usan esa unidad completa, no rehacen sus nutrientes ni suman otra vez sus componentes. No generalizar una suma g+ml para otros productos.

Antes de redondear, sumar y escalar necesidades. No redondear cada aporte por receta/envase primero. Una cantidad ya expresada en unidades verificadas se conserva si es entera; fracción → entero superior tras escalado. Sin formato verificado y en g/ml → decena superior, identificando la limitación de formato cuando corresponda. No transformar un garbanzo genérico cocido en conserva comercial por conveniencia.

## 6. Responsabilidad del registrador de productos

Notificar la necesidad de formato de compra sin reabrir auditorías completas de productos ya válidos. Reutilizar por ID/EAN y referencias vigentes; si hay cambio real de envase o falta un dato, verificar etiqueta/ficha, neto, escurrido, unidades individuales y pack, y registrar fuente y fecha conforme a su protocolo.

No cambia Airtable ni web/PWA desde este rol. No fusiona productos por nombre, marca o valor nutricional parecido. No inventa peso escurrido, tamaño de tortilla/rebanada, densidad o unidad de comercialización. Datos desconocidos se conservan como desconocidos, no cero. Producto compuesto no se desglosa en compra si se compra como producto completo.

Su aprobación de una ficha nutricional sigue el protocolo vigente; esta notificación no autoriza escribir todos los productos, corregir nutrientes o crear equivalencias no verificadas. Entrega ID de producto, EAN si existe, referencia exacta, formato y evidencia al exportador mediante expediente, no mensaje automático.

## 7. Tests y traspaso

Tests mínimos del exportador: recursión con base interna y varios niveles, repetición semanal, postre dual, mismo ID sumado desde comida/preparación, IDs distintos con nombre común, mismo ID g/ml separados, desconocidos sin cero, ciclos/enlaces inválidos, formato neto/escurrido/individual, escalado antes de ceil, stock por ID aun al renombrar, validación del contrato y exportación reproducible.

Comparar fixtures de septiembre/octubre contra experimentos para controlar algoritmo, sin tratar sus valores históricos como fuentes actuales. No editar datos canónicos para fabricar fixtures. La prueba 7/8 física cubre representación; tests de algoritmo no acreditan una nueva importación.

Entrega: contrato y versión, campos reales consumidos, IDs y equivalencias confirmados, datos por menú con cobertura, PR y SHA, suites ejecutadas, estado de publicación y rutas públicas. La implementación debe funcionar desde esos archivos sin credenciales ni acceso privado. Faltas de identidad/presentación deben quedar visibles como diagnóstico; no ocultarlas con nombres aproximados.

## Prompt breve — exportador

Actúa como responsable del exportador de menús de MiruRecetas. Lee esta guía, el Maestro Bring! v2.0 y los contratos actuales en main. Implementa la extracción recursiva de PREPARACION_ELEMENTOS y la fuente de compra por menú con IDs reales, cantidades exactas, orígenes, nombres de visualización, descripciones, stock y presentaciones verificadas. Incluye ambos postres y bases internas; agrupa por ID/unidad, sin alterar nutrientes ni menús. Coordina campos con Airtable y formatos con productos; publica mediante rama, PR, CI y verificaciones. No incorpores tokens al cliente ni supongas que el exportador actual ya exporta recetas.

## Prompt breve — productos comerciales

Actúa como registrador de productos comerciales de MiruRecetas. Lee esta guía y tu protocolo vigente. Revisa las fichas vinculadas necesarias para la compra Bring!: contenido neto/escurrido, unidades individuales y pack, denominación de compra y referencia exacta. Reutiliza registros validados; documenta únicamente formatos faltantes o cambios reales con evidencia, sin duplicar productos ni inventar equivalencias. Respeta el flujo de aprobación de fichas, no modifiques Airtable, web/PWA o recetas y entrega al exportador las correspondencias verificadas por ID/EAN.


## Implementación permanente · 14/10/2026

El encargo posterior de Lucía autoriza la integración y publicación de Octubre · Menú 1. El estado documental previo se conserva como expediente histórico. El contrato ejecutable, campos reales, extracción, generación, rutas, límites PWA, incorporación de menús y recuperación se describen en [OPERACION.md](OPERACION.md); las verificaciones y estado de despliegue se registran en [PUBLICACION-OCTUBRE.md](PUBLICACION-OCTUBRE.md). Solo octubre está habilitado; extender a otros menús requiere autorización posterior. Las pruebas físicas 7 y 8 permanecen validadas, sin atribuirles una importación de la nueva ruta.
