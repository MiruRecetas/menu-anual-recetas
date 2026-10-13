import json
import unittest
from fractions import Fraction as F
from urllib.parse import parse_qs, urlparse
from generar import build, ROOT, for_people

class Trial5(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data=json.loads((ROOT/'entrada.json').read_text())
        cls.files=build(cls.data)
        cls.base=json.loads(cls.files['calculo-base.json'])

    def payload(self,n):return json.loads(self.files[f'exports/{n}.json'])
    def item(self,n,name):return next(x for x in self.payload(n)['items'] if name in x['itemId'])

    def test_scale_then_ceil_instead_of_scaling_ceil(self):
        self.assertEqual(self.item(1,'Philadelphia')['spec'],'1 tarrina')
        self.assertEqual(self.item(3,'Philadelphia')['spec'],'1 tarrina')
        self.assertEqual(self.item(15,'Philadelphia')['spec'],'2 tarrinas')
        self.assertEqual(self.item(3,'Mozzarella')['spec'],'2 bolsas')
        self.assertEqual(self.item(3,'Yogur')['spec'],'1 vasito')
        self.assertEqual(self.item(4,'Yogur')['spec'],'2 vasitos')

    def test_whole_presentation_and_no_annotations(self):
        self.assertEqual(self.item(3,'Oroweat')['spec'],'6 rebanadas')
        self.assertEqual(self.item(3,'Mini tortillas')['spec'],'9 tortillas')
        self.assertEqual(self.item(3,'Gazpacho')['spec'],'3 botellas')
        self.assertEqual(self.item(3,'Arroz blanco')['spec'],'3 vasitos')
        for n in (1,3,20):
            for x in self.payload(n)['items']:
                if 'spec' in x:
                    self.assertRegex(x['spec'],r'^\d+(?:\.\d+)? [^();]+$')
                    self.assertNotIn('necesario',x['spec'])

    def test_fresh_tens_and_oil_stock(self):
        self.assertEqual(self.item(1,'Cebolla')['spec'],'120 g')
        self.assertEqual(self.item(3,'Cebolla')['spec'],'360 g')
        self.assertEqual(self.item(1,'Aceite de oliva')['spec'],'60 ml')
        self.assertEqual(self.item(3,'Aceite de oliva')['spec'],'180 ml')
        self.assertTrue(self.item(3,'Aceite de oliva')['stock'])
        self.assertEqual(self.item(1,'Pechuga de pollo')['spec'],'270 g')

    def test_anchovies_and_display_precision_regression(self):
        self.assertEqual(self.item(4,'Anchoas')['spec'],'120 g')
        self.assertEqual(self.item(5,'Anchoas')['spec'],'150 g')
        views=json.loads(self.files['vista.json'])
        r=next(x for x in views[3]['ingredientes'] if 'Anchoas' in x['nombre'])
        self.assertEqual(r['cantidad_real'],'113.3 g')
        self.assertEqual(F(r['cantidad_exacta']),F(340,3))
        for v in views:
            for row in v['ingredientes']:
                self.assertRegex(row['cantidad_real'],r'^\d+(?:\.\d)? ')

    def test_yield_link_quantities_and_real_need(self):
        views=json.loads(self.files['vista.json'])
        for n in range(1,21):
            self.assertEqual(self.payload(n)['yield'],str(n))
            query=parse_qs(urlparse(views[n-1]['enlace']).query)
            self.assertEqual(query['baseQuantity'],[str(n)])
            self.assertEqual(query['requestedQuantity'],[str(n)])
            self.assertTrue(query['url'][0].endswith(f'exports/{n}.json'))
        row=next(x for x in views[2]['ingredientes'] if 'Philadelphia' in x['nombre'])
        self.assertEqual(F(row['cantidad_exacta']),F(105,2))
        self.assertEqual(row['cantidad_real'],'52.5 g')

    def test_stock_identity_and_input_validation(self):
        for n in (1,3,20):
            p=self.payload(n)
            self.assertEqual(len(p['items']),40)
            self.assertEqual(sum(x['stock'] for x in p['items']),6)
            for x in p['items']:
                if x['itemId'] in ('Sal','Pimienta negra','Ajo en polvo','Salsa Worcestershire','Condimentos al gusto'):
                    self.assertTrue(x['stock']);self.assertNotIn('spec',x)
        for n in (0,21,1.5,True):
            with self.assertRaises(ValueError):for_people(self.base,n)
        self.assertEqual(build(self.data),self.files)
        for forbidden in ('serviceWorker','localStorage','manifest.webmanifest','assets/'):
            self.assertNotIn(forbidden,self.files['index.html'])

if __name__=='__main__':unittest.main()
