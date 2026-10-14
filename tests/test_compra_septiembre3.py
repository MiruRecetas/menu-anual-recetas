import json,sys,unittest
from fractions import Fraction as F
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import compra
from exportar_compra import make_source
R=Path(__file__).resolve().parents[1];SITE='https://mirurecetas.github.io/menu-anual-recetas'
class SeptiembreTresCompra(unittest.TestCase):
 def setUp(self):self.s=json.loads((R/'datos/compra/09-3.json').read_text())
 def row(self,iid):return next(x for x in self.s['calculo']['ingredientes'] if x['id']==iid)
 def test_repetitions_and_internal_bases(self):
  b=compra.validate_source(self.s,R)
  self.assertEqual(len(b['ingredientes']),33);self.assertEqual(len(b['preparaciones']),9)
  self.assertIn('recZ9MGL7IIEy9LWG',b['preparaciones'])
  self.assertIn('recgi0wLvd7EOUa6E',b['preparaciones'])
  for iid,q,uses in [('recqRhWfhNW5TZb77',F(1000,3),2),('recl0KweclZiBy98h',F(1000,3),4),('recOYCX563rWZgvWh',360,3),('recSE81b9WjkURbXi',690,6),('recrQuW0jedsqM35u',300,3),('recpHKx8XrOpBd8zW',260,2)]:
   r=self.row(iid);self.assertEqual(F(r['cantidad_exacta']),q);self.assertEqual(len(r['aportes']),uses)
  self.assertEqual(self.row('recrGNY88zOIOcRom')['cantidad_exacta'],'400')
  self.assertEqual(F(self.row('recBse4SOxBOPwYEQ')['cantidad_exacta']),F(375,4))
  for r in b['ingredientes']:self.assertEqual(sum((F(a['cantidad_exacta']) for a in r['aportes']),F(0)),F(r['cantidad_exacta']))
 def test_rice_variants_and_verified_individual_formats(self):
  self.assertNotIn('presentacion',self.row('rec2ds3lrGGTSSER0'))
  self.assertEqual(self.row('reccZQ0blNFQ0THdM')['presentacion']['contenido'],'125')
  self.assertEqual(self.row('recMpMB5G7N8U3xQb')['presentacion']['contenido'],'200')
  p,v=compra.selection(self.s,3,SITE)
  rice=[x for x in p['items'] if x['itemId']=='Arroz'];self.assertEqual(len(rice),2)
  self.assertTrue(any(x['spec']=='150 g, blanco, grano corto, crudo' for x in rice))
  self.assertTrue(any(x['spec']=='3 vasitos, blanco, cocido, DIA Al Punto' for x in rice))
  rows={r['nombre']:r for r in v['ingredientes']}
  self.assertEqual(rows['Nata']['necesidad'],'540 ml');self.assertEqual(rows['Nata']['exportada'],'3 envases')
  self.assertEqual(rows['Huevos']['necesidad'],'700 g');self.assertEqual(rows['Huevos']['exportada'],'14 huevos')
  self.assertEqual(rows['Ternera picada']['exportada'],'1000 g')
 def test_payloads_stock_and_office_coffee(self):
  for n in range(1,21):
   p,v=compra.selection(self.s,n,SITE);self.assertEqual(len(p['items']),40);self.assertEqual(sum(x['stock'] for x in p['items']),8)
   self.assertEqual(p['yield'],str(n));self.assertEqual(p['imageUrl'],SITE+'/imagenes/menus/09-3.webp')
   self.assertIn('/menus/09-3/compra/exports/',v['enlace'].replace('%2F','/'))
   self.assertEqual(next(x for x in p['items'] if x['itemId']=='Laurel'),{'itemId':'Laurel','stock':True})
   self.assertTrue(next(x for x in p['items'] if x['itemId']=='Aceite de oliva')['stock'])
  self.assertEqual(len(self.s['calculo']['exclusiones']),5)
  self.assertNotIn(compra.OFFICE_COFFEE,{r['id'] for r in self.s['calculo']['ingredientes']})
 def test_exporter_reproduces_source(self):
  g=self.s['grafo'];mapping={'menus':'menu','comidas':'comidas','elementos':'comida_elementos','preparaciones':'preparaciones','preparacion_elementos':'preparacion_elementos','ingredientes':'ingredientes'}
  tables={k:{r['id']:{a:b for a,b in r.items() if a!='id'} for r in ([g[v]] if k=='menus' else g[v])} for k,v in mapping.items()}
  self.assertEqual(make_source(tables,self.s['productos'],R,'09-3',self.s['fuentes']['catalogo_blob']),self.s)
