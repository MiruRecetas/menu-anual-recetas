"""Behavioral controls for the public projection; no economic engine dependency."""
import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
from coste_receta import PublicCosts, fingerprint, culinary


class PublicCostsTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.recipes = self.root / "recetas"
        self.recipes.mkdir()
        self.recipe = {
            "slug": "plato", "nombre": "Plato", "raciones": 2,
            "ingredientes": [{"nombre": "Arroz", "cantidad": 100, "unidad": "g"}],
            "pasos": ["Cocer el arroz."],
        }
        self.data = {"schema": "mirurecetas.public-recipe-costs/1", "recipes": {
            "plato": {"web_name": "Plato", "base_portions": "2",
                      "culinary_sha256": fingerprint(culinary(self.recipe)), "cents": "536"}
        }}
        self.path = self.root / "costes.json"
        self.write()

    def write(self):
        self.path.write_text(json.dumps(self.data))
        (self.recipes / "plato.json").write_text(json.dumps(self.recipe))

    def costs(self):
        return PublicCosts(self.path, self.recipes)

    def test_static_render_and_reference_portion(self):
        badge = self.costs().render(self.recipe)
        self.assertIn("≈ 5,36 €/ración", badge)
        self.assertIn('data-lucide="hand-coins"', badge)
        self.assertNotIn("Offer", badge)

    def test_changed_identity_blocks_build(self):
        for field, value in [("raciones", 3), ("nombre", "Otro"), ("pasos", ["Freír."])]:
            with self.subTest(field=field):
                old = copy.deepcopy(self.recipe)
                self.recipe[field] = value
                self.write()
                with self.assertRaises(ValueError):
                    self.costs()
                self.recipe = old

    def test_invalid_cents_and_private_fields_rejected(self):
        row = self.data["recipes"]["plato"]
        for value in ["-1", "5.36", 536, True]:
            row["cents"] = value
            self.write()
            with self.assertRaises(ValueError):
                self.costs()
        row["cents"] = "536"
        row["preparation_id"] = "private-id"
        self.write()
        with self.assertRaises(ValueError):
            self.costs()

    def test_missing_projection_blocks_build(self):
        self.path.unlink()
        with self.assertRaises(OSError):
            self.costs()

    def test_photo_does_not_invalidate_economics(self):
        self.recipe["imagen"] = "plato.webp"
        self.write()
        self.assertIn("5,36", self.costs().render(self.recipe))

    def test_new_unmapped_recipe_has_no_invented_price(self):
        other = {**self.recipe, "slug": "nuevo"}
        self.assertEqual(self.costs().render(other), "")

    def test_zero_and_large_costs(self):
        for value, label in [("0", "0,00"), ("999999", "9.999,99")]:
            self.data["recipes"]["plato"]["cents"] = value
            self.write()
            self.assertIn(label, self.costs().render(self.recipe))
