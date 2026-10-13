"""Prueba 6: escalar cantidades exactas antes de redondear la compra."""
import argparse
import html
import json
from fractions import Fraction as F
from decimal import Decimal, localcontext, ROUND_HALF_UP
from pathlib import Path
from urllib.parse import urlencode
from calcular_base import build as base_build, ceil, fmt

ROOT = Path(__file__).resolve().parent
URL = 'https://mirurecetas.github.io/menu-anual-recetas/experimentos/bring/prueba-6-10-1/'
MAX_PERSONAS = 20
OIL_ID = 'rec4QWbZX5KJIhQyW'
def display_real(q):
    with localcontext() as ctx:
        ctx.prec = 40
        value = (Decimal(q.numerator) / Decimal(q.denominator)).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)
    return format(value, 'f').rstrip('0').rstrip('.') if '.' in format(value, 'f') else format(value, 'f')


def for_people(base, n):
    if isinstance(n, bool) or not isinstance(n, int) or not 1 <= n <= MAX_PERSONAS:
        raise ValueError('Porciones: entero entre 1 y 20')
    rows, items = [], []
    for r in base['ingredientes']:
        real = F(r['cantidad_exacta']) * n
        row = dict(id=r['id'], nombre=r['nombre'], cantidad_exacta=str(real),
                   cantidad_real=display_real(real)+' '+r['unidad'], stock=r['id'] in {OIL_ID, 'rec70jSFploNVyMCF', 'recZmy5VtKavv2D9U'})
        if 'equivalencia_exacta' in r:
            equivalent = F(r['equivalencia_exacta']) * n
            buy = ceil(equivalent)
            # The base nomenclature is canonicalized here for selected count.
            nouns = {'botella':'botellas','tortilla':'tortillas','envase':'envases',
                     'frasco':'frascos','paquete':'paquetes','vasito':'vasitos',
                     'bolsa':'bolsas','tarrina':'tarrinas','rebanada':'rebanadas',
                     'caja':'cajas','tarro':'tarros','huevo':'huevos','diente':'dientes','lata':'latas'}
            singular = next(k for k,v in nouns.items() if r['unidad_exportada'] in (k,v))
            unit = singular if buy==1 else nouns[singular]
            spec = f'{buy} {unit}'
            row.update(equivalencia_exacta=str(equivalent), cantidad_compra=buy, unidad_compra=unit,
                       regla='unidades enteras tras escalado', contenido_unidad=r['contenido_unidad'])
        elif r['unidad'] in ('g','ml'):
            buy = ceil(real / 10) * 10
            spec = f'{buy} {r["unidad"]}'
            row.update(cantidad_compra=buy, unidad_compra=r['unidad'], regla='decena superior tras escalado')
        else:
            spec = fmt(real)+' '+r['unidad']
            row.update(cantidad_compra=fmt(real), unidad_compra=r['unidad'], regla='cantidad en unidad original')
        row['spec'] = spec
        rows.append(row)
        items.append(dict(itemId=r['nombre'], spec=spec, stock=row['stock']))
    for c in base['condimentos']:
        # Literal checklist already present in quantified pantry item: no numeric merge.
        if not any(x['itemId'] == c['nombre'] and x['stock'] for x in items):
            items.append(dict(itemId=c['nombre'], stock=True))
    payload = dict(author='MiruRecetas', name=f'Octubre · Menú 1 · Prueba 6 · {n} porciones',
        tagline=f'Menú de octubre de lunes a viernes para {n} porciones. Compra calculada antes de exportar.',
        linkOutUrl=URL+f'?porciones={n}', items=items)
    payload['yield']=str(n)
    link='https://api.getbring.com/rest/bringrecipes/deeplink?'+urlencode(dict(
        url=URL+f'exports/{n}.json',source='web',baseQuantity=n,requestedQuantity=n))
    return payload, dict(porciones=n, ingredientes=rows, enlace=link)

