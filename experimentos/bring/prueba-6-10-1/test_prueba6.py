import copy
import json
import unittest
from fractions import Fraction as F
from generar import ROOT, build, for_people
from calcular_base import grouped

class Trial6(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data=json.loads((ROOT/'entrada.json').read_text())
        cls.files=build(cls.data)
        cls.base=json.loads(cls.files['calculo-base.json'])

    def test_recursive_repeated_meals_and_postre(self):
        rs={r['id']:r for r in self.base['ingredientes']}
        self.assertEqual(F(rs['rec8i7dH9EyB0AlVT']['cantidad_exacta']),400)
        self.assertEqual(F(rs['reckrgbmpjdK4nvOa']['cantidad_exacta']),400)
        self.assertEqual(F(rs['recSE81b9WjkURbXi']['cantidad_exacta']),400)
        self.assertEqual(F(rs['recSPOXZkbn9PSbHI']['cantidad_exacta']),100)
        self.assertEqual(F(rs['recBse4SOxBOPwYEQ']['cantidad_exacta']),F(375,2))
        self.assertEqual(F(rs['recw8aSxhSx0aSH93']['cantidad_exacta']),F(250,3))
        self.assertEqual(self.base['pendientes'],[])
        self.assertEqual(len(rs),54)
        names={r['nombre'] for r in self.base['preparaciones_recorridas']}
        self.assertTrue({'Sofrito clásico','Bowl de yogur con miel y granola','Bechamel','Falafel','Salsa vizcaína'}<=names)
        for r in rs.values():
            self.assertEqual(F(r['cantidad_exacta']),sum((F(a['cantidad_exacta']) for a in r['aportes']),F()))

    def test_display_and_round_all_unformatted_weights(self):
        for n in range(1,21):
            payload,v=for_people(self.base,n)
            self.assertEqual(payload['yield'],str(n))
            for r in v['ingredientes']:
                self.assertRegex(r['cantidad_real'],r'^\d+(?:\.\d)? (g|ml)$')
                if r['unidad_compra'] in ('g','ml'):
                    self.assertEqual(r['cantidad_compra']%10,0)
                    self.assertGreaterEqual(F(r['cantidad_compra']),F(r['cantidad_exacta']))
                    self.assertLess(F(r['cantidad_compra'])-F(r['cantidad_exacta']),10)
            oil=next(x for x in payload['items'] if 'Aceite de oliva virgen extra'==x['itemId'])
            self.assertTrue(oil['stock'])
            self.assertFalse(any('Café' in x['itemId'] for x in payload['items']))
        _,v=for_people(self.base,1)
        oil=next(r for r in v['ingredientes'] if r['id']=='rec4QWbZX5KJIhQyW')
        self.assertEqual(oil['cantidad_real'],'83.7 ml')
        self.assertEqual(oil['spec'],'90 ml')

    def test_package_sizes_drained_and_scale_before_ceil(self):
        rs={r['id']:r for r in self.base['ingredientes']}
        self.assertEqual(rs['recHiBRS3Ikrzb1mt']['contenido_unidad'],'250')
        self.assertEqual(rs['recBR5gKXgTzxIPy9']['contenido_unidad'],'163')
        self.assertEqual(rs['recJoLfb85Oe5dxXq']['contenido_unidad'],'120')
        _,v=for_people(self.base,3)
        out={r['id']:r for r in v['ingredientes']}
        self.assertEqual(out['recBR5gKXgTzxIPy9']['spec'],'2 latas')
        self.assertEqual(out['recHiBRS3Ikrzb1mt']['spec'],'2 envases')
        self.assertEqual(out['recBse4SOxBOPwYEQ']['spec'],'5 vasitos')
        self.assertEqual(out['recYmQvMp2kBIW1Ju']['spec'],'1 tarrina')
        self.assertEqual(out['recZ6WhTcrZDhRgKI']['spec'],'6 rebanadas')

    def test_identity_separation_cycles_and_input(self):
        self.assertEqual(len(grouped([dict(id='recA',unidad='g',cantidad=F(1)),dict(id='recA',unidad='ml',cantidad=F(2)),dict(id='recB',unidad='g',cantidad=F(1))])),3)
        data=copy.deepcopy(self.data)
        p=next(x for x in data['pe'] if x.get('Preparación incluida'))
        p['Preparación incluida']=[{'id':p['Preparación principal'][0]['id']}]
        with self.assertRaisesRegex(ValueError,'Ciclo'):build(data)
        for n in (0,21,1.5,True):
            with self.assertRaises(ValueError):for_people(self.base,n)
        self.assertEqual(build(self.data),self.files)

    def test_stock_and_isolation(self):
        p,_=for_people(self.base,1)
        ids=[x['itemId'] for x in p['items']]
        self.assertEqual(ids.count('Pimienta negra'),1)
        for x in p['items']:
            if x['itemId'] in ('Sal','Nuez moscada','Romero','Tomillo','Menta o hierbabuena'):
                self.assertTrue(x['stock']);self.assertNotIn('spec',x)
        for term in ('serviceWorker','localStorage','manifest.webmanifest','assets/'):
            self.assertNotIn(term,self.files['index.html'])
        self.assertNotIn('Miércoles comida y cena pendientes',self.files['index.html'])

if __name__=='__main__':unittest.main()
