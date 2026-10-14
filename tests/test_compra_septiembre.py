import copy,json,sys,unittest
from fractions import Fraction as F
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import compra
from exportar_compra import make_source
R=Path(__file__).resolve().parents[1];SITE='https://mirurecetas.github.io/menu-anual-recetas'
class SeptiembreCompra(unittest.TestCase):
 def setUp(self):self.s=json.loads((R/'datos/compra/09-4.json').read_text())
 def row(self,iid):return next(x for x in self.s['calculo']['ingredientes'] if x['id']==iid)
 def test_repeated_meals_and_preparations(self):
  base=compra.validate_source(self.s,R)
  self.assertEqual(len(base['ingredientes']),35);self.assertEqual(len(base['preparaciones']),12)
  bonito=self.row('recU1vinIuUBjzUQJ');self.assertEqual(F(bonito['cantidad_exacta']),300)
  self.assertEqual({x['origen'] for x in bonito['aportes']},{'Martes · Comida','Jueves · Cena'})
  beef=self.row('recqRhWfhNW5TZb77');self.assertEqual(F(beef['cantidad_exacta']),200);self.assertEqual(len(beef['aportes']),2)
  chicken=self.row('recWu3cmRxB6uzGOH');self.assertEqual(F(chicken['cantidad_exacta']),300);self.assertEqual(len(chicken['aportes']),2)
  self.assertEqual(self.row('recSE81b9WjkURbXi')['cantidad_exacta'],'730')
  self.assertEqual(self.row('recSPOXZkbn9PSbHI')['cantidad_exacta'],'200')
  for r in base['ingredientes']:self.assertEqual(sum((F(x['cantidad_exacta']) for x in r['aportes']),F(0)),F(r['cantidad_exacta']))
 def test_individual_drained_cans(self):
  for iid,size in [('rec2gsfoCFXCmmEDw','60'),('recCqcEvBuDY6SD9h','50')]:
   row=self.row(iid);self.assertEqual(row['presentacion']['contenido'],size)
   self.assertEqual(row['presentacion']['base'],'escurrida por unidad individual')
  for n in [1,3,20]:
   p,_=compra.selection(self.s,n,SITE)
   for name in ['Atún','Aceitunas']:
    spec=next(x['spec'] for x in p['items'] if x['itemId']==name);self.assertTrue(spec.startswith(str(n)+(' lata,' if n==1 else ' latas,')))
 def test_adobo_net_basis_and_variants(self):
  self.assertEqual(self.row('recNnfHxJO9aFN7gF')['presentacion']['contenido'],'220')
  self.assertEqual(self.row('recNnfHxJO9aFN7gF')['presentacion']['base'],'neto con adobo')
  p,_=compra.selection(self.s,4,SITE);self.assertTrue(next(x['spec'] for x in p['items'] if x['itemId']=='Chipotles').startswith('1 envase,'))
  variants=[x for x in p['items'] if x['itemId']=='Pechuga de pollo'];self.assertEqual(len(variants),2)
  self.assertTrue(any('loncheada' in x['spec'] for x in variants));self.assertTrue(any('cruda' in x['spec'] for x in variants))
 def test_all_payloads_and_literal_checklist(self):
  for n in range(1,21):
   p,v=compra.selection(self.s,n,SITE);self.assertEqual(len(p['items']),41);self.assertEqual(sum(x['stock'] for x in p['items']),8)
   self.assertEqual(p['yield'],str(n));self.assertIn('/menus/09-4/compra/exports/',v['enlace'].replace('%2F','/'))
   self.assertEqual(p['imageUrl'],SITE+'/imagenes/menus/09-4.webp')
   self.assertEqual(next(x for x in p['items'] if x['itemId']=='Laurel'),{'itemId':'Laurel','stock':True})
   self.assertEqual(len([x for x in p['items'] if x['itemId']=='Pimentón']),1)
  line=next(x for x in self.s['condimentos'] if x['nombre']=='Laurel')
  self.assertEqual(line['cantidad_culinaria'],2);self.assertEqual(line['unidad_culinaria'],'hojas')
 def test_legacy_postre_is_accepted_without_modifying_menu(self):
  g=self.s['grafo'];mapping={'menus':'menu','comidas':'comidas','elementos':'comida_elementos','preparaciones':'preparaciones','preparacion_elementos':'preparacion_elementos','ingredientes':'ingredientes'}
  tables={k:{r['id']:{a:b for a,b in r.items() if a!='id'} for r in ([g[v]] if k=='menus' else g[v])} for k,v in mapping.items()}
  self.assertEqual(make_source(tables,self.s['productos'],R,'09-4',self.s['fuentes']['catalogo_blob']),self.s)
  public=json.loads((R/'datos/menus/09-4.json').read_text());self.assertNotIn('componentes',public['dias']['Lunes']['postre'])
  tables['menus'][g['menu']['id']]['Lunes · Postre cantidad']=101
  with self.assertRaisesRegex(ValueError,'Postre público'):make_source(tables,self.s['productos'],R,'09-4',self.s['fuentes']['catalogo_blob'])
