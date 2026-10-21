> **Vigencia reconciliada · 21/10/2026.** [Estado actual, aclaraciones y pendientes](ESTADO-RECONCILIADO-2026-10-21.md) prevalece sobre propuestas históricas incompatibles de esta guía. Se conserva su contenido operativo y su trazabilidad. No autoriza cambios funcionales durante la sincronización documental.

# Coste estimado por ración

Motor privado → contrato validado → proyección pública mínima → generador oficial → HTML estático → misma web/PWA.

`presentacion/costes-recetas.json` contiene solo salidas aprobadas: slug, nombre/raciones ya públicos, huella de composición culinaria y céntimos finales. No contiene IDs canónicos, ingredientes, precios de productos, tiendas, catálogos, manifiestos privados, credenciales o correspondencias internas. Se genera/revisa desde el motor privado; no editar importes a mano.

`scripts/coste_receta.py:PublicCosts` reutiliza el adaptador y renderer de Fase 3.2 y el consumidor stdlib vendorizado. No calcula ingredientes, mermas o árboles. Se valida la proyección y la identidad completa antes de escribir HTML. La generación normal funciona sin secretos ni variables económicas. Proyección ausente/corrupta o una ficha existente incompatible bloquea el build completo; no sustituirla por un catálogo vacío ni retirar importes para pasar CI.

Una foto, descripción o etiquetas nuevas conservan el coste. Cambios en nombre, raciones, ingredientes o pasos de una ficha con precio requieren revalidación privada del vínculo y actualización coherente de la proyección. Una receta nueva sin vínculo económico no recibe precio inventado; los importes existentes se conservan. También hay que releer Airtable al actualizar el lote: el build web no escucha Airtable ni afirma que una huella de ficha detecte un cambio canónico externo.

Presentación aprobada: Lucide hand-coins + ≈ XX,XX €/ración, coma española y dos decimales; inferior derecha de foto, crema opaco, icono verde. Fallback al pie derecho del panel sin foto. Importe por ración de referencia: no escala con el selector. No añadir fechas, avisos o desgloses visibles ni propiedades económicas a Schema.org.

La plantilla incorpora inmediatamente después de la frase nutricional la atribución aprobada, con enlaces a OpenCesta y ODbL 1.0. Precio y atribución son HTML y permanecen en las fichas almacenadas offline conforme a la caché PWA existente; no hay solicitud económica en cliente.

Verificación: `python scripts/generar.py`, `python scripts/verificar_costes.py`, suites Python completas, QA navegador y `node tests/costes_qa.cjs`, PWA y temporizador. El publicador oficial ejecuta además `python scripts/verificar_costes.py --public`: HTTP anónimo y bytes de todas las fichas con precio y sus CSS/JS locales. Para navegador sobre producción, ejecutar `MIRU_PUBLIC_BASE=https://mirurecetas.github.io/menu-anual-recetas node tests/costes_qa.cjs`, con Chromium instalado. Esa prueba cubre SW real, instalabilidad técnica, recarga offline y selector; no acredita dispositivo físico de la usuaria.

Actualizaciones económicas: preparar/regenerar el lote privado vigente, auditar IDs/raciones/composición y todas las correspondencias, producir la proyección mínima con el motor, comparar todos los importes y nutrición, rama/PR y ambos CI antes de fusionar. `presentacion/**` ya dispara Publicar recetas. No se necesitan nuevos secretos o permisos entre repositorios.

Recuperación: rama desde main vigente y retirada selectiva de import/conexión/marcador económico, atribución y reglas CSS específicas; retirar proyección/adaptadores solo si siguen siendo exclusivos. Mantener cambios concurrentes, datos, fotos, menús/Bring!, temporizador, SW/manifest/iconos y revisiones inmutables. Regenerar, ambos CI, PR correctiva y verificar Publicar recetas/Pages/HTTP/navegador. Nunca reset --hard de main ni restauración global de un commit antiguo. Las copias offline previas cambian al navegar con red o por expulsión normal, sin borrado de cachés.
