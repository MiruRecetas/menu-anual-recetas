#!/usr/bin/env python3
import json,html,re
from pathlib import Path
R=Path(__file__).resolve().parents[1]
SITE="https://mirurecetas.github.io/menu-anual-recetas"
DAYS=["Lunes","Martes","Miércoles","Jueves","Viernes"]
T=(R/"plantillas/receta.html").read_text(encoding="utf-8")
def e(x):return html.escape(str(x),quote=True)
def slug(s):return isinstance(s,str) and bool(re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*",s))
def image(r):
    name=r.get("imagen")
    if not name:return None
    if not isinstance(name,str) or Path(name).name!=name or Path(name).suffix.lower() not in (".png",".jpg",".jpeg",".webp") or not (R/"imagenes"/name).is_file():raise ValueError("Imagen inválida "+str(name))
    return SITE+"/imagenes/"+name
def entries(r):
    values=r["ingredientes"]
    if not isinstance(values,list) or not values:raise ValueError("Ingredientes necesarios")
    for v in values:
        if not isinstance(v,dict) or not isinstance(v.get("nombre"),str) or not v["nombre"].strip() or not isinstance(v.get("unidad"),str) or (v["cantidad"] is not None and not v["unidad"].strip()) or isinstance(v.get("cantidad"),bool) or (v.get("cantidad") is not None and (not isinstance(v["cantidad"],(int,float)) or v["cantidad"]<=0)) or (v.get("preparacion") and not slug(v["preparacion"])):raise ValueError("Ingrediente inválido: "+str(v))
    return values
def make(r):
    s=r["slug"]; n=r["nombre"]; servings=r["raciones"];steps=r["pasos"]
    if not slug(s) or not isinstance(n,str) or not n.strip() or isinstance(servings,bool) or not isinstance(servings,int) or servings<1 or not isinstance(steps,list) or not steps or any(not isinstance(t,str) or not t.strip() for t in steps):raise ValueError("Receta incorrecta")
    ing=entries(r); img=image(r);url=SITE+"/recetas/"+s+"/"
    desc=str(r.get("descripcion") or "").strip()
    structured={"@context":"https://schema.org","@type":"Recipe","name":n,"url":url,"author":{"@type":"Organization","name":"MiruRecetas"},"recipeYield":str(servings),"recipeIngredient":[(str(v["cantidad"])+" "+v["unidad"]+" de "+v["nombre"]) if v["cantidad"] is not None else (v["nombre"]) for v in ing],"recipeInstructions":[{"@type":"HowToStep","text":step} for step in steps]}
    if img:structured["image"]=img
    if desc:structured["description"]=desc
    for key,out in [("preparacion_min","prepTime"),("coccion_min","cookTime")]:
        if key in r:
            if isinstance(r[key],bool) or not isinstance(r[key],int) or r[key]<0:raise ValueError("Tiempo inválido")
            structured[out]="PT"+str(r[key])+"M"
    nut=r.get("nutricion")
    nut_html='<p class="muted small">Datos nutricionales pendientes de revisión.</p>'
    if nut is not None:
        keys=["kcal","proteinas_g","hidratos_g","grasas_g"]
        if any(isinstance(nut.get(k),bool) or not isinstance(nut.get(k),(int,float)) or nut[k]<0 for k in keys):raise ValueError("Nutrición incompleta")
        p,c,f=nut["proteinas_g"],nut["hidratos_g"],nut["grasas_g"]
        total=p*4+c*4+f*9;pc=100*p*4/total if total else 0;cc=100*c*4/total if total else 0
        ring="conic-gradient(#748d76 0 "+str(pc)+"%, #d0a36e "+str(pc)+"% "+str(pc+cc)+"%, #b86f54 "+str(pc+cc)+"% 100%)" if total else "#d3d9d0"
        nut_html='<section aria-label="Nutrición por ración"><div class="nutrition"><div class="ring" style="background:'+ring+'"><div class="ring-center"><strong>'+e(nut["kcal"])+'</strong><span>kcal/ración</span></div></div><div class="macros">'
        for name,key,cls in [("Proteínas","proteinas_g","p"),("Hidratos","hidratos_g","c"),("Grasas","grasas_g","f")]:
            nut_html+='<div class="macro"><span><span class="dot '+cls+'"></span>'+name+'</span><strong>'+e(nut[key])+' g</strong></div>'
        nut_html+='</div></div></section>'
        structured["nutrition"]={"@type":"NutritionInformation","calories":str(nut["kcal"])+" calories","proteinContent":str(p)+" g","carbohydrateContent":str(c)+" g","fatContent":str(f)+" g"}
    # Catálogo cerrado, compartido con Airtable.
    categories={
        "guisos-legumbres":("Guisos y estofados","cooking-pot"),
        "arroces-pastas":("Arroces y pastas","wheat"),
        "asados-horno":("Asados y horno","ham"),
        "ensaladas-frios":("Ensaladas y platos fríos","salad"),
        "sopas-cremas-pures":("Sopas, cremas y purés","soup"),
        "huevos-tortillas":("Huevos y tortillas","egg-fried"),
        "tostas-bocadillos-wraps":("Tostas, bocadillos y wraps","sandwich"),
        "postres":("Postres","cupcake"),
        "aperitivos-guarniciones":("Aperitivos, bocados y guarniciones","hand-platter"),
        "salsas-aderezos":("Salsas y aderezos","paint-bucket")}
    tags_catalog={
        "congelable":("Congelable","snowflake","practical"),
        "microondas":("Apto para microondas","waves-vertical","practical"),
        "tupper":("Apto para tupper","paper-bag","practical"),
        "batchcooking":("Batchcooking","calendar-check","practical"),
        "rapida":("Preparación rápida","zap","practical"),
        "consumo-frio":("Se puede comer frío","snowflake-off","practical"),
        "carne":("Carne","beef","main"),
        "huevos":("Huevos","egg","main"),
        "pescado":("Pescado","fish","main"),
        "marisco":("Marisco","shrimp","main"),
        "verduras":("Verduras","carrot","main"),
        "legumbres":("Legumbres","bean","main"),"lacteos":("Lácteos","carton","main")}
    category=r.get("categoria")
    if category is not None and category not in categories:raise ValueError("Categoría inválida: "+str(category))
    cat_title,cat_icon=categories[category] if category else ("Sin categoría","book-open")
    cat_html='<span class="category-badge" role="img" tabindex="0" aria-label="'+e(cat_title)+'" title="'+e(cat_title)+'" data-label="'+e(cat_title)+'"><i data-lucide="'+cat_icon+'" aria-hidden="true"></i></span>' if category else ""
    tags=r.get("etiquetas",[])
    if not isinstance(tags,list) or any(t not in tags_catalog for t in tags):raise ValueError("Etiquetas inválidas")
    tags_html='<h2 class="section-title visually-hidden">Características de la receta</h2><div class="icon-tags" aria-label="Características">'+"".join('<span class="icon-tag '+('is-main' if tags_catalog[t][2]=="main" else '')+'" role="img" tabindex="0" aria-label="'+e(tags_catalog[t][0])+'" title="'+e(tags_catalog[t][0])+'" data-label="'+e(tags_catalog[t][0])+'"><i data-lucide="'+tags_catalog[t][1]+'" aria-hidden="true"></i></span>' for t in tags)+"</div>" if tags else ""
    rows=""
    for v in ing:
        name=e(v["nombre"])
        if v.get("preparacion"):name='<a href="'+SITE+'/recetas/'+e(v["preparacion"])+'/">'+name+' ↗</a>'
        rows+='<li><span class="itemname">'+name+'</span>'+(('<span class="qty" data-qty="'+e(v["cantidad"])+'" data-unit="'+e(v["unidad"])+'">'+e(v["cantidad"])+' '+e(v["unidad"])+'</span>') if v["cantidad"] is not None else ('<span class="qty">'+e(v["unidad"])+'</span>'))+'</li>'
    photo='<img class="hero-photo" itemprop="image" src="'+e(img)+'" alt="'+e(n)+'">' if img else '<div class="photo-empty">Fotografía pendiente</div>'
    social='<meta property="og:image" content="'+e(img)+'"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="'+e(img)+'">' if img else ""
    notes=str(r.get("notas") or "")
    replacements={"PAGE_TITLE":e(n+" · MiruRecetas"),"META_DESCRIPTION":e(desc or n),"CANONICAL_URL":url,"SOCIAL_IMAGE":social,"CSS_URL":SITE+"/assets/estilo.css","JS_URL":SITE+"/assets/cocina.js","HOME_URL":SITE+"/","JSON_LD":json.dumps(structured,ensure_ascii=False).replace("<",r"\u003c"),"UI_JSON":json.dumps({"raciones":servings}),"VISIBLE_IMAGE":photo,"TITLE":e(n),"DESCRIPTION":'<p class="muted">'+e(desc)+'</p>' if desc else "","BASE_SERVINGS":str(servings),"NUTRITION":nut_html,"INGREDIENT_ROWS":rows,"TAGS":tags_html,"CATEGORY_ICON":cat_html,"STEP_ROWS":''.join('<li><label><input type="checkbox"><span class="step-text">'+e(t)+'</span></label></li>' for t in steps),"NOTES":'<div class="notes"><h2>Notas</h2><p>'+e(notes)+'</p></div>' if notes else ""}
    out=T
    for k,v in replacements.items():out=out.replace("{{"+k+"}}",v)
    dest=R/"recetas"/s/"index.html";dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(out,encoding="utf-8")
    return {"slug":s,"nombre":n,"imagen":img,"descripcion":desc,"etiquetas":[tags_catalog[t][0] for t in tags]}
def main():
    (R/"datos"/"recetas").mkdir(parents=True,exist_ok=True);(R/"datos"/"menus").mkdir(parents=True,exist_ok=True)
    recipes=[];rs={}
    for p in sorted((R/"datos"/"recetas").glob("*.json")):
        record=json.loads(p.read_text(encoding="utf-8"))
        if record.get("slug")!=p.stem:raise ValueError("Slug de archivo inválido")
        recipes.append(make(record));rs[p.stem]=record
    for r in rs.values():
        for ing in entries(r):
            if ing.get("preparacion") and ing["preparacion"] not in rs:raise ValueError("Preparación enlazada no existente")
    menus=[]
    for p in sorted((R/"datos"/"menus").glob("*.json")):
        m=json.loads(p.read_text(encoding="utf-8"));month,num=m.get("mes"),m.get("menu")
        if isinstance(month,bool) or isinstance(num,bool) or not isinstance(month,int) or not isinstance(num,int) or not 1<=month<=12 or not 1<=num<=4 or p.stem!=str(month).zfill(2)+"-"+str(num):raise ValueError("Menú inválido")
        days=m.get("dias")
        if not isinstance(days,dict) or set(days)!=set(DAYS):raise ValueError("Días inválidos")
        for day in DAYS:
            pair=days[day]
            if not isinstance(pair,dict) or set(pair)!={"comida","cena"}:raise ValueError("Comida/cena inválidas")
            if any(x is not None and x not in rs for x in pair.values()):raise ValueError("Receta de menú no existe")
        batch=m.get("batchcooking",[])
        if not isinstance(batch,list) or any(x not in rs for x in batch):raise ValueError("Batch cooking inválido")
        menus.append(m)
    sitejson=json.dumps({"recetas":recipes,"menus":menus},ensure_ascii=False).replace("<",r"\u003c")
    page=(R/"plantillas"/"inicio.html").read_text(encoding="utf-8").replace("{{SITE_JSON}}",sitejson).replace("{{SITE}}",SITE)
    (R/"index.html").write_text(page,encoding="utf-8")
    print("Generadas",len(recipes),"recetas y",len(menus),"menús.")
if __name__=="__main__":main()
