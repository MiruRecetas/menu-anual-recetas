"""Pruebas de actualización automática e idempotencia del catálogo público."""
import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from indice_publico import BEGIN, END, render_index, update_readme


class PublicRecipeIndexTests(unittest.TestCase):
    def setUp(self):
        self.recipe = {
            "slug": "sopa-de-tomate",
            "nombre": "Sopa de tomate",
            "categoria": "sopas-cremas-pures",
            "raciones": 2,
            "descripcion": "Sopa casera de tomate.",
            "ingredientes": [
                {"nombre": "Tomate", "cantidad": 500, "unidad": "g"},
                {"nombre": "Aceite de oliva", "cantidad": 10, "unidad": "ml"}
            ],
            "etiquetas": ["tupper"],
            "pasos": ["Lavar los tomates.", "Triturar y cocinar hasta espesar."]
        }

    def test_complete_and_readable(self):
        data = [copy.deepcopy(self.recipe)]
        text = render_index(data)
        self.assertIn("Total de recetas publicadas: 1", text)
        self.assertIn("sopa-de-tomate", text)
        self.assertIn("sopas-cremas-pures", text)
        self.assertIn("Sopa casera de tomate.", text)
        self.assertIn("Tomate (500 g)", text)
        self.assertIn("Lavar los tomates. Triturar y cocinar", text)
        self.assertIn("/recetas/sopa-de-tomate/", text)
        self.assertIn("/blob/main/datos/recetas/sopa-de-tomate.json", text)
        self.assertEqual(data, [self.recipe], "Generar índice no debe alterar los originales")

    def test_idempotent_and_no_stale_recipes(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "README.md"
            path.write_text("# Proyecto\n\n## Qué ofrece la web\n\nContenido original.\n", encoding="utf-8")
            self.assertTrue(update_readme(path, [self.recipe]))
            original = path.read_text(encoding="utf-8")
            self.assertEqual(original.count(BEGIN), 1)
            self.assertEqual(original.count(END), 1)
            self.assertFalse(update_readme(path, [self.recipe]))
            self.assertEqual(original, path.read_text(encoding="utf-8"))
            self.assertTrue(update_readme(path, []))
            new = path.read_text(encoding="utf-8")
            self.assertIn("Total de recetas publicadas: 0", new)
            self.assertNotIn("sopa-de-tomate", new)
            self.assertIn("Contenido original.", new)

    def test_real_inventory(self):
        source = sorted((ROOT / "datos" / "recetas").glob("*.json"))
        records = [json.loads(p.read_text(encoding="utf-8")) for p in source]
        catalog = render_index(records)
        self.assertIn(f"Total de recetas publicadas: {len(source)}", catalog)
        for item in records:
            self.assertIn("/recetas/" + item["slug"] + "/", catalog)
            self.assertIn("/blob/main/datos/recetas/" + item["slug"] + ".json", catalog)


if __name__ == "__main__":
    unittest.main()
