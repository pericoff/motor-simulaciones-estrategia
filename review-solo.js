import {REVIEW_ROUNDS} from "./review-content.js";
const KEY="repaso-estrategia-individual-v1";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const root=document.getElementById("app");
let progress;
try{progress=JSON.parse(localStorage.getItem(KEY))||{};if(typeof progress!=="object"||Array.isArray(progress))progress={};}catch{progress={};}
let current=1;
const questionsFor=n=>REVIEW_ROUNDS[n-1].questions;
const totalCorrect=()=>REVIEW_ROUNDS.reduce((sum,_,i)=>sum+(score(i+1)?.correct||0),0);
function score(round){
 const answers=progress[round];
 if(!Array.isArray(answers)||answers.length!==questionsFor(round).length)return null;
 return {correct:questionsFor(round).filter((q,i)=>q.correct===answers[i]).length,total:questionsFor(round).length};
}
function save(){localStorage.setItem(KEY,JSON.stringify(progress));}
function render(){
 const total=REVIEW_ROUNDS.reduce((n,r)=>n+r.questions.length,0);
 const completed=REVIEW_ROUNDS.filter((_,i)=>score(i+1)).length;
 let html='<div class="toplinks"><a class="linkbtn secondary" href="./">Portal de empresas</a><a class="linkbtn secondary" href="./profesor.html">Panel del profesor</a></div>'+
 '<div class="card"><h2>Repaso individual · Temas 2 a 5</h2><p>Dirige el análisis de una empresa industrial ficticia y revisa los conceptos del temario. Corrige tus respuestas con explicaciones y referencias a las diapositivas originales.</p>'+
 '<div class="grid"><div class="metric">Bloques completados<b>'+completed+'/5</b></div><div class="metric">Aciertos acumulados<b>'+totalCorrect()+'/'+total+'</b></div></div>'+
 '<p class="muted">Los resultados se guardan en este navegador y no se envían al profesor.</p></div>'+
 '<div class="card"><h2>Elegir bloque de repaso</h2><div class="toplinks">'+REVIEW_ROUNDS.map((r,i)=>'<button type="button" class="'+(current===i+1?'':'secondary')+'" data-round="'+(i+1)+'">'+(i+1)+'. '+esc(r.topic)+(score(i+1)?' ✓':'')+'</button>').join('')+'</div></div>';
 const activity=REVIEW_ROUNDS[current-1],result=score(current);
 html+='<div class="card"><p class="muted">'+esc(activity.topic)+' · Bloque '+current+' de 5</p><h2>'+esc(activity.title)+'</h2><p>'+esc(activity.context)+'</p>';
 if(!result){
  html+='<form id="soloForm">';
  activity.questions.forEach((q,i)=>{
   html+='<fieldset class="review-question"><legend><b>'+(i+1)+'. '+esc(q.q)+'</b></legend>';
   q.options.forEach((option,j)=>{html+='<label class="review-option"><input required type="radio" name="q'+i+'" value="'+j+'"> '+esc(option)+'</label>';});
   html+='</fieldset>';
  });
  html+='<button type="submit">Corregir respuestas</button></form>';
 }else{
  html+='<div class="success"><b>Resultado del bloque: '+result.correct+'/'+result.total+' respuestas correctas.</b></div>';
  activity.questions.forEach((q,i)=>{
   const answer=progress[current][i];
   html+='<div class="review-feedback"><p><b>'+(i+1)+'. '+esc(q.q)+'</b></p><p class="'+(answer===q.correct?'good-answer':'bad-answer')+'">'+(answer===q.correct?'Correcta':'Incorrecta')+': '+esc(q.options[answer])+'</p>';
   if(answer!==q.correct)html+='<p><b>Respuesta correcta:</b> '+esc(q.options[q.correct])+'</p>';
   html+='<p>'+esc(q.why)+'</p><p class="muted">Fuente de estudio: '+esc(q.source)+'</p></div>';
  });
  html+='<button id="repeat" class="secondary">Repetir este bloque</button>';
  if(current<5)html+='<button id="nextRound">Siguiente bloque</button>';
  else html+='<button id="summary">Ver resumen final</button>';
 }
 html+='</div>';
 if(completed===5){
  html+='<div class="card" id="finalSummary"><h2>Informe de repaso completo</h2><p>Has respondido '+total+' preguntas. Aciertos: <b>'+totalCorrect()+'/'+total+'</b> ('+Math.round(totalCorrect()/total*100)+' %).</p>';
  html+='<div class="scroll"><table><thead><tr><th>Bloque</th><th>Resultado</th></tr></thead><tbody>'+REVIEW_ROUNDS.map((r,i)=>'<tr><td>'+esc(r.title)+'</td><td>'+score(i+1).correct+'/'+score(i+1).total+'</td></tr>').join('')+'</tbody></table></div><button id="exportProgress" class="secondary">Exportar informe CSV</button><button id="restartAll" class="danger">Reiniciar todo el repaso</button></div>';
 }
 html+='<footer>Actividad de autoestudio basada en los temas 2, 3, 4 y 5 del curso. No sustituye la lectura de las diapositivas ni la evaluación oficial.</footer>';
 root.innerHTML=html;
 document.querySelectorAll("[data-round]").forEach(b=>b.onclick=()=>{current=Number(b.dataset.round);render();});
 const form=document.getElementById("soloForm");
 if(form)form.onsubmit=e=>{
  e.preventDefault();
  const data=new FormData(form),answers=questionsFor(current).map((_,i)=>Number(data.get("q"+i)));
  if(answers.some((v,i)=>!Number.isInteger(v)||v<0||v>=questionsFor(current)[i].options.length))return;
  progress[current]=answers;save();render();
 };
 if(document.getElementById("repeat"))document.getElementById("repeat").onclick=()=>{
  if(confirm("¿Repetir el bloque y sustituir su resultado anterior?")){delete progress[current];save();render();}
 };
 if(document.getElementById("nextRound"))document.getElementById("nextRound").onclick=()=>{current++;render();window.scrollTo(0,0);};
 if(document.getElementById("summary"))document.getElementById("summary").onclick=()=>document.getElementById("finalSummary")?.scrollIntoView({behavior:"smooth"});
 if(document.getElementById("restartAll"))document.getElementById("restartAll").onclick=()=>{if(confirm("¿Borrar los resultados individuales de los cinco bloques?")){progress={};save();current=1;render();}};
 if(document.getElementById("exportProgress"))document.getElementById("exportProgress").onclick=()=>{
  const lines=[["Bloque","Tema","Aciertos","Preguntas"],...REVIEW_ROUNDS.map((r,i)=>[r.title,r.topic,score(i+1).correct,score(i+1).total])];
  const body="\uFEFF"+lines.map(line=>line.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(";")).join("\n");
  const url=URL.createObjectURL(new Blob([body],{type:"text/csv;charset=utf-8"}));
  const link=document.createElement("a");link.href=url;link.download="repaso-estrategia-resultado.csv";document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
}
render();
