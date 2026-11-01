import {CONFIG} from "./config.js";
import {defaultCustomScenario,saveCustomScenario} from "./scenarios.js";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const input=(name,label,value,type="text",extra="")=>'<div><label for="'+name+'">'+esc(label)+'</label><input id="'+name+'" name="'+name+'" type="'+type+'" value="'+esc(value)+'" '+extra+' required></div>';
const textarea=(name,label,value)=>'<div><label for="'+name+'">'+esc(label)+'</label><textarea id="'+name+'" name="'+name+'" maxlength="600" required>'+esc(value)+'</textarea></div>';
const number=(name,label,value,min,max,step)=>input(name,label,value,"number",'min="'+min+'" max="'+max+'" step="'+step+'"');
export function renderScenarioEditor(game){
 if(CONFIG.id!=="custom")return "";
 const started=game.results.length>0||game.teams.some(t=>t.submitted);
 const s=CONFIG;
 let out='<div class="card"><h2>Editor del cuarto escenario</h2><p>Personaliza la temática y las reglas del modelo sin modificar código. Los cambios se guardan en este navegador, no en GitHub ni en otros equipos.</p>';
 if(started)return out+'<div class="alert">Hay decisiones entregadas o resultados calculados. Para evitar alterar la partida, utiliza «Reiniciar demostración» antes de editar.</div></div>';
 out+='<form id="scenarioEditor">'+input("scenario_title","Nombre de la simulación",s.title,"text",'maxlength="100"')+
 input("scenario_sector","Sector o contexto",s.sector,"text",'maxlength="100"')+
 textarea("scenario_desc","Descripción docente",s.description);
 out+='<h3>Cinco rondas</h3>';
 s.rounds.forEach((r,i)=>{out+='<div class="grid">'+input("round_title_"+i,"Ronda "+(i+1)+" · Título",r.title,"text",'maxlength="90"')+input("round_desc_"+i,"Objetivo de la ronda",r.description,"text",'maxlength="500"')+'</div>';});
 out+='<h3>Tres alternativas estratégicas</h3><div class="grid">';
 s.strategies.forEach((st,i)=>{out+=input("strategy_"+i,"Estrategia "+(i+1),st.name,"text",'maxlength="100"');});out+='</div>';
 out+='<h3>Seis decisiones económicas</h3><div class="grid">';
 s.decisions.forEach((d,i)=>{out+=input("decision_"+i,"Decisión "+(i+1)+" · Etiqueta",d.label,"text",'maxlength="100"');});out+='</div>';
 out+='<h3>Cinco acontecimientos de mercado</h3><div class="grid">';
 Object.entries(s.events).forEach(([id,event])=>{
  out+=input("event_name_"+id,"Nombre: "+id,event.name,"text",'maxlength="100"')+
  number("event_demand_"+id,"Multiplicador demanda · "+id,event.demand,.5,2,.01)+
  number("event_cost_"+id,"Multiplicador costes · "+id,event.cost,.5,2,.01)+
  number("event_quality_"+id,"Bonificación calidad · "+id,event.quality,0,1,.01)+
  number("event_innovation_"+id,"Bonificación innovación · "+id,event.innovation,0,1,.01);
 });out+='</div>';
 out+='<h3>Parámetros del mercado</h3><p class="muted">Estos valores modifican el motor matemático. Conviene probar varias partidas antes de usarlos para evaluar estudiantes.</p><div class="grid">';
 const specs=[
  ["market","Demanda base (unidades)",1000,500000,1000],
  ["baseCost","Coste unitario base (€)",10,200,1],
  ["baselinePrice","Precio de referencia (€)",50,160,1],
  ["priceSensitivity","Sensibilidad al precio",10,100,1],
  ["fixedCost","Costes fijos por ronda (€)",0,250000,1000],
  ["marketingEffect","Efecto del marketing",0,2,.001],
  ["qualityEffect","Efecto de calidad",0,2,.001],
  ["innovationEffect","Efecto de innovación",0,2,.001],
  ["efficiencyCostEffect","Efecto de eficiencia en costes",0,2,.01],
  ["capacityFactor","Conversión de inversión en capacidad",0,2,.01],
  ["alignmentBonus","Bonificación por coherencia estratégica",0,2,.01]
 ];
 for(const [key,label,min,max,step] of specs)out+=number("model_"+key,label,s.model[key],min,max,step);
 out+='</div><button type="submit">Guardar configuración del escenario</button><button type="button" class="secondary" id="restoreScenario">Restaurar plantilla inicial</button></form></div>';
 return out;
}
export function bindScenarioEditor(game,onSaved,onError){
 const form=document.getElementById("scenarioEditor");
 if(!form)return;
 function apply(s){
  try{saveCustomScenario(s);onSaved();}catch(e){onError(e.message);}
 }
 form.onsubmit=e=>{
  e.preventDefault();
  const data=new FormData(form),s=structuredClone(CONFIG);
  s.title=String(data.get("scenario_title")||"").trim();
  s.sector=String(data.get("scenario_sector")||"").trim();
  s.description=String(data.get("scenario_desc")||"").trim();
  s.rounds.forEach((r,i)=>{r.title=String(data.get("round_title_"+i)||"").trim();r.description=String(data.get("round_desc_"+i)||"").trim();});
  s.strategies.forEach((st,i)=>{st.name=String(data.get("strategy_"+i)||"").trim();});
  s.decisions.forEach((d,i)=>{d.label=String(data.get("decision_"+i)||"").trim();});
  for(const [id,event] of Object.entries(s.events)){
   event.name=String(data.get("event_name_"+id)||"").trim();
   for(const key of ["demand","cost","quality","innovation"])event[key]=Number(data.get("event_"+key+"_"+id));
  }
  for(const key of Object.keys(s.model))s.model[key]=Number(data.get("model_"+key));
  apply(s);
 };
 document.getElementById("restoreScenario").onclick=()=>{
  if(confirm("¿Restaurar la configuración del cuarto escenario? Se conservará la partida local sin cambios."))apply(defaultCustomScenario());
 };
}
