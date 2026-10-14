# MiruRecetas — Traspaso al gestor de Airtable: presentación de ingredientes

> **Estado vigente · 14/10/2026:** integración permanente de Octubre · Menú 1 publicada mediante PR #86, CI y verificación HTTP/navegador correctos. Solo este menú está activo. [Operación y recuperación](OPERACION.md) · [Expediente de publicación](PUBLICACION-OCTUBRE.md). Las secciones de propuesta anteriores se conservan como antecedentes y no describen el estado de implementación actual. La prueba física de la nueva ruta está pendiente; pruebas históricas 7/8 validadas.


Versión 1.0 · 14/10/2026. Complementa el Maestro Bring! v2.0 y los protocolos Airtable/recetas. Especificación para el siguiente encargo; no afirma que se hayan creado campos o modificado registros.

## Motivo y evidencia

Nombre técnico «Huevo de gallina entero crudo» generaba icono de pollo; «Higo fresco (higos y brevas)», icono incorrecto; garbanzo cocido con «sin sal», icono de sal. Prueba 7 usa Huevos, Higos y Garbanzos con características por comas: la usuaria confirma iconos correctos, escalado y unión de descripciones en cesta. Se necesita presentación editorial persistente sin cambiar identidad ni datos nutricionales.

## Esquema propuesto, que debe verificarse antes de ejecutar

Base observada: `apprzwAwMVhkn3oHh`. INGREDIENTES observada: `tblJ7cjOhGBHLMWxv`. Confirmar accesos y esquema actual por herramientas; no asumir que nombres/IDs siguen vigentes. El último esquema leído no tenía el campo de visualización.

| Campo | Tipo propuesto | Uso |
|---|---|---|
| Nombre de visualización | Texto de una línea | Nombre genérico corto para receta/web y nombre del artículo Bring! |
| Descripción de compra | Texto de una línea | Estado, variante, marca o característica útil para comprar; sin cantidades calculadas |

Crear/reutilizar solo esos campos para este traspaso; conservar el campo técnico `Nombre`, su ID y todo el registro. No borrar/renombrar tablas, fórmulas o enlaces. No duplicar ingredientes porque dos variantes compartan nombre visible. No crear «Nombre Bring!» adicional por defecto: se ha descartado como necesidad general tras prueba 7.

Campo de stock NO obligatorio en esta fase. Las reglas actuales pueden residir en configuración por ID. Si el gestor propone persistirlas, coordinar contrato separado sin añadir campos por inferencia. No alterar nutrientes para convertir un ingrediente en despensa.

## Población inicial verificable

| ID observado | Nombre de visualización propuesto | Descripción de compra probada |
|---|---|---|
| `recuumabv4qaMUXNE` | Garbanzos | cocidos, sin sal |
| `recQJX7aiVeoHJvep` | Garbanzos | secos |
| `recSPOXZkbn9PSbHI` | Huevos | vacío |
| `recPmxLD5hBc4rvSM` | Higos | frescos |
| `recBse4SOxBOPwYEQ` | Yogur | griego natural, DIA Fidias |
| `recGpy51QX8MYe0j9` | Miel | natural |
| `rechMDQXS4hW2JBYg` | Tahini | NaturGreen |
| `recpst98trSqZIPSe` | Salsa de soja | Salseo |
| `rec4QWbZX5KJIhQyW` | Aceite de oliva | virgen extra |

Son correspondencias de ensayo por ID, no una instrucción para reclasificar alimentos. Verificar cada ficha antes de trasladar. El garbanzo cocido genérico no se convierte en conserva: no inventar EAN, marca ni formato de tarro. Las dos variantes conservan sus dos IDs y estados nutricionales.

Para los demás ingredientes, inventariar y proponer etiquetas sencillas conservando lo necesario para identificar el alimento (leche, tipo de harina, carne, etc.). No eliminar información técnica: sigue en Nombre y sus referencias. Las características de compra llevan comas sin cantidades, fracciones, paréntesis nutricionales, nutrientes ni mensajes técnicos. El exportador añadirá el número y la unidad delante de ellas.

