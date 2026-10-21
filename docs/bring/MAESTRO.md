> **Vigencia reconciliada · 21/10/2026.** [Estado actual, aclaraciones y pendientes](../ESTADO-RECONCILIADO-2026-10-21.md) prevalece sobre propuestas históricas incompatibles de esta guía. Se conserva su contenido operativo y su trazabilidad. No autoriza cambios funcionales durante la sincronización documental.

# MiruRecetas — Maestro Bring! y expediente de implementación

> **Estado vigente 16/10/2026:** la integración permanente está implementada. Activos: Octubre 1 y Septiembre 1–4, veinte selecciones por menú. La usuaria confirma importaciones correctas de septiembre 3/4; no volver a presentarlas como pendientes. Las pruebas 7/8 conservan íntegramente sus resultados y procedimiento. Leer [ESTADO](ESTADO.md), [operación](OPERACION.md) y los traspasos [integración](AGENTE-INTEGRACION.md) / [imágenes](AGENTE-IMAGENES.md). Las descripciones de propuestas/ausencias del 14/10 que se conservan abajo son antecedentes históricos, no estado actual.

> **Ampliación autorizada · 15/10/2026:** Lucía solicita Septiembre · Menú 4. Se incorpora `09-4` manteniendo `10-1`, con fuente actual, imagen propia, veinte selecciones y los mismos contratos de cálculo/PWA. [Operación vigente](OPERACION.md) · [Expediente de septiembre](PUBLICACION-SEPTIEMBRE4.md). Las restricciones anteriores a octubre describen el primer despliegue y quedan ampliadas solo a este segundo menú.


> **Estado vigente · 14/10/2026:** integración permanente de Octubre · Menú 1 publicada mediante PR #86, CI y verificación HTTP/navegador correctos. Solo este menú está activo. [Operación y recuperación](OPERACION.md) · [Expediente de publicación](PUBLICACION-OCTUBRE.md). Las secciones de propuesta anteriores se conservan como antecedentes y no describen el estado de implementación actual. La prueba física de la nueva ruta está pendiente; pruebas históricas 7/8 validadas.


Versión 3.0 · 16/10/2026 · Responsable de integración Bring!.

Sustituye íntegramente el traspaso Bring! del 13/10/2026. Complementa los maestros de web, PWA, recetas, comidas y productos exclusivamente en materia de lista de compra. No sustituye sus contratos nutricionales, culinarios, editoriales ni de publicación.

Repositorio: https://github.com/MiruRecetas/menu-anual-recetas. Base inspeccionada: `ed60c8eaaabb000ed410ac2ed4bb055d0d1b4e39`. Leer main y PR abiertas al iniciar: esa base no es una instrucción de restauración. Documentación canónica nueva: `docs/bring/`.

## 1. Estado y autorización

La usuaria ha validado físicamente en Bring! Android las pruebas finales 7 y 8: nombres sencillos, características por comas, unión de variantes en cesta, escalado, despensa e imagen de menú. La validación de imagen se comunica el 14/10/2026 a las 19:47, hora de España peninsular, con captura de la receta importada.

Este encargo actualiza documentación y prepara agentes para implementar; NO ejecuta todavía cambios de esquema/datos en Airtable, exportador de producción, interfaz web/PWA, nutrición, recetas, menús o imágenes canónicas. Los prompts al final de las guías son encargos concretos para cuando la usuaria los invoque. No enviar mensajes a otros agentes o servicios en su nombre.

Implementado y publicado: únicamente experimentos públicos en `experimentos/bring/`. Falta implementar: campos de presentación en INGREDIENTES, extracción permanente del grafo de preparaciones/ingredientes, contrato de compra reproducible para cada menú, imágenes de menú en carpeta canónica, generación integrada y acceso desde web/PWA. No presentar esas propuestas como funciones actuales.

## 2. Fuentes de verdad y límites

