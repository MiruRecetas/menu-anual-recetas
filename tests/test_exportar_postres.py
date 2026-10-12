import copy
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from scripts import exportar_airtable as exporter

N = dict(kcal=100.0, proteinas_g=8.0, hidratos_g=10.0, grasas_g=3.0)
PREP = {'Nombre': 'Postre de prueba', 'Estado cálculo': 'Calculado',
        'Enlace receta': 'https://mirurecetas.github.io/menu-anual-recetas/recetas/postre-prueba/',
        **dict(zip(('Kcal/ración','Proteínas/ración','Hidratos/ración','Grasas/ración'),N.values()))}
ING = {'Nombre':'Fruta', 'Base nutricional':'100 g'}

def row(kind=None, amount=1):
    r={'Lunes · Estado postre':'Calculado' if kind else 'Sin postre'}
    if kind=='preparacion':
        r.update({'Lunes · Postre preparación':['prep'], 'Lunes · Postre raciones':amount})
    if kind=='ingrediente':
        r.update({'Lunes · Postre':['ing'], 'Lunes · Postre cantidad':amount, 'Lunes · Postre unidad':'g'})
        r.update({'TEC Lunes Postre '+field:n for field,n in zip(exporter.FIELD_MACROS,N.values())})
    return r

class Desserts(unittest.TestCase):
    def export(self, r, preps=None, slugs=None):
        return exporter.dessert(r,'Lunes',{'ing':ING},preps or {'prep':PREP},slugs or set())

    def test_ingredient_portion_not_base(self):
        for amount in (50,100,150):
            post=self.export(row('ingrediente',amount))['componentes'][0]
            self.assertEqual(post['cantidad'],amount)
            self.assertEqual(post['nutricion'],{k:v*amount/100 for k,v in N.items()})
        r=row('ingrediente',50);r['Lunes · Postre unidad']='ml'
        with patch.dict(ING,{'Base nutricional':'100 ml'}):
            self.assertEqual(self.export(r)['componentes'][0]['nutricion']['kcal'],50)

    def test_preparation_portions_and_real_link(self):
        for amount in (0.5,1,2):
            post=self.export(row('preparacion',amount),slugs={'postre-prueba'})['componentes'][0]
            self.assertEqual(post['raciones'],amount)
            self.assertEqual(post['slug'],'postre-prueba')
            self.assertEqual(post['nutricion'],{k:v*amount for k,v in N.items()})
            self.assertNotIn('cantidad',post)
            self.assertNotIn('unidad',post)
        self.assertNotIn('slug',self.export(row('preparacion'))['componentes'][0])

    def test_both_are_valid_and_independent(self):
        r=row('ingrediente',50);r.update(row('preparacion',0.5))
        post=self.export(r,slugs={'postre-prueba'})
        self.assertEqual(set(post),{'componentes'})
        self.assertEqual([p['tipo'] for p in post['componentes']],['ingrediente','preparacion'])
        self.assertEqual([p['nutricion']['kcal'] for p in post['componentes']],[50,50])
        for field,bad in (('Lunes · Postre cantidad',0),('Lunes · Postre raciones',0),
                          ('Lunes · Postre',['ing','ing']),('Lunes · Postre preparación',['prep','prep']),
                          ('Lunes · Estado postre','Error: revisar postre preparación')):
            invalid=copy.deepcopy(r);invalid[field]=bad
            with self.assertRaises(ValueError):self.export(invalid)

    def test_no_dessert(self):
        self.assertIsNone(self.export(row()))

    def test_errors_fail_closed(self):
        cases=[]
        r=row('preparacion');r['Lunes · Postre']=['ing'];cases.append(r)
        for kind in ('ingrediente','preparacion'):
            for amount in (0,-1,float('nan'),float('inf'),True):cases.append(row(kind,amount))
            r=row(kind);r['Lunes · Estado postre']='Error: revisar postre';cases.append(r)
            r=row(kind);r.pop('Lunes · Estado postre');cases.append(r)
        r=row('ingrediente');r['Lunes · Postre unidad']='ml';cases.append(r)
        r=row('preparacion');r['Lunes · Postre cantidad']=100;cases.append(r)
        r=row('preparacion');r['Lunes · Postre preparación']=['prep','prep'];cases.append(r)
        r=row();r['Lunes · Estado postre']='Error: cantidad sin postre';cases.append(r)
        for r in cases:
            with self.subTest(row=r), self.assertRaises(ValueError):self.export(r)
        prep=copy.deepcopy(PREP);prep['Estado cálculo']='Pendiente'
        with self.assertRaises(ValueError):self.export(row('preparacion'),{'prep':prep})

    def test_meal_exports_official_element_contributions(self):
        meals={'meal':{'Nombre':'Plato','Estado cálculo':'Calculado','COMIDA_ELEMENTOS':['element'],
                      **dict(zip(('Kcal','Proteínas (g)','Hidratos (g)','Grasas (g)'),N.values()))}}
        elements={'element':{'Comida':['meal'],'Ingrediente':['ing'],'Cantidad':50,'Unidad':'g',
                            'TEC_Estado elemento':'Calculado',
                            **dict(zip(('Kcal aportadas','Proteínas aportadas','Hidratos aportadas','Grasas aportadas'),N.values()))}}
        before=copy.deepcopy(elements)
        result=exporter.meal('meal',meals,elements,{'ing':ING},{},set())
        self.assertEqual(result['presentacion']['elementos_sin_grupo'][0]['nutricion'],N)
        self.assertEqual(elements,before)
        elements['element']['TEC_Estado elemento']='Pendiente'
        with self.assertRaises(ValueError):exporter.meal('meal',meals,elements,{'ing':ING},{},set())

    def test_main_preserves_official_partial_totals_and_writes_nothing_on_error(self):
        menu={'Mes':'Octubre','Número':1,
              'Estado menú':'Pendiente: revisar vínculos, desayunos, postres o nutrición'}
        # Valores oficiales con una diferencia de redondeo admisible; no sustituirlos por sumas.
        for day in exporter.DAYS:
            menu[day+' · Desayuno']=['ing']
            menu[day+' · Estado postre']='Sin postre'
            for field,key in zip(exporter.FIELD_MACROS,N):
                menu['TEC '+day+' Desayuno '+field]=N[key]/1.3
                menu[day+' · '+field+' totales']=N[key]+0.01
        for field,key in zip(exporter.FIELD_MACROS,N):menu['Menú · '+field]=(N[key]+0.01)*5
        menu.update(row('ingrediente',50));menu.update(row('preparacion',0.5))
        for field,key in zip(exporter.FIELD_MACROS,N):
            menu['Lunes · '+field+' totales']+=N[key]
            menu['Menú · '+field]+=N[key]
        tables={name:{} for name in exporter.TABLES}
        tables['menus']={'menu':menu};tables['ingredientes']={'ing':ING};tables['preparaciones']={'prep':PREP}
        with tempfile.TemporaryDirectory() as tmp, patch.object(exporter,'ROOT',Path(tmp)), \
             patch.object(exporter,'retrieve',side_effect=lambda name,token:tables[name]), \
             patch.dict('os.environ',{'AIRTABLE_TOKEN':'test','AIRTABLE_MENU_IDS':'menu'}):
            exporter.main()
            target=Path(tmp)/'datos/menus/10-1.json'
            result=json.loads(target.read_text())
            self.assertEqual(result['dias']['Lunes']['nutricion']['kcal'],200.01)
            self.assertEqual(result['nutricion_semana']['kcal'],600.05)
            before=target.read_bytes()
            menu['Lunes · Estado postre']='Error: revisar postre ingrediente'
            with self.assertRaises(ValueError):exporter.main()
            self.assertEqual(target.read_bytes(),before)

if __name__=='__main__':unittest.main()
