> **Vigencia reconciliada · 21/10/2026.** [Estado actual, aclaraciones y pendientes](../ESTADO-RECONCILIADO-2026-10-21.md) prevalece sobre propuestas históricas incompatibles de esta guía. Se conserva su contenido operativo y su trazabilidad. No autoriza cambios funcionales durante la sincronización documental.

# Bring! — Presentación de ingredientes en Airtable

Versión 2.0 · 16/10/2026. Estado implementado; leer ESTADO.md y AGENTE-INTEGRACION.md. Las propuestas del 14/10 se han ejecutado. Reconfirmar siempre esquema/acceso vivos.

Base `apprzwAwMVhkn3oHh`, INGREDIENTES `tblJ7cjOhGBHLMWxv`. Campos de texto de una línea existentes: **Nombre de visualización** `fldr6piAwwi3gHG7x` y **Descripción de compra** `fldXb73P5SLE5syZe`. No crear campos duplicados ni Nombre Bring! separado. Solo estos dos campos se pueden completar dentro del encargo de compra; conservar Nombre técnico, IDs, referencias, fórmulas, enlaces, cantidades, bases y nutrientes.

Nombres genéricos cortos para reconocimiento Bring!: Huevos, Higos, Garbanzos. Características útiles por comas, sin cantidades secundarias: cocidos, sin sal; secos; griego natural, DIA Fidias. Dos IDs siguen separados aunque compartan etiqueta; nunca agrupar cantidades por nombre. Las marcas de compra no se trasladan a fichas culinarias ni sustituyen aclaraciones de un uso.

Antes de escribir: resolver ID real y campos/tipos; guardar antes/después. Poblar únicamente ingredientes necesarios que carecen de presentación. Releer cambios y comprobar Nombre/referencia y campos ajenos. Las escrituras parciales solo afectan campos indicados; no recalcular nutrientes. Documentar expediente por registro y campo. Segunda extracción completa valida estabilidad de la proyección del menú, no igualdad textual de JSON ni de registros ajenos.

Expedientes: AIRTABLE-OCTUBRE-2026-10-14.json, AIRTABLE-SEPTIEMBRE4-2026-10-15.json, AIRTABLE-SEPTIEMBRE3-2026-10-15.json y AIRTABLE-SEPTIEMBRE12-2026-10-16.json (24 presentaciones nuevas). Fuente pública conserva solo metadatos necesarios, nunca credenciales ni catálogo privado completo.

Stock se mantiene por IDs en compra.STOCK: AOVE `rec4QWbZX5KJIhQyW`, miel `recGpy51QX8MYe0j9`, tahini `rechMDQXS4hW2JBYg`, soja `recpst98trSqZIPSe`, además de reglas explícitas de especias. No hace falta crear campo stock ni cambiar nutrientes. Condimentos sin cantidad no requieren ingredientes nutricionales nuevos.

Los usos culinarios pueden tener matices que una referencia nutricional no expresa: jamón ibérico con proxy serrano y azúcar blanco/moreno agrupado por instrucción previa. Conservar la identidad técnica; el contrato de compra contiene aclaraciones trazables por preparación. No renombrar globalmente un ingrediente usado por otros menús para corregir un uso concreto.

Prueba 7 ya validó los nombres y características en Android. Septiembre 3/4 cuenta además con confirmación real de importación el 16/10/2026. No presentar comprobación de esquema como prueba física ni reabrir validaciones comunicadas.
