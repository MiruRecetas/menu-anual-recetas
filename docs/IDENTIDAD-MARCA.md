# MiruRecetas · identidad visual corregida

## Referencia y aprobación
La referencia aprobada es la imagen 1000167864.jpg enviada por la usuaria. El paquete anterior reinterpretaba el signo y queda sustituido por esta entrega. Se conservan las seis piezas, sus contornos, separación y semilla central. No se han convertido las iniciales en letras tipográficas ni desplazado la semilla.

## Fuente y fidelidad
manual/referencia-aprobada-original.jpg es una copia binaria sin alterar de la imagen suministrada.
Los SVG son un calco vectorial de las siluetas obtenidas del archivo original. Los colores planos se muestrearon en el interior de sus piezas: #8c9985, #536556, #778876, #af7251, #3c493f, #6c7d6b. Al ser una imagen JPEG difuminada, el calco elimina el desenfoque, la textura y las sombras de la maqueta. La geometría procede de la referencia; el JPEG permanece como autoridad visual. No se afirma identidad píxel a píxel entre SVG y JPEG.

## Archivos
- vector/: isotipo y firma horizontal, versiones normal, negativa y monocroma. SVG real sin raster incrustado, scripts ni recursos remotos.
- png/: isotipo 1024 × 1024 y firma horizontal transparente.
- pwa/: PNG 192/512 transparentes, maskable 512 sólido, Apple touch 180 sólido y favicon 16/32.
- manual/: este documento y original aprobado.

## Aplicación
En la cabecera se usa el símbolo junto a MiruRecetas. El nombre queda separado del isotipo y no cambia sus piezas. Sobre fondos oscuros, usar la versión negativa. Mantener proporción y separación de todos los módulos. No recolorear o mover la semilla, introducir letras o añadir detalles. Dejar alrededor al menos el 10% de la anchura del símbolo.

El isotipo funciona mejor desde 32 px. A 16 px las piezas son una miniatura de identidad y la semilla pierde detalle. Los iconos se exportan con la misma geometría; solo varían lienzo y margen.

## Android y PWA
mirurecetas-icon-maskable-512.png mantiene fondo sólido y sitúa todo el arte dentro del círculo central seguro de diámetro 80% del lienzo. No incorpora la sombra ni el marco de la maqueta. Apple touch usa fondo sólido; las versiones estándar son transparentes. La comprobación realizada es de archivos y máscaras visuales, no de instalación real en dispositivo.

## Firma y tipografía
El nombre se escribe MiruRecetas. Los SVG horizontales conservan texto editable con Bricolage Grotesque, system-ui, sans-serif. No se distribuyen fuentes. El PNG de la firma se exportó con una sans del sistema al no estar Bricolage instalada; el Work web debe comprobar la firma con la fuente del sitio, o convertir el texto en contornos para distribución estable.

## Traspaso
Esta entrega sustituye el paquete anterior. El Work web/PWA debe usar exclusivamente estos archivos corregidos y verificar rutas y presentación. No se ha modificado GitHub, Airtable, recetas, fotografías, web o PWA. La exploración original pudo incluir imágenes por IA; el maestro entregado se obtiene trazando la imagen aprobada, sin generación de una nueva propuesta.


## Integración de cabeceras · 13/10/2026
El original `assets/marca/isotipo.svg` conserva exactamente los bytes del vector aprobado. El generador lo inserta como SVG decorativo en portada, recetario, recetas y días. Ajusta solo el viewBox a los límites exactos de las piezas, conservando sus paths y colores; el espacio de seguridad lo proporciona la separación CSS. La altura visible usa `1cap`, equivalente a la mayúscula M de la fuente del texto (fallback 0,72em). El símbolo queda a la izquierda y comparte línea base con MiruRecetas; el nombre conserva tipografía y colores. Al estar incluido en el HTML también funciona en páginas almacenadas offline, sin nuevas dependencias de red. Los iconos de instalación permanecen independientes.
