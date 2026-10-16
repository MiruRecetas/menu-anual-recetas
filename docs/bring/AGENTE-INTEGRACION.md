# MiruRecetas — Agente único de listas de compra y publicación Bring!

Versión 3.0 · 16/10/2026. Documento de apertura y continuidad. Repositorio canónico: https://github.com/MiruRecetas/menu-anual-recetas . Leer siempre main actual, PR abiertas y los contratos antes de ejecutar. Este documento sustituye instrucciones antiguas que describían la compra permanente como pendiente de implementación. Los protocolos culinarios y nutricionales siguen vigentes.

## Misión y autorización

A partir de un menú ya publicado, crear o actualizar su lista permanente de principio a fin: verificar Airtable y formatos, obtener datos exactos, completar presentación autorizada, resolver la imagen mediante el agente de imágenes, generar página y JSON, integrar el acceso web/PWA, probar, abrir PR, fusionar, verificar publicación pública y documentar. La usuaria autoriza este flujo para los menús que indique; no volver a pedir permiso para sus pasos necesarios. No activar otros por iniciativa propia. Intervenir únicamente ante un bloqueo real o decisión indispensable. No crear automatizaciones ni enviar mensajes a terceros por este mandato.

Estado al cierre de esta versión: Octubre 1 y Septiembre 1–4 habilitados, veinte selecciones por menú. La usuaria confirma el 16/10/2026 que las importaciones de septiembre 3 y 4 son correctas y funcionan según lo esperado. Es validación real comunicada por ella; no inventar versión Android, porciones concretas o recorridos no especificados. Las nuevas rutas septiembre 1 y 2 requieren su comprobación física; CI/HTTP no la reemplazan. Pruebas históricas 7 y 8 siguen validadas, con resultados y procedimiento en MAESTRO.md.

## Inicio obligatorio

1. Clonar/fetch main actual y leer AGENTS.md si existe. Registrar SHA y PR concurrentes. Usar rama/worktree aislada; preservar commits simultáneos y no restaurar snapshots antiguos.
2. Leer `docs/bring/OPERACION.md`, `MAESTRO.md`, `AIRTABLE-INGREDIENTES.md`, `EXPORTADOR-PRODUCTOS.md`, `IMAGENES-MENUS.md`, `IMPLEMENTACION-MANTENIMIENTO.md`, los expedientes del menú, `docs/CONTRATO-MENUS-V2.md`, `docs/PWA.md` y contratos de datos. Inspeccionar el código actual, no asumir que coincide con una guía antigua.
3. Revisar menú publicado `datos/menus/MM-N.json`, sus comidas, ambos postres, preparaciones internas y fichas culinarias. La compra completa exige estados calculados, cantidades positivas, enlaces válidos y cobertura de nueve comidas/cenas; viernes cena libre y cinco cafés de oficina se excluyen según política por ID.
4. Confirmar esquema vivo y registros de Airtable; leer catálogo privado vigente `MiruRecetas/datos-productos/productos.json` con su SHA de blob. No publicar catálogo completo ni credenciales. No confundir producto nutricional verificado con formato comercial conocido.

## Arquitectura implementada

| Función | Ruta vigente |
|---|---|
| Activación explícita | `datos/compra/activos.json` |
| Fuente reproducible v1 | `datos/compra/MM-N.json` |
| Extracción autenticada | `scripts/exportar_compra.py` (`make_source`) |
| Recursión, formatos, selección | `scripts/compra.py` |
| Generación | `scripts/generar.py` |
| Página | `menus/MM-N/compra/index.html` |
| Veinte payloads estáticos | `menus/MM-N/compra/exports/1.json` … `20.json` |
| Imagen única | `imagenes/menus/MM-N.webp` |
| Diseño/interacción | `plantillas/compra.html`, `assets/compra.css`, `assets/compra.js` |
| Entrada contextual | `assets/inicio.js`, mapa `compras` de site-data |
| Comprobación pública | `scripts/verificar_compra_publica.py` |

Excepción aprobada: octubre 1 utiliza `imagenes/menus/10-1.png`, 1254 cuadrado, SHA-256 `c7952019f9e9b24a3c1bba2f376e5b354a91c518464b2e85d6276a48252c62c7`; no regenerar/convertir/recortar. Las fotos de recetas y los experimentos históricos se conservan.

## Airtable y metadatos

Base observada `apprzwAwMVhkn3oHh`; confirmar al iniciar. INGREDIENTES `tblJ7cjOhGBHLMWxv`. Campos existentes de texto de una línea: Nombre de visualización `fldr6piAwwi3gHG7x`, Descripción de compra `fldXb73P5SLE5syZe`. Reutilizarlos y completar únicamente presentación necesaria, conservando nombres técnicos, IDs, referencias, enlaces, cantidades, fórmulas y nutrientes. Documentar antes/después y releer cada cambio. No duplicar ingredientes por compartir nombre visible ni crear «Nombre Bring!» adicional.

