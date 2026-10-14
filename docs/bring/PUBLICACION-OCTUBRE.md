# Expediente de despliegue — Octubre · Menú 1

Fecha: 14/10/2026. Base leída: main `7485006` (sin PR abiertas al iniciar). Alcance: única integración permanente `10-1`.

- Airtable: esquema real verificado. Creados dos campos de presentación y poblados 54 registros; relectura correcta. Segunda lectura de las seis tablas: proyección de identidades, referencias, cantidades, raciones, enlaces y estados sin cambios. Expediente por campo/registro en AIRTABLE-OCTUBRE-2026-10-14.json.
- Catálogo actual: blob `193f1ba3b51a4b7941e3120ec30ffcca16d936a0`, leído por conexión autenticada. Solo se publica proyección de formatos necesarios.
- Fuente nueva: grafo actual de 8 comidas distintas, 15 elementos de comida, 15 preparaciones, 76 elementos de preparación y 54 ingredientes. Cada repetición semanal se vuelve a contar. Totales coinciden con el fixture 8.
- Imagen aprobada reutilizada sin cambiar sus bytes: `imagenes/menus/10-1.png`, SHA-256 c7952019f9e9b24a3c1bba2f376e5b354a91c518464b2e85d6276a48252c62c7.
- Automatizadas locales: 50 pruebas Python correctas, sintaxis JS y generación idempotente. Incluye comparación fixture, recursión, postre doble, IDs/unidades, errores, formatos individuales/escurridos, escalado antes de techo, 20 selecciones, stock y procedencia. Producción no importa generadores experimentales.
- QA navegador añadido al CI: anchos 320/390/820/1440, acceso contextual, imagen decodificada, 54 filas, selector 1/3/20, entrada inválida, error HTTP/reintento, offline/online, vuelta a octubre y ocultación en septiembre. Se conserva QA completo de web y SW real.
- Publicación y comprobaciones HTTP/navegador: pendientes de PR/CI/Pages al redactar esta primera revisión; completar con resultados del despliegue.

## Comprobación física pendiente en la ruta permanente

Las pruebas 7 y 8 ya están validadas por Lucía en Bring! Android: conservar procedimiento y resultados del Maestro. Para la nueva ruta, abrir Octubre · Menú 1 desde web o la PWA instalada; elegir 1 y 3 porciones, importar mediante el enlace nuevo y comprobar imagen, título, cantidades/variantes y despensa. Volver desde Bring! conserva las porciones. No usar un favorito antiguo para validar esta publicación.

No se ha realizado esa prueba física por el integrador ni se declara una instalación real de PWA. El CI/navegador y HTTP no acreditan cómo abre el enlace el Android físico. iOS no está validado y no forma parte de la evidencia 7/8.
