"""Exportación autenticada y estricta: Airtable -> JSON público v2.

Uso: AIRTABLE_TOKEN=... python scripts/exportar_airtable.py
El token solo se lee del entorno y jamás se imprime ni se guarda.
"""
import json
import math
import urllib.error
import os
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path
from agrupar_componentes import agrupar_comida
from validar_menus import validate_menu, DAYS, MACROS

ROOT = Path(__file__).resolve().parents[1]
BASE = "apprzwAwMVhkn3oHh"
TABLES = {"menus":"tblBdMnjwXtWMEdNk","comidas":"tblSv4yTF3731fclg",
          "elementos":"tblmIe4WuNWF6aRLE","ingredientes":"tblJ7cjOhGBHLMWxv",
          "preparaciones":"tbl82iVr3ysnzTUit"}
MONTHS = {"Enero":1,"Febrero":2,"Marzo":3,"Abril":4,"Mayo":5,"Junio":6,
          "Septiembre":9,"Octubre":10,"Noviembre":11,"Diciembre":12}
FIELD_MACROS = ("Kcal","Proteínas","Hidratos","Grasas")
KEY_MACROS = ("kcal","proteinas_g","hidratos_g","grasas_g")

def error(message):
    raise ValueError(message)

def value(v):
    if isinstance(v,list):
        if len(v)!=1:
            error("Se esperaba un único registro o valor numérico")
        return value(v[0])
    if isinstance(v,dict) and "name" in v:
        return v["name"]
    return v

def numeric(v,context):
    v=value(v)
    if type(v) not in (int,float) or not math.isfinite(v) or v<0:
        error("Valor numérico ausente o inválido en "+context)
    return v

def single_link(row,field,optional=False):
    links=row.get(field) or []
    if optional and not links:
        return None
    if len(links)!=1:
        error("Enlace ausente o múltiple en "+field)
    link=links[0]
    return link["id"] if isinstance(link,dict) else link

def retrieve(table,token):
    records=[]
    offset=None
    while True:
        args={"pageSize":100}
        if offset:args["offset"]=offset
        url="https://api.airtable.com/v0/"+BASE+"/"+TABLES[table]+"?"+urllib.parse.urlencode(args)
        req=urllib.request.Request(url,headers={"Authorization":"Bearer "+token})
        with urllib.request.urlopen(req,timeout=25) as response:
            data=json.load(response)
        records.extend(data.get("records",[]))
        offset=data.get("offset")
        if not offset:break
    return {r["id"]:r["fields"] for r in records}

def macros(row,names,context):
    return {key:numeric(row.get(field),context+" "+field) for key,field in zip(KEY_MACROS,names)}

def ingredient(ref,ingredients,quantity,unit,official):
    row=ingredients[ref]
    return {"tipo":"ingrediente","referencia_id":ref,"nombre":row["Nombre"],
            "cantidad":quantity,"unidad":unit,"nutricion":official}

def meal(ref,comidas,elementos,ingredientes,preps,slugs):
    row=comidas[ref]
    if row.get("Estado cálculo")!="Calculado":
        error("COMIDA no calculada: "+ref)
    children=[]
    for eid in row.get("COMIDA_ELEMENTOS",[]):
        eid=eid["id"] if isinstance(eid,dict) else eid
        r=elementos[eid]
        if single_link(r,"Comida")!=ref:
            error("Elemento no pertenece a la COMIDA: "+eid)
        ir=single_link(r,"Ingrediente",True)
        pr=single_link(r,"Preparación",True)
        if bool(ir)==bool(pr):
            error("Elemento sin vínculo único: "+eid)
        reference=pr or ir
        source=preps[reference] if pr else ingredientes[reference]
        unit=value(r.get("Unidad"))
        item={"id":eid,"tipo":"preparacion" if pr else "ingrediente",
              "referencia_id":reference,"nombre":source["Nombre"],
              "cantidad":numeric(r.get("Cantidad"),eid),"unidad":unit}
        if not isinstance(unit,str) or not unit:
            error("Unidad sin definir: "+eid)
        if pr:
            link=source.get("Enlace receta") or ""
            match=re.search(r"/recetas/([a-z0-9-]+)/?",link)
            if match and match.group(1) in slugs:
                item["slug"]=match.group(1)
        for field in ("Visual · Grupo ID","Visual · Nombre grupo",
                      "Visual · Orden grupo","Visual · Orden elemento"):
            if field in r:item[field]=r[field]
        children.append(item)
    return {"comida_id":ref,"nombre":row["Nombre"],"estado":"Calculado",
            "nutricion":macros(row,("Kcal","Proteínas (g)","Hidratos (g)","Grasas (g)"),ref),
            "presentacion":agrupar_comida(ref,children)}

