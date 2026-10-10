import copy
import unittest
from scripts.agrupar_componentes import agrupar_comida, ErrorAgrupacion, NAMES


def element(identifier, name, group=None, title=None, go=None, order=None):
    return {"id": identifier, "tipo": "ingrediente", "nombre": name, "cantidad": 5,
            "unidad": "g", "nutricion": {"kcal": 77, "proteinas_g": 2},
            "fields": {NAMES["grupo"]: group, NAMES["nombre"]: title,
                       NAMES["orden_grupo"]: go, NAMES["orden_elemento"]: order}}


class Agrupaciones(unittest.TestCase):
    def test_bacalao(self):
        original = [element("prep", "Bacalao", "principal", "Bacalao a la vizcaína", 1, 1),
                    element("oil", "AOVE", "acompanamiento-1", "Patatas panadera", 2, 2),
                    element("potato", "Patata", "acompanamiento-1", "Patatas panadera", 2, 1)]
        before = copy.deepcopy(original)
        output = agrupar_comida("rec6pQ1IKkMn3Eqyf", original)
        self.assertEqual([g["nombre"] for g in output["grupos"]], ["Bacalao a la vizcaína", "Patatas panadera"])
        self.assertEqual([e["id"] for e in output["grupos"][1]["elementos"]], ["potato", "oil"])
        self.assertEqual(original, before)

    def test_carrilleras(self):
        out = agrupar_comida("comida2", [element("meat", "Carrilleras", "plato-1", "Carrilleras al vino", 1),
                                        element("sweet", "Boniato", "guarnicion", "Boniato al horno", 2),
                                        element("oil", "AOVE", "guarnicion", "Boniato al horno", 2)])
        self.assertEqual(out["grupos"][1]["nombre"], "Boniato al horno")

    def test_unico_multiple_and_ungrouped(self):
        items = [element("a", "Salmón"), element("b", "Tomate", "side1", "Tomate", 2),
                 element("c", "Arroz", "side2", "Arroz", 3)]
        out = agrupar_comida("food", items)
        self.assertEqual(len(out["grupos"]), 2)
        self.assertEqual(len(out["elementos_sin_grupo"]), 1)

    def test_missing_name_neutral(self):
        self.assertEqual(agrupar_comida("x", [element("a", "Patata", "group")])["grupos"][0]["nombre"], "Patata")

    def test_conflicting_names(self):
        with self.assertRaises(ErrorAgrupacion):
            agrupar_comida("x", [element("a", "A", "g", "Uno"), element("b", "B", "g", "Otro")])

    def test_conflicting_order(self):
        with self.assertRaises(ErrorAgrupacion):
            agrupar_comida("x", [element("a", "A", "g", "Grupo", 1),
                                 element("b", "B", "g", "Grupo", 2)])

    def test_duplicate(self):
        with self.assertRaises(ErrorAgrupacion):
            agrupar_comida("x", [element("a", "A"), element("a", "A")])

    def test_same_group_id_different_foods(self):
        self.assertEqual(len(agrupar_comida("food1", [element("a", "A", "g", "Primero")])["grupos"]), 1)
        self.assertEqual(agrupar_comida("food2", [element("b", "B", "g", "Segundo")])["grupos"][0]["nombre"], "Segundo")

    def test_official_macros_unmodified(self):
        comida = {"kcal": 540.01, "proteinas_g": 53.41, "grasas_g": 16.02}
        copy_nut = comida.copy()
        agrupar_comida("x", [element("a", "A", "g", "Grupo")])
        self.assertEqual(comida, copy_nut)


if __name__ == "__main__":
    unittest.main()
