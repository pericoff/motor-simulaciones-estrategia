import test from "node:test";
import assert from "node:assert/strict";
import {SCENARIOS,loadCustomScenario} from "../scenarios.js";
import {CONFIG,activateScenario} from "../config.js";
import {newGame,calculate,validate,advance} from "../engine.js";
import {LIBRARY_KEY,loadLibrary,libraryList,createScenario,updateScenario,deleteScenario,exportScenario,importScenario} from "../scenario-library.js";
const entries=new Map();
globalThis.localStorage={
 getItem:key=>entries.has(key)?entries.get(key):null,
 setItem:(key,value)=>{entries.set(key,String(value));},
 removeItem:key=>{entries.delete(key);}
};
test("biblioteca: crear, recuperar, duplicar, exportar, importar y eliminar sin tocar originales",()=>{
 entries.clear();
 loadCustomScenario();loadLibrary();
 const originalTitle=SCENARIOS.porter.title;
 const a=createScenario("porter");
 assert.match(a.id,/^user-/);
 assert.equal(libraryList().length,1);
 const edited={...a,title:"Expansión en mercados digitales"};
 updateScenario(edited);
 loadLibrary();
 assert.equal(SCENARIOS[a.id].title,"Expansión en mercados digitales");
 const duplicate=createScenario(a.id);
 assert.notEqual(duplicate.id,a.id);
 assert.equal(libraryList().length,2);
 const exported=exportScenario(a.id);
 const imported=importScenario(exported);
 assert.notEqual(imported.id,a.id);
 assert.equal(imported.title,edited.title);
 assert.equal(libraryList().length,3);
 assert.equal(SCENARIOS.porter.title,originalTitle);
 assert.throws(()=>deleteScenario("porter"),/predefinidos/);
 deleteScenario(a.id);
 assert.equal(libraryList().length,2);
 assert.equal(SCENARIOS[a.id],undefined);
 assert.ok(entries.get(LIBRARY_KEY));
});
test("importación: rechazo de formato inválido sin alterar biblioteca",()=>{
 const before=libraryList().length;
 assert.throws(()=>importScenario("{}"),/compatible/);
 assert.throws(()=>importScenario("no es json"),/JSON/);
 const invalid=JSON.parse(exportScenario(libraryList()[0].id));
 invalid.scenario.model.market=-1;
 assert.throws(()=>importScenario(JSON.stringify(invalid)),/fuera de rango/);
 assert.equal(libraryList().length,before);
});
test("escenario creado con biblioteca disputa cinco rondas sin cambiar Porter",()=>{
 const s=createScenario("innovation");
 activateScenario(s.id);
 let game=newGame();
 for(let round=1;round<=5;round++){
  for(const team of game.teams){
   team.decision={strategy:CONFIG.strategies[(team.id-1)%3].id,...Object.fromEntries(CONFIG.decisions.map(d=>[d.id,d.initial]))};
   assert.equal(validate(team,team.decision),"");
   team.submitted=true;
  }
  game=calculate(game);
  assert.ok(game.results.at(-1).rows.every(r=>Number.isFinite(r.score)));
  if(round<5)game=advance(game);
 }
 assert.equal(game.results.length,5);
 activateScenario("porter");
});
