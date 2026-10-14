# MiruRecetas — Guía del responsable de implementación y mantenimiento de compra Bring!

> **Estado vigente · 14/10/2026:** integración permanente de Octubre · Menú 1 publicada mediante PR #86, CI y verificación HTTP/navegador correctos. Solo este menú está activo. [Operación y recuperación](OPERACION.md) · [Expediente de publicación](PUBLICACION-OCTUBRE.md). Las secciones de propuesta anteriores se conservan como antecedentes y no describen el estado de implementación actual. La prueba física de la nueva ruta está pendiente; pruebas históricas 7/8 validadas.


Versión 1.0 · 14/10/2026. Documento de ejecución para el agente que implemente la página de compra por menú y mantenga la integración. Leer íntegramente el Maestro Bring! v2.0 y las guías de Airtable, exportación/productos e imágenes de menú.

## Mandato y punto de partida

La fase de experimentación terminó con validación física de prueba 7 (nombres, variantes, unión en cesta, iconos, escalados, despensa) y prueba 8 (imagen). No repetir como pendiente un resultado ya comunicado. No extrapolar a iOS o todos los iconos.

La implementación permanente aún NO está realizada. El encargo que abra este agente debe concretar la ejecución; este documento es traspaso, no una PR de código ni una modificación Airtable. El presente responsable puede coordinar contratos y desarrollar web/exportación según el alcance recibido, pero no editar por su cuenta registros, recetas, nutrientes, fórmulas, imágenes aprobadas o productos fuera de su rol.

Antes de actuar: leer main, SHA, commits y PR simultáneas; contratos de datos/FORMATO, docs/CONTRATO-MENUS-V2, docs/PWA y mantenimiento web; revisar scripts/generar.py, scripts/exportar_airtable.py, plantillas, assets y workflows actuales. No desarrollar desde copia vieja ni restaurar producción al SHA del ensayo.

## Arquitectura propuesta y límites

Conservar Python + HTML/CSS/JavaScript y la PWA única existente. No introducir backend, otra publicación, frameworks, cuentas, carrito propio, historial, partners, analítica o automatizaciones por conveniencia.

| Capa | Fuente/ruta propuesta | Responsabilidad |
|---|---|---|
| Menú culinario/nutricional | datos/menus/MM-N.json actual | Fuente existente, sin cambiar nutrientes para compra |
| Grafo y agregados exactos de compra | datos/compra/MM-N.json nuevo | Exportador autenticado, validado por ID |
| Imagen de menú | imagenes/menus/MM-N.webp nuevo | Agente de imágenes; una sola por menú |
| Página pública de compra | menus/MM-N/compra/ propuesta | Generador integrado y UI |
| JSON Bring! por selección | menus/MM-N/compra/exports/N.json propuesta | Cantidades ya escaladas/redondeadas, yield N |

Rutas nuevas son especificación inicial: contrastar colisiones y contrato real antes de adoptar. Si ya existe implementación equivalente, mantenerla y documentar adaptación. No decir que una ruta está publicada antes de crearla y verificarla.

Los snapshots de pruebas 4–8 sirven como fixtures y control del algoritmo, no como fuente permanente de menú actual. No importar `generar.py` experimental desde producción ni usar instantáneas históricas como sincronización. Extraer el algoritmo a módulo mantenible y testeado preservando resultados, sin reescribir todas las páginas por conveniencia.

## Página de lista de compra

- Título y menú seleccionado inequívocos, imagen de menú real si disponible y enlace para volver al menú.
- Selector de porciones antes de exportar, con controles +/- y entrada accesible. Inicialmente puede conservarse el rango ensayado 1–20; ampliar solo con JSON públicos correspondientes y pruebas. Validar entero positivo y límite; no aceptar fracciones/NaN/0 ni mostrar un enlace para porciones que no tienen payload.
- Tabla/lista con nombre visible y variante, Necesidad real (máximo un decimal), Se exporta (cantidad de compra + características) y Compra/Despensa. Mantener variantes independientes por ID aunque el nombre coincida.
- Condimentos sin cantidad presentes sin ceros inventados. Necesarios aunque stock; no llamarlos opcionales culinarios.
- Botón «Exportar N porciones a Bring!» usa deeplink con JSON para N y yield N. Si falta fuente/JSON o carga falla, deshabilitar con mensaje útil y opción de reintento; no fingir exportación correcta.
- Mensaje breve: elegir personas aquí recalcula compra; el selector de Bring! multiplica compras ya redondeadas. No bloquear una función de Bring! que no controlamos.
- Ingredientes no completos o referencias faltantes: no vender la lista como compra completa. Menús parciales que ya se muestran en la web conservan sus pendientes; decidir si deshabilitar compra completa o ofrecer claramente «ingredientes registrados» sin inventar faltantes. El ensayo de septiembre fue explícitamente parcial.
- No mostrar IDs, hashes, campos Airtable, diagnósticos de backend ni protocolos técnicos dentro del flujo de compra ordinario. Auditoría técnica fuera de la experiencia principal.