- MENÚS → COMIDAS → COMIDA_ELEMENTOS; PREPARACIONES → PREPARACION_ELEMENTOS → INGREDIENTES. Ambas ramas acaban en el ID real del ingrediente.
- Nutrición: fórmulas oficiales de Airtable y procedimientos de recetas vigentes. Una lista de compra no modifica cantidades culinarias, retención de aceite, ajustes de alcohol ni nutrientes.
- Productos propios: `MiruRecetas/datos-productos/productos.json`, ficha exacta vinculada por referencia PROPIOS, contenido neto/escurrido y unidades por presentación verificados. Una equivalencia comercial no cambia la identidad nutricional.
- Elaboración y apariencia: fichas culinarias actuales, incluidas bases internas y subpreparaciones. Imagen generada = representación editorial, no prueba documental de ingredientes ni fotografía de la usuaria.
- Instantáneas experimentales: congeladas, NO sincronizadas ni aptas para copiar como los menús actuales sin releer sus fuentes. Septiembre se ensayó incompleto; octubre con datos completos. Main puede haber cambiado después.
- El café de oficina se excluye de la compra por la decisión ya fijada. No excluir toda la leche, el café culinario u otras bebidas por semejanza de nombre. Viernes cena libre no aporta artículos.

## 3. Algoritmo definitivo de compra

1. Validar todos los enlaces y cantidades del menú seleccionado; incluir comida, cena y ambos vínculos de postre cuando existan (ingrediente/fruta Y preparación). No excluir el bowl por coexistir con fruta.
2. Expandir recursivamente cada preparación. En cada nivel aplicar cantidad base × raciones solicitadas / raciones base. Detectar ciclos, vínculos ausentes y bases no positivas. Cada uso en otro día aporta de nuevo; no deduplicar una preparación antes de contar consumos.
3. Desglosar también bases internas como Sofrito clásico aunque no tengan slug/ficha. Deben terminar como ingredientes, nunca como artículo de compra. No expandir un producto comercial compuesto como si fuera preparación culinaria.
4. Agregar cantidades exclusivamente por `(ID único real de INGREDIENTES, unidad compatible comprobada)`. Inicialmente conservar unidad literal: g y ml permanecen separados. Nombres y marcas no son claves de cálculo. Dos IDs distintos no se suman aunque compartan nombre.
5. Multiplicar totales exactos por las porciones elegidas en MiruRecetas antes de convertir presentaciones y redondear. En los experimentos el menú base es una persona y el selector admite enteros 1–20; este límite es de ensayo, no requisito universal de Bring!.
6. Convertir únicamente mediante equivalencias verificadas: 330 ml gazpacho = 1 botella si la ficha declara ese formato; 75 g mini tortillas de 25 g = 3 tortillas; pan en rebanadas; yogur en vasitos. Conservar la unidad individual si corresponde, no sustituirla automáticamente por un paquete exterior.
7. Si la cantidad en presentación es entera, conservarla. Si es fraccionaria, techo matemático DESPUÉS del escalado: `compra = ceil(cantidad_escalada / contenido_unidad)`.
8. Si no existe presentación unitaria verificada y la cantidad está en g/ml: `compra = ceil(cantidad_escalada / 10) × 10`. Una decena exacta se conserva. Se aplica también a conservas genéricas sin formato, como anchoas; no limitarlo a una categoría llamada «frescos».
9. Para mostrar «Necesidad real», cero o como máximo un decimal. Esa cifra es solo visual; no alimenta sumas, escalado, conversión ni redondeo. Preservar precisión exacta o aritmética decimal controlada internamente.

Ejemplos comprobados: cebolla 117,5 g → 120 g; AOVE aproximadamente 58,7 ml → 60 ml; anchoas a 4 porciones 340/3 g → necesidad visible 113,3 g → compra 120 g; a 5, 425/3 g → 141,7 g → 150 g. Philadelphia 17,5 g a 1 persona y 52,5 g a 3 → 1 tarrina en ambos casos si el formato es 250 g. Redondear 1 persona primero y multiplicar después daría una compra diferente.

No convertir aceite g/ml por equivalencia 1:1 ni densidad supuesta. La conversión de unidades distintas queda para otro encargo. Equivalencias de huevo/diente requieren respaldo específico: los experimentos usan huevo 50 g comestibles/unidad; septiembre ajo 3 g/diente, pero octubre mantiene gramos porque las recetas indican dientes de 2,7 y 3 g. No generalizar esos tamaños.

