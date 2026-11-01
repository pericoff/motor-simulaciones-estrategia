import {SCENARIOS,defaultCustomScenario,validateCustomScenario} from "./scenarios.js";

export const LIBRARY_KEY="motor-biblioteca-escenarios-v1";
export const BUILTIN_IDS=["porter","global","innovation","custom"];
const MAX_SCENARIOS=50;
const ID_PATTERN=/^user-[a-z0-9-]{1,60}$/;
const clone=value=>JSON.parse(JSON.stringify(value));

export function isEditableScenario(id){
 return id==="custom"||ID_PATTERN.test(id);
}
export function validateLibraryScenario(value){
 if(!value||!ID_PATTERN.test(value.id))throw Error("Identificador no válido.");
 const normalized=clone(value);
 // Emplea la misma estructura de seis decisiones y el mismo motor del editor de la v0.3.
 validateCustomScenario({...normalized,id:"custom"});
 if(!Array.isArray(normalized.strategies)||normalized.strategies.some((s,i)=>s.trait!==["efficiency","quality","brand"][i]))
   throw Error("Las capacidades estratégicas deben corresponder al motor.");
 const template=defaultCustomScenario();
 for(let i=0;i<6;i++){
   const a=normalized.decisions[i],b=template.decisions[i];
   if(a.kind!==b.kind||a.min!==b.min||a.max!==b.max||a.step!==b.step||a.initial!==b.initial)
     throw Error("El esquema de decisiones no es compatible.");
 }
 return normalized;
}
function readLibrary(){
 try {
  const raw=localStorage.getItem(LIBRARY_KEY);
  if(!raw)return {};
  if(raw.length>500000)throw Error("Biblioteca demasiado grande.");
  const data=JSON.parse(raw);
  if(!data||typeof data!=="object"||Array.isArray(data))throw Error("Biblioteca inválida.");
  const clean=Object.create(null);
  for(const [id,scenario] of Object.entries(data).slice(0,MAX_SCENARIOS)){
    try{if(id===scenario.id)clean[id]=validateLibraryScenario(scenario);}catch{}
  }
  return clean;
 }catch{return {};}
}
export function loadLibrary(){
 const entries=readLibrary();
 for(const key of Object.keys(SCENARIOS))if(ID_PATTERN.test(key))delete SCENARIOS[key];
 for(const [id,value] of Object.entries(entries))SCENARIOS[id]=value;
 return entries;
}
export function libraryList(){return Object.values(readLibrary());}
function saveLibrary(entries){
 if(Object.keys(entries).length>MAX_SCENARIOS)throw Error("Máximo de 50 escenarios guardados.");
 const serialized=JSON.stringify(entries);
 if(serialized.length>500000)throw Error("La biblioteca supera el espacio permitido.");
 localStorage.setItem(LIBRARY_KEY,serialized);
 loadLibrary();
}
function randomId(entries){
 for(let i=0;i<20;i++){
  const id="user-"+Math.random().toString(36).slice(2,12);
  if(!entries[id]&&!SCENARIOS[id])return id;
 }
 throw Error("No se pudo crear un identificador único.");
}
export function createScenario(sourceId="custom"){
 const entries=readLibrary(),source=SCENARIOS[sourceId]||defaultCustomScenario();
 const scenario=clone(source);
 scenario.id=randomId(entries);
 scenario.title=(source.title+" · Copia").slice(0,100);
 // El motor solo comprende estas tres correspondencias estratégicas para escenarios editables.
 scenario.strategies=defaultCustomScenario().strategies.map((base,i)=>({...base,name:source.strategies?.[i]?.name||base.name}));
 scenario.decisions=defaultCustomScenario().decisions.map((base,i)=>({...base,label:source.decisions?.[i]?.label||base.label}));
 scenario.events=clone(defaultCustomScenario().events);
 scenario.rounds=clone(source.rounds);
 scenario.model=clone(source.model);
 validateLibraryScenario(scenario);
 entries[scenario.id]=scenario;
 saveLibrary(entries);
 return scenario;
}
export function updateScenario(s){
 const entries=readLibrary();
 if(!entries[s.id])throw Error("No se encontró el escenario que quieres editar.");
 const clean=validateLibraryScenario(s);
 entries[clean.id]=clean;saveLibrary(entries);
 return clean;
}
export function deleteScenario(id){
 if(!ID_PATTERN.test(id))throw Error("No se pueden borrar escenarios predefinidos.");
 const entries=readLibrary();
 if(!entries[id])throw Error("El escenario ya no existe.");
 delete entries[id];
 saveLibrary(entries);
}
export function exportScenario(id){
 if(!isEditableScenario(id)||!SCENARIOS[id])throw Error("Escenario no exportable.");
 const s=clone(SCENARIOS[id]);
 if(id==="custom")validateCustomScenario(s);else validateLibraryScenario(s);
 return JSON.stringify({format:"motor-estrategia-scenario",version:1,scenario:s},null,2);
}
export function importScenario(raw){
 if(typeof raw!=="string"||raw.length>150000)throw Error("El archivo es demasiado grande.");
 let payload;
 try{payload=JSON.parse(raw);}catch{throw Error("JSON no válido.");}
 if(payload?.format!=="motor-estrategia-scenario"||payload.version!==1||!payload.scenario)
  throw Error("No es un archivo de escenario compatible.");
 const entries=readLibrary(),s=clone(payload.scenario);
 // Importar siempre crea un nuevo identificador, no reemplaza partidas existentes.
 s.id=randomId(entries);
 validateLibraryScenario(s);
 entries[s.id]=s;saveLibrary(entries);
 return s;
}