## Integración en web y PWA

Añadir acceso contextual «Lista de la compra» al menú seleccionado conforme al diseño actual, sin cambiar selección, tarjetas, gráficos, Batch cooking o recetario innecesariamente. El punto de acceso exacto puede resolverse como decisión rutinaria de diseño dentro del encargo; no crear barras nuevas o rediseñar toda la navegación.

Reutilizar cabecera, logotipo definitivo, paleta crema/salvia/terracota, tipografías y accesibilidad vigentes; una nueva familia de plantilla debe participar en versionado de assets y metadatos actuales. Mantener vistas móvil vertical/horizontal, tablet y escritorio y foco/teclado, contraste y controles táctiles.

La PWA usa mismo sitio, manifest, iconos y SW. No crear otra instalación ni cambiar su id/scope. Auditar rutas y MIME/tamaño de JSON/imágenes antes de ampliar caché. No precachear todo el catálogo de payloads ni el servicio externo. El PNG experimental supera 2 MiB; su importación online exitosa NO acredita caché offline en la PWA, cuyo contrato limita imágenes por entrada. Las imágenes futuras optimizadas ayudan a ese límite sin cambiar el SW por defecto.

Importar a Bring! requiere conexión y URLs públicas. Una lista/selector calculada solo en JS local no proporciona al importador la receta; debe existir JSON público para cada selección. Si hay contenido offline, mostrar su estado y evitar prometer importación sin red. No limpiar almacenamiento, caches ajenas o favoritos; no activar recargas que interrumpan cocina.

No implementar exportación adicional de recetas individuales en esta fase si no se solicita. Su Schema.org y comportamiento de compartir siguen siendo un flujo distinto. El nuevo Nombre de visualización puede coordinarse con publicación de recetas sin añadirles el mecanismo de menús ni modificar su nutrición/elaboración.

## Algoritmo y contrato que deben conservarse

Expandir hasta ID real de ingrediente; contar todos los usos; separar unidades incompatibles; sumar exacto → escalar → convertir presentación verificada → ceil unidades o decena g/ml. Necesidad real redondeada solo al renderizar. Sin densidades inventadas, tamaños universales de huevo/diente ni redondeo previo por receta.

Stock fijo por IDs AOVE/miel/tahini/soja; condimentos sin cantidad stock con spec omitido. Comino y pimienta según reglas ya comprobadas. Nombre de artículo desde etiqueta genérica; características desde descripción de compra, separadas por comas tras cantidad. No poner necesidades culinarias secundarias. Garbanzos seco/cocido permanecen dos filas hasta que Bring! los reúne en su propia cesta.

JSON con author, name, tagline, yield, linkOutUrl, imageUrl si existe y items con itemId/spec/stock. Native itemId es nombre, no ID Airtable. URLs absolutas, sin sesiones; parámetros baseQuantity=N/requestedQuantity=N para archivo calculado para N. No cambiar a JSON-LD y asumir stock/imageUrl equivalentes.

## Flujo de trabajo verificable

1. Auditar estado y acordar contrato con expedientes de campos/formato. Avanzar estructura y tests sin datos falsos; resolver bloqueos esenciales antes de publicar.
2. Crear rama basada en main actual. Preparar módulo de cálculo, validación de datos de compra, plantilla/UI y generación estática de payloads. Nunca escribir a mano salidas generadas.
3. Añadir tests significativos de datos/identidad y UI. Incluir explícitamente nuevas rutas de compra en CI: los tests experimentales previos no se ejecutan automáticamente por el CI vigente.
4. Ajustar workflow solo lo necesario para regenerar/publicar nueva fuente y nuevas salidas; comprobar paths de disparo y git add de directorios nuevos. Hoy `publicar-recetas` no menciona datos/compra; no afirmar automatización antes de conectarla.
5. Ejecutar suites pertinentes, generación repetida/idempotencia, revisar scope del diff y salidas. Evitar cambios oportunistas o descartar trabajo de otros agentes.
6. PR con problema/resultado, contrato, fuentes, pruebas y límites. Esperar Validar web y QA navegador; si main avanzó, reconciliar preservando cambios ajenos y repetir checks afectados.
7. Merge y publicación. Verificar HTTP anónimo del menú, página de compra, JSON 1/3 y extremos del selector, imageUrl/binario; comparar contenido/hash. Validar que no sean respuestas HTML de error con HTTP 200.
8. Verificar navegador real disponible: selector cambia URL, tabla y estado correctamente; imagen naturalWidth > 0; acceso contextual conserva menú; móvil/tablet y flujo PWA cuando esté disponible. Separar automatización de dispositivo físico.
9. Registrar resultado y tareas físicas pendientes, PR/SHA y contrato. Mantener este expediente actualizado sin presentar implementación propuesta como concluida.