## 4. Despensa y cantidades desconocidas

`stock: true` significa necesario para cocinar pero probablemente disponible en casa, NO prescindible culinariamente. Bring! lo presenta en su apartado de despensa/«Probablemente ya tienes».

Siempre despensa, mediante identidad explícita y nunca búsqueda de palabras:

| Ingrediente probado | ID Airtable observado |
|---|---|
| Aceite de oliva virgen extra | `rec4QWbZX5KJIhQyW` |
| Miel | `recGpy51QX8MYe0j9` |
| Tahini | `rechMDQXS4hW2JBYg` |
| Salsa de soja | `recpst98trSqZIPSe` |

Los cuatro son regla de producto para futuros registros equivalentes: ampliar el mapa con el ID real verificado, sin inferir por nombre ni fusionar registros. Comino `recZmy5VtKavv2D9U` y pimienta `rec70jSFploNVyMCF` cuantificados son despensa en octubre; sal y condimentos no cuantificados también.

Condimentos al gusto sin peso: incluir en exportación como stock, sin asignar cero ni aportes nutricionales. Omitir `spec` si no hay cantidad ni característica útil. Si hay descripción verificada, puede incluirse sin inventar número, pero ese caso no se ensayó en las pruebas finales.

Los condimentos literales sin vínculo Airtable presentes en las fichas web se conservaron como checklist no numérico, con origen auditable. No inventar IDs ni agrupar sus cantidades por nombre. Si un literal exacto ya existe como artículo cuantificado de despensa, las pruebas evitan repetir la misma etiqueta conservando los orígenes sin cantidad; no trasladar esta excepción a fusiones numéricas generales.

## 5. Nombres, características y dos identidades distintas

Campo propuesto en INGREDIENTES: `Nombre de visualización`; complementarlo con `Descripción de compra`. Conservar `Nombre` técnico y sus referencias. No hace falta un segundo nombre específico Bring! salvo una excepción demostrada posteriormente.

El nombre corto determina reconocimiento y presentación en Bring!; las características van tras la cantidad, separadas por comas. Ejemplos reales de prueba 7:

| ID | itemId | spec a 3 porciones |
|---|---|---|
| `recuumabv4qaMUXNE` | Garbanzos | `270 g, cocidos, sin sal` |
| `recQJX7aiVeoHJvep` | Garbanzos | `90 g, secos` |
| `recSPOXZkbn9PSbHI` | Huevos | `6 huevos` |
| `recPmxLD5hBc4rvSM` | Higos | `300 g, frescos` |
| `recBse4SOxBOPwYEQ` | Yogur | `5 vasitos, griego natural, DIA Fidias` |

Ambos Garbanzos son artículos independientes en la receta importada. Al añadirlos a la cesta, Bring! los reúne como «Garbanzos» con `270 g, cocidos, sin sal + 90 g, secos`. Concatena descripciones: NO demuestra suma aritmética ni conversión entre seco/cocido. MiruRecetas mantiene cantidades y IDs separados hasta exportar.

El ingrediente genérico cocido sin sal usado en octubre NO acredita un envase en conserva. No llamarlo «conserva» ni inventar formato comercial; ese texto pertenecía a la receta ficticia de la usuaria.

No reintroducir cantidades reales secundarias entre paréntesis o tras punto y coma: fracasaron como texto escalable en prueba 4. El patrón validado es cantidad de compra inicial + características textuales por comas. La necesidad real queda en la página. No poner números secundarios innecesarios en la descripción.

La descripción de compra puede conservar marca, estado y variedad para comprar. La ficha culinaria sigue sin marcas en campos visibles y con sus reglas editoriales (AOVE, Sal, presentaciones como Tomate cherry). No insertar auditorías en notas. El campo compartido no borra los matices del ingrediente en una receta: conservar las aclaraciones existentes de cada uso, sin convertirlas en otra clave de suma.

## 6. Contrato Bring! validado

JSON propio, distinto de JSON-LD/Schema.org:

