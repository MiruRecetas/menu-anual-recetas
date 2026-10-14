"""Exportador autenticado de compra. Solo menús habilitados en activos.json.

AIRTABLE_TOKEN=... PRODUCTOS_JSON=/ruta/privada/productos.json python scripts/exportar_compra.py
El catálogo se lee en local; solo se publica su proyección de formatos necesarios.
"""
import json
import os
import re
from pathlib import Path
from compra import positive, digest, expand_graph, ids, one, scalar, DERIVED
from exportar_airtable import retrieve as menu_retrieve, TABLES as MENU_TABLES

ROOT=Path(__file__).resolve().parents[1]
TABLES={**MENU_TABLES,'preparacion_elementos':'tbl2FpmTvBgbzjZ1T'}
def retrieve(table,token):return menu_retrieve(table,token,TABLES[table])
FIELDS={
 'menus':['Menú','Mes','Número','Estado menú']+[d+' · '+s for d in ('Lunes','Martes','Miércoles','Jueves','Viernes') for s in ('Comida','Cena','Desayuno','Postre','Postre cantidad','Postre unidad','Postre preparación','Postre raciones','Estado postre')],
 'comidas':['Nombre','COMIDA_ELEMENTOS','Estado cálculo'],
 'elementos':['Cantidad','Unidad','Comida','Ingrediente','Preparación','TEC_Estado elemento'],
 'preparaciones':['Nombre','Raciones base','Enlace receta','PREPARACION_ELEMENTOS','Estado cálculo'],
 'preparacion_elementos':['Cantidad','Unidad','Preparación principal','Ingrediente','Preparación incluida','TEC_Estado elemento'],
 'ingredientes':['Nombre','Referencia GitHub','Nombre de visualización','Descripción de compra'],
}
def culinary(recipe):return {k:recipe[k] for k in ('raciones','ingredientes')}