def main():
    token=os.environ.get("AIRTABLE_TOKEN")
    if not token: error("Falta AIRTABLE_TOKEN en el entorno")
    tables={name:retrieve(name,token) for name in TABLES}
    existing={p.stem for p in (ROOT/"datos"/"recetas").glob("*.json")}
    menus=[]
    targets=set(os.environ.get("AIRTABLE_MENU_IDS","").split(",")) - {""}
    for mid,m in tables["menus"].items():
        if targets and mid not in targets:
            continue
        if m.get("Estado menú")!="Calculado":
            continue
        month=MONTHS.get(value(m.get("Mes")))
        number=m.get("Número")
        if month is None or type(number)!=int or number not in (1,2,3,4):
            error("Menú con mes/número inválido: "+mid)
        days={}
        for day in DAYS:
            br=single_link(m,day+" · Desayuno")
            breakfast_nut=macros(m,tuple("TEC "+day+" Desayuno "+k for k in FIELD_MACROS),day)
            # Rollups TEC Desayuno son valores por 100 ml; el día registra 130 ml.
            breakfast_quantity=130
            breakfast_nut={k: v*breakfast_quantity/100 for k,v in breakfast_nut.items()}
            breakfast=ingredient(br,tables["ingredientes"],breakfast_quantity,"ml",breakfast_nut)
            lunch=meal(single_link(m,day+" · Comida"),tables["comidas"],tables["elementos"],tables["ingredientes"],tables["preparaciones"],existing)
            dinner=({"estado":"libre"} if day=="Viernes" else
                    meal(single_link(m,day+" · Cena"),tables["comidas"],tables["elementos"],tables["ingredientes"],tables["preparaciones"],existing))
            postref=single_link(m,day+" · Postre",True)
            post=None
            if postref:
                quantity=numeric(m.get(day+" · Postre cantidad"),day)
                unit=value(m.get(day+" · Postre unidad"))
                if not isinstance(unit,str) or not unit:error("Unidad de postre inválida: "+day)
                post=ingredient(postref,tables["ingredientes"],quantity,unit,
                                macros(m,tuple("TEC "+day+" Postre "+k for k in FIELD_MACROS),day))
            days[day]={"desayuno":breakfast,"comida":lunch,"cena":dinner,"postre":post,
                       "nutricion":macros(m,tuple(day+" · "+k+" totales" for k in FIELD_MACROS),day)}
        week={"schema_version":2,"mes":month,"menu":number,"airtable_menu_id":mid,
              "estado":"Calculado","dias":days,
              "nutricion_semana":macros(m,("Menú · Kcal","Menú · Proteínas","Menú · Hidratos","Menú · Grasas"),mid)}
        filename=f"{month:02d}-{number}.json"
        validate_menu(week,filename,existing)
        menus.append((filename,week))
    if targets and targets != {m["airtable_menu_id"] for _,m in menus}:
        error("No se pudo validar el conjunto solicitado de menús")
    if not menus:error("No hay menús completos calculados")
    # Ningún fichero se escribe antes de validar todos los menús seleccionados.
    for filename,week in menus:
        target=ROOT/"datos"/"menus"/filename
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_text(json.dumps(week,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("Menús validados y exportados:",len(menus))

if __name__=="__main__":
    try:main()
    except (ValueError,KeyError,urllib.error.URLError) as ex:
        print("Exportación cancelada:",str(ex),file=sys.stderr)
        sys.exit(1)