```json
{
  "author": "MiruRecetas",
  "name": "Octubre · Menú 1 · 3 porciones",
  "tagline": "Menú semanal. Compra calculada antes de exportar.",
  "yield": "3",
  "linkOutUrl": "https://mirurecetas.github.io/menu-anual-recetas/experimentos/bring/prueba-8-10-1/?porciones=3",
  "imageUrl": "https://mirurecetas.github.io/menu-anual-recetas/experimentos/bring/prueba-8-10-1/menu-octubre-1.png",
  "items": [
    {"itemId": "Garbanzos", "spec": "270 g, cocidos, sin sal", "stock": false},
    {"itemId": "Garbanzos", "spec": "90 g, secos", "stock": false},
    {"itemId": "Sal", "stock": true}
  ]
}
```

Ejemplo de contrato, no un menú completo ni un fichero listo para publicar como datos reales. En producción cambiar URLs solo al implementar las rutas reales.

Enlace probado: `https://api.getbring.com/rest/bringrecipes/deeplink?url=URL_JSON_CODIFICADA&source=web&baseQuantity=N&requestedQuantity=N` para un JSON YA calculado para N y `yield: "N"`. No volver a multiplicarlo mediante parámetros. `linkOutUrl` devuelve a la página y conserva porciones.

JSON e imagen deben ser públicos y accesibles sin sesión. El importador remoto no puede leer estado solo local o contenido que existe únicamente después de ejecutar JS. Publicar JSON estáticos válidos o una solución equivalente realmente accesible; no poner tokens Airtable/GitHub en navegador ni payload.

La usuaria confirma escalado dentro de Bring! con características por comas. Es correcto como multiplicación de la compra ya redondeada; no recalcula necesidades exactas ni envases mínimos. Procedimiento principal: cambiar personas en nuestra página y hacer nueva importación. Un favorito viejo conserva datos viejos; siempre nueva importación al comprobar cambios.

Tagline: Bring! mantiene el texto, elimina saltos originales y ajusta líneas visualmente. No depender de saltos. No atribuir redondeo universal de unidades al importador. No se valida iOS, todas las versiones ni todos los nombres/iconos del catálogo.

## 7. Imagen: contrato y validación final

Prueba 8 usa el PNG ORIGINAL aportado: 1254 × 1254, sin editar, con SHA-256 `c7952019f9e9b24a3c1bba2f376e5b354a91c518464b2e85d6276a48252c62c7`.

Ruta publicada: `experimentos/bring/prueba-8-10-1/menu-octubre-1.png`. La página lo muestra y los 20 payloads contienen la misma `imageUrl` absoluta. HTTP 200, MIME PNG y bytes idénticos verificados; captura física posterior confirma portada en Bring!. No implica que la imagen sea una representación culinaria exacta de cada plato: se aprobó para ensayar imagen y estilo.

Para imágenes futuras: guía específica de imágenes de menú. Ruta NUEVA acordada documentalmente para implementar: `imagenes/menus/MM-N.webp`, 1:1, referencia 1024 × 1024, cenital de platos reales sobre una única superficie, cálido/editorial. No modificar fotos de recetas ni crear variantes en `imagenes/batchcooking/`. La carpeta canónica no está implementada por este encargo.

## 8. Expediente de las ocho pruebas

| Prueba / publicación | Objetivo y resultado real | Decisión |
|---|---|---|
| 1 · PR #70 · octubre | HTML de menú como receta; expansión y enlace funcionaron; descripción ausente y nombres problemáticos | Probar JSON propio |
| 2 · PR #71 | JSON importa título, autor, tagline, ingredientes, stock, iconos y enlace; escalado también de stock confirmado en Android | Usar contrato JSON |
| 3 · PR #72; documentación #73 | Tagline multilínea pierde saltos; texto completo se conserva. Base 2 correcta; al bajar a 1: bacalao 400 g, huevos 2, yogur 1,5 unidades. Ajo fraccionario | No depender de saltos ni redondeo de Bring! |
| 4 · PR #76 · septiembre incompleto | Identidad Airtable, recursión y compra por envases. 4A paréntesis, 4B punto y coma, 4C fracción + necesidad: cifras secundarias NO escalan. Usuaria rechaza las tres | Descartar esas anotaciones para cantidades reales |
| 5 · PR #77; corrección #78 | Selector antes de importar, envases redondeados tras escalar, AOVE stock. Usuaria confirma procedimiento; detecta anchoas sin decena y necesidad con seis decimales | Corregir toda salida g/ml sin presentación y máximo un decimal visible |
| 6 · PR #78 · octubre; despensa #79 | Menú completo con postres. Importación a 1 y 3 porciones confirmada. Miel/tahini/soja pasan a stock por IDs | Adoptar reglas de cantidades y despensa |
| 7 · PR #80 | Nombres sencillos y características por comas. Garbanzos independientes en receta y combinados en cesta; huevos/higos con iconos correctos, yogur/despensa correctos, escalado web y Bring! confirmado | Adoptar nombre corto + descripción; NO fusionar cálculos por nombre |
| 8 · PR #81 | Página con imagen y imageUrl. HTTP/binario verificados; usuaria confirma imagen visible en Bring! | Adoptar imagen única de menú para página y receta importada |

