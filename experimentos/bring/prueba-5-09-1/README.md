# Prueba 5 — Septiembre · Menú 1

## Estado final de evidencia · 14/10/2026

La usuaria confirmó el procedimiento de compra y selector previo. La PR #78 corrigió anchoas (113,3 g visibles / 120 g exportados a 4 porciones) y máximo un decimal visible. Octubre se contrastó después en pruebas 6–8.

Referencia vigente: [Maestro Bring! v2.0](../../../docs/bring/MAESTRO.md) y [guías de implementación](../../../docs/bring/README.md). El contenido inferior conserva el protocolo y estado en la fecha del ensayo; los pendientes históricos quedan actualizados por este apartado. No se cambian aquí generadores, snapshots ni payloads.

URL: https://mirurecetas.github.io/menu-anual-recetas/experimentos/bring/prueba-5-09-1/

Autorizada el 14/10/2026. Página autónoma de pruebas con selector de 1 a 20 porciones y JSON públicos estáticos generados para cada selección. No se actualiza producción, Airtable ni PWA.

## Resultado real que origina este cambio

La usuaria confirmó que ninguna variante 4A/4B/4C resolvió el escalado del texto secundario. Sus capturas Android muestran 1 y 3 porciones: las cifras iniciales escalan y los valores entre paréntesis o tras separadores permanecen en la cantidad base (Philadelphia 17,5 g, ajo 4,5 g, etc.). Despensa y lectura siguen funcionando. Esta evidencia pertenece a prueba 4; la lectura física de prueba 5 sigue pendiente.

## Cantidades

Se conserva exactamente la instantánea de lectura de prueba 4, identificada por SHA y vínculos en `entrada.json`, para comparar solo el nuevo algoritmo. Menú incompleto: miércoles comida y cena pendientes; postre del miércoles incluido. Café de oficina excluido y viernes cena libre.

1. Expandir las preparaciones hasta INGREDIENTES, con raciones reales/base en cada nivel.
2. Sumar por `(ID Airtable de ingrediente, unidad literal)`.
3. Multiplicar la cantidad exacta agregada por las porciones elegidas.
4. Convertir al formato comercial registrado y aplicar entero superior al resultado. Una cantidad ya entera permanece entera. Pan, mini tortillas y vasitos conservan su unidad individual registrada, aunque pertenezcan a packs.
5. Los ingredientes sin presentación comercial/unidad culinaria verificada expresados en gramos o ml se redondean a la decena superior, conservando las decenas exactas. El AOVE sigue esta regla y recibe siempre `stock: true` por su ID, no por buscar palabras en el nombre.
6. `spec` contiene solo cantidad y unidad; no hay paréntesis, segunda cifra, formato de envase ni necesidades reales. La cantidad real se puede consultar en la tabla de la página antes de exportar.

La corrección del 14/10/2026 amplía el redondeo a toda cantidad en g/ml que no tenga una presentación unitaria verificada, incluidas anchoas genéricas y conservas sin formato. Anchoas a 4 porciones: necesidad exacta 340/3 g, visual 113,3 g y exportación 120 g; a 5: 425/3 g, visual 141,7 g y compra 150 g. Las presentaciones culinarias verificadas de huevo/diente siguen usando unidades enteras después del escalado.

«Necesidad real» se muestra con cero o un decimal; el cálculo sigue usando fracciones exactas sin ese redondeo visual. La usuaria confirmó que la importación de prueba 5 funciona perfectamente en su Android y fija este procedimiento para las futuras pruebas. Eso no valida todavía el nuevo menú de octubre.

Ejemplos: una persona = cebolla 120 g, AOVE 60 ml en despensa, Philadelphia 1 tarrina, 2 rebanadas de pan. Tres personas = cebolla 360 g, AOVE 180 ml, Philadelphia 1 tarrina para 52,5 g reales, mozzarella 2 bolsas para 270 g reales, yogur 1 vasito para 125 g, pan 6 rebanadas. No multiplicar las compras ya redondeadas de una persona.

## JSON y selector

Cada `exports/N.json` declara `yield: "N"`; el enlace lleva `baseQuantity=N&requestedQuantity=N` y no vuelve a multiplicar las cantidades. `linkOutUrl` vuelve a esta página con `?porciones=N`. El selector cambia la tabla y el enlace correspondiente; no publica ni escribe datos en runtime. La entrada manual admite únicamente enteros 1–20; ante dato inválido o fallo de carga la exportación se bloquea.

Para cambiar personas, calcular aquí y hacer una nueva importación. Bring! sigue teniendo su propio selector: modificarlo después puede escalar compras redondeadas y deshacer la intención del cálculo. No se afirma que se pueda desactivar ese selector ni que la prueba automática pruebe la UI de Bring!.

## Despensa e identidad

El AOVE cuantificado se exporta con la cantidad redondeada y `stock: true`. Los cinco condimentos sin cantidad de prueba 4 mantienen `stock: true` y omiten `spec`. Los condimentos culinarios sin ID Airtable se conservan como etiquetas literales documentadas, sin aportes falsos ni sumas por nombre. Los artículos con cantidad siguen usando exclusivamente IDs/unidades para agrupar.

## Reproducción y límites

```sh
python experimentos/bring/prueba-5-09-1/generar.py
python experimentos/bring/prueba-5-09-1/generar.py --check
python -m unittest discover -s experimentos/bring/prueba-5-09-1 -p 'test_*.py' -v
```

`calcular_base.py` solo calcula en memoria, sin entrada CLI de escritura. `generar.py` escribe exclusivamente dentro de esta carpeta; no altera prueba 4. `calculo-base.json` conserva cantidades/IDs exactos y resultados observados; `vista.json` aporta las veinte vistas del selector.

Esperar CI «Validar web» y «QA navegador MiruRecetas» antes de fusionar la PR. CI comprueba regresión de producción, no valida Bring! ni carga automáticamente la página experimental. Ejecutar pruebas experimentales y del selector por separado. Tras merge verificar HTTP público, MIME y contenido de JSON seleccionados y página.

No hay CSS/JS, manifiesto, registro service worker ni almacenamiento compartidos de producción. Sigue siendo el mismo origen Pages: el service worker existente puede cachear una visita dentro de su ámbito; no se modifica ni purga su caché. La cantidad de aceite de tortilla sigue siendo el retenido estimado del cálculo origen, no volumen inicial de fritura.

Retirada: eliminar únicamente esta carpeta mediante rama/PR, verificar 404 público y continuidad de producción. Los favoritos en Bring! permanecen en la app.

