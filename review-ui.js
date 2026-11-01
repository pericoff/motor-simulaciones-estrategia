import {REVIEW_ROUNDS,REVIEW_ID,reviewScore,completeReview} from "./review-content.js";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $=id=>document.getElementById(id);
export const isReview=id=>id===REVIEW_ID;
export function reviewStudentPanel(team,round){
 const activity=REVIEW_ROUNDS[round-1],result=reviewScore(team,round);
 if(!activity)return "";
 let html='<div class="card"><p class="muted">'+esc(activity.topic)+' · Actividad de repaso</p><h2>Desafío académico: '+esc(activity.title)+'</h2><p>'+esc(activity.context)+'</p>';
 if(!result){
  html+='<p class="alert">Antes de tomar las decisiones económicas de esta ronda, resuelve las cuatro preguntas. Cada pregunta tiene una sola respuesta correcta.</p><form id="reviewForm">';
  activity.questions.forEach((q,i)=>{
   html+='<fieldset class="review-question"><legend><b>'+(i+1)+'. '+esc(q.q)+'</b></legend>';
   q.options.forEach((o,j)=>{
    html+='<label class="review-option"><input type="radio" name="review_'+i+'" value="'+j+'" required> '+esc(o)+'</label>';
   });
   html+='</fieldset>';
  });
  return html+'<button type="submit">Corregir mi repaso</button></form></div>';
 }
 html+='<div class="success"><b>Repaso corregido: '+result.correct+'/'+result.total+' aciertos ('+result.percent+' %).</b> Lee las explicaciones y continúa con tus decisiones estratégicas.</div>';
 activity.questions.forEach((q,i)=>{
  const answer=team.review[round].answers[i],good=answer===q.correct;
  html+='<div class="review-feedback"><p><b>'+(i+1)+'. '+esc(q.q)+'</b></p><p class="'+(good?'good-answer':'bad-answer')+'">'+(good?'Correcta':'Incorrecta')+' · Tu respuesta: '+esc(q.options[answer])+'</p>';
  if(!good)html+='<p><b>Respuesta correcta:</b> '+esc(q.options[q.correct])+'</p>';
  html+='<p>'+esc(q.why)+'</p><p class="muted">Repasar: '+esc(q.source)+'</p></div>';
 });
 return html+'</div>';
}
export function bindStudentReview(team,round,onSuccess,onError){
 const form=$("reviewForm");if(!form)return;
 form.onsubmit=e=>{
  e.preventDefault();
  const data=new FormData(form);
  try{
   const answers=REVIEW_ROUNDS[round-1].questions.map((_,i)=>{
    const val=data.get("review_"+i);
    if(val===null)throw Error("Contesta las cuatro preguntas antes de corregir.");
    return Number(val);
   });
   completeReview(team,round,answers);
   onSuccess();
  }catch(err){onError(err.message);}
 };
}
export function reviewTeacherPanel(game){
 if(!isReview(game.scenarioId))return "";
 const html=game.teams.map(t=>{
  const scores=Array.from({length:5},(_,i)=>reviewScore(t,i+1));
  const total=scores.reduce((n,s)=>n+(s?.correct||0),0),done=scores.filter(Boolean).length;
  return '<tr><td>'+esc(t.name)+'</td><td>'+done+'/5</td><td>'+total+'/20</td><td>'+(reviewScore(t,game.round)?'Completado':'Pendiente')+'</td></tr>';
 }).join('');
 return '<div class="card"><h2>Seguimiento del aprendizaje</h2><p>20 preguntas distribuidas en cinco rondas. Los aciertos se registran por empresa y se presentan separados de los resultados económicos.</p><div class="scroll"><table><thead><tr><th>Equipo</th><th>Rondas de repaso</th><th>Aciertos</th><th>Repaso actual</th></tr></thead><tbody>'+html+'</tbody></table></div></div>';
}
export function reviewCsvRows(game){
 return game.teams.map(t=>{
  const scores=Array.from({length:5},(_,i)=>reviewScore(t,i+1));
  return [t.name,...scores.map(s=>s?s.correct:""),scores.reduce((n,s)=>n+(s?.correct||0),0)];
 });
}
