import test from "node:test";
import assert from "node:assert/strict";
import {SCENARIOS} from "../scenarios.js";
import {CONFIG,activateScenario} from "../config.js";
import {newGame,validate,calculate,advance,ranking} from "../engine.js";

for(const id of Object.keys(SCENARIOS)){
  test("escenario "+id+": cinco rondas con resultados coherentes",()=>{
    activateScenario(id);
    assert.equal(CONFIG.rounds.length,5);
    assert.equal(CONFIG.strategies.length,3);
    let g=newGame();
    assert.equal(g.scenarioId,id);
    for(let round=1;round<=5;round++){
      for(const t of g.teams){
        t.decision={strategy:CONFIG.strategies[(t.id-1)%3].id,...Object.fromEntries(CONFIG.decisions.map(d=>[d.id,d.initial]))};
        assert.equal(validate(t,t.decision),"");
        t.submitted=true;
      }
      if(round===4)g.event=Object.keys(CONFIG.events)[1];
      g=calculate(g);
      const result=g.results.at(-1);
      assert.equal(result.rows.length,4);
      assert.equal(result.round,round);
      assert.ok(result.rows.every(r=>[r.cash,r.score,r.revenue,r.operating,r.sold,r.share].every(Number.isFinite)));
      assert.ok(result.rows.reduce((s,r)=>s+r.sold,0)<=result.market+4);
      assert.ok(g.teams.every(t=>t.history.length===round));
      if(round<5)g=advance(g);
    }
    assert.equal(ranking(g).length,4);
    assert.throws(()=>advance(g));
  });
}
test("una partida no puede calcularse con otro escenario",()=>{
  activateScenario("porter");
  const g=newGame();
  activateScenario("global");
  assert.throws(()=>calculate(g),/no corresponde/);
});
