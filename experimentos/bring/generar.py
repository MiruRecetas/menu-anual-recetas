#!/usr/bin/env python3
"""Generate only the isolated October menu Bring experiment; no production writes."""
import argparse
import hashlib
import html
import json
import unicodedata
from collections import defaultdict
from decimal import Decimal, localcontext
from fractions import Fraction
from pathlib import Path
from urllib.parse import urlencode

ROOT = Path(__file__).resolve().parents[2]
SITE = 'https://mirurecetas.github.io/menu-anual-recetas/'
URL = SITE + 'experimentos/bring/10-1/'
JSON_URL = URL + 'bring-v2.json'
TAGLINE = 'Menú de octubre de lunes a viernes para una persona.'
# Explicit test selection: pantry items remain necessary for cooking.
STOCK_NAMES = {'sal', 'pimienta negra', 'comino en polvo', 'laurel',
               'nuez moscada', 'romero', 'tomillo'}
DAYS = ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes')
KINDS = ('desayuno', 'comida', 'cena', 'postre')


def normalized(value):
    return unicodedata.normalize('NFC', value).strip().casefold()


def number(value):
    if isinstance(value, bool) or value is None:
        raise ValueError('Cantidad numérica requerida')
    result = Fraction(str(value))
    if result <= 0:
        raise ValueError('Cantidad positiva requerida')
    return result


def formatted(value):
    with localcontext() as ctx:
        ctx.prec = 30
        decimal = Decimal(value.numerator) / Decimal(value.denominator)
        return format(decimal.quantize(Decimal('0.000001')), 'f').rstrip('0').rstrip('.')


def ingredient_text(name, quantity, unit):
    return name if quantity is None else f'{formatted(quantity)} {unit} de {name}'


def compatible_unit(name, unit):
    # These published garlic units all count cloves; the annotation is not a conversion.
    if normalized(name) == 'ajo' and normalized(unit) in (
        'diente', 'dientes', 'diente (2,7 g)', 'dientes (2,7 g)'):
        return 'dientes'
    return unit


def meal_elements(meal):
    if not meal or meal.get('estado') == 'libre':
        return []
    if 'componentes' in meal:
        return meal['componentes']
    if meal.get('tipo'):
        return [meal]
    presentation = meal.get('presentacion', {})
    groups = sorted(presentation.get('grupos', []), key=lambda x: x.get('orden', 0))
    return [e for g in groups for e in g['elementos']] + presentation.get('elementos_sin_grupo', [])