PR #74 (etiquetas culinarias) y #75 (maestro recetas) no fueron pruebas Bring!. No incorporarlas como tales.

Merges comprobados:

| PR | SHA de merge |
|---|---|
| 70 | `45cd64cb5b019f6067f7405264150ccfea479675` |
| 71 | `ee4e76400eecb2d3675f5aedfc1efd6d912c11cd` |
| 72 | `8dd572d58f56dcf4fccfff58493a503554c3622a` |
| 73 | `e31b6c1763a4a432ce98182cd4d890363d2a0b48` |
| 76 | `3ce807e1d2afbdd926b580f4490e16cf21161ce9` |
| 77 | `02b91249cbb9a4049f1fcd92d37d97774108e403` |
| 78 | `6ef1b79ffc722f4bec735bc053aa7f90267f4859` |
| 79 | `66b9da5ee19d60ea870a66f649d8d3b2dfbc2675` |
| 80 | `ed85534c6605e868e97138e6e68cd28bb5a31917` |
| 81 | `97bd8fcfa197242e7411bdad2b3e482a5b42aec2` |

URLs de ensayo bajo `https://mirurecetas.github.io/menu-anual-recetas/experimentos/bring/`: `10-1/` (1–3), `prueba-4-09-1/`, `prueba-5-09-1/`, `prueba-6-10-1/`, `prueba-7-10-1/`, `prueba-8-10-1/`.

El prototipo 4–8 incluye snapshot, auditoría exacta, generador y tests. 5–8 incluyen vista y 20 exports. Prueba 6: snapshot culinario de `02b91249cbb9a4049f1fcd92d37d97774108e403`, catálogo comercial blob `193f1ba3b51a4b7941e3120ec30ffcca16d936a0`; 54 filas agregadas de ingredientes cuantificados. La salida final contiene 59 artículos (48 compra y 11 despensa), con los garbanzos como dos artículos. No interpretar la unión posterior de cesta como un ingrediente menos en el cálculo.

Verificación técnica documentada: tests locales de recursión, identidad/unidad, ciclos, paquetes escurridos, redondeos y reproducibilidad; selector público comprobado en intervenciones previas; CI Validar web/QA navegador y Pages para cada PR final. Prueba 6: 6 tests tras cambio de stock; prueba 7: 2 tests y controles de los 20 exports; prueba 8: 3 tests e integridad PNG. HTTP final de prueba 7: 25 archivos; prueba 8: 24, incluidos PNG y 20 exports. No atribuir ejecución de tests experimentales al CI existente, que acredita regresión de producción, ni llamar a HTTP prueba física.

## 9. Plan de implementación y coordinación

1. Airtable: confirmar esquema actual; crear/reutilizar campos de presentación, poblar sin tocar cantidades/nutrientes/IDs; entregar nombres e IDs de campos, versión y correspondencias. No crear duplicados.
2. Exportador/productos: extraer grafo y formatos en entorno autenticado; validar referencias y producir contrato estático por ID. No depender de slugs/nombres como identidad ni de acceso Airtable en cliente.
3. Imágenes: generar una imagen fiel por menú real publicable; guardar y verificar binario en ruta canónica; registrar menú/SHA de fuentes. Coordinar con implementación para URL, sin editar nutrientes o recetas.
4. Implementación/mantenimiento: convertir fuente de compra en página por menú, selector, tabla y payloads; integrar acceso desde menú web/PWA sin reemplazar ficha de receta ni PWA. Revisar caché/rutas y flujo desde modo standalone.
5. Validar localmente, CI, publicación, HTTP, navegador y pruebas físicas que efectivamente se ejecuten. Registrar rollback y resultado.

