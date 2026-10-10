"""Agrupación editorial de COMIDA_ELEMENTOS; nunca modifica nutrición oficial."""
from copy import deepcopy
from math import isfinite

TABLE_ID = "tblmIe4WuNWF6aRLE"
FIELDS = {
    "grupo": "fldw2WYRbyzv9qZmQ",
    "nombre": "fldcYMsUDmXNRnJfI",
    "orden_grupo": "fldXXebPlYFQh33co",
    "orden_elemento": "fldJdc8nbkoesAe6k",
}
NAMES = {
    "grupo": "Visual · Grupo ID",
    "nombre": "Visual · Nombre grupo",
    "orden_grupo": "Visual · Orden grupo",
    "orden_elemento": "Visual · Orden elemento",
}


class ErrorAgrupacion(ValueError):
    pass


def _field(record, name):
    fields = record.get("fields", record)
    # Soporta API Airtable configurada para devolver nombres o IDs.
    return fields.get(FIELDS[name], fields.get(NAMES[name]))


def _order(value, *, identifier):
    if value is None or value == "":
        return None
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not isfinite(value) or int(value) != value:
        raise ErrorAgrupacion(f"{identifier}: orden no entero")
    return int(value)


def agrupar_comida(comida_id, elementos):
    """Devuelve grupos y componentes individuales, sin sumar ni alterar macros.

    Entrada: registros originales de COMIDA_ELEMENTOS, vinculados a UNA COMIDA.
    Cada registro necesita id y un único vínculo de ingrediente o preparación,
    que debe validar la capa de exportación contra Airtable.
    """
    if not isinstance(comida_id, str) or not comida_id.strip():
        raise ErrorAgrupacion("Falta ID de COMIDA")
    if not isinstance(elementos, list):
        raise ErrorAgrupacion("Elementos no es una lista")
    seen = set()
    grouped = {}
    independent = []
    for index, original in enumerate(elementos):
        element = deepcopy(original)
        eid = element.get("id")
        if not isinstance(eid, str) or not eid.strip() or eid in seen:
            raise ErrorAgrupacion(f"{comida_id}: ID ausente o duplicado: {eid}")
        seen.add(eid)
        group_id = _field(element, "grupo")
        group_name = _field(element, "nombre")
        group_order = _order(_field(element, "orden_grupo"), identifier=eid)
        item_order = _order(_field(element, "orden_elemento"), identifier=eid)
        # Metadatos se retiran solo del objeto de presentación, no del registro de origen.
        if "fields" in element:
            clean = {k: deepcopy(v) for k, v in element.items() if k != "fields"}
            clean.update({k: deepcopy(v) for k, v in element["fields"].items()
                          if k not in set(FIELDS.values()) | set(NAMES.values())})
        else:
            clean = {k: v for k, v in element.items()
                     if k not in set(FIELDS.values()) | set(NAMES.values())}
        clean.pop("createdTime", None)
        if not group_id:
            independent.append((item_order if item_order is not None else float("inf"), index, clean))
            continue
        if not isinstance(group_id, str):
            raise ErrorAgrupacion(f"{eid}: identificador de grupo inválido")
        name = group_name.strip() if isinstance(group_name, str) else ""
        obj = grouped.setdefault(group_id, {"id": group_id, "nombre": name,
                                             "orden": group_order, "elementos": [],
                                             "_index": index})
        if name and obj["nombre"] and name != obj["nombre"]:
            raise ErrorAgrupacion(f"{comida_id}: grupo {group_id} tiene nombres distintos")
        if name and not obj["nombre"]:
            obj["nombre"] = name
        if group_order is not None and obj["orden"] is not None and group_order != obj["orden"]:
            raise ErrorAgrupacion(f"{comida_id}: grupo {group_id} tiene órdenes diferentes")
        if obj["orden"] is None:
            obj["orden"] = group_order
        obj["elementos"].append((item_order if item_order is not None else float("inf"), index, clean))
    groups = []
    for obj in grouped.values():
        obj["elementos"] = [x[2] for x in sorted(obj["elementos"], key=lambda x: (x[0], x[1], x[2]["id"]))]
        if not obj["nombre"]:
            # Etiqueta neutral, sin deducir técnica culinaria ni inventar receta.
            obj["nombre"] = obj["elementos"][0].get("nombre") or "Componente"
        groups.append(obj)
    groups.sort(key=lambda x: (x["orden"] if x["orden"] is not None else float("inf"), x["_index"], x["id"]))
    for obj in groups:
        obj.pop("_index")
    return {"grupos": groups, "elementos_sin_grupo": [x[2] for x in sorted(independent)]}
