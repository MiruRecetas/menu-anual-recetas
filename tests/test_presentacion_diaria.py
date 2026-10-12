import copy
import json
import unittest
from pathlib import Path
from scripts.presentacion_diaria import enrich_day

ROOT=Path(__file__).resolve().parents[1]

class DailyPresentation(unittest.TestCase):
    def setUp(self):
        self.day=json.loads((ROOT/'datos/menus/09-3.json').read_text())['dias']['Lunes']
        self.snapshot=json.loads((ROOT/'presentacion/aportes-componentes.json').read_text())['elementos']

    def test_desglose_oficial_sin_mutar_fuentes(self):
        before=copy.deepcopy(self.day);snapshot=copy.deepcopy(self.snapshot)
        result=enrich_day(self.day,self.snapshot)
        groups=result['comida']['presentacion']['grupos']
        self.assertEqual(len(groups),3)
        for k,v in self.day['comida']['nutricion'].items():
            self.assertAlmostEqual(sum(g['nutricion'][k] for g in groups),v)
        self.assertEqual(self.day,before)
        self.assertEqual(self.snapshot,snapshot)
        self.assertEqual(result['nutricion'],before['nutricion'])

    def test_no_mezcla_aportes_obsoletos(self):
        for field,value in [('cantidad',201),('referencia_id','otra'),('nutricion',dict(kcal=9999,proteinas_g=0,hidratos_g=0,grasas_g=0))]:
            cache=copy.deepcopy(self.snapshot)
            first=self.day['comida']['presentacion']['grupos'][0]['elementos'][0]['id']
            cache[first][field]=value
            groups=enrich_day(self.day,cache)['comida']['presentacion']['grupos']
            self.assertTrue(all('nutricion' not in g for g in groups))

    def test_exportaciones_con_aportes_no_necesitan_cache(self):
        day=enrich_day(self.day,self.snapshot)
        result=enrich_day(day,{})
        self.assertEqual(result,day)

    def test_sin_aportes_no_inventa_nutrientes(self):
        result=enrich_day(self.day,{})
        self.assertEqual(result['comida']['nutricion'],self.day['comida']['nutricion'])
        self.assertTrue(all('nutricion' not in g for g in result['comida']['presentacion']['grupos']))

    def test_comidas_cubiertas_por_la_instantanea_tienen_desglose(self):
        for path in (ROOT/'datos/menus').glob('*.json'):
            menu=json.loads(path.read_text())
            for d in menu['dias'].values():
                result=enrich_day(d,self.snapshot)
                for kind in ('comida','cena'):
                    if 'presentacion' not in result[kind]:continue
                    groups=result[kind]['presentacion']['grupos']
                    elements=result[kind]['presentacion']['elementos_sin_grupo']+[e for g in groups for e in g['elementos']]
                    if all(e['id'] in self.snapshot for e in elements):
                        for group in groups:self.assertIn('nutricion',group)

if __name__=='__main__':unittest.main()
