import json,sys,unittest
from pathlib import Path
from fractions import Fraction as F
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from compra import validate_source,selection,presentation
from exportar_compra import make_source
R=Path(__file__).resolve().parents[1];SITE='https://mirurecetas.github.io/menu-anual-recetas'
def source(k):return json.loads((R/'datos/compra'/f'{k}.json').read_text())
class SeptiembreUnoDos(unittest.TestCase):
 def test_empty_image_rejected_even_with_matching_hash(self):
  import hashlib
  from unittest.mock import patch
  s=source('09-1');s['fuentes']['imagen_sha256']=hashlib.sha256(b'').hexdigest()
  with patch.object(Path,'read_bytes',return_value=b''):
   with self.assertRaisesRegex(ValueError,'inválido o vacío'):validate_source(s,R)
 def test_exact_dependency_totals(self):
  cases={'09-1':{'recqRhWfhNW5TZb77':150,'recopPfIUQXoWtL7P':160,'recWu3cmRxB6uzGOH':270,'rec8Qjo12MyyUQ3Rc':400},'09-2':{'recHXANUTNGT7A9ni':F(500,3),'rec3IWu5VmkWByjJV':F(400,3),'recRXEXmNsAe7G2OK':360,'recENcfvg6SEEWS6F':850,'recw8aSxhSx0aSH93':200,'rec5W7tOnZEG0QEni':15}}
  for key,expected in cases.items():
   s=source(key);b=validate_source(s,R);rows={r['id']:r for r in b['ingredientes']}
   self.assertEqual(len(b['preparaciones']),12);self.assertEqual(len(b['ingredientes']),41)
   for iid,q in expected.items():self.assertEqual(F(rows[iid]['cantidad_exacta']),q)
   for r in rows.values():self.assertEqual(sum((F(a['cantidad_exacta']) for a in r['aportes']),F(0)),F(r['cantidad_exacta']))
   self.assertEqual(len(b['exclusiones']),5)
 def test_dual_dessert_and_recursive_repetition(self):
  s=source('09-2');rows={r['id']:r for r in s['calculo']['ingredientes']}
  self.assertEqual({a['origen'] for a in rows['recHXANUTNGT7A9ni']['aportes']},{'Lunes · Comida','Jueves · Comida'})
  self.assertEqual(len(rows['recRXEXmNsAe7G2OK']['aportes']),2)
  self.assertEqual(len(rows['recENcfvg6SEEWS6F']['aportes']),5)
  self.assertEqual(next(x for x in s['calculo']['cobertura'] if x['ingesta']=='Miércoles · Postre')['componentes'],2)
  self.assertEqual(rows['recw8aSxhSx0aSH93']['aportes'][0]['origen'],'Miércoles · Postre ingrediente')
  self.assertEqual(rows['rec5W7tOnZEG0QEni']['aportes'][0]['origen'],'Miércoles · Postre preparación')
 def test_formats_and_rounding_after_scale(self):
  s=source('09-2');p,v=selection(s,3,SITE);rows={r['nombre']:r for r in v['ingredientes']}
  self.assertEqual(rows['Dorada']['necesidad'],'577.5 g');self.assertEqual(rows['Dorada']['exportada'],'3 doradas')
  self.assertEqual(rows['Chorizo']['exportada'],'400 g');self.assertEqual(rows['Tomate']['exportada'],'900 g')
  self.assertEqual(next(x for x in v['ingredientes'] if x['descripcion']=='natural, monodosis, Iberitos')['exportada'],'9 tarrinas')
  self.assertEqual(len([x for x in p['items'] if x['itemId']=='Mostaza']),2)
  self.assertEqual(next(x for x in p['items'] if x['itemId']=='Jamón')['spec'],'180 g, ibérico')
  self.assertEqual(next(x for x in p['items'] if x['itemId']=='Azúcar')['spec'],'90 g, blanco y moreno, para galletas')
  i=next(x for x in s['grafo']['ingredientes'] if x['id']=='rec3IWu5VmkWByjJV')
  self.assertIsNone(presentation(i,'g',{p['id']:p for p in s['productos']}))
 def test_literal_complements_without_fake_ids_or_nutrients(self):
  s=source('09-2');c=s['calculo']['complementos'];self.assertEqual(len(c),4)
  self.assertTrue(all('id' not in x and 'nutricion' not in x for x in c))
  p,v=selection(s,3,SITE);items={x['itemId']:x for x in p['items']}
  self.assertEqual(items['Limón']['spec'],'3 unidades, para aromatizar')
  self.assertEqual(items['Naranja']['spec'],'1 unidad, para aromatizar')
  self.assertFalse(items['Naranja']['stock'])
  self.assertEqual(next(x for x in v['ingredientes'] if x['nombre']=='Limón')['necesidad'],'3 unidades')
  vanilla=next(x for x in v['ingredientes'] if x['nombre']=='Extracto de vainilla')
  self.assertEqual(vanilla['necesidad'],'3.2 ml');self.assertEqual(vanilla['exportada'],'10 ml');self.assertTrue(vanilla['stock'])
 def test_twenty_payloads_and_reproduction(self):
  for key,total,stock in [('09-1',49,10),('09-2',53,12)]:
   s=source(key)
   for n in range(1,21):
    p,v=selection(s,n,SITE);self.assertEqual(len(p['items']),total);self.assertEqual(sum(x['stock'] for x in p['items']),stock);self.assertEqual(p['yield'],str(n));self.assertEqual(p['imageUrl'],SITE+f'/imagenes/menus/{key}.webp')
   g=s['grafo'];mapping={'menus':'menu','comidas':'comidas','elementos':'comida_elementos','preparaciones':'preparaciones','preparacion_elementos':'preparacion_elementos','ingredientes':'ingredientes'}
   t={k:{r['id']:{a:b for a,b in r.items() if a!='id'} for r in ([g[v]] if k=='menus' else g[v])} for k,v in mapping.items()}
   self.assertEqual(make_source(t,s['productos'],R,key,s['fuentes']['catalogo_blob']),s)