El grafo recorre MENÚS → COMIDAS → COMIDA_ELEMENTOS y PREPARACIONES → PREPARACION_ELEMENTOS → INGREDIENTES. Los vínculos de postre ingrediente y preparación pueden coexistir, con cantidades independientes. Sofrito clásico u otras bases internas sin slug también se expanden. Cada uso repetido se recorre otra vez; detectar ciclos y referencias ausentes.

## Cálculo y contrato

- Agregar exclusivamente por ID real de ingrediente y unidad comprobada. IDs distintos siguen separados aunque compartan itemId; g/ml incompatibles nunca se fusionan. Preservar fracciones exactas en texto (`340/3`), sin convertir a valores visuales para calcular.
- Orden: expandir → sumar exacto → multiplicar por N elegido → convertir presentación verificada → techo. Unidades/envases fraccionarios al entero superior; g/ml sin formato a la decena superior, conservando decenas exactas. Necesidad real se muestra con máximo un decimal.
- Resolver producto por referencia PROPIOS exacta, con DERIVED explícito para los casos históricos; nunca quitar sufijos o deducir tamaños por nombre. Priorizar contenido individual verificado, neto/escurrido según el uso real y distinguirlo del pack exterior.
- Ejemplos vigentes: atún 60 g escurridos/lata; aceitunas 50 g/lata; caballa 85 g escurridos/lata; tomate Iberitos 22 g/tarrina; nata 200 ml/envase; arroz cocido 125 g/vasito; mini tortilla 25 g; yogur 125 g; rebanada Oroweat 36,5 g aproximados. Cada equivalencia pertenece a su ficha exacta.
- Chorizo Julián Becerro: ficha verificada, peso de pieza desconocido (`cantidad_envase.valor: null`); mantener g y redondeo por decenas. No bloquear ni inventar una pieza.
- Dorada: el registro comestible aporta 192,5 g por pieza de compra de 350 g, rendimiento FEN estimado 55 % ya documentado. Solo su ID tiene equivalencia explícita a una dorada. No generalizar rendimientos a otros pescados ni alterar nutrición.
- AOVE, miel, tahini y soja siempre stock true por IDs. Comino, pimienta y pimentón siguen las reglas explícitas; condimentos sin cantidad también stock, sin cero/spec numérico ni nutrientes inventados.
- Nombres sencillos; características por comas. Nunca añadir una segunda cantidad culinaria dentro de spec. Mantener variantes como dos artículos JSON aunque Bring! las reúna en cesta. No confundir concatenación de descripciones con suma o conversión.

Fuente v1: grafo mínimo, productos proyectados, condimentos, cálculo reconstruible, cobertura, exclusiones y huellas de menú, ingredientes/raciones de recetas, grafo, catálogo e imagen. No editar agregados a mano. Las aclaraciones culinarias `aclaraciones_compra` conservan equivalencias expresas sin cambiar Airtable: jamón ibérico presentado con referencia nutricional serrano autorizada; azúcar blanco y moreno agrupado bajo un ID ya autorizado. Verificar preparación y ruta, y bloquear si aparece otro uso que haga ambigua la variante.

`complementos` es una extensión opcional compatible de v1 para ingredientes culinarios necesarios que carecen de ID nutricional: actualmente limón/naranja aromáticos y vainilla/levadura de galletas. Se extraen de líneas exactas de recetas por preparación verificada; se escalan por sus raciones base en cada aparición. Conservar cada uso, cantidad, unidad, fuente y ruta; no agregar por nombre ni crear IDs/nutrientes. Los cítricos se exportan como compra, unidades al techo; vainilla/levadura como despensa con cantidades g/ml reales y decena. No tratar como desconocida una cantidad que sí consta en ficha. Cualquier nuevo caso requiere trazabilidad y prueba específica.

## Imagen y coordinación

Comprobar primero `imagenes/menus/`. Usar una sola imagen canónica fiel al menú, sin regenerar aprobadas por cambios de estilo. Si falta, encargar o ejecutar el flujo de AGENTE-IMAGENES.md dentro del alcance. No activar una compra completa hasta disponer del archivo real y su huella. La imagen se publica en página y todos los payloads mediante la misma URL absoluta. Un menú nuevo no reutiliza la portada de otro.

## Extracción, pruebas y publicación

1. Leer las seis tablas y normalizar campos/vínculos como hace el adaptador. Ejecutar `make_source` con catálogo vigente, o REST seguro:

```bash
# Variables ya presentes en entorno seguro; no imprimir valores.
python scripts/exportar_compra.py
python scripts/generar.py
python -m unittest discover -s tests -v
node --check assets/compra.js
node --check assets/inicio.js
node --check tests/compra_qa.cjs
git diff --check
```

El exportador REST requiere AIRTABLE_TOKEN, PRODUCTOS_JSON y PRODUCTOS_BLOB_SHA. Si se usan conectores autenticados, construir el mismo formato y pasar por `make_source`; no escribir una compra desde texto aproximado. Hacer segunda extracción y comparar semánticamente la proyección completa de dependencias antes de guardar; orden de claves y registros ajenos no son cambios del menú.

