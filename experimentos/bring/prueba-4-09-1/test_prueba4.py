import copy
import json
import unittest
from fractions import Fraction as F
from generar import build, grouped, ROOT

class Trial4(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads((ROOT / 'entrada.json').read_text())
        cls.files = build(cls.data)
        cls.audit = json.loads(cls.files['calculo.json'])

    def test_identity_not_name_and_incompatible_units(self):
        rows = grouped([
            dict(id='recA', unidad='g', cantidad=F(10)),
            dict(id='recB', unidad='g', cantidad=F(20)),
            dict(id='recA', unidad='ml', cantidad=F(5)),
            dict(id='recA', unidad='g', cantidad=F(2)),
        ])
        self.assertEqual(len(rows), 3)
        self.assertEqual(next(x['cantidad'] for x in rows if x['id']=='recA' and x['unidad']=='g'),12)

    def test_recursion_and_independent_control_totals(self):
        rs={x['id']:x for x in self.audit['ingredientes']}
        expected={'recWu3cmRxB6uzGOH':270,'recSE81b9WjkURbXi':450,
                  'recrGNY88zOIOcRom':F(235,2),'recG7EOA99Wt7MiRC':90,
                  'recEiDCa6JHQpUw23':50,'recqRhWfhNW5TZb77':150,
                  'rec5FqFslqUdjaiiX':F(85,3),'rec8Qjo12MyyUQ3Rc':400}
        for key,value in expected.items():self.assertEqual(F(rs[key]['cantidad_exacta']),value)
        self.assertEqual(len(rs),35)
        self.assertEqual(sum(len(x['aportes']) for x in rs.values()),60)
        self.assertEqual(len(self.audit['pendientes']),2)
        for row in rs.values():
            self.assertEqual(F(row['cantidad_exacta']),sum((F(x['cantidad_exacta']) for x in row['aportes']),F()))

    def test_purchase_units_ceil_after_sum(self):
        rs={x['id']:x for x in self.audit['ingredientes']}
        self.assertEqual(rs['recYmQvMp2kBIW1Ju']['compra_redondeada'],1)
        self.assertEqual(F(rs['recYmQvMp2kBIW1Ju']['equivalencia_exacta']),F(7,100))
        self.assertEqual(rs['receShdIxklq3Ht6E']['compra_redondeada'],3)
        self.assertEqual(rs['recZ6WhTcrZDhRgKI']['compra_redondeada'],2)
        self.assertEqual(rs['recJ4mshh3aIXqMWm']['compra_redondeada'],1)
        self.assertEqual(rs['recopPfIUQXoWtL7P']['contenido_unidad'],'220')
        self.assertEqual(rs['recSPOXZkbn9PSbHI']['compra_redondeada'],3)
        self.assertEqual(rs['recoM4LY51MoUUkJm']['compra_redondeada'],2)

    def test_variants_stock_and_isolation(self):
        payloads=[json.loads(self.files['bring-4'+v+'.json']) for v in 'abc']
        for p in payloads:
            self.assertEqual(p['yield'],'1')
            stock={x['itemId']:x for x in p['items'] if x['stock']}
            self.assertEqual(set(stock),{'Sal','Pimienta negra','Ajo en polvo','Salsa Worcestershire','Condimentos al gusto'})
            self.assertTrue(all('spec' not in x for x in stock.values()))
            self.assertEqual(len(p['items']),40)
            self.assertFalse(any('Café' in x['itemId'] for x in p['items']))
            self.assertFalse(any(x['itemId'] in ('Sofrito clásico','Ragú a la boloñesa') for x in p['items']))
        self.assertEqual([x['itemId'] for x in payloads[0]['items']],[x['itemId'] for x in payloads[1]['items']])
        html=self.files['index.html']
        for forbidden in ('serviceWorker','localStorage','manifest.webmanifest','assets/'):
            self.assertNotIn(forbidden,html)
        self.assertIn('noindex, nofollow',html)
        self.assertEqual(build(self.data),self.files)

    def test_cycles_rejected(self):
        data=copy.deepcopy(self.data)
        root=next(x for x in data['pe'] if x['id']=='recXozoI97sfuwiZD')
        root['Preparación incluida']=[{'id':'recaVkzuZrFim3Mgb'}]
        with self.assertRaisesRegex(ValueError,'Ciclo'):build(data)

if __name__=='__main__':unittest.main()