def build(data):
    base=json.loads(base_build(data)['calculo.json'])
    files={}
    views=[]
    for n in range(1,MAX_PERSONAS+1):
        payload,view=for_people(base,n)
        files[f'exports/{n}.json']=json.dumps(payload,ensure_ascii=False,indent=2)+'\n'
        views.append(view)
    files['vista.json']=json.dumps(views,ensure_ascii=False,indent=2)+'\n'
    base['resultado_prueba_4']='La usuaria confirmó el 14/10/2026 en Android que 4A/4B/4C no escalan las anotaciones. Capturas muestran 1 y 3 porciones: solo cambia la cantidad inicial, el texto añadido permanece fijo.'
    base['reglas_prueba_6']={
        'orden':'agrupar por ID/unidad, multiplicar cantidades exactas por porciones, convertir presentación y redondear al final',
        'exportacion':'spec contiene únicamente cantidad y unidad; sin cantidades secundarias',
        'redondeo_g_ml':'todos los pesos/volúmenes sin presentación unitaria verificada', 'aceite_stock_id':OIL_ID, 'max_porciones_experimento':MAX_PERSONAS,
        'estado_real':'Prueba 6 en Bring! pendiente; prueba 5 validada por la usuaria en Android'  ,
        'limite':'Para cambiar porciones volver a esta página y hacer una nueva importación. Bring! puede escalar de nuevo cifras ya redondeadas.'}
    base['resultado_prueba_5']='La usuaria confirma importación perfecta en Bring!; adopta selector previo, escalado exacto y redondeo antes de exportar. Corrige anchoas y necesidad real a un decimal.'
    files['calculo-base.json']=json.dumps(base,ensure_ascii=False,indent=2)+'\n'
    e=html.escape
    rows=''.join('<tr><td>'+e(r['nombre'])+'</td><td>'+e(r['cantidad_real'])+'</td><td>'+e(r['spec'])+'</td><td>'+('Despensa' if r['stock'] else 'Compra')+'</td></tr>' for r in views[0]['ingredientes'])
    stock=''.join('<li>'+e(c['nombre'])+'</li>' for c in base['condimentos'])
    files['index.html']=f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Octubre · Menú 1 · Prueba 6 Bring!</title>
<style>body{{margin:0;font:16px/1.5 system-ui;background:#f9f6f0;color:#29392f}}main{{max-width:1000px;margin:auto;padding:24px}}.selector{{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:20px 0}}button,input{{font:inherit;padding:10px;border:1px solid #9bad9c;border-radius:9px;background:white}}input{{width:64px;text-align:center}}button{{min-width:44px}}.button{{display:inline-block;padding:14px 20px;color:#203728;background:#d9e3d3;border-radius:12px;text-decoration:none}}.button[aria-disabled="true"]{{opacity:.5;pointer-events:none}}.scroll{{overflow:auto}}table{{border-collapse:collapse;width:100%;font-size:14px}}th,td{{padding:10px;text-align:left;border-bottom:1px solid #ddd;vertical-align:top}}small{{color:#556658}}a:focus-visible,button:focus-visible,input:focus-visible{{outline:3px solid #527856;outline-offset:2px}}</style>
<script src="selector.js" defer></script></head><body><main><p>MiruRecetas · Prueba temporal Bring!</p>
<h1>Octubre · Menú 1 · Prueba 6</h1><p>Menú completo registrado de lunes a viernes. Se incluyen los postres vinculados, incluido el bowl de yogur y la fruta. El café de oficina está excluido.</p>
<div class="selector"><label for="porciones">Porciones</label><button id="menos" type="button" aria-label="Reducir porciones">−</button><input id="porciones" type="number" min="1" max="20" step="1" value="1" inputmode="numeric"><button id="mas" type="button" aria-label="Aumentar porciones">+</button></div>
<p id="estado" role="status">Cargando el selector…</p><p><a id="exportar" class="button" aria-disabled="true">Exportar a Bring!</a></p>
<p>Elige aquí las porciones antes de importar. Los envases fraccionados se redondean hacia arriba después del escalado. Los ingredientes sin presentación unitaria expresados en g/ml se redondean a la decena superior; las decenas exactas se conservan. El AOVE aparece en despensa.</p>
<p>Para comprobar lo que tienes en casa, consulta la cantidad real de la tabla. Bring! recibirá únicamente la cantidad de compra y su unidad.</p>
<h2 id="titulo-lista">Cantidades para 1 porción</h2><div class="scroll"><table><thead><tr><th>Ingrediente</th><th>Necesidad real</th><th>Se exporta</th><th>Lista</th></tr></thead><tbody id="lista">{rows}</tbody></table></div>
<h2>Condimentos · despensa</h2><ul>{stock}</ul><p>Sin cantidad inventada. Se exportan con stock: true y sin spec.</p>
<p>Para cambiar el número de personas, vuelve a esta página y realiza una nueva importación. Cambiar después las porciones dentro de Bring! puede volver a escalar cantidades ya redondeadas.</p>
<p><a href="calculo-base.json">Auditoría por ID</a> · <a href="README.md">Protocolo y resultados</a></p>
<small>Selector experimental de 1 a 20 porciones. La instantánea conserva las cantidades culinarias originales sin modificar recetas, menús o nutrición.</small>
</main></body></html>\n'''
    return files

def main():
    p=argparse.ArgumentParser();p.add_argument('--check',action='store_true');args=p.parse_args()
    data=json.loads((ROOT/'entrada.json').read_text())
    for name,content in build(data).items():
        path=ROOT/name
        if args.check:
            if not path.exists() or path.read_text()!=content:raise SystemExit('No reproducible: '+name)
        else:
            path.parent.mkdir(parents=True,exist_ok=True);path.write_text(content)
    print('Prueba 6 comprobada' if args.check else 'Prueba 6 generada')

if __name__=='__main__':main()
