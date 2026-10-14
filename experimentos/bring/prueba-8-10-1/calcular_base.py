"""Prueba 4 autónoma: instantánea de lectura, sin conexiones ni escrituras externas."""
import argparse
import copy
import hashlib
import html
import json
from collections import defaultdict
from fractions import Fraction as F
from pathlib import Path
from urllib.parse import urlencode

ROOT = Path(__file__).resolve().parent
URL = 'https://mirurecetas.github.io/menu-anual-recetas/experimentos/bring/prueba-4-09-1/'
DAYS = ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes')
# Explicit presentation nouns. Identity is resolved by Airtable ID / PROPIOS ID.
NOUNS = {
 'dia-al-punto-gazpacho-fresco-330': ('botella', 'botellas'),
 'ifa-eliges-mini-tortillas-trigo': ('tortilla', 'tortillas'),
 'dia-seleccion-mundial-burrata-150': ('envase', 'envases'),
 'delicias-dia-pimientos-piquillo-dop-lodosa': ('frasco', 'frascos'),
 'dia-seleccion-mundial-grana-padano-dop-rallado': ('paquete', 'paquetes'),
 'dia-fidias-yogur-griego-natural': ('vasito', 'vasitos'),
 'dia-lactea-mozzarella-rallada': ('bolsa', 'bolsas'),
 'philadelphia-queso-crema-original': ('tarrina', 'tarrinas'),
 'oroweat-pan-molde-12-cereales-semillas': ('rebanada', 'rebanadas'),
 'de-alberto-vino-blanco-bag-in-box': ('caja', 'cajas'),
 'dia-al-punto-arroz-blanco-cocido': ('vasito', 'vasitos'),
 'maille-mostaza-dijon-original-215': ('tarro', 'tarros'),
}
# Verified culinary equivalents, not guessed from generic ingredient names.
UNITS = {
 'recSPOXZkbn9PSbHI': (F(50), 'g', ('huevo', 'huevos'), 'Quiche: 4 huevos = 200 g comestibles'),
}

def num(x):
    if x is None or isinstance(x, bool):
        raise ValueError('Cantidad ausente/no numérica')
    q = F(str(x))
    if q <= 0:
        raise ValueError('Cantidad/raciones no positiva')
    return q

def fmt(q):
    return ('%.6f' % float(q)).rstrip('0').rstrip('.')

