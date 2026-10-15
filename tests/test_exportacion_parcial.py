import unittest
from scripts.exportar_airtable import weekly_macros, DAYS, KEY_MACROS


class WeeklyExportTests(unittest.TestCase):
    def test_partial_menu_with_blank_weekly_formulas(self):
        days = {d: {'nutricion': dict(zip(KEY_MACROS, (47.50698, 3.332, 4.738, 1.654)))} for d in DAYS}
        days['Lunes']['nutricion']['kcal'] += 654.6481842571701
        result = weekly_macros({}, days, False, 'parcial')
        self.assertAlmostEqual(result['kcal'], 892.1830842571701)
        self.assertAlmostEqual(result['proteinas_g'], 16.66)

    def test_complete_menu_preserves_official_values(self):
        official = dict(zip(('Menú · Kcal', 'Menú · Proteínas', 'Menú · Hidratos', 'Menú · Grasas'), (1000, 80, 100, 40)))
        self.assertEqual(weekly_macros(official, {}, True, 'completo'), dict(zip(KEY_MACROS, (1000, 80, 100, 40))))
        with self.assertRaises(ValueError):
            weekly_macros({}, {}, True, 'completo')
