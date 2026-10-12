"""Desglose de presentación a partir de aportaciones oficiales, sin alterar menús."""
from copy import deepcopy
from unicodedata import normalize, combining
if __package__:
    from .validar_menus import MACROS, check_macros
else:
    from validar_menus import MACROS, check_macros


def enrich_day(day, snapshot, recipes=()):
    result = deepcopy(day)
    def recipe_name(name):
        return ' '.join(''.join(c for c in normalize('NFD', name) if not combining(c)).casefold().split())
    published = {}
    for recipe in recipes:
        published.setdefault(recipe_name(recipe['nombre']), set()).add(recipe['slug'])
    for kind in ('comida', 'cena'):
        meal = result.get(kind, {})
        presentation = meal.get('presentacion')
        if not presentation:
            continue
        elements = presentation['elementos_sin_grupo'] + [
            e for g in presentation['grupos'] for e in g['elementos']]
        for e in elements:
            # Enlace de presentación: únicamente preparación y coincidencia exacta única.
            matches = published.get(recipe_name(e.get('nombre', '')), set())
            if e['tipo'] == 'preparacion' and not e.get('slug') and len(matches) == 1:
                e['slug'] = next(iter(matches))
            record = snapshot.get(e['id'], {})
            signature = {'comida_id': meal['comida_id'], **{
                k: e[k] for k in ('referencia_id', 'tipo', 'cantidad', 'unidad')}}
            if not e.get('nutricion') and all(record.get(k) == v for k, v in signature.items()):
                e['nutricion'] = deepcopy(record.get('nutricion'))
        valid = True
        try:
            for e in elements:
                check_macros(e.get('nutricion'), e['id'])
            valid = all(abs(sum(e['nutricion'][k] for e in elements) - meal['nutricion'][k]) <= .11
                        for k in MACROS)
        except ValueError:
            valid = False
        # No mezclar un desglose antiguo/parcial con los valores oficiales de una comida nueva.
        if not valid:
            for e in elements:
                e.pop('nutricion', None)
        for group in presentation['grupos']:
            group.pop('nutricion', None)
            if valid:
                group['nutricion'] = {k: sum(e['nutricion'][k] for e in group['elementos']) for k in MACROS}
    return result