def make_source(tables,catalog,root,key,catalog_sha):
    menu_public=json.loads((root/'datos/menus'/f'{key}.json').read_text())
    mid=menu_public['airtable_menu_id'];m=tables['menus'][mid]
    graph={}; selected={k:set() for k in TABLES};selected['menus'].add(mid)
    def visit_p(pid,path=()):
        if pid in path:raise ValueError('Ciclo en fuente: '+pid)
        if pid in selected['preparaciones']:return
        selected['preparaciones'].add(pid)
        for eid in ids(tables['preparaciones'][pid].get('PREPARACION_ELEMENTOS')):
            selected['preparacion_elementos'].add(eid);visit_e(tables['preparacion_elementos'][eid],path+(pid,))
    def visit_e(row,path=()):
        ir=one(row,'Ingrediente',True);pr=one(row,'Preparación incluida' if 'Preparación incluida' in row else 'Preparación',True)
        if bool(ir)==bool(pr):raise ValueError('Vínculo ambiguo')
        if ir:selected['ingredientes'].add(ir)
        if pr:visit_p(pr,path)
    for day,public in menu_public['dias'].items():
        # Validación de correspondencia con el menú ya publicado, sin reescribir nutrición.
        for kind in ('comida','cena'):
            if day=='Viernes' and kind=='cena':continue
            mealid=one(m,day+' · '+kind.title())
            if public[kind]['comida_id']!=mealid:raise ValueError('Menú público desactualizado: '+day)
            selected['comidas'].add(mealid)
            for eid in ids(tables['comidas'][mealid]['COMIDA_ELEMENTOS']):
                selected['elementos'].add(eid);visit_e(tables['elementos'][eid])
        ir=one(m,day+' · Postre',True);pr=one(m,day+' · Postre preparación',True)
        if ir:selected['ingredientes'].add(ir)
        if pr:visit_p(pr)
        # Reconstruir proyección de componentes; detecta cantidades, referencias y postres obsoletos.
        actual=[]
        for kind in ('comida','cena'):
            if day=='Viernes' and kind=='cena':continue
            raw=[tables['elementos'][eid] for eid in ids(tables['comidas'][one(m,day+' · '+kind.title())]['COMIDA_ELEMENTOS'])]
            expected=[]
            for group in public[kind]['presentacion']['grupos']:
                expected.extend(group['elementos'])
            expected.extend(public[kind]['presentacion']['elementos_sin_grupo'])
            a=sorted((r['id'],r['referencia_id'],str(positive(r['cantidad'])),r['unidad']) for r in expected)
            b=sorted((eid,one(tables['elementos'][eid],'Ingrediente',True) or one(tables['elementos'][eid],'Preparación'),str(positive(tables['elementos'][eid]['Cantidad'])),scalar(tables['elementos'][eid]['Unidad'])) for eid in ids(tables['comidas'][one(m,day+' · '+kind.title())]['COMIDA_ELEMENTOS']))
            if a!=b:raise ValueError('Componentes públicos desactualizados: '+day+' '+kind)
        expected=public.get('postre');expected=expected.get('componentes',[expected]) if expected else []
        a=sorted((x['referencia_id'],str(positive(x.get('cantidad',x.get('raciones')))),x.get('unidad','ración')) for x in expected)
        b=[]
        if ir:b.append((ir,str(positive(m[day+' · Postre cantidad'])),scalar(m[day+' · Postre unidad'])))
        if pr:b.append((pr,str(positive(m[day+' · Postre raciones'])),'ración'))
        if a!=sorted(b):raise ValueError('Postre público desactualizado: '+day)
    keys={'menus':'menu','comidas':'comidas','elementos':'comida_elementos','preparaciones':'preparaciones','preparacion_elementos':'preparacion_elementos','ingredientes':'ingredientes'}
    for table,name in keys.items():
        records=[dict(id=i,**{k:v for k,v in tables[table][i].items() if k in FIELDS[table]}) for i in sorted(selected[table])]
        graph[name]=records[0] if table=='menus' else records
    product_ids=set()
    for row in graph['ingredientes']:
        ref=row.get('Referencia GitHub','')
        if ref.startswith('PROPIOS:'):product_ids.add(DERIVED.get(row['id'],ref.removeprefix('PROPIOS:')))
    products=[]
    for p in catalog:
        if p['id'] in product_ids:
            products.append({k:v for k,v in p.items() if k in ('id','cantidad_envase','peso_escurrido','peso_escurrido_g','presentacion','formato_unidades','componentes_envase','fuente','estado')})
    if {p['id'] for p in products}!=product_ids:raise ValueError('Productos no resueltos')
    condiments=[];recipe_hashes={}
    for p in graph['preparaciones']:
        match=re.search(r'/recetas/([a-z0-9-]+)/?',p.get('Enlace receta',''))
        if not match:continue # Base interna sin ficha: expansión por ID igualmente obligatoria.
        slug=match.group(1);path=root/'datos/recetas'/f'{slug}.json'
        if not path.exists():raise ValueError('Ficha no disponible: '+slug)
        recipe=json.loads(path.read_text());recipe_hashes[slug]=digest(culinary(recipe))
        for ingredient in recipe['ingredientes']:
            if ingredient['cantidad'] is None or (p['id']=='recdhYBKhV8omXHcm' and ingredient['nombre']=='Laurel' and ingredient['unidad'] in ('hoja','hojas')):
                line={'nombre':ingredient['nombre'],'preparacion_id':p['id'],'fuente':slug}
                if ingredient['cantidad'] is not None:
                    line.update(cantidad_culinaria=ingredient['cantidad'],unidad_culinaria=ingredient['unidad'],criterio='Checklist literal sin ID de ingrediente; cantidad conservada en ficha, sin conversión a peso')
                condiments.append(line)
    candidates=[f'imagenes/menus/{key}.{ext}' for ext in ('webp','png','jpg') if (root/f'imagenes/menus/{key}.{ext}').is_file()]
    if len(candidates)!=1:raise ValueError('Se requiere una única imagen canónica de menú')
    image=candidates[0]
    source=dict(schema_version=1,estado="completo",pendientes=[],menu_key=key,titulo=m['Menú'],porciones_base=1,imagen=image,
        fuentes={'menu_sha256':digest(menu_public),'recetas_sha256':recipe_hashes,'catalogo_blob':catalog_sha,
                 'grafo_sha256':digest(graph),'imagen_sha256':__import__('hashlib').sha256((root/image).read_bytes()).hexdigest()},
        grafo=graph,productos=products,condimentos=condiments)
    source['calculo']=expand_graph(source)
    return source

def main():
    token=os.environ.get('AIRTABLE_TOKEN')
    if not token:raise ValueError('Falta AIRTABLE_TOKEN')
    path=Path(os.environ['PRODUCTOS_JSON']);catalog_data=json.loads(path.read_text())
    catalog=catalog_data['items'];catalog_sha=os.environ.get('PRODUCTOS_BLOB_SHA')
    if not catalog_sha:raise ValueError('Falta PRODUCTOS_BLOB_SHA de la revisión verificada')
    tables={k:retrieve(k,token) for k in TABLES}
    active=json.loads((ROOT/'datos/compra/activos.json').read_text())
    outputs={key:make_source(tables,catalog,ROOT,key,catalog_sha) for key in active}
    # Releer grafo relevante antes de escribir: no mezclar revisiones de Airtable.
    second={k:retrieve(k,token) for k in TABLES}
    for key,source in outputs.items():
        if make_source(second,catalog,ROOT,key,catalog_sha)!=source:raise ValueError('Airtable cambió durante la extracción; reintentar')
    for key,source in outputs.items():(ROOT/'datos/compra'/f'{key}.json').write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n')
    print('Fuentes de compra exportadas:',len(outputs))
if __name__=='__main__':main()
