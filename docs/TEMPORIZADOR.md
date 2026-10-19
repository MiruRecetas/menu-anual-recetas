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

`tests/pwa_qa.cjs` verifica también edición por horas/minutos/segundos y puesta a cero offline bajo SW real y ruta canónica. CI no equivale a instalación física. Tras PR/CI/fusión deben verificarse generación y HTTP de HTML y assets revisados. Prueba física de sonido, vibración, gestos y tamaños reales pendiente de la usuaria; no declararla realizada por revisar APIs o capturas.

Una única publicación y PWA. No cambia Airtable, ingredientes, nutrición, menús, fotografías o exportación Bring!. Respetar las integraciones Bring! actualmente publicadas por sus agentes; no revertirlas basándose en documentación histórica.
