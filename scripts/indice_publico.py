"""Índice público de solo lectura derivado de los JSON originales.

Se publica dentro de README.md para navegadores web; nunca edita datos fuente.
"""
from pathlib import Path

SITE = "https://mirurecetas.github.io/menu-anual-recetas"
REPO = "https://github.com/MiruRecetas/menu-anual-recetas"
BEGIN = "<!-- MIRURECETAS_INDICE_PUBLICO_INICIO: generado automáticamente -->"
END = "<!-- MIRURECETAS_INDICE_PUBLICO_FIN -->"
ANCHOR = "## Qué ofrece la web"


def markdown(value):
    raw = " ".join(str(value if value is not None else "").split())
    for source, target in (
        ("\\", "\\\\"), ("[", "\\["), ("]", "\\]"), ("*", "\\*"),
        ("<", "&lt;"), (">", "&gt;"), ("|", "\\|"), ("`", "\\`")
    ):
        raw = raw.replace(source, target)
    return raw


def ingredient_text(item):
    label = markdown(item["nombre"])
    qty = item.get("cantidad")
    if qty is not None:
        if type(qty) in (int, float):
            number = format(qty, "g")
        else:
            number = str(qty)
        label += " (" + markdown(number + " " + (item.get("unidad") or "").strip()) + ")"
    if item.get("preparacion"):
        label += " [preparación: " + markdown(item["preparacion"]) + "]"
    return label


def procedure_excerpt(recipe, limit=360):
    steps = recipe.get("pasos") or []
    text = " ".join(" ".join(str(step).split()) for step in steps[:2])
    if len(text) > limit:
        text = text[:limit - 1].rsplit(" ", 1)[0].rstrip() + "…"
    return markdown(text) if text else "Sin pasos publicados."


def render_index(recipes):
    recipes = sorted(recipes, key=lambda r: r["slug"])
    lines = [
        "## Índice público de recetas para consulta de solo lectura",
        "",
        "Este listado se genera **automáticamente desde `datos/recetas/*.json`**.",
        "Permite a herramientas de navegación leer todas las recetas sin explorar directorios,",
        "autenticarse ni solicitar permisos de edición. **No es una segunda fuente de datos**:",
        "las fichas JSON siguen siendo la fuente de verdad. No editar este bloque manualmente.",
        "",
        f"**Total de recetas publicadas: {len(recipes)}.**",
        "",
        "Cada entrada incluye nombre, slug, categoría, descripción, ingredientes registrados,",
        "inicio de elaboración y enlaces públicos. Las cantidades se refieren a las",
        "raciones base de cada receta; no son necesariamente una ración.",
        "",
    ]
    for r in recipes:
        slug = r["slug"]
        name = markdown(r["nombre"])
        category = markdown(r.get("categoria") or "sin categoría")
        description = markdown(r.get("descripcion") or "Sin descripción publicada.")
        ingredients = "; ".join(ingredient_text(x) for x in r.get("ingredientes", []))
        tags = ", ".join(markdown(tag) for tag in r.get("etiquetas", [])) or "sin etiquetas"
        lines.extend([
            f"### [{name}]({SITE}/recetas/{slug}/)",
            "",
            f"- **Slug:** `{slug}` · **Categoría:** `{category}` · **Raciones base:** {r['raciones']}.",
            f"- **Descripción:** {description}",
            f"- **Ingredientes registrados:** {ingredients or 'Sin ingredientes publicados.'}.",
            f"- **Etiquetas web:** {tags}.",
            f"- **Inicio de elaboración (extracto):** {procedure_excerpt(r)}",
            f"- **Origen JSON:** [datos/recetas/{slug}.json]({REPO}/blob/main/datos/recetas/{slug}.json).",
            "",
        ])
    return "\n".join(lines).rstrip()


def update_readme(readme_path, recipes):
    path = Path(readme_path)
    original = path.read_text(encoding="utf-8")
    block = BEGIN + "\n" + render_index(recipes) + "\n" + END
    if original.count(BEGIN) == 1 and original.count(END) == 1:
        before, rest = original.split(BEGIN, 1)
        _, after = rest.split(END, 1)
        updated = before + block + after
    elif BEGIN not in original and END not in original:
        if original.count(ANCHOR) != 1:
            raise ValueError("README: falta ancla única para índice público")
        updated = original.replace(ANCHOR, block + "\n\n" + ANCHOR, 1)
    else:
        raise ValueError("README: delimitadores del índice incompletos o duplicados")
    if updated != original:
        path.write_text(updated, encoding="utf-8")
    return updated != original


def source_commit(root):
    """Último commit que modificó datos/recetas, no el commit del JSON generado."""
    import subprocess
    sha = subprocess.check_output(
        ["git", "-C", str(root), "log", "-1", "--format=%H", "--", "datos/recetas"],
        text=True
    ).strip()
    if len(sha) != 40 or any(c not in "0123456789abcdef" for c in sha):
        raise ValueError("No se pudo identificar el SHA del origen; requiere historial Git completo")
    return sha


def json_payload(recipes, origin_sha, generated_utc):
    """Esquema v1; copia editorial de solo lectura y orden estable."""
    if len({r["slug"] for r in recipes}) != len(recipes):
        raise ValueError("Slugs duplicados en recetas fuente")
    rows = []
    for r in sorted(recipes, key=lambda item: item["slug"]):
        ing = [{"nombre": i["nombre"], "cantidad": i.get("cantidad"), "unidad": i.get("unidad", "")}
               for i in r["ingredientes"]]
        for obj, original in zip(ing, r["ingredientes"]):
            if original.get("preparacion"):
                obj["preparacion"] = original["preparacion"]
        rows.append({
            "nombre": r["nombre"],
            "slug": r["slug"],
            "categoria": r.get("categoria"),
            "descripcion": r.get("descripcion") or "",
            "raciones_base": r["raciones"],
            "ingredientes": ing,
            "url": SITE + "/recetas/" + r["slug"] + "/"
        })
    return {
        "schema_version": 1,
        "source_commit_sha": origin_sha,
        "generated_at_utc": generated_utc,
        "total_recetas": len(rows),
        "recetas": rows
    }


def update_json_index(path, recipes, origin_sha, now=None):
    """Mantiene fecha y bytes si contenido/SHA no cambian; evita ciclos."""
    import json
    from datetime import datetime, timezone
    path = Path(path)
    previous = None
    if path.is_file():
        try:
            previous = json.loads(path.read_text(encoding="utf-8"))
        except (ValueError, UnicodeError):
            pass
    stamp = (now or datetime.now(timezone.utc)).astimezone(timezone.utc).isoformat(
        timespec="seconds").replace("+00:00", "Z")
    fresh = json_payload(recipes, origin_sha, stamp)
    if previous is not None:
        prior_without_date = {key: value for key, value in previous.items() if key != "generated_at_utc"}
        fresh_without_date = {key: value for key, value in fresh.items() if key != "generated_at_utc"}
        if prior_without_date == fresh_without_date and isinstance(previous.get("generated_at_utc"), str):
            fresh["generated_at_utc"] = previous["generated_at_utc"]
    content = json.dumps(fresh, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
    if not path.exists() or path.read_text(encoding="utf-8") != content:
        path.write_text(content, encoding="utf-8")
        return True
    return False
