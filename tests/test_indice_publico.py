"""Pruebas de actualización automática e idempotencia del catálogo público."""
import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from indice_publico import json_payload, update_json_index, source_commit


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

    def test_readme_contains_only_index_link(self):
        text = (ROOT / "README.md").read_text(encoding="utf-8")
        self.assertIn("indice-recetas.json", text)
        self.assertNotIn("MIRURECETAS_INDICE_PUBLICO_INICIO", text)
        self.assertNotIn("MIRURECETAS_INDICE_PUBLICO_FIN", text)
        self.assertNotIn("## Índice público de recetas para consulta de solo lectura", text)

    def test_generator_does_not_write_readme(self):
        generator = (ROOT / "scripts" / "generar.py").read_text(encoding="utf-8")
        self.assertNotIn("update_readme(", generator)
        self.assertNotIn("render_index(", generator)

    def test_json_complete_and_changes(self):
        from datetime import datetime, timezone, timedelta
        sample = copy.deepcopy(self.recipe)
        sha1 = "a" * 40
        sha2 = "b" * 40
        date1 = datetime(2026, 10, 11, 8, tzinfo=timezone.utc)
        date2 = date1 + timedelta(hours=1)
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "indice-recetas.json"
            self.assertTrue(update_json_index(path, [sample], sha1, date1))
            first = json.loads(path.read_text(encoding="utf-8"))
            self.assertEqual(first["schema_version"], 1)
            self.assertEqual(first["source_commit_sha"], sha1)
            self.assertEqual(first["generated_at_utc"], "2026-10-11T08:00:00Z")
            self.assertEqual(first["total_recetas"], 1)
            self.assertEqual(first["recetas"][0]["ingredientes"][0]["cantidad"], 500)
            self.assertFalse(update_json_index(path, [sample], sha1, date2), "sin cambios no hay nueva fecha ni commit")
            sample["descripcion"] = "Nueva variante"
            self.assertTrue(update_json_index(path, [sample], sha2, date2))
            modified = json.loads(path.read_text(encoding="utf-8"))
            self.assertEqual(modified["recetas"][0]["descripcion"], "Nueva variante")
            self.assertEqual(modified["source_commit_sha"], sha2)
            self.assertEqual(modified["generated_at_utc"], "2026-10-11T09:00:00Z")
            self.assertTrue(update_json_index(path, [], sha2, date2))
            removed = json.loads(path.read_text(encoding="utf-8"))
            self.assertEqual(removed["total_recetas"], 0)
            self.assertEqual(removed["recetas"], [])
            self.assertTrue(update_json_index(path, [self.recipe], sha2, date2))
            self.assertEqual(json.loads(path.read_text(encoding="utf-8"))["total_recetas"], 1)

    def test_json_unique_and_sorted(self):
        a = copy.deepcopy(self.recipe)
        b = copy.deepcopy(self.recipe)
        b["slug"] = "arroz-vegetal"
        b["nombre"] = "Arroz vegetal"
        catalog = json_payload([a,b], "f"*40, "2026-10-11T08:00:00Z")
        self.assertEqual([r["slug"] for r in catalog["recetas"]], ["arroz-vegetal","sopa-de-tomate"])
        with self.assertRaisesRegex(ValueError, "duplicados"):
            json_payload([a,a], "f"*40, "2026-10-11T08:00:00Z")

    def test_source_sha_matches_git_data_history(self):
        import subprocess
        expected = subprocess.check_output(["git", "-C", str(ROOT), "log", "-1", "--format=%H", "--", "datos/recetas"], text=True).strip()
        self.assertEqual(source_commit(ROOT), expected)

    def test_real_inventory(self):
        source = sorted((ROOT / "datos" / "recetas").glob("*.json"))
        records = [json.loads(p.read_text(encoding="utf-8")) for p in source]
        raw = json_payload(records, source_commit(ROOT), "2026-10-11T08:00:00Z")
        self.assertEqual(raw["total_recetas"], len(source))
        self.assertEqual(len(raw["recetas"]), len(source))
        self.assertEqual({x["slug"] for x in raw["recetas"]}, {p.stem for p in source})
        self.assertEqual(raw["source_commit_sha"], source_commit(ROOT))
        for item in raw["recetas"]:
            self.assertIn("/recetas/" + item["slug"] + "/", item["url"])


if __name__ == "__main__":
    unittest.main()
