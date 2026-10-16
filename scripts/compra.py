"""Contrato compra v1: grafo por ID, fracciones exactas y salidas estáticas Bring!."""
import hashlib
import html
import json
import re
from decimal import Decimal, localcontext, ROUND_HALF_UP
from fractions import Fraction as F
from pathlib import Path
from urllib.parse import urlencode

DAYS = ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes')
STOCK = frozenset(('rec4QWbZX5KJIhQyW','recGpy51QX8MYe0j9','rechMDQXS4hW2JBYg',
                   'recpst98trSqZIPSe','recZmy5VtKavv2D9U','rec70jSFploNVyMCF','recI8AwaRp7BOa9GZ'))
OFFICE_COFFEE = 'recIa7zpasm2s0mgH'
MAX_PEOPLE = 20
# Nombre de unidad comercial explícito, nunca inferido por similitud de ingrediente.
NOUNS = {
 'dia-al-punto-gazpacho-fresco-330': ('botella','botellas'),
 'ifa-eliges-mini-tortillas-trigo': ('tortilla','tortillas'),
 'dia-seleccion-mundial-burrata-150': ('envase','envases'),
 'delicias-dia-pimientos-piquillo-dop-lodosa': ('frasco','frascos'),
 'dia-seleccion-mundial-grana-padano-dop-rallado': ('paquete','paquetes'),
 'dia-fidias-yogur-griego-natural': ('vasito','vasitos'),
 'dia-lactea-mozzarella-rallada': ('bolsa','bolsas'),
 'philadelphia-queso-crema-original': ('tarrina','tarrinas'),
 'oroweat-pan-molde-12-cereales-semillas': ('rebanada','rebanadas'),
 'de-alberto-vino-blanco-bag-in-box': ('caja','cajas'),
 'dia-al-punto-arroz-blanco-cocido': ('vasito','vasitos'),
 'maille-mostaza-dijon-original-215': ('tarro','tarros'),
 'portonovo-sardinillas-aceite-oliva': ('lata','latas'),
 'dia-mari-marinera-atun-claro-natural': ('lata','latas'),
 'dia-vegcampo-aceitunas-rellenas-anchoa': ('lata','latas'),
 'cidacos-alubias-rojas-extra': ('frasco','frascos'),
 'maille-mostaza-antigua-210': ('tarro','tarros'),
 'dia-mari-marinera-caballa-sur-aceite-oliva': ('lata','latas'),
 'iberitos-tomate-natural-20x22': ('tarrina','tarrinas'),
 'dia-temptation-chocolate-85-sin-azucares-anadidos-100': ('tableta','tabletas'),
}
DERIVED = {
 'recHiBRS3Ikrzb1mt': 'arteinaki-filete-boqueron-alinado',
 'recBR5gKXgTzxIPy9': 'portonovo-sardinillas-aceite-oliva',
}

def digest(value):
    return hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()

def positive(value):
    if value is None or isinstance(value,bool):
        raise ValueError('Cantidad/raciones ausente o inválida')
    q=F(str(value))
    if q<=0: raise ValueError('Cantidad/raciones no positiva')
    return q

