import json
import unittest
from fractions import Fraction
from html.parser import HTMLParser
from generar import build


class RecipeParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ingredients, self.schemas = [], []
        self.kind = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'li' and attrs.get('itemprop') == 'recipeIngredient':
            self.kind = 'ingredient'
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.kind = 'schema'

    def handle_data(self, text):
        if self.kind == 'ingredient':
            self.ingredients.append(text)
        elif self.kind == 'schema':
            self.schemas.append(json.loads(text))

    def handle_endtag(self, tag):
        if tag in ('li', 'script'):
            self.kind = None


class MenuTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.output = build()
        cls.audit = json.loads(cls.output['calculo.json'])
        cls.parser = RecipeParser()
        cls.parser.feed(cls.output['index.html'])

    def quantity(self, name, unit):
        rows = [x for x in self.audit['ingredientes'] if x['nombre'] == name and x['unidad'] == unit]
        self.assertEqual(len(rows), 1)
        return Fraction(rows[0]['cantidad_exacta'])

    def test_repeat_dishes_and_nested_carrilleras(self):
        self.assertEqual(self.quantity('Bacalao', 'g'), 400)
        self.assertEqual(self.quantity('Carrilleras de cerdo', 'g'), 400)
        self.assertEqual(self.quantity('Patata, cruda (parte comestible)', 'g'), 400)

    def test_two_quiche_servings_and_fractional_bases(self):
        self.assertEqual(self.quantity('Huevos M', 'unidades'), 2)
        self.assertEqual(self.quantity('Leche semidesnatada', 'ml'), Fraction(500, 6))
        self.assertEqual(self.quantity('Yogur griego natural', 'unidad (125 g)'), Fraction(3, 2))
        self.assertEqual(self.quantity('Ajo', 'dientes'), Fraction(41, 6))

    def test_incompatible_units_and_unknown_amounts(self):
        self.assertEqual(self.quantity('AOVE', 'g'), Fraction(25, 2))
        self.assertEqual(self.quantity('AOVE', 'ml'), 55)
        salts = [x for x in self.audit['ingredientes'] if x['nombre'] == 'Sal']
        self.assertTrue(any(x['cantidad'] is None for x in salts))
        self.assertEqual(self.quantity('Sal', 'g'), Fraction(7, 6))

    def test_one_recipe_and_matching_visible_ingredients(self):
        self.assertEqual(len(self.parser.schemas), 1)
        schema = self.parser.schemas[0]
        self.assertEqual(schema['recipeYield'], '1')
        self.assertEqual(schema['name'], 'Menú 1 - Octubre')
        self.assertEqual(schema['recipeIngredient'], self.parser.ingredients)
        for name in ('Salsa vizcaína', 'Carrilleras de cerdo al vino', 'Bechamel', 'Hummus', 'Pisto', 'Falafel', 'Tzatziki'):
            self.assertFalse(any(name in line for line in schema['recipeIngredient']), name)
        self.assertIn('noindex, nofollow', self.output['index.html'])
        self.assertNotIn('pwa.js', self.output['index.html'])
        self.assertNotIn('serviceWorker', self.output['index.html'])

    def test_weekly_menu_not_batch_gallery_and_idempotence(self):
        self.assertEqual(len(self.audit['dias']), 5)
        self.assertFalse(any('Café' in x['nombre'] for x in self.audit['ingredientes']))
        self.assertEqual(build(), self.output)
        for ingredient in self.audit['ingredientes']:
            if ingredient['cantidad_exacta'] is not None:
                self.assertEqual(Fraction(ingredient['cantidad_exacta']), sum(
                    (Fraction(part['cantidad_exacta']) for part in ingredient['aportes']), Fraction(0)))

    def test_native_description_stock_and_control_quantities(self):
        native = json.loads(self.output['bring-v2.json'])
        self.assertEqual(native['yield'], '1')
        self.assertEqual(native['tagline'], self.parser.schemas[0]['description'])
        self.assertNotIn('\n', native['tagline'])
        self.assertEqual(len(native['items']), len(self.audit['ingredientes']))
        for item, source in zip(native['items'], self.audit['ingredientes']):
            self.assertEqual(item['itemId'], source['nombre'])
            self.assertIsInstance(item['stock'], bool)
            if source['cantidad'] is not None:
                self.assertEqual(item['spec'], source['cantidad'] + ' ' + source['unidad'])
            else:
                self.assertNotIn('spec', item)
        self.assertTrue(all(i['stock'] for i in native['items'] if i['itemId'] == 'Sal'))
        self.assertTrue(all(i['stock'] for i in native['items'] if i['itemId'] == 'Pimienta negra'))
        self.assertFalse(any(i['stock'] for i in native['items'] if i['itemId'] in ('Bacalao', 'Carrilleras de cerdo', 'Yogur griego natural')))
        self.assertIn('bring-v2.json', self.output['index.html'])
        self.assertIn('itemprop="tagline"', self.output['index.html'])
        self.assertEqual(native['linkOutUrl'], self.parser.schemas[0]['url'])


if __name__ == '__main__':
    unittest.main()
