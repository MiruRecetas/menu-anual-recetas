const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {model}=require('../assets/graficos-semana.js');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'datos/menus/10-1.json'),'utf8');
const menu=JSON.parse(source);
const recipes=fs.readdirSync(path.join(root,'datos/recetas')).filter(x=>x.endsWith('.json')).map(name=>{
 const recipe=JSON.parse(fs.readFileSync(path.join(root,'datos/recetas',name),'utf8'));
 return {...recipe,etiquetas_principales:recipe.etiquetas.filter(t=>['carne','huevos','pescado','marisco','verduras','legumbres','lacteos'].includes(t))};
});
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const data=model(menu,recipes);
assert.deepEqual(data.bars.map(b=>b.letter),['L','M','X','J','V']);
for(const bar of data.bars){
 near(bar.kcal,menu.dias[bar.day].nutricion.kcal);
 near(bar.segments.reduce((n,s)=>n+s.kcal,0),bar.kcal);
 near(bar.segments.reduce((n,s)=>n+s.share,0),1);
 const n=menu.dias[bar.day].nutricion;
 near(bar.segments[0].share,n.proteinas_g*4/(n.proteinas_g*4+n.hidratos_g*4+n.grasas_g*9));
}
near(data.total,menu.nutricion_semana.kcal);
near(data.meals.reduce((n,e)=>n+e.kcal,0),data.total);
near(data.variety.entries.reduce((n,e)=>n+e.kcal,0),data.total);
assert.equal(data.variety.basis,'protagonista');
near(data.meals.find(e=>e.key==='cena').kcal,
 Object.values(menu.dias).slice(0,4).reduce((n,d)=>n+d.cena.nutricion.kcal,0));
near(data.variety.entries.find(e=>e.key==='carne').kcal,
 menu.dias.Lunes.cena.nutricion.kcal+menu.dias.Martes.comida.nutricion.kcal+menu.dias.Jueves.comida.nutricion.kcal);
assert.equal(JSON.stringify(menu),JSON.stringify(JSON.parse(source)),'No modificar menú');
const missing=model(menu,[]);
assert.ok(missing.variety.entries.find(e=>e.key==='otros').kcal>0,'Sin etiquetas no inventar clasificación');
near(missing.variety.entries.reduce((n,e)=>n+e.kcal,0),data.total);
const zero=structuredClone(menu);
zero.estado='Pendiente';
for(const day of Object.values(zero.dias)){
 day.nutricion={kcal:0,proteinas_g:0,hidratos_g:0,grasas_g:0};
 for(const kind of ['desayuno','comida','cena','postre']){
  if(day[kind]?.nutricion)day[kind].nutricion={...day.nutricion};
 }
}
const empty=model(zero,recipes);
assert.equal(empty.partial,true);
assert.equal(empty.variety.entries.length,0);
assert.equal(empty.meals.length,0);
assert.ok(empty.bars.every(b=>b.segments.every(s=>s.kcal===0&&s.share===0)),'Ceros sin NaN');
const combined=structuredClone(menu);
const original=combined.dias.Lunes.postre;
const prep={tipo:'preparacion',nombre:'Postre',slug:'bowl-de-yogur-con-miel-y-granola',
 raciones:0.5,nutricion:{kcal:123,proteinas_g:5,hidratos_g:6,grasas_g:7}};
combined.dias.Lunes.postre={componentes:[original,prep]};
combined.dias.Lunes.nutricion.kcal+=123;
combined.nutricion_semana.kcal+=123;
const combinedModel=model(combined,recipes);
near(combinedModel.total,data.total+123);
near(combinedModel.meals.find(e=>e.key==='postre').kcal,data.meals.find(e=>e.key==='postre').kcal+123);
near(combinedModel.meals.reduce((n,e)=>n+e.kcal,0),combinedModel.total);
near(combinedModel.variety.entries.reduce((n,e)=>n+e.kcal,0),combinedModel.total);
assert.equal(menu.dias.Lunes.postre.tipo,'ingrediente','La prueba no cambia el menú real');
console.log('PASS: gráficos semanales: kcal oficiales, proporciones 4/4/9, sumas semanales, protagonista, cena libre y datos ausentes.');