## Matriz mínima de pruebas

| Caso | Criterio |
|---|---|
| Repetición en dos días y dentro de otra receta | Ambos aportes y subrecursión exactos |
| Base interna sin slug y postre ingrediente+preparación | Expansión completa, sin artículos Sofrito ni omisiones |
| ID igual en varias recetas; ID distinto con nombre igual | Suma solo del primero; variantes separadas |
| Mismo ID g y ml | Separados hasta conversión expresamente autorizada |
| Envase fraccionario / entero | Techo tras escalado / entero conservado |
| Cantidad g/ml 117,5; exacta 120 | 120 / 120, no incremento extra |
| Anchoas 340/3 a 4 porciones | 113,3 visible, 120 exportado |
| Necesidad con precisión larga | Máximo un decimal visible, exactitud interna conservada |
| Stock tras cambio de etiqueta | AOVE/miel/tahini/soja siempre true por ID |
| Condimento desconocido | Incluido stock sin 0 ni nutrientes inventados |
| Selector N y errores | JSON N, yield N, sin doble escalado; enlace bloqueado en error |
| Imagen | Archivo real/HTTP/MIME/hash y imageUrl exactos |
| Regresión web/PWA | Misma navegación, recetas, gráficos, cocina, SW e iconos |

Las capturas de prueba 7 y 8 ya validan el formato en Android. Una nueva publicación permanente necesita comprobar sus rutas y funcionamiento real cuando la usuaria la pruebe; no repetir todas las variaciones históricas ni declarar un nuevo ensayo físico por solo ejecutar CI.

## Mantenimiento y recuperación

Cambios de menú/ingrediente/producto deben invalidar/regenerar la fuente de compra afectada por dependencias reales, incluidas subpreparaciones. Imagen requiere revisión si cambian platos. Un cambio de etiqueta no altera sumas por ID. Nuevos productos deben aportar formato verificado y una regla explícita, no heurística por texto.

No afirmar que GitHub ve automáticamente un cambio Airtable: definir y documentar la ejecución autenticada del exportador, el disparo de generación y publicación. No crear tareas recurrentes nuevas sin encargo.

Rollback de integración: revertir en PR el acceso y módulo/salidas afectados, preservando menús, recetas, nutrición y fotos. Si se cambió SW, usar su procedimiento de recuperación por la misma URL, no borrar sw.js como solución. No eliminar experimentos, campos Airtable o imágenes válidas para revertir el botón. Favoritos/importaciones existentes permanecen en Bring!.

## Prompt breve de apertura

Actúa como responsable de implementación y mantenimiento de la lista de compra Bring! de MiruRecetas. Lee esta guía, el Maestro Bring! v2.0 y las guías de Airtable, exportación/productos e imágenes; contrasta main, contratos, generador, PWA y PR concurrentes. Implementa una página de compra por menú real con selector previo, necesidad real, compra redondeada, variantes por descripción, stock e imagen, y acceso desde web/PWA. Usa IDs y formatos verificados, JSON públicos y el procedimiento validado en pruebas 7/8. Trabaja mediante ramas, PR, CI, navegador y HTTP, preservando recetas, nutrición, fotos y PWA existente. Coordina los cambios de esquema con su gestor; no inventes datos ni publiques pendientes como completos.


## Implementación permanente · 14/10/2026

El encargo posterior de Lucía autoriza la integración y publicación de Octubre · Menú 1. El estado documental previo se conserva como expediente histórico. El contrato ejecutable, campos reales, extracción, generación, rutas, límites PWA, incorporación de menús y recuperación se describen en [OPERACION.md](OPERACION.md); las verificaciones y estado de despliegue se registran en [PUBLICACION-OCTUBRE.md](PUBLICACION-OCTUBRE.md). Solo octubre está habilitado; extender a otros menús requiere autorización posterior. Las pruebas físicas 7 y 8 permanecen validadas, sin atribuirles una importación de la nueva ruta.
