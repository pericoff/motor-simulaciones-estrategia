import test from "node:test";
import assert from "node:assert/strict";
import {newGame,validate,calculate,advance,ranking} from "../engine.js";
import {CONFIG} from "../config.js";
const choice={strategy:"cost",...Object.fromEntries(CONFIG.decisions.map(f=>[f.id,f.initial]))};
test("las inversiones no pueden superar la tesorería disponible",()=>{
 const g=newGame();assert.equal(validate(g.teams[0],choice),"");
 assert.match(validate(g.teams[0],{...choice,price:1000}),/Valor incorrecto/);
 assert.match(validate({...g.teams[0],cash:15000},choice),/reserva/);
});
test("partida de cinco rondas, resultados competitivos y estados acumulados",()=>{
 let g=newGame();
 for(let r=1;r<=5;r++){
  for(const team of g.teams){team.decision={...choice,price:95+team.id*5,strategy:["cost","different","focus","cost"][team.id-1]};team.submitted=true;}
  g=calculate(g);
  assert.equal(g.phase,"results");
  assert.equal(g.results.length,r);
  assert.equal(g.results.at(-1).rows.length,4);
  assert.ok(g.results.at(-1).rows.every(row=>Number.isFinite(row.cash)&&Number.isFinite(row.score)));
  assert.ok(g.results.at(-1).rows.reduce((n,row)=>n+row.sold,0)<=g.results.at(-1).market+4);
  if(r<5)g=advance(g);
 }
 assert.equal(ranking(g).length,4);
 assert.equal(g.teams[0].history.length,5);
 assert.throws(()=>advance(g));
});
