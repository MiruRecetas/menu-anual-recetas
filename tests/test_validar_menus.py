import copy
import unittest
from scripts.validar_menus import validate_menu, DAYS

N={"kcal":100.0,"proteinas_g":8.0,"hidratos_g":10.0,"grasas_g":3.0}

def meal():
    return {"comida_id":"rec-comida","nombre":"Plato y guarnición","estado":"Calculado",
            "nutricion":copy.deepcopy(N),
            "presentacion":{"grupos":[{"id":"principal","nombre":"Preparación","orden":1,
                "elementos":[{"id":"rec-elem-1","tipo":"preparacion","referencia_id":"rec-prep",
                              "nombre":"Preparación","cantidad":1,"unidad":"ración","slug":"receta-real"}]},
               {"id":"acomp","nombre":"Verdura","orden":2,
                "elementos":[{"id":"rec-elem-2","tipo":"ingrediente","referencia_id":"rec-ing",
                              "nombre":"Verdura","cantidad":80,"unidad":"g"}]}],
                "elementos_sin_grupo":[]}}

def simple():
    return {"tipo":"ingrediente","nombre":"Café","cantidad":130,"unidad":"ml","nutricion":copy.deepcopy(N)}

def fixture():
    days={}
    for d in DAYS:
        days[d]={"desayuno":simple(),"comida":meal(),
                 "cena":{"estado":"libre"} if d=="Viernes" else meal(),
                 "postre":None,
                 "nutricion":{k:v*(2 if d=="Viernes" else 3) for k,v in N.items()}}
    return {"schema_version":2,"mes":10,"menu":1,"airtable_menu_id":"rec-menu",
            "estado":"Calculado","dias":days,
            "nutricion_semana":{k:v*14 for k,v in N.items()}}

class MenuV2(unittest.TestCase):
    def test_acepta_comida_compuesta(self):
        validate_menu(fixture(),"10-1.json",{"receta-real"})
    def test_no_inventa_cena_viernes(self):
        m=fixture()
        m["dias"]["Viernes"]["cena"]=None
        with self.assertRaises(ValueError):validate_menu(m,"10-1.json",{"receta-real"})
    def test_sin_postre_es_valido(self):
        validate_menu(fixture(),"10-1.json",{"receta-real"})
    def test_sin_ficha_real_rechazado(self):
        with self.assertRaises(ValueError):validate_menu(fixture(),"10-1.json",set())
    def test_no_dobla_elementos(self):
        m=fixture()
        g=m["dias"]["Lunes"]["comida"]["presentacion"]["grupos"]
        g[1]["elementos"].append(copy.deepcopy(g[0]["elementos"][0]))
        with self.assertRaises(ValueError):validate_menu(m,"10-1.json",{"receta-real"})
    def test_mismatch_macros(self):
        m=fixture()
        m["dias"]["Lunes"]["nutricion"]["kcal"]+=1
        with self.assertRaises(ValueError):validate_menu(m,"10-1.json",{"receta-real"})

if __name__=="__main__":unittest.main()
