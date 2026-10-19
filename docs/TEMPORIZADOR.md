# Temporizador del modo cocina

Contrato aprobado por la usuaria el 19/10/2026; base de implementación main `6935440693c822eb769bd7db8f6fb69805f307da`. Fuentes: `plantillas/receta.html`, `assets/cocina.js`, `assets/estilo.css`. Las recetas y datos canónicos no cambian.

## Diseño e interacción

Esfera redonda plana con borde salvia marcado, espacio crema antes de la escala, marcas exactas y mando circular con centro del color activo. Tiempo central editable en minutos:segundos, sin campos externos ni texto visible «Quedan…». Horas adicionales editables dentro del centro (`+0 h` permite añadir la primera hora, después `+1 h`, `+2 h`; `+3 h` en el máximo exacto). La lectura central descuenta mientras funciona. Los campos y el dial se sincronizan en ambos sentidos. Inicio de sesión: 10 minutos y sonido activado; no se guarda estado entre recargas.

Máximo 3 h (10800 s), mínimo 0. Minutos y segundos de 0 a 59; exceso limitado al rango, campos vacíos se interpretan como 0 y al salir recuperan formato válido. Una vuelta siempre son 60 minutos. Arrastrar cruza horas en ambos sentidos; tocar una marca ajusta los minutos de la hora actual. Ajuste de esfera al minuto; entrada central permite segundos. Teclado del dial: flechas ±1 min, Mayús+flechas ±5 min, RePág/AvPág ±1 h, Inicio 0 y Fin 3 h. Campos numéricos: flechas incrementan su unidad y Enter confirma.

Capas según tiempo restante:
- 0–60 min: sector terracota `#af7251` sobre crema `#faf6ee`.
- Más de 60 hasta 120 min: sector mostaza `#c5a052` sobre terracota completa.
- Más de 120 hasta 180 min: sector salvia `#8c9985` sobre mostaza completa.

En horas exactas se muestra un círculo completo del color de la hora que queda: 60 min terracota, 120 mostaza, 180 salvia. Centro 00:00 con +1/+2/+3 h respectivamente. Después continúa la capa inferior sin un salto ambiguo a esfera vacía.

Accesos rápidos 5/10/15/30 min seleccionan duración sin arrancar. Editar, tocar el dial o elegir un rápido pausa una cuenta en marcha. Lucide local: `play`/`pause` en un botón; `rotate-ccw` detiene todo y pone a cero, no restaura duración; `volume-2`/`volume-x` activa/silencia sonido sin desactivar vibración compatible. Etiquetas accesibles, foco visible y controles principales de al menos 44 px. No sustituir iconos de instalación ni modificar la marca.

## Cuenta y alarma

Fecha límite absoluta con actualización visual periódica. Cero no arranca; al finalizar aparece `circle-stop` en el centro en lugar de los campos. Aviso visual, tonos locales repetidos y solicitud de vibración durante un máximo de 30 s. El control central o poner a cero detiene inmediatamente los avisos y devuelve 00:00. Silenciar durante la alarma corta los tonos pendientes y conserva la solicitud de vibración. No hay animación decorativa continua.

AudioContext se prepara por gesto del usuario al iniciar/activar sonido. Fallo o ausencia de API no impide la cuenta y el aviso visual. Vibración solo se solicita si está disponible y con documento visible, con errores gestionados. Volumen/silencio del dispositivo, bloqueo de reproducción, permisos del navegador y suspensión pueden impedir sonido o vibración. Sin backend ni notificaciones programadas. No se garantiza alarma puntual en segundo plano o pantalla bloqueada. Al volver a primer plano se reconcilia la fecha límite; al abandonar la página se cancelan osciladores y vibración. Recargar/cerrar pierde estado de cocina, igual que antes; restauración de bfcache queda pausada.

## Verificación y alcance

`tests/timer_qa.cjs`: edición bidireccional, capas y horas exactas, máximos, giro con cruce de hora, toque táctil, teclado, cuenta con reloj controlado, pausa y puesta a cero, solicitudes Web Audio/vibración, silencio, parada central y corte automático a 30 s. Layout y capturas a 1440×900, 1100×820, 820×1100, 844×390, 390×844, 320×700 y 667×375. Se ejecuta en QA navegador junto a regresiones existentes.

`tests/pwa_qa.cjs` verifica también edición por horas/minutos/segundos y puesta a cero offline bajo SW real y ruta canónica. CI no equivale a instalación física. Tras PR/CI/fusión deben verificarse generación y HTTP de HTML y assets revisados. La usuaria ha confirmado su prueba física el 19/10/2026; el alcance y la evidencia se registran a continuación y no se deducen de las pruebas automáticas.

Una única publicación y PWA. No cambia Airtable, ingredientes, nutrición, menús, fotografías o exportación Bring!. Respetar las integraciones Bring! actualmente publicadas por sus agentes; no revertirlas basándose en documentación histórica.


## Validación y publicación · 19/10/2026

Implementación publicada mediante [PR #122](https://github.com/MiruRecetas/menu-anual-recetas/pull/122), merge `4a900070c65bd1f2814b3348e97be7d894e03a3c` y commit de páginas generadas `8c1c3ac2b1813deddc3f9139301d7cd9f28cdfdb`.

| Evidencia | Resultado y alcance |
| --- | --- |
| Automatización | 67 pruebas Python, gráficos Node y generación idempotente; `Validar web` #191 y `QA navegador MiruRecetas` #165 correctos. Incluye interacciones del temporizador, controles en siete tamaños/orientaciones y edición offline con SW real. |
| Publicación | `Publicar recetas` y Pages correctos. HTTP anónimo 200 y bytes comprobados en manifest, SW, offline, seis iconos y cuatro familias HTML; hashes de CSS/JS de la ficha comprobados públicamente. |
| Prueba física declarada | El 19/10/2026 a las 09:35, hora de España peninsular, la usuaria confirma: «Funciona perfectamente! He hecho todas las pruebas y todo funciona exactamente como quería!». Se registra como aceptación física y funcional del temporizador entregado, incluidos sus avisos según el alcance declarado por la usuaria. |
| Límites de la evidencia | La confirmación no identifica individualmente dispositivo, sistema, navegador u orientación. No convertirla en una batería física de todas las plataformas, ni en prueba de instalación/actualización completa de PWA o de alarma en segundo plano/pantalla bloqueada. |

**Estado: temporizador publicado y validado por la usuaria.** No seguir presentándolo como propuesta o pendiente de comprobación física inicial. Una modificación posterior exige las regresiones correspondientes; la aprobación no permite rediseñarlo ni ampliar alcance sin encargo.
