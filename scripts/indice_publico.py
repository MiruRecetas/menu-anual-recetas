"""Índice JSON público de solo lectura derivado de datos/recetas/*.json."""
from pathlib import Path

SITE = "https://mirurecetas.github.io/menu-anual-recetas"


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
