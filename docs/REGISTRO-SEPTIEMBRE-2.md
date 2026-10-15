# Septiembre · Menú 2 — registro operativo

Fuente: encargo de la usuaria de 16/10/2026, Airtable consultado el 15/10/2026
a las 22:32 UTC. Menú `recszLULYqeN04sPl`. Publicación incremental, todavía
Pendiente: falta comida del viernes.
Actualización del miércoles: 2 raciones (4 galletas) y 200 ml de leche
semidesnatada, ambas en los campos de postre correspondientes.

| Día | Comida | Cena | Fruta / postre confirmado |
|---|---|---|---|
| Lunes | Lentejas estofadas con chorizo | Dorada con patatas + 1 rebanada Oroweat | Melocotón 180 g |
| Martes | Solomillo a las dos mostazas + boniato 200 g + brócoli 200 g | Revuelto de setas, trigueros y gambas | Bowl de yogur, 1 ración |
| Miércoles | Ensalada griega con caballa | Pa amb tomàquet con jamón ibérico | Galletas 2 raciones (4 unidades) + leche semidesnatada 200 ml |
| Jueves | Misma COMIDA de lentejas del lunes | Salmón con naranja y azafrán + patata 200 g + pimientos asados, 1 ración | Melocotón 180 g |
| Viernes | Pendiente | Libre | Sin postre registrado |

Cinco cafés universales conservados. Se reutilizan todas las PREPARACIONES
existentes, sin nuevas recetas. Siete COMIDAS nuevas, doce elementos; la de
lentejas `recxoSr6SJCrICLgT` se comparte entre lunes y jueves. Las otras:
dorada `recQnxRDTuf6Uwhq5`, solomillo `recbXWzLDzMHFJOsg`, revuelto
`recZVCuvgbA9G0KGn`, ensalada `recyOjEWEtOifdiQ3`, pan con jamón
`rec6NdYuKyv1ZyXfw` y salmón `recSKWLaLJdtVeZq3`.

Se conservan los grupos principal/acompañamientos y su orden. El pimentón
sin cantidad solo aparece en la denominación visual «Cachelos con pimentón»;
no se crea ingrediente ni aporte nutricional. No se agrega aceite a las
guarniciones que no lo indican. Pan: 1 rebanada = 36,5 g aproximados, formato
verificado de Oroweat, EAN 8412600019832, reutilizado sin duplicarlo.

Ingredientes genéricos creados tras revisar los 113 registros previos:

- Brócoli crudo `recL3yn5EmZ3TgyhD`, BEDCA:1177 «Brécol, crudo».
- Melocotón `recVeBuCVGy0nsmj3`, BEDCA:2232. Grasa ausente en BEDCA:
  complemento estimado de 0,25 g/100 g de USDA NDB 09236 «Peaches, yellow,
  raw», informe original SR28 revisado mayo 2016 consultado en copia en
  https://www.growables.org/information/LowChillFruit/documents/PeachNutrient.pdf .
  No se atribuye consulta a la API FDC ni al ZIP USDA. Kcal, proteína e hidratos
  conservan BEDCA; la energía se convierte de kJ / 4,184. Los originales y
  micronutrientes disponibles permanecen en la ficha JSON de Airtable;
  desconocidos se conservan nulos. Los 180 g son parte comestible cruda.

Las cuatro macros de cada COMIDA y cada día se leyeron de Airtable tras
registrar. Las fórmulas semanales son BLANK por menú incompleto: el JSON
publica un subtotal de días oficiales (5853,086079 kcal; 356,005658 g proteína;
504,52575 g hidratos; 261,643248 g grasa), sin comida del viernes.
No sustituir ese subtotal por una semana completa ni alterar las fórmulas.

Galletas existentes `recgAYwNYGSi8mF3w`: receta de 10 raciones / 20 galletas,
por tanto 1 ración = 2 galletas. Se registran 2 raciones por indicación expresa: 4 galletas.
Leche semidesnatada existente `recw8aSxhSx0aSH93`, 200 ml; no se
crea una preparación artificial para juntar los dos componentes.
Postre conjunto: 717,128836 kcal; 16,4315 g proteína; 85,0998 g hidratos;
34,6513 g grasa. Total del miércoles: 1762,246983 kcal; 86,892625 g proteína;
145,6738 g hidratos; 91,241017 g grasa.

La fórmula de proteínas del miércoles `fld7koIr5ofdQ5HTB` mantenía la
exclusión histórica: si había preparación, omitía el ingrediente. Se corrige
para sumar ambos aportes una sola vez, como ya hacen kcal/hidratos/grasas,
sin modificar los datos de ingredientes ni recetas. Relectura de los 40
menús: solo 09-2 tiene ambos componentes de postre el miércoles; los demás
resultados no cambian. La leche se etiqueta visualmente como Postre, no
Fruta, manteniendo separados los componentes y las cantidades.
El bowl del martes conserva su campo de postre PREPARACIÓN separado.

No se activa compra Bring! para este menú ni se modifican fotografías,
otras recetas, menús o instalación PWA. Registro, generación y disponibilidad
pública se verifican por separado al publicar la PR.