def ceil(q): return -(-q.numerator//q.denominator)

def real_text(q):
    with localcontext() as context:
        context.prec=max(40,len(str(abs(q.numerator)))+len(str(q.denominator))+5)
        d=(Decimal(q.numerator)/Decimal(q.denominator)).quantize(Decimal('.1'),rounding=ROUND_HALF_UP)
    return format(d,'f').rstrip('0').rstrip('.')

def ids(links): return [x['id'] if isinstance(x,dict) else x for x in links or []]
def scalar(x): return x.get('name') if isinstance(x,dict) else x

def one(row,field,optional=False):
    links=ids(row.get(field))
    if not links and optional:return None
    if len(links)!=1:raise ValueError('Enlace ausente/múltiple: '+field)
    return links[0]

def presentation(ingredient,unit,products):
    ref=ingredient.get('Referencia GitHub','')
    if ref.startswith('PROPIOS:'):
        exact=ref.removeprefix('PROPIOS:')
        pid=DERIVED.get(ingredient['id'],exact)
        p=products[pid] # Referencia exacta o equivalencia derivada explícita; no quitar sufijos.
        if p.get('estado')!='verificado':raise ValueError('Formato comercial no verificado: '+pid)
        size=p.get('presentacion',{}).get('contenido_unidad') or p.get('cantidad_envase')
        if p.get('peso_escurrido_g'):size={'valor':p['peso_escurrido_g'],'unidad':'g'}
        elif p.get('peso_escurrido'):size=p['peso_escurrido']
        base='escurrida' if p.get('peso_escurrido_g') or p.get('peso_escurrido') else 'contenido individual'
        individual=p.get('formato_unidades',{})
        if individual.get('escurrido_por_unidad_g') is not None:
            size={'valor':individual['escurrido_por_unidad_g'],'unidad':'g'}
            base='escurrida por unidad individual'
        # El chili incorpora también el adobo: el envase comprado aporta 220 g netos, no solo chiles escurridos.
        if ingredient['id']=='recNnfHxJO9aFN7gF' and pid=='la-costena-chipotles-adobo':
            size=p['cantidad_envase'];base='neto con adobo'
        # Ficha verificada no implica peso de envase conocido (p. ej. chorizo artesanal).
        if not size or size.get('valor') is None:return None
        if size['unidad']!=unit:raise ValueError('Formato/unidad no verificado: '+pid)
        return {'contenido':str(positive(size['valor'])),'unidad':unit,
                'singular':NOUNS.get(pid,('envase','envases'))[0],
                'plural':NOUNS.get(pid,('envase','envases'))[1],
                'producto_id':pid,'referencia':ref,'fuente':p.get('fuente'),
                'base':base,
                'verificado':True}
    if ingredient['id']=='recSPOXZkbn9PSbHI' and unit=='g':
        return {'contenido':'50','unidad':'g','singular':'huevo','plural':'huevos',
                'fuente':'Quiche registrada: 4 huevos = 200 g comestibles; criterio ensayado 7/8', 'verificado':True}
    if ingredient['id']=='recfn122yYJmxuETA' and unit=='g':
        return {'contenido':'385/2','unidad':'g','singular':'dorada','plural':'doradas',
                'fuente':'Dorada al horno registrada: una pieza de compra de 350 g, rendimiento FEN estimado 55 %, 192,5 g comestibles por pieza; no rendimiento medido',
                'verificado':True}
    return None

def expand_graph(source):
    """Cada aparición se recorre de nuevo; solo se agregan las hojas ID/unidad."""
    graph=source['grafo']; menu=graph['menu']
    for name in ('preparaciones','preparacion_elementos','comida_elementos','comidas','ingredientes'):
        values=graph[name]
        if len({x['id'] for x in values})!=len(values):raise ValueError('IDs duplicados en '+name)
        if any(not re.fullmatch(r'rec[A-Za-z0-9]{14}',x['id']) for x in values):raise ValueError('ID inválido en '+name)
    preps,pe,ce,meals,ingredients=({x['id']:x for x in graph[k]} for k in ('preparaciones','preparacion_elementos','comida_elementos','comidas','ingredientes'))
    leaves=[];coverage=[];excluded=[];visited=set();complements=[]
    def emit(row,factor,origin,path):
        ir=one(row,'Ingrediente',True)
        pr=one(row,'Preparación incluida' if 'Preparación incluida' in row else 'Preparación',True)
        if bool(ir)==bool(pr):raise ValueError('Elemento ambiguo: '+row['id'])
        if row.get('TEC_Estado elemento')!='Calculado':raise ValueError('Elemento no calculado: '+row['id'])
        unit=scalar(row.get('Unidad'));q=positive(row.get('Cantidad'))*factor
        if pr:
            if unit not in ('ración','raciones'):raise ValueError('Subpreparación sin raciones')
            expand(pr,q,origin,path+[row['id']])
        else:
            if ir not in ingredients:raise ValueError('Ingrediente no resuelto: '+str(ir))
            if unit not in ('g','ml','unidad','unidades'):raise ValueError('Unidad no admitida: '+str(unit))
            leaves.append(dict(id=ir,unidad=unit,cantidad_exacta=str(q),origen=origin,ruta=path+[row['id']]))
    def expand(pid,servings,origin,path):
        if pid in path:raise ValueError('Ciclo de preparaciones: '+pid)
        p=preps[pid];visited.add(pid)
        if p.get('Estado cálculo')!='Calculado':raise ValueError('Preparación no calculada: '+pid)
        factor=servings/positive(p.get('Raciones base')); links=ids(p.get('PREPARACION_ELEMENTOS'))
        for c in source.get('complementos',[]):
            if c['preparacion_id']==pid:
                complements.append(dict(c,cantidad_exacta=str(positive(c['cantidad'])*factor),origen=origin,ruta=path+[pid]))
        if not links:raise ValueError('Preparación vacía: '+pid)
        for eid in links:
            row=pe[eid]
            if one(row,'Preparación principal')!=pid:raise ValueError('Preparación principal incoherente')
            emit(row,factor,origin,path+[pid])
    for day in DAYS:
        breakfast=one(menu,day+' · Desayuno')
        if breakfast!=OFFICE_COFFEE:raise ValueError('Desayuno requiere política de compra explícita: '+day)
        excluded.append({'origen':day+' · Desayuno','id':breakfast,'motivo':'Café de oficina'})
        for kind in ('Comida','Cena'):
            origin=day+' · '+kind
            if day=='Viernes' and kind=='Cena':
                coverage.append({'ingesta':origin,'estado':'libre'});continue
            mid=one(menu,origin); meal=meals[mid]
            if meal.get('Estado cálculo')!='Calculado':raise ValueError('Comida no calculada: '+mid)
            links=ids(meal.get('COMIDA_ELEMENTOS'))
            if not links:raise ValueError('Comida vacía: '+mid)
            coverage.append({'ingesta':origin,'estado':'completa','id':mid})
            for eid in links:
                row=ce[eid]
                if one(row,'Comida')!=mid:raise ValueError('Comida principal incoherente')
                emit(row,F(1),origin,[menu['id'],mid])
        ir=one(menu,day+' · Postre',True);pr=one(menu,day+' · Postre preparación',True)
        if scalar(menu.get(day+' · Estado postre'))!=('Calculado' if ir or pr else 'Sin postre'):
            raise ValueError('Postre no validado: '+day)
        if ir:
            if ir not in ingredients:raise ValueError('Postre sin ingrediente')
            unit=scalar(menu.get(day+' · Postre unidad'))
            if unit not in ('g','ml'):raise ValueError('Unidad postre inválida')
            leaves.append(dict(id=ir,unidad=unit,cantidad_exacta=str(positive(menu.get(day+' · Postre cantidad'))),origen=day+' · Postre ingrediente',ruta=[menu['id'],ir]))
        if pr:expand(pr,positive(menu.get(day+' · Postre raciones')),day+' · Postre preparación',[menu['id']])
        coverage.append({'ingesta':day+' · Postre','estado':'completo' if ir or pr else 'sin postre','componentes':int(bool(ir))+int(bool(pr))})
    grouped={}
    for leaf in leaves:
        key=(leaf['id'],leaf['unidad'])
        grouped.setdefault(key,[]).append(leaf)
    products={p['id']:p for p in source['productos']}
    rows=[]
    for (iid,unit),contributions in grouped.items():
        ingredient=ingredients[iid];name=ingredient.get('Nombre de visualización')
        if not name:raise ValueError('Falta Nombre de visualización: '+iid)
        q=sum((F(x['cantidad_exacta']) for x in contributions),F(0))
        row=dict(id=iid,nombre_tecnico=ingredient['Nombre'],nombre=name,
                 descripcion=ingredient.get('Descripción de compra',''),unidad=unit,cantidad_exacta=str(q),
                 stock=iid in STOCK,aportes=contributions)
        for c in source.get('aclaraciones_compra',[]):
            if c['ingrediente_id']==iid:
                if not all(c['preparacion_id'] in x['ruta'] for x in contributions):raise ValueError('Revisar variantes culinarias del ingrediente: '+iid)
                row.update(nombre=c['nombre'],descripcion=c['descripcion'])
        pres=presentation(ingredient,unit,products)
        if pres:row['presentacion']=pres
        rows.append(row)
    condiments={}
    for r in source['condimentos']:
        if r['preparacion_id'] not in visited:raise ValueError('Condimento ajeno al grafo')
        condiments.setdefault(r['nombre'],[]).append(r['fuente'])
    result={'ingredientes':sorted(rows,key=lambda r:(r['nombre'].casefold(),r['id'],r['unidad'])),
            'condimentos':[{'nombre':n,'origenes':origins} for n,origins in sorted(condiments.items())],
            'cobertura':coverage,'exclusiones':excluded,'preparaciones':sorted(visited)}
    if source.get('complementos'):
        if any(c['preparacion_id'] not in visited for c in source['complementos']):raise ValueError('Complemento ajeno al grafo')
        # Sin ID nutricional: conservar cada uso literal; nunca agregar por nombre o ID ficticio.
        result['complementos']=complements
    return result

def validate_source(source,root):
    if source.get('schema_version')!=1:raise ValueError('Contrato compra desconocido')
    key=source['menu_key']
    if not re.fullmatch(r'\d{2}-[1-4]',key):raise ValueError('Clave de menú inválida')
    if source.get('estado')!='completo' or source.get('pendientes'):raise ValueError('Compra incompleta')
    if source.get('porciones_base')!=1:raise ValueError('Base no admitida')
    m=json.loads((root/'datos/menus'/f'{key}.json').read_text())
    if digest(m)!=source['fuentes']['menu_sha256']:raise ValueError('Menú actualizado: regenerar compra '+key)
    if m['airtable_menu_id']!=source['grafo']['menu']['id'] or m['estado']!='Calculado':raise ValueError('Menú incompleto o distinto')
    for slug,sha in source['fuentes']['recetas_sha256'].items():
        if digest({k:v for k,v in json.loads((root/'datos/recetas'/f'{slug}.json').read_text()).items() if k in ('raciones','ingredientes')})!=sha:
            raise ValueError('Receta actualizada: regenerar compra '+slug)
    image=root/source['imagen']
    data=image.read_bytes()
    valid=(data.startswith(b'\x89PNG\r\n\x1a\n') or
           (len(data)>=30 and data[:4]==b'RIFF' and data[8:12]==b'WEBP' and int.from_bytes(data[4:8],'little')+8==len(data)) or
           (data.startswith(b'\xff\xd8\xff') and data.endswith(b'\xff\xd9')))
    if not valid:raise ValueError('Archivo de imagen inválido o vacío')
    if hashlib.sha256(data).hexdigest()!=source['fuentes']['imagen_sha256']:raise ValueError('Imagen no verificada')
    if digest(source['grafo'])!=source['fuentes']['grafo_sha256']:raise ValueError('Huella de grafo incoherente')
    base=expand_graph(source)
    if base!=source['calculo']:raise ValueError('Compra no reproducible desde grafo')
    return base

def selection(source,n,site):
    if type(n)!=int or not 1<=n<=MAX_PEOPLE:raise ValueError('Porciones: entero entre 1 y 20')
    url=site+'/menus/'+source['menu_key']+'/compra/'
    items=[];rows=[]
    for r in source['calculo']['ingredientes']:
        q=F(r['cantidad_exacta'])*n;pres=r.get('presentacion')
        if pres:
            count=ceil(q/positive(pres['contenido']));unit=pres['singular'] if count==1 else pres['plural']
        elif r['unidad'] in ('g','ml'):count=ceil(q/10)*10;unit=r['unidad']
        else:count=ceil(q);unit=r['unidad']
        exported=f'{count} {unit}';spec=exported+(', '+r['descripcion'] if r['descripcion'] else '')
        rows.append(dict(nombre=r['nombre'],descripcion=r['descripcion'],necesidad=real_text(q)+' '+r['unidad'],exportada=exported,stock=r['stock']))
        items.append(dict(itemId=r['nombre'],spec=spec,stock=r['stock']))
    for c in source['calculo'].get('complementos',[]):
        q=F(c['cantidad_exacta'])*n
        if c['unidad'] in ('g','ml'):count=ceil(q/10)*10;unit=c['unidad']
        elif c['unidad']=='unidad':count=ceil(q);unit='unidad' if count==1 else 'unidades'
        else:raise ValueError('Unidad de complemento no admitida')
        exported=f'{count} {unit}'
        rows.append(dict(nombre=c['nombre'],descripcion=c['descripcion'],necesidad=real_text(q)+' '+c['unidad'],exportada=exported,stock=c.get('stock',False)))
        items.append(dict(itemId=c['nombre'],spec=exported+', '+c['descripcion'],stock=c.get('stock',False)))
    condiments=[]
    for c in source['calculo']['condimentos']:
        condiments.append(c['nombre'])
        if not any(x['itemId']==c['nombre'] and x['stock'] for x in items):items.append(dict(itemId=c['nombre'],stock=True))
    payload=dict(author='MiruRecetas',name=f'{source["titulo"]} · {n} porciones',tagline='Menú semanal. Compra calculada antes de exportar.',
                 linkOutUrl=url+f'?porciones={n}',imageUrl=site+'/'+source['imagen'],items=items)
    payload['yield']=str(n)
    link='https://api.getbring.com/rest/bringrecipes/deeplink?'+urlencode(dict(url=url+f'exports/{n}.json',source='web',baseQuantity=n,requestedQuantity=n))
    return payload,dict(porciones=n,ingredientes=rows,condimentos=condiments,enlace=link)

def generate(root,site,decorate,branded):
    active=json.loads((root/'datos/compra/activos.json').read_text())
    prepared=[]
    for key in active:
        source=json.loads((root/'datos/compra'/f'{key}.json').read_text());validate_source(source,root)
        if source['menu_key']!=key:raise ValueError('Clave incoherente')
        views=[];outputs={}
        for n in range(1,MAX_PEOPLE+1):
            payload,view=selection(source,n,site);views.append(view)
            outputs[f'exports/{n}.json']=json.dumps(payload,ensure_ascii=False,indent=2)+'\n'
        # Datos de selector embebidos: permite leer una página visitada sin red, sin prometer importación.
        page=(root/'plantillas/compra.html').read_text()
        replacements={'SITE':site,'TITLE':html.escape(source['titulo']),'IMAGE':site+'/'+source['imagen'],
                      'MENU_KEY':key,'MONTH':str(int(key[:2])),'MENU_NUMBER':key[-1],'VIEWS_JSON':json.dumps(views,ensure_ascii=False).replace('<',r'\u003c')}
        for k,v in replacements.items():page=page.replace('{{'+k+'}}',v)
        outputs['index.html']=decorate(branded(page),root,site)
        prepared.append((key,outputs))
    for key,outputs in prepared:
        dest=root/'menus'/key/'compra'
        for name,content in outputs.items():
            p=dest/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(content,encoding='utf-8')
    return {key:site+'/menus/'+key+'/compra/' for key in active}