2. Añadir solo la clave autorizada a activos, fuente e imagen. Generar las veinte selecciones y repetir generación: mismas entradas producen mismos bytes. Menú o recetas desactualizadas bloquean; corregir en su flujo operativo, no modificar sus macros para desbloquear compra.
3. Tests significativos: totales por origen, repeticiones, bases internas, ambos postres, variantes/ID/unidad, neto/escurrido/individual, stock, escala previa y complementos sin ID. Añadir QA de acceso, imagen, tabla, selector N y regreso para cada menú nuevo. Mantener regresión de web y PWA real.
4. Revisar diff sin cambios ajenos. Abrir PR y esperar Validar web y QA navegador. Reconciliar main si avanzó, preservando cambios concurrentes. Fusionar dentro de la autorización vigente.
5. Esperar Publicar recetas y Pages. El workflow se dispara por datos/compra y guarda menus, index y assets generados; no asumir que subir fuente equivale a desplegar. Ejecutar/comprobar `verificar_compra_publica.py`: HTTP anónimo 200, MIME correcto y bytes de fuente, página, veinte JSON e imagen por menú activo.
6. Navegador público: entrada contextual, imagen decodificada, selector 1/3/extremos, URL y tabla, enlace válido, regreso al mes/menú. CI cubre móvil/tablet/escritorio; distinguirlo de dispositivo físico. Nunca afirmar importación real por abrir deeplink o inspeccionar JSON.
7. Expediente con fecha, main, fuentes, PR/SHA, CI, publicación, HTTP, navegador y resultado físico comunicado o pendiente. Actualizar protocolos/refencias y entregar URL lista para usar.

## Bring! y PWA

JSON propio, no JSON-LD: author, name, tagline, yield como texto N, linkOutUrl con `?porciones=N`, imageUrl absoluta, items con itemId sencillo, spec de compra y stock. Enlace `https://api.getbring.com/rest/bringrecipes/deeplink` con url del JSON N, source=web, baseQuantity=N y requestedQuantity=N. Evitar doble escalado. Favoritos viejos mantienen datos anteriores; comprobar mediante nueva importación.

Misma PWA, manifest, iconos y scope. No crear otra instalación ni precachear todos los payloads. Exportar exige red; el cliente comprueba el JSON antes de habilitar el enlace, bloquea errores/cantidades inválidas y ofrece reintento. La lista ya abierta puede consultarse al perder conexión; no garantizar reapertura offline ni importación sin red. Mantener diseño crema/salvia, logo, tipografías y estructura visual editable mediante plantilla/CSS.

## Mantenimiento y recuperación

No existe escucha automática de Airtable. Cambiar Airtable no cambia la web hasta nueva extracción, generación y publicación. Cambios de subpreparaciones/productos/ingredientes afectan dependencias: regenerar las compras correspondientes y revisar imagen si cambian platos. Las huellas culinarias ignoran cambios de fotografía o notas ajenos a compra.

Para retirar acceso temporalmente: quitar clave de activos y regenerar en PR. Las salidas antiguas siguen accesibles hasta eliminarlas expresamente en la misma PR si se solicita. Revertir solo cambios propios; preservar recetas, nutrientes, fotos, experimentos y campos. No borrar cachés, favoritos o almacenamiento del usuario. Una corrección exige importación nueva para actualizar Bring!.

## Prompt breve de apertura

Actúa como responsable único de listas de compra Bring! de MiruRecetas. Lee íntegramente el documento adjunto AGENTE-INTEGRACION v3.0 y los protocolos vigentes de docs/bring en main. A partir del menú ya publicado que te indique, completa autónomamente verificación Airtable/productos, extracción exacta, presentación, coordinación de imagen, página y JSON, integración web/PWA, pruebas, rama, PR, fusión, publicación HTTP y navegador, y documentación. Conserva las validaciones reales de pruebas 7/8 y septiembre 3/4; distingue las nuevas pruebas físicas pendientes. Respeta cambios concurrentes y no alteres recetas, menús, cantidades culinarias, nutrición, fotos aprobadas ni la PWA única. Ejecuta únicamente los menús que indique; solicita intervención solo ante bloqueo real. Menú: [MES · NÚMERO].

## Regla de diseño — portadas en móvil vertical · 16/10/2026

En las listas de compra, la portada debe quedar centrada horizontalmente en móvil y PWA en vertical dentro de la disposición apilada (ancho de viewport hasta 540 px). Se mantiene su tamaño y posición anterior al texto. En horizontal, tablet y escritorio se conserva la disposición existente, con portada a la derecha cuando hay dos columnas. Aplicar la regla en `assets/compra.css` para todos los menús actuales y futuros; no editar ni regenerar las fotografías para corregir alineación.

Verificar el centrado por geometría en móvil vertical y la columna derecha en horizontal/escritorio mediante `tests/compra_qa.cjs`. La misma página y CSS sirven a web y PWA; una prueba automatizada no acredita una prueba física en el dispositivo.
