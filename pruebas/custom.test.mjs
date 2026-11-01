import test from "node:test";
import assert from "node:assert/strict";
import {CONFIG,activateScenario} from "../config.js";
import {defaultCustomScenario,validateCustomScenario,SCENARIOS} from "../scenarios.js";
import {newGame,calculate,validate,advance} from "../engine.js";

test("escenario personalizado: plantilla completa y validación de parámetros",()=>{
 const s=defaultCustomScenario();
 assert.equal(s.id,"custom");
 assert.equal(s.rounds.length,5);
 assert.equal(s.strategies.length,3);
 assert.equal(s.decisions.length,6);
 assert.equal(validateCustomScenario(s),s);
 assert.throws(()=>validateCustomScenario({...s,model:{...s.model,market:0}}),/fuera de rango/);
 assert.throws(()=>validateCustomScenario({...s,title:""}),/nombre/);
});
test("escenario personalizado: permite disputar cinco rondas con configuración propia",()=>{
 const s=defaultCustomScenario();
 s.title="Simulación de estrategia corporativa";
 s.model.market=70000;
 s.events.recession.demand=.7;
 SCENARIOS.custom=validateCustomScenario(s);
 activateScenario("custom");
 let game=newGame();
 for(let r=1;r<=5;r++){
   for(const team of game.teams){
     team.decision={strategy:CONFIG.strategies[(team.id-1)%3].id,...Object.fromEntries(CONFIG.decisions.map(d=>[d.id,d.initial]))};
     assert.equal(validate(team,team.decision),"");
     team.submitted=true;
   }
   if(r===4)game.event="recession";
   game=calculate(game);
   assert.equal(game.results.length,r);
   assert.ok(game.results.at(-1).rows.every(x=>Number.isFinite(x.operating)));
   if(r<5)game=advance(game);
 }
 assert.equal(game.results[3].market,49000);
 activateScenario("porter");
});