def build(root=ROOT):
    recipes = {p.stem: json.loads(p.read_text(encoding='utf-8'))
               for p in (root / 'datos/recetas').glob('*.json')}
    names = defaultdict(list)
    for slug, recipe in recipes.items():
        names[normalized(recipe['nombre'])].append(slug)
    menu_path = root / 'datos/menus/10-1.json'
    menu = json.loads(menu_path.read_text(encoding='utf-8'))
    if (menu['mes'], menu['menu'], menu['estado']) != (10, 1, 'Calculado'):
        raise ValueError('Se requiere Octubre · Menú 1 calculado')
    used = {menu_path}
    leaves, days = [], []

    def expand(slug, servings, context, path=()):
        if slug in path:
            raise ValueError('Ciclo: ' + ' -> '.join(path + (slug,)))
        if slug not in recipes:
            raise ValueError('Preparación inexistente: ' + slug)
        recipe = recipes[slug]
        used.add(root / 'datos/recetas' / (slug + '.json'))
        factor = servings / number(recipe['raciones'])
        for ingredient in recipe['ingredientes']:
            quantity = ingredient['cantidad']
            if ingredient.get('preparacion'):
                if normalized(ingredient['unidad']) not in ('ración', 'raciones'):
                    raise ValueError('Unidad de preparación no expresada en raciones')
                expand(ingredient['preparacion'], number(quantity) * factor,
                       context, path + (slug,))
            else:
                leaves.append({'nombre': ingredient['nombre'], 'unidad': ingredient['unidad'],
                               'cantidad': None if quantity is None else number(quantity) * factor,
                               'origen': context, 'receta': slug})

    for day in DAYS:
        summaries, expanded_meals = [], []
        for kind in KINDS:
            meal = menu['dias'][day].get(kind)
            if not meal:
                continue
            if meal.get('estado') == 'libre':
                summaries.append('Cena libre')
                expanded_meals.append({'ingesta': kind, 'nombre': 'Cena libre', 'componentes': []})
                continue
            elements = meal_elements(meal)
            if not elements:
                raise ValueError(f'{day} {kind}: componentes ausentes')
            displayed, start = [], len(leaves)
            for element in elements:
                quantity = number(element.get('cantidad', element.get('raciones')))
                unit = element.get('unidad', 'ración')
                displayed.append(ingredient_text(element['nombre'], quantity, unit))
                if kind == 'desayuno' and normalized(element['nombre']) == normalized('Café con leche (oficina, Incapto)'):
                    continue  # Office coffee is outside this shopping export; no milk substitution.
                if element['tipo'] == 'preparacion':
                    slug = element.get('slug')
                    if not slug:
                        candidates = names[normalized(element['nombre'])]
                        if len(candidates) != 1:
                            raise ValueError('Nombre de preparación ambiguo/no publicado: ' + element['nombre'])
                        slug = candidates[0]
                    expand(slug, quantity, f'{day} · {kind}')
                elif element['tipo'] == 'ingrediente':
                    leaves.append({'nombre': element['nombre'], 'unidad': unit, 'cantidad': quantity,
                                   'origen': f'{day} · {kind}', 'receta': None})
                else:
                    raise ValueError('Tipo de componente desconocido')
            name = meal.get('nombre') or ', '.join(e['nombre'] for e in elements)
            summaries.append(f'{kind.capitalize()}: {name}')
            expanded_meals.append({'ingesta': kind, 'nombre': name, 'componentes': displayed,
                                   'ingredientes': [dict(x, cantidad=None if x['cantidad'] is None else formatted(x['cantidad']))
                                                    for x in leaves[start:]]})
        days.append({'dia': day, 'resumen': '; '.join(summaries), 'ingestas': expanded_meals})

    # Exact names and compatible count units only: no ingredient aliases/density conversions.
    grouped = {}
    for leaf in leaves:
        unit = compatible_unit(leaf['nombre'], leaf['unidad'])
        key = (normalized(leaf['nombre']), normalized(unit), leaf['cantidad'] is None)
        if key not in grouped:
            grouped[key] = dict(leaf, unidad=unit, cantidad=None if leaf['cantidad'] is None else Fraction(0), aportes=[])
        item = grouped[key]
        if leaf['cantidad'] is not None:
            item['cantidad'] += leaf['cantidad']
        item['aportes'].append({'origen': leaf['origen'], 'receta': leaf['receta'], 'unidad_original': leaf['unidad'],
                               'cantidad_exacta': None if leaf['cantidad'] is None else str(leaf['cantidad'])})
    ingredients = [grouped[key] for key in sorted(grouped)]
    description = TAGLINE
    texts = [ingredient_text(x['nombre'], x['cantidad'], x['unidad']) for x in ingredients]
    recipe = {'@context': 'https://schema.org', '@type': 'Recipe',
              'name': 'Menú 1 - Octubre', 'description': description, 'url': URL,
              'author': {'@type': 'Organization', 'name': 'MiruRecetas'},
              'publisher': {'@type': 'Organization', 'name': 'MiruRecetas'},
              'recipeYield': '1', 'recipeIngredient': texts,
              'recipeInstructions': [{'@type': 'HowToStep', 'name': day['dia'], 'text': day['resumen'],
                                      'url': SITE + 'menus/10-1/' + day['dia'].lower() + '/'} for day in days]}
    e = html.escape
    plan = ''.join('<section><h3>' + e(day['dia']) + '</h3>' + ''.join(
        '<h4>' + e(meal['ingesta'].capitalize() + ': ' + meal['nombre']) + '</h4><ul>' + ''.join(
            '<li>' + e(line) + '</li>' for line in meal['componentes']) + '</ul>'
        for meal in day['ingestas']) + '</section>' for day in days)
    bring = 'https://api.getbring.com/rest/bringrecipes/deeplink?' + urlencode(
        {'url': URL, 'source': 'web', 'baseQuantity': 1, 'requestedQuantity': 1})
    bring_json = 'https://api.getbring.com/rest/bringrecipes/deeplink?' + urlencode(
        {'url': JSON_URL, 'source': 'web', 'baseQuantity': 1, 'requestedQuantity': 1})
    native = {'author': 'MiruRecetas', 'linkOutUrl': URL,
              'name': 'Menú 1 - Octubre', 'tagline': TAGLINE, 'yield': '1',
              'items': [dict({'itemId': x['nombre'],
                             'stock': normalized(x['nombre']) in STOCK_NAMES},
                            **({} if x['cantidad'] is None else
                               {'spec': f"{formatted(x['cantidad'])} {x['unidad']}"}))
                        for x in ingredients]}
    page = f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Menú 1 - Octubre · MiruRecetas · Prueba Bring!</title>
