import json
import unittest
import hashlib
from pathlib import Path
from generar import ROOT, build, DISPLAY

class Trial7(unittest.TestCase):
    def test_determinism_and_unchanged_calculation(self):
        files=build(json.loads((ROOT/'entrada.json').read_text()))
        base=json.loads(files['calculo-base.json'])
        control=json.loads((ROOT/'control-prueba6.json').read_text())
        digest=lambda x:hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True).encode()).hexdigest()
        self.assertEqual(digest(base['ingredientes']),control['ingredientes_sha256'])
        for n in range(1,21):
            payload=json.loads(files[f'exports/{n}.json'])
            projection=dict(yield_=payload['yield'],items=[dict(spec=r.get('spec','').split(', ')[0],stock=r['stock']) for r in payload['items']])
            self.assertEqual(digest(projection),control['exports_sha256'][str(n)])
            self.assertEqual(payload['linkOutUrl'],f'https://mirurecetas.github.io/menu-anual-recetas/experimentos/bring/prueba-7-10-1/?porciones={n}')
        self.assertEqual(files,build(json.loads((ROOT/'entrada.json').read_text())))

    def test_shared_name_keeps_two_ids_and_variants(self):
        files=build(json.loads((ROOT/'entrada.json').read_text()))
        for n,expected in [(1,['90 g, cocidos, sin sal','30 g, secos']),(3,['270 g, cocidos, sin sal','90 g, secos'])]:
            p=json.loads(files[f'exports/{n}.json'])
            self.assertEqual([r['spec'] for r in p['items'] if r['itemId']=='Garbanzos'],expected)
            views=json.loads(files['vista.json'])
            ids=[r['id'] for r in views[n-1]['ingredientes'] if r['nombre']=='Garbanzos']
            self.assertEqual(set(ids),{'recuumabv4qaMUXNE','recQJX7aiVeoHJvep'})
            for name in ('Aceite de oliva','Miel','Tahini','Salsa de soja'):
                self.assertTrue(next(r for r in p['items'] if r['itemId']==name)['stock'])
            self.assertEqual(next(r for r in p['items'] if r['itemId']=='Yogur')['spec'],f'{2 if n==1 else 5} vasitos, griego natural, DIA Fidias')
            self.assertEqual(next(r for r in p['items'] if r['itemId']=='Huevos')['spec'],f'{n*2} huevos')

if __name__=='__main__':unittest.main()