El orden permite avanzar diseño/tests mientras se esperan metadatos, pero no publicar cantidades o envases inventados para desbloquear dependencias. Resolver incompatibilidades de contrato antes de publicarlas; conservar fallback editorial cuando falte una etiqueta, con diagnóstico sin exponer detalles técnicos al usuario final.

## 10. Condiciones de aceptación

- Totales y trazabilidad por ID exactos, recursión completa sin doble conteo, ambos postres presentes; unidades incompatibles separadas.
- Necesidad real ≤1 decimal visible, cantidad exportada calculada tras escalar, formatos verificados y stock estable.
- Nombres sencillos sin marcas en fichas culinarias; marcas útiles solo en descripción de compra. Diferentes IDs pueden compartir itemId conservando specs separados.
- Cada selección publicable tiene JSON público con yield correcto y parámetros coherentes; imagen pública real si declarada; sin secretos.
- UI integrada con diseño y accesibilidad actuales, móvil/tablet/escritorio, selección coherente y exportación inválida bloqueada. Falta de datos o red no simula exportación correcta.
- PWA sigue siendo la misma publicación. Importar requiere red y acceso remoto al JSON; no prometer Bring! offline ni almacenamiento de cesta propio.
- No modificar macros, etiquetas culinarias, fotos de recetas, calendario, modo cocina o datos ajenos.

## 11. Retirada y mantenimiento

Experimentos independientes: no tienen registro SW propio ni navegación de producción, pero comparten origen/scope; el SW existente puede guardar una visita. No borrar cachés o favoritos para retirar pruebas.

Tras implementar, no eliminar experimentos por iniciativa propia: conservarlos como controles hasta encargo de retirada. Borrar únicamente rutas acordadas mediante PR y verificar 404 y continuidad de producción. Favoritos Bring! no se borran con la web.

Documentar por cambio fecha, main SHA, fuentes, PR, suites reales, Pages/HTTP, observación física y limitaciones. No afirmar sincronización automática con Airtable mientras no exista y esté configurada. El maestro es el contrato; el código y los datos actuales describen el estado implementado.

## 12. Guías y fuentes

- Imágenes de menú: `docs/bring/IMAGENES-MENUS.md`.
- Cambios Airtable: `docs/bring/AIRTABLE-INGREDIENTES.md`.
- Exportación y formatos: `docs/bring/EXPORTADOR-PRODUCTOS.md`.
- Implementación y mantenimiento: `docs/bring/IMPLEMENTACION-MANTENIMIENTO.md`.
- Prompts: `docs/bring/PROMPTS-AGENTES.md`.
- Guía oficial: https://sites.google.com/getbring.com/bring-import-dev-guide/web-to-app-integration/alternative-button-integration (ejemplo imageUrl); https://sites.google.com/getbring.com/bring-import-dev-guide/web-to-app-integration .

No se ha solicitado adhesión a recipe partners/Inspiration Stream. No añadir cuentas, backend, tiendas, analítica, publicidad ni sincronización privada como parte de esta integración.


## Implementación permanente · 14/10/2026

El encargo posterior de Lucía autoriza la integración y publicación de Octubre · Menú 1. El estado documental previo se conserva como expediente histórico. El contrato ejecutable, campos reales, extracción, generación, rutas, límites PWA, incorporación de menús y recuperación se describen en [OPERACION.md](OPERACION.md); las verificaciones y estado de despliegue se registran en [PUBLICACION-OCTUBRE.md](PUBLICACION-OCTUBRE.md). Solo octubre está habilitado; extender a otros menús requiere autorización posterior. Las pruebas físicas 7 y 8 permanecen validadas, sin atribuirles una importación de la nueva ruta.
