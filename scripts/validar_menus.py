"""Validación de menús v2 para publicación estática."""
import math

DAYS = ("Lunes", "Martes", "Miércoles", "Jueves", "Viernes")
MACROS = ("kcal", "proteinas_g", "hidratos_g", "grasas_g")
MONTHS = (1, 2, 3, 4, 5, 6, 9, 10, 11, 12)

def ensure(condition, message):
    if not condition:
        raise ValueError(message)

def check_macros(n, where):
    ensure(isinstance(n, dict), where + ": nutrición ausente")
    for key in MACROS:
        value = n.get(key)
        ensure(type(value) in (float, int) and math.isfinite(value) and value >= 0, where + ": macro inválido " + key)

def check_element(e, slugs):
    ensure(isinstance(e, dict), "elemento inválido")
    ensure(bool(e.get("id")) and bool(e.get("nombre")) and bool(e.get("referencia_id")), "elemento sin identidad")
    ensure(e.get("tipo") in ("ingrediente", "preparacion"), "tipo de elemento inválido")
    ensure(type(e.get("cantidad")) in (int, float) and e["cantidad"] > 0 and bool(e.get("unidad")), "cantidad inválida")
    if e["tipo"] == "preparacion":
        ensure(not e.get("slug") or e.get("slug") in slugs, "enlace a preparación inexistente")
    else:
        ensure(not e.get("slug"), "ingrediente con enlace de preparación")

def check_meal(m, slugs):
    ensure(isinstance(m, dict) and bool(m.get("comida_id")) and bool(m.get("nombre")), "COMIDA inválida")
    ensure(m.get("estado") == "Calculado", "COMIDA sin calcular")
    check_macros(m.get("nutricion"), "COMIDA")
    p = m.get("presentacion")
    ensure(isinstance(p, dict), "presentación ausente")
    ensure(isinstance(p.get("grupos"), list) and isinstance(p.get("elementos_sin_grupo"), list), "presentación inválida")
    ids = set()
    for g in p["grupos"]:
        ensure(isinstance(g, dict) and bool(g.get("id")) and bool(g.get("nombre")) and bool(g.get("elementos")), "grupo inválido")
        for e in g["elementos"]:
            check_element(e, slugs)
            ensure(e["id"] not in ids, "elemento duplicado")
            ids.add(e["id"])
    for e in p["elementos_sin_grupo"]:
        check_element(e, slugs)
        ensure(e["id"] not in ids, "elemento duplicado")
        ids.add(e["id"])
    ensure(bool(ids), "COMIDA sin componentes")

def check_simple(x):
    ensure(isinstance(x, dict) and x.get("tipo") == "ingrediente" and bool(x.get("nombre")), "ingesta simple inválida")
    ensure(type(x.get("cantidad")) in (int, float) and math.isfinite(x["cantidad"]) and x["cantidad"] > 0 and x.get("unidad") in ("g", "ml"), "ingesta sin cantidad")
    check_macros(x.get("nutricion"), "ingesta")

def check_dessert(x, slugs):
    ensure(isinstance(x, dict), "postre inválido")
    ensure(x.get("estado", "Calculado") == "Calculado", "postre sin calcular")
    if x.get("tipo") == "ingrediente":
        check_simple(x)
        ensure(not x.get("slug") and "raciones" not in x, "postre ingrediente con campos de preparación")
    else:
        ensure(x.get("tipo") == "preparacion" and bool(x.get("nombre")) and bool(x.get("referencia_id")), "postre preparación sin identidad")
        r = x.get("raciones")
        ensure(type(r) in (int, float) and math.isfinite(r) and r > 0, "raciones de postre inválidas")
        ensure("cantidad" not in x and "unidad" not in x, "postre preparación con campos de ingrediente")
        ensure(not x.get("slug") or x["slug"] in slugs, "postre con receta inexistente")
        check_macros(x.get("nutricion"), "postre")

def validate_menu(m, filename, slugs):
    ensure(isinstance(m, dict) and m.get("schema_version") == 2, "schema_version inválida")
    month, number = m.get("mes"), m.get("menu")
    ensure(type(month) is int and month in MONTHS and type(number) is int and 1 <= number <= 4, "mes/menú inválidos")
    ensure(filename == f"{month:02d}-{number}.json", "archivo no corresponde al menú")
    ensure(bool(m.get("airtable_menu_id")) and m.get("estado") in ("Calculado", "Pendiente"), "menú sin ID o estado válido")
    days = m.get("dias")
    ensure(isinstance(days, dict) and set(days) == set(DAYS), "días incorrectos")
    for day in DAYS:
        d = days[day]
        check_simple(d.get("desayuno"))
        for kind in ("comida", "cena"):
            entry = d.get(kind)
            if day == "Viernes" and kind == "cena":
                ensure(entry == {"estado": "libre"}, "viernes debe tener cena libre")
            elif entry == {"estado": "pendiente"}:
                ensure(m["estado"] == "Pendiente", "Menú calculado con ingestas pendientes")
            else:
                check_meal(entry, slugs)
        if d.get("postre") is not None:
            check_dessert(d["postre"], slugs)
        check_macros(d.get("nutricion"), day)
        ingestas = [d["desayuno"]]
        for kind in ("comida", "cena"):
            if d[kind].get("estado") == "Calculado":
                ingestas.append(d[kind])
        if d.get("postre") is not None:
            ingestas.append(d["postre"])
        for key in MACROS:
            total = sum(x["nutricion"][key] for x in ingestas)
            ensure(abs(total - d["nutricion"][key]) <= .11, day + ": descuadre " + key)
    check_macros(m.get("nutricion_semana"), "semana")
    for key in MACROS:
        total = sum(days[day]["nutricion"][key] for day in DAYS)
        ensure(abs(total - m["nutricion_semana"][key]) <= .55, "descuadre semanal " + key)
    return m