<meta name="description" content="{e(description, quote=True)}">
<link rel="canonical" href="{URL}">
<script type="application/ld+json">{json.dumps(recipe, ensure_ascii=False).replace('<', chr(92) + 'u003c')}</script>
</head><body>
<p>Prueba temporal de importación a Bring! · Ensayo 2: descripción y despensa · Sin diseño definitivo.</p>
<article itemscope itemtype="https://schema.org/Recipe">
<h1 itemprop="name">Menú 1 - Octubre</h1><p>Por <span itemprop="author">MiruRecetas</span></p>
<p>Rendimiento: <span itemprop="recipeYield">1</span> porción = el menú completo de lunes a viernes para 1 persona.</p>
<p itemprop="tagline">{e(TAGLINE)}</p>
<p><a href="{e(bring_json, quote=True)}">Prueba 2: importar descripción y despensa en Bring! (JSON)</a></p>
<p><a href="{e(bring, quote=True)}">Control: importar desde esta página (HTML)</a> · <button id="share" type="button">Compartir esta página HTML</button></p>
<p>Para probar stock: true, usa el enlace Prueba 2 (JSON). Compartir la página usa el importador HTML y no envía ese campo explícito.</p>
<p>Frase esperada: {e(TAGLINE)} Condimentos de despensa: sal, pimienta negra, comino, laurel, nuez moscada, romero y tomillo. Son necesarios para cocinar; la marca significa que probablemente ya los tienes.</p>
<p>Comprueba también 1 y 2 porciones, cantidades, iconos, Favoritos y Ver receta. La documentación de Bring! advierte limitaciones de escalado e iconos en la vía JSON; este ensayo busca observar su comportamiento real.</p>
<p id="share-status" role="status">La segunda prueba se inicia con el enlace JSON de arriba.</p>
<h2>Lista completa para la compra ({len(texts)} entradas)</h2>
<ul>{''.join('<li itemprop="recipeIngredient">' + e(line) + '</li>' for line in texts)}</ul>
<p>Se suman nombres exactamente iguales y unidades compatibles. Diente/dientes de ajo se cuentan juntos; g y ml se conservan separados. Las cantidades desconocidas no se inventan. El café de oficina se excluye de la compra; permanece en el resumen del menú. Agrupación por identidad Airtable, conversión de AOVE y redondeo de compra quedan para otra fase.</p>
<h2>Comidas y cantidades para 1 persona</h2>{plan}
</article>
<p><a id="open-menu" href="{SITE}">Ver Octubre · Menú 1 en la vista semanal</a> · <a href="{SITE}recetario/">Recetario</a></p>
<script>
document.getElementById('open-menu').addEventListener('click',()=>{{try{{localStorage.setItem('miru-menu',JSON.stringify({{mes:10,menu:1}}));}}catch{{}}}});
document.getElementById('share').addEventListener('click',async()=>{{
 const status=document.getElementById('share-status');
 if(!navigator.share){{status.textContent='Usa Compartir del navegador o el enlace de importación en Bring!.';return;}}
 try{{await navigator.share({{title:'Menú 1 - Octubre',url:{json.dumps(URL)}}});status.textContent='Compartir abierto.';}}
 catch(error){{if(error.name!=='AbortError')status.textContent='No se ha podido compartir. Usa Compartir del navegador.';}}
}});
</script></body></html>
'''
    audit = {'menu': '10-1', 'base_personas': 1, 'entradas_exportadas': len(texts),
             'fuentes_sha256': {str(path.relative_to(root)): hashlib.sha256(path.read_bytes()).hexdigest()
                               for path in sorted(used)}, 'dias': days,
             'ingredientes': [dict(x, cantidad=None if x['cantidad'] is None else formatted(x['cantidad']),
                                  cantidad_exacta=None if x['cantidad'] is None else str(x['cantidad'])) for x in ingredients]}
    return {'index.html': page, 'calculo.json': json.dumps(audit, ensure_ascii=False, indent=2) + '\n',
            'bring-v2.json': json.dumps(native, ensure_ascii=False, indent=2) + '\n'}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    destination = ROOT / 'experimentos/bring/10-1'
    for filename, content in build().items():
        path = destination / filename
        if args.check:
            if not path.exists() or path.read_text(encoding='utf-8') != content:
                raise SystemExit('Prueba obsoleta o modificada: ' + str(path))
        else:
            destination.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding='utf-8')
    print('Prueba Bring! comprobada' if args.check else 'Prueba Bring! generada')


if __name__ == '__main__':
    main()
