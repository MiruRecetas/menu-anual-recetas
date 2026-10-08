#!/usr/bin/env python3
"""Genera páginas estáticas de recetas desde datos/recetas/*.json, sin dependencias."""
import html
import json
import re
from pathlib import Path
from string import Template

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "datos" / "recetas"
PAGES = ROOT / "recetas"
IMAGES = ROOT / "imagenes"
SITE = "https://mirurecetas.github.io/menu-anual-recetas"
CSS = f"{SITE}/assets/estilo.css"
PAGE_TEMPLATE = (ROOT / "plantillas" / "receta.html").read_text(encoding="utf-8")
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}

def esc(value):
    return html.escape(str(value), quote=True)

def image_info(record):
    name = record.get("imagen")
    if not name:
        return None
    if Path(name).name != name or Path(name).suffix.lower() not in ALLOWED_IMAGE_EXTS:
        raise ValueError(f"Nombre de imagen no válido: {name}")
    file = IMAGES / name
    if not file.is_file():
        raise ValueError(f"Falta la imagen {file}")
    return f"{SITE}/imagenes/{name}"

def make_page(recipe):
    slug = recipe["slug"]
    if not SLUG_RE.fullmatch(slug):
        raise ValueError(f"Slug inválido: {slug}")
    title = recipe["nombre"].strip()
    servings = recipe["raciones"]
    if not isinstance(servings, int) or isinstance(servings, bool) or servings < 1:
        raise ValueError(f"Raciones no válidas para {slug}")
    ingredients = recipe["ingredientes"]
    steps = recipe["pasos"]
    if not title or not isinstance(ingredients, list) or not ingredients or not isinstance(steps, list) or not steps:
        raise ValueError(f"Faltan nombre, ingredientes o pasos para {slug}")
    if not all(isinstance(i, str) and i.strip() for i in ingredients + steps):
        raise ValueError(f"Ingredientes y pasos deben ser textos no vacíos: {slug}")
    image = image_info(recipe)
    page_url = f"{SITE}/recetas/{slug}/"
    yield_label = f"{servings} {'ración' if servings == 1 else 'raciones'}"
    description = recipe.get("descripcion", "").strip()
    recipe_json = {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": title,
        "author": {"@type": "Organization", "name": "MiruRecetas"},
        "mainEntityOfPage": page_url,
        "url": page_url,
        "recipeYield": str(servings),
        "recipeIngredient": ingredients,
        "recipeInstructions": [{"@type": "HowToStep", "text": step} for step in steps],
    }
    if description:
        recipe_json["description"] = description
    if image:
        recipe_json["image"] = image
    for key, schema_key in (("preparacion_min", "prepTime"), ("coccion_min", "cookTime")):
        value = recipe.get(key)
        if value is not None:
            if not isinstance(value, int) or isinstance(value, bool) or value < 0:
                raise ValueError(f"{key} debe ser un entero no negativo: {slug}")
            recipe_json[schema_key] = f"PT{value}M"
    if "preparacion_min" in recipe and "coccion_min" in recipe:
        recipe_json["totalTime"] = f"PT{recipe['preparacion_min'] + recipe['coccion_min']}M"

    social = (f'<meta property="og:image" content="{esc(image)}">\n'
              f'<meta name="twitter:card" content="summary_large_image">\n'
              f'<meta name="twitter:image" content="{esc(image)}">') if image else ""
    visible_image = (f'<img class="hero" itemprop="image" src="{esc(image)}" '
                     f'alt="{esc(title)}" loading="eager">') if image else ""
    times = "".join(
        f'<span class="pill">{esc(label)}: {value} min</span>'
        for key, label in (("preparacion_min", "Preparación"), ("coccion_min", "Cocción"))
        if (value := recipe.get(key)) is not None
    )
    note = recipe.get("notas", "").strip()
    replacements = {
        "PAGE_TITLE": esc(f"{title} · MiruRecetas"),
        "META_DESCRIPTION": esc(description or f"Ingredientes y elaboración de {title}."),
        "CANONICAL_URL": esc(page_url),
        "CSS_URL": esc(CSS),
        "HOME_URL": esc(SITE + "/"),
        "SOCIAL_IMAGE": social,
        "VISIBLE_IMAGE": visible_image,
        "JSON_LD": json.dumps(recipe_json, ensure_ascii=False).replace("<", "\\u003c"),
        "TITLE": esc(title),
        "DESCRIPTION": f'<p class="muted">{esc(description)}</p>' if description else "",
        "YIELD_LABEL": esc(yield_label),
        "TIME_PILLS": times,
        "INGREDIENT_ROWS": "".join(f'<li itemprop="recipeIngredient">{esc(i)}</li>' for i in ingredients),
        "STEP_ROWS": "".join(f'<li itemprop="recipeInstructions">{esc(s)}</li>' for s in steps),
        "NOTES": f'<aside class="note"><strong>Notas</strong><p>{esc(note)}</p></aside>' if note else "",
    }
    result = PAGE_TEMPLATE
    for key, value in replacements.items():
        result = result.replace("{{" + key + "}}", value)
    target = PAGES / slug / "index.html"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(result, encoding="utf-8")
    return (title, slug)

def main():
    DATA.mkdir(parents=True, exist_ok=True)
    entries = []
    for path in sorted(DATA.glob("*.json")):
        recipe = json.loads(path.read_text(encoding="utf-8"))
        if recipe["slug"] != path.stem:
            raise ValueError(f"El slug de {path.name} debe coincidir con el nombre del archivo")
        entries.append(make_page(recipe))
    cards = "".join(f'<a class="tile" href="recetas/{esc(slug)}/">{esc(title)} →</a>' for title, slug in sorted(entries))
    intro = f'<div class="tiles">{cards}</div>' if cards else '<p class="muted">El recetario está preparado. Las recetas se publicarán cuando estén revisadas.</p>'
    index = f"""<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MiruRecetas · Menú anual</title><meta name="description" content="Recetario del menú anual"><link rel="stylesheet" href="{CSS}"></head><body><div class="wrap"><header class="brand"><a href="./">MiruRecetas</a><span class="tag">Menú anual</span></header><div class="panel content"><span class="tag">Recetario personal</span><h1>Recetas para cada semana</h1><p class="muted">Recetas organizadas para consultar y compartir con Bring!.</p>{intro}</div><footer>MiruRecetas · Recetario personal</footer></div></body></html>"""
    (ROOT / "index.html").write_text(index, encoding="utf-8")
    print(f"Generadas {len(entries)} recetas y la portada.")

if __name__ == "__main__":
    main()
