import copy, hashlib, json, subprocess, sys, unittest
from fractions import Fraction as F
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import compra
from exportar_compra import make_source
R=Path(__file__).resolve().parents[1]; SITE='https://mirurecetas.github.io/menu-anual-recetas'
class Compra(unittest.TestCase):
 def setUp(self): self.s=json.loads((R/'datos/compra/10-1.json').read_text())
 def row(self,iid): return next(x for x in self.s['calculo']['ingredientes'] if x['id']==iid)
 def test_graph_totals_and_repetition(self):
  base=compra.validate_source(self.s,R)
  old=json.loads((R/'experimentos/bring/prueba-8-10-1/calculo-base.json').read_text())
  project=lambda rows:{(x['id'],x['unidad']):F(x['cantidad_exacta']) for x in rows}
  self.assertEqual(project(base['ingredientes']),project(old['ingredientes']))
  self.assertEqual(len(base['ingredientes']),54);self.assertEqual(len(base['preparaciones']),15)
  self.assertEqual(next(x['componentes'] for x in base['cobertura'] if x['ingesta']=='Lunes · Postre'),2)
  self.assertEqual(len(base['exclusiones']),5)
  self.assertTrue(all(x['id']==compra.OFFICE_COFFEE for x in base['exclusiones']))
  for row in base['ingredientes']: self.assertEqual(sum((F(x['cantidad_exacta']) for x in row['aportes']),F(0)),F(row['cantidad_exacta']))
  potato=self.row('recSE81b9WjkURbXi');self.assertEqual(F(potato['cantidad_exacta']),400);self.assertEqual(len(potato['aportes']),2)
  self.assertTrue(any(len(x['ruta'])>=7 for r in base['ingredientes'] for x in r['aportes']))
 def test_round_after_scale(self):
  r=self.row('recYmQvMp2kBIW1Ju');r['cantidad_exacta']='35/2'
  _,v=compra.selection(self.s,3,SITE);cheese=next(x for x in v['ingredientes'] if x['nombre']=='Queso crema')
  self.assertEqual(cheese['necesidad'],'52.5 g');self.assertEqual(cheese['exportada'],'1 tarrina')
  for quantity,expected in [('235/2','120 g'),('120','120 g'),('340/3','120 g')]:
   self.row('recrGNY88zOIOcRom')['cantidad_exacta']=quantity
   _,v=compra.selection(self.s,1,SITE);self.assertEqual(next(x['exportada'] for x in v['ingredientes'] if x['nombre']=='Cebolla'),expected)
  self.assertEqual(compra.real_text(F(340,3)),'113.3')
 def test_units_and_identity(self):
  g=self.s['grafo'];iid='recoM4LY51MoUUkJm';e=next(x for x in g['preparacion_elementos'] if compra.ids(x.get('Ingrediente'))==[iid])
  clone=copy.deepcopy(e);clone['id']='recTestUnit000001';clone['Unidad']={'name':'ml'};g['preparacion_elementos'].append(clone)
  parent=next(x for x in g['preparaciones'] if x['id']==compra.one(e,'Preparación principal'));parent['PREPARACION_ELEMENTOS'].append({'id':clone['id']})
  rows=compra.expand_graph(self.s)['ingredientes'];self.assertEqual({r['unidad'] for r in rows if r['id']==iid},{'g','ml'})
  payload,_=compra.selection(self.s,3,SITE);chickpeas=[x for x in payload['items'] if x['itemId']=='Garbanzos']
  self.assertEqual(len(chickpeas),2);self.assertEqual({x['spec'] for x in chickpeas},{'270 g, cocidos, sin sal','90 g, secos'})
 def test_invalid_graph(self):
  for defect in ('cycle','missing','quantity','state'):
   source=copy.deepcopy(self.s);g=source['grafo'];p=g['preparaciones'][0]
   if defect=='cycle':
    eid=compra.ids(p['PREPARACION_ELEMENTOS'])[0];r=next(x for x in g['preparacion_elementos'] if x['id']==eid);r.pop('Ingrediente',None);r['Preparación incluida']=[{'id':p['id']}];r['Unidad']={'name':'ración'}
   elif defect=='missing':g['ingredientes']=[]
   elif defect=='quantity':p['Raciones base']=0
   else:p['Estado cálculo']='Pendiente'
   with self.assertRaises((ValueError,KeyError),msg=defect):compra.expand_graph(source)
 def test_stock_and_unknown(self):
  self.row('rec4QWbZX5KJIhQyW')['nombre']='Etiqueta nueva';p,_=compra.selection(self.s,1,SITE)
  self.assertTrue(next(x['stock'] for x in p['items'] if x['itemId']=='Etiqueta nueva'))
  self.assertEqual(next(x for x in p['items'] if x['itemId']=='Sal'),{'itemId':'Sal','stock':True})
  for iid in compra.STOCK:self.assertTrue(self.row(iid)['stock'])
 def test_presentations_and_selections(self):
  for iid,size in [('receShdIxklq3Ht6E','25'),('recHiBRS3Ikrzb1mt','250'),('recBR5gKXgTzxIPy9','163'),('recZ6WhTcrZDhRgKI','73/2')]:self.assertEqual(self.row(iid)['presentacion']['contenido'],size)
  for n in range(1,21):
   p,v=compra.selection(self.s,n,SITE);self.assertEqual(p['yield'],str(n));self.assertEqual(len(p['items']),59)
   self.assertIn('baseQuantity='+str(n),v['enlace']);self.assertIn('requestedQuantity='+str(n),v['enlace'])
   self.assertEqual(p['imageUrl'],SITE+'/imagenes/menus/10-1.png');self.assertEqual(p['linkOutUrl'],SITE+'/menus/10-1/compra/?porciones='+str(n))
  for n in (0,21,True,1.5,None):
   with self.assertRaises(ValueError):compra.selection(self.s,n,SITE)
 def test_exporter_rebuild(self):
  g=self.s['grafo'];mapping={'menus':'menu','comidas':'comidas','elementos':'comida_elementos','preparaciones':'preparaciones','preparacion_elementos':'preparacion_elementos','ingredientes':'ingredientes'}
  tables={k:{r['id']:{a:b for a,b in r.items() if a!='id'} for r in ([g[v]] if k=='menus' else g[v])} for k,v in mapping.items()}
  self.assertEqual(make_source(tables,self.s['productos'],R,'10-1',self.s['fuentes']['catalogo_blob']),self.s)
  tables['menus'][g['menu']['id']]['Lunes · Postre cantidad']=101
  with self.assertRaisesRegex(ValueError,'Postre público'):make_source(tables,self.s['productos'],R,'10-1',self.s['fuentes']['catalogo_blob'])
 def test_only_october_and_image(self):
  self.assertEqual(json.loads((R/'datos/compra/activos.json').read_text()),['10-1'])
  data=(R/self.s['imagen']).read_bytes();self.assertEqual(hashlib.sha256(data).hexdigest(),'c7952019f9e9b24a3c1bba2f376e5b354a91c518464b2e85d6276a48252c62c7')
  self.assertEqual(data,(R/'experimentos/bring/prueba-8-10-1/menu-octubre-1.png').read_bytes())
 def test_reproducibility(self):
  def run():subprocess.run([sys.executable,'scripts/generar.py'],cwd=R,check=True,capture_output=True)
  run();paths=list((R/'menus/10-1/compra').rglob('*'));before={str(p):p.read_bytes() for p in paths if p.is_file()};run();self.assertEqual(before,{str(p):p.read_bytes() for p in paths if p.is_file()})