Las fichas culinarias actuales prohíben marcas visibles y usan AOVE/Sal. Respetar esos nombres editoriales y las aclaraciones del uso de un ingrediente (p. ej. tomate genérico presentado como Tomate cherry) hasta migración coordinada. Nombre de visualización genérico no debe imponer marca a recetas ni borrar la variante culinaria. La marca puede aparecer en la descripción de compra, no en notas de cocina.

## Invariantes y fronteras

- Agregación numérica exclusivamente por ID/unidad, nunca nombre visible. Dos IDs con Garbanzos pueden exportar el mismo itemId y mantener dos cantidades.
- No fusionar registros, fórmulas o nutrientes de seco/cocido. La unión posterior en Bring! es de presentación y concatena descripciones.
- No cambiar cantidades en PREPARACION_ELEMENTOS/COMIDA_ELEMENTOS, raciones, bases nutricionales, enlaces, valores oficiales, estados calculados ni catálogos.
- Los condimentos sin cantidad no requieren nuevos registros nutricionales por este cambio. Conservar su situación y trazabilidad; stock no inventa nutrientes.
- No normalizar ml/g ni convertir AOVE 1:1. No corregir recetas o menús en el mismo lote.

## Despensa a notificar al exportador

AOVE, miel, tahini y salsa de soja siempre `stock: true`. IDs actuales en la tabla anterior. Mantener un mapa verificable para nuevos registros equivalentes, sin basarse en substrings del nombre. Comino y pimienta cuantificados ya son despensa en el ensayo; condimentos sin cantidad también, sin peso inventado.

No exponer tokens, URLs de adjuntos privados caducables o estructura completa de la base en assets públicos. Exportar solo metadatos necesarios para compra y procedencia de cálculo.

## Ejecución cuando se invoque el encargo

1. Releer esquema y resolver campos existentes; registrar IDs reales del campo y cualquier diferencia con esta guía.
2. Preparar inventario del alcance y copia verificable de los campos que se editarán. Confirmar identidad por ID, no por lista de nombres aproximados.
3. Crear/reutilizar campos y poblar exclusivamente presentación dentro del alcance de la usuaria. No pedir autorización de nuevo para acciones ya expresamente encargadas; pedir intervención solo por ambigüedad esencial o limitación de acceso.
4. Releer registros afectados y comprobar que datos ajenos permanecen iguales; verificar que fórmulas/estados y vínculos no cambian.
5. Entregar un expediente por registro y campo con antes/después, nombres e IDs de campos, tipos, valores nulos/vacíos y estados de verificación. No enviar mensajes a otros chats automáticamente.
6. Registrar contrato en GitHub mediante rama/PR cuando autorizado, conservando cambios simultáneos. No modificar exporter/web desde el chat Airtable.

## Prompt breve de apertura

Actúa como gestor de Airtable de MiruRecetas. Lee esta guía y el Maestro Bring! v2.0 y verifica el esquema actual. Implementa en INGREDIENTES Nombre de visualización y Descripción de compra, reutilizando campos si ya existen y conservando Nombre técnico, IDs, enlaces, cantidades, fórmulas y nutrientes. Usa nombres genéricos cortos y características por comas; las variantes con nombre común siguen siendo registros separados. Verifica los nueve casos probados y prepara el inventario restante dentro del alcance acordado. Entrega IDs/tipos de campos y correspondencias verificadas al exportador, sin modificar web/PWA ni recetas y sin crear registros duplicados.


## Implementación permanente · 14/10/2026

El encargo posterior de Lucía autoriza la integración y publicación de Octubre · Menú 1. El estado documental previo se conserva como expediente histórico. El contrato ejecutable, campos reales, extracción, generación, rutas, límites PWA, incorporación de menús y recuperación se describen en [OPERACION.md](OPERACION.md); las verificaciones y estado de despliegue se registran en [PUBLICACION-OCTUBRE.md](PUBLICACION-OCTUBRE.md). Solo octubre está habilitado; extender a otros menús requiere autorización posterior. Las pruebas físicas 7 y 8 permanecen validadas, sin atribuirles una importación de la nueva ruta.
