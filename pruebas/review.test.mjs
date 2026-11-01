import test from "node:test";
import assert from "node:assert/strict";
import {REVIEW_ROUNDS,REVIEW_ID,reviewScore,completeReview} from "../review-content.js";
import {CONFIG,activateScenario} from "../config.js";
import {newGame,validate,calculate,advance} from "../engine.js";

test("los cinco retos cubren temas 2, 3, 4 y 5 con retroalimentación",()=>{
 assert.equal(REVIEW_ROUNDS.length,5);
 assert.deepEqual(REVIEW_ROUNDS.map(r=>r.topic),["Tema 2","Tema 2","Tema 3","Tema 4","Tema 5"]);
 assert.ok(REVIEW_ROUNDS.every(r=>r.questions.length>=4));
 for(const round of REVIEW_ROUNDS){
  for(const q of round.questions){
   assert.equal(q.options.length,4);
   assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4);
   assert.ok(q.why.length>40);
   assert.ok(q.source.includes(round.topic));
  }
 }
});
test("corrección, feedback y prohibición de responder dos veces",()=>{
 activateScenario(REVIEW_ID);
 const team=newGame().teams[0];
 assert.equal(reviewScore(team,1),null);
 assert.throws(()=>completeReview(team,1,[1]),/Completa/);
 const answers=REVIEW_ROUNDS[0].questions.map(q=>q.correct);
 assert.equal(completeReview(team,1,answers).percent,100);
 assert.equal(reviewScore(team,1).correct,4);
 assert.throws(()=>completeReview(team,1,answers),/ya ha sido/);
 assert.equal(completeReview(team,2,REVIEW_ROUNDS[1].questions.map(q=>(q.correct+1)%4)).correct,0);
});
test("partida completa de cinco rondas con repaso y decisiones",()=>{
 activateScenario(REVIEW_ID);
 let game=newGame();
 assert.equal(game.scenarioId,REVIEW_ID);
 for(let r=1;r<=5;r++){
  game.teams.forEach((team,i)=>{
   const answers=REVIEW_ROUNDS[r-1].questions.map((q,k)=>(i===0?q.correct:(q.correct+i+k)%4));
   completeReview(team,r,answers);
   team.decision={strategy:CONFIG.strategies[i%3].id,...Object.fromEntries(CONFIG.decisions.map(d=>[d.id,d.initial]))};
   assert.equal(validate(team,team.decision),"");
   team.submitted=true;
  });
  game=calculate(game);
  assert.equal(game.phase,"results");
  assert.ok(game.results.at(-1).rows.every(r=>Number.isFinite(r.operating)));
  if(r<5)game=advance(game);
 }
 assert.equal(game.teams[0].history.length,5);
 assert.equal(game.teams[0].review[5].answers.length,4);
 activateScenario("porter");
});