def ceil(q):
    return -(-q.numerator // q.denominator)

def grouped(leaves):
    groups = {}
    for x in leaves:
        key = (x['id'], x['unidad'])
        if not x['id'].startswith('rec'):
            raise ValueError('Ingrediente sin ID Airtable')
        if key not in groups:
            groups[key] = dict(id=x['id'], unidad=x['unidad'], cantidad=F(0), aportes=[])
        groups[key]['cantidad'] += x['cantidad']
        groups[key]['aportes'].append(x)
    return list(groups.values())

def build(data):
    index = lambda rows: {x['id']: x for x in rows}
    ps, pe, ce, cs, ins = map(index, (data['prep'], data['pe'], data['ce'], data['comidas'], data['ingredients']))
    products = {p['id']: p for p in data['products']}
    leaves, chains, missing, menu_rows = [], [], [], []

    def emit(e, factor, origin, path):
        ig = e.get('Ingrediente', [])
        sub = e.get('Preparación incluida', e.get('Preparación', []))
        if len(ig) + len(sub) != 1:
            raise ValueError('Elemento ambiguo: ' + e['id'])
        q, unit = num(e['Cantidad']) * factor, e['Unidad']['name']
        if sub:
            if unit not in ('ración', 'raciones'):
                raise ValueError('Subpreparación sin raciones')
            expand(sub[0]['id'], q, origin, path + [e['id']])
        else:
            if ig[0]['id'] not in ins:
                raise ValueError('Ingrediente no resuelto')
            leaves.append(dict(id=ig[0]['id'], unidad=unit, cantidad=q, origen=origin, ruta=path + [e['id']]))

    def expand(pid, servings, origin, path):
        if pid in path:
            raise ValueError('Ciclo de preparaciones')
        p = ps[pid]
        factor = servings / num(p['Raciones base'])
        chains.append(dict(id=pid, nombre=p['Nombre'], raciones=str(servings), factor=str(factor), origen=origin))
        for link in p.get('PREPARACION_ELEMENTOS', []):
            e = pe[link['id']]
            if [x['id'] for x in e['Preparación principal']] != [pid]:
                raise ValueError('Vínculo principal incoherente')
            emit(e, factor, origin, path + [pid])

    for day in DAYS:
        for kind in ('Comida', 'Cena'):
            if day == 'Viernes' and kind == 'Cena':
                menu_rows.append((day, kind, 'Libre'))
                continue
            links = data['menu'].get(day + ' · ' + kind, [])
            if not links:
                missing.append(day + ' · ' + kind)
                menu_rows.append((day, kind, 'Pendiente; no se inventan ingredientes'))
                continue
            if len(links) != 1:
                raise ValueError('Ingesta con varios vínculos')
            c = cs[links[0]['id']]
            origin = day + ' · ' + kind
            menu_rows.append((day, kind, c['Nombre']))
            for link in c['COMIDA_ELEMENTOS']:
                e = ce[link['id']]
                if [x['id'] for x in e['Comida']] != [c['id']]:
                    raise ValueError('Vínculo comida incoherente')
                emit(e, F(1), origin, [data['menu']['id'], c['id']])
        postre = data['menu'].get(day + ' · Postre', [])
        for link in data['menu'].get(day + ' · Postre preparación', []):
            expand(link['id'], num(data['menu'][day + ' · Postre raciones']), day + ' · Postre', [data['menu']['id']])
        for link in postre:
            leaves.append(dict(id=link['id'], unidad=data['menu'][day + ' · Postre unidad']['name'],
                cantidad=num(data['menu'][day + ' · Postre cantidad']), origen=day + ' · Postre', ruta=[data['menu']['id'], link['id']]))

    rows = sorted(grouped(leaves), key=lambda x: ins[x['id']]['Nombre'].casefold())
    variants = {v: [] for v in ('a', 'b', 'c')}
    audit_rows = []
    for row in rows:
        ingredient = ins[row['id']]
        q, unit, identity = row['cantidad'], row['unidad'], ingredient['id']
        ref = ingredient.get('Referencia GitHub', '')
        display = ingredient['Nombre']
        presentation = None
        if ref.startswith('PROPIOS:'):
            pid = ref.removeprefix('PROPIOS:').split('/')[0]
            product = products[pid]
            nouns = NOUNS.get(pid, ('envase', 'envases'))
            pack = product.get('presentacion', {})
            size = pack.get('contenido_unidad', product.get('cantidad_envase'))
            if product.get('peso_escurrido_g'):
                size = {'valor': product['peso_escurrido_g'], 'unidad': 'g'}
            elif product.get('peso_escurrido'):
                size = product['peso_escurrido']
            special = data.get('equivalencias_especiales', {}).get(identity)
            if special:
                if special['producto'] != pid:
                    raise ValueError('Producto de ficha derivada incoherente')
                size = {'valor': special['contenido'], 'unidad': special['unidad']}
                nouns = (special['presentacion'], special['presentacion'] + 's' if special['presentacion'] == 'envase' else 'latas')
            if size['unidad'] != unit:
                raise ValueError('Conversión entre unidades no autorizada')
            presentation = (num(size['valor']), nouns, pid)
        elif identity in UNITS:
            size, target_unit, nouns, evidence = UNITS[identity]
            if target_unit != unit:
                raise ValueError('Unidad de equivalencia incoherente')
            presentation = (size, nouns, evidence)
        real = fmt(q) + ' ' + unit
        audit = dict(id=identity, nombre=display, unidad=unit, cantidad_exacta=str(q), cantidad=fmt(q),
            aportes=[dict(x, cantidad_exacta=str(x['cantidad']), cantidad=fmt(x['cantidad'])) for x in row['aportes']])
        if presentation:
            size, nouns, evidence = presentation
            equivalent = q / size
            rounded = ceil(equivalent)
            noun = nouns[0] if rounded == 1 else nouns[1]
            primary = f'{rounded} {noun}'
            annotation = f'{real} necesarios; {fmt(size)} {unit} por {nouns[0]}'
            specs = {
                'a': f'{primary} ({annotation})',
                'b': f'{primary}; necesario: {real}; formato: {fmt(size)} {unit}',
                'c': f'{primary} ({fmt(equivalent)} {nouns[0]} necesarios; {real})',
            }
            audit.update(equivalencia_exacta=str(equivalent), compra_redondeada=rounded,
                unidad_exportada=noun, contenido_unidad=fmt(size), evidencia=evidence)
        else:
            specs = {v: real for v in variants}
        for v in variants:
            variants[v].append({'itemId': display, 'spec': specs[v], 'stock': False})
        audit['specs'] = specs
        audit_rows.append(audit)

    # These culinary-only lines have no Airtable link by the recipe protocol.
    # There is no numeric sum: exact literal repeated labels become one checklist line.
    condiments = {}
    for slug, recipe in data['web'].items():
        for item in recipe['ingredientes']:
            if item['cantidad'] is None:
                condiments.setdefault(item['nombre'], []).append(slug)
    for name in sorted(condiments):
        for v in variants:
            variants[v].append({'itemId': name, 'stock': True})

    files = {}
    title = 'Septiembre · Menú 1 · Prueba 4'
    for v, items in variants.items():
        payload = dict(author='MiruRecetas', linkOutUrl=URL, name=title + v.upper(),
            tagline='Menú incompleto de septiembre para una persona. Miércoles comida y cena pendientes. Prueba de compra por envases y cantidades reales.',
            yield_='1', items=items)
        payload['yield'] = payload.pop('yield_')
        files['bring-4' + v + '.json'] = json.dumps(payload, ensure_ascii=False, indent=2) + '\n'
    audit = dict(menu_id=data['menu']['id'], main_sha=data['main_sha'], catalogo_blob=data['catalogo_blob'],
        entrada_sha256=hashlib.sha256(json.dumps(data, ensure_ascii=False, sort_keys=True).encode()).hexdigest(),
        personas=1, pendientes=missing, preparaciones_recorridas=chains, ingredientes=audit_rows,
        condimentos=[dict(nombre=n, stock=True, cantidad=None, airtable_id=None, origenes=origins) for n, origins in sorted(condiments.items())],
        exclusiones=['Café de oficina', 'Viernes cena libre'],
        aviso='Bring! puede escalar los enteros ya redondeados y no redondear después. Escalado de anotaciones pendiente de prueba real.')
    files['calculo.json'] = json.dumps(audit, ensure_ascii=False, indent=2) + '\n'
    e = html.escape
    links = ''
    explanations = {'a': '4A · Cantidad real en gramos o ml entre paréntesis', 'b': '4B · Cantidad real tras punto y coma', 'c': '4C · Fracción de unidad y cantidad real entre paréntesis'}
    for v, label in explanations.items():
        link = 'https://api.getbring.com/rest/bringrecipes/deeplink?' + urlencode(dict(url=URL+'bring-4'+v+'.json', source='web', baseQuantity=1, requestedQuantity=1))
        links += f'<p><a class="button" href="{e(link, quote=True)}">{e(label)}</a></p>'
    table = ''.join('<tr><td>'+e(r['nombre'])+'</td><td>'+e(r['specs']['a'])+'</td><td>'+e(r['id'])+'</td></tr>' for r in audit_rows)
    stock = ''.join('<li>'+e(n)+'</li>' for n in sorted(condiments))
    plan = ''.join('<tr><td>'+e(d)+'</td><td>'+e(k)+'</td><td>'+e(n)+'</td></tr>' for d,k,n in menu_rows)
    files['index.html'] = f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>{title}</title>
<style>body{{font:16px/1.5 system-ui;margin:0;background:#f9f6f0;color:#28392e}}main{{max-width:1050px;margin:auto;padding:24px}}.button{{display:inline-block;padding:13px 18px;background:#d9e3d3;color:#203728;border-radius:12px;text-decoration:none}}table{{border-collapse:collapse;width:100%;font-size:14px}}th,td{{padding:9px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top}}.scroll{{overflow:auto}}td:last-child{{white-space:nowrap}}small{{color:#536357}}</style></head><body><main>
<p>MiruRecetas · Entorno temporal de pruebas Bring!</p><h1>{title}</h1>
<p>Una porción representa el menú registrado para una persona. <strong>Miércoles comida y cena pendientes.</strong> Se incluyen sus postres registrados. Café de oficina excluido.</p>
<h2>Importar una prueba nueva</h2>{links}
<p>Las tres variantes contienen los mismos ingredientes, cantidades de compra y stock. Solo cambia cómo se escribe la cantidad real. Importa cada enlace por separado; no uses un favorito antiguo.</p>
<h2>Qué comprobar en Bring!</h2><ol><li>A una porción: Philadelphia debe mostrar compra de 1 tarrina y necesidad de 17,5 g. Gazpacho 1 botella; tortillas 3 unidades; pan 2 rebanadas.</li><li>Pasar a dos porciones: observar si cambian tanto la compra como la cantidad entre paréntesis o tras el separador. Philadelphia real debería corresponder a 35 g, tortillas a 6 y pan a 4 rebanadas.</li><li>Comprobar que los condimentos aparecen en despensa y que no aparecen Sofrito o Ragú como artículos.</li></ol>
<p><strong>El escalado de texto aún no está validado en Bring!.</strong> Multiplicar una tarrina ya redondeada puede dar dos aunque 35 g quepan en una. Esta prueba observa el importador; no garantiza redondeo posterior dentro de la app.</p>
<h2>Compra y cantidad real · Variante 4A</h2><div class="scroll"><table><thead><tr><th>Ingrediente</th><th>Cantidad exportada</th><th>ID Airtable</th></tr></thead><tbody>{table}</tbody></table></div>
<h2>Despensa · stock: true · sin cantidad inventada</h2><ul>{stock}</ul><p>Los condimentos deliberadamente sin cantidad proceden de los JSON culinarios; no tienen vínculo Airtable. Solo se reúnen etiquetas literales repetidas, sin sumar cantidades ni asignar IDs ficticios.</p>
<h2>Menú registrado</h2><div class="scroll"><table><tbody>{plan}</tbody></table></div>
<p><a href="calculo.json">Auditoría de cantidades e IDs</a> · <a href="README.md">Protocolo de esta prueba</a></p>
<small>Instantánea de lectura; sin sincronización automática, sin recursos PWA compartidos ni cambios de navegación o almacenamiento. Retirable eliminando únicamente esta carpeta.</small>
</main></body></html>\n'''
    return files
