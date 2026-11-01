import {CONFIG,activateScenario} from "./config.js";
import {SCENARIOS,loadCustomScenario} from "./scenarios.js";
import {LIBRARY_KEY,loadLibrary,createScenario,deleteScenario,exportScenario,importScenario,isEditableScenario} from "./scenario-library.js";
import {renderScenarioEditor,bindScenarioEditor} from "./scenario-editor.js";
import {newGame,euros,investment,validate,calculate,advance,ranking} from "./engine.js";
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const portal=document.body.dataset.portal;
const ACTIVE_KEY="motor-escenario-activo-v2";
const gameKey=id=>CONFIG.storageKey+"-scenario-"+id;
function readGame(id){
  let data=null;
  try{
    const raw=localStorage.getItem(gameKey(id))||(id==="porter"?localStorage.getItem(CONFIG.storageKey):null);
    data=raw?JSON.parse(raw):null;
    if(!data||!Array.isArray(data.teams)||data.teams.length!==4||!Array.isArray(data.results)||!Number.isInteger(data.round)||data.round<1||data.round>5||!["decisions","results"].includes(data.phase))return newGame();
    if((data.scenarioId||"porter")!==id)return newGame();
    data.scenarioId=id;
    return data;
  }catch{return newGame();}
}
loadCustomScenario();
loadLibrary();
activateScenario(localStorage.getItem(ACTIVE_KEY)||"porter");
let game=readGame(CONFIG.id);
let selected=null,message="";
const save=()=>{
  localStorage.setItem(gameKey(CONFIG.id),JSON.stringify(game));
  localStorage.setItem(ACTIVE_KEY,CONFIG.id);
};
function switchScenario(id){
  if(!SCENARIOS[id]||id===CONFIG.id)return;
  if(!confirm("¿Cambiar de escenario? La partida actual se conservará por separado en este navegador."))return;
  save();
  activateScenario(id);
  game=readGame(id);
  selected=null;message="Escenario cambiado. Cada temática tiene su propia partida local.";
  save();render();
}
window.addEventListener("storage",e=>{
  if(e.key===LIBRARY_KEY){
    loadLibrary();
    if(!SCENARIOS[CONFIG.id]){
      activateScenario("porter");game=readGame(CONFIG.id);selected=null;
    }else{activateScenario(CONFIG.id);}
    render();
    return;
  }
  if(e.key==="motor-escenario-personalizado-v1"){
    loadCustomScenario();
    if(CONFIG.id==="custom"){activateScenario("custom");message="Configuración del escenario actualizada en este navegador.";render();}
  }
  if(e.key===ACTIVE_KEY&&e.newValue&&SCENARIOS[e.newValue]&&e.newValue!==CONFIG.id){
    activateScenario(e.newValue);game=readGame(CONFIG.id);selected=null;message="El profesor ha cambiado de escenario. Se ha cargado la partida correspondiente.";render();
  } else if(e.key===gameKey(CONFIG.id)){
    game=readGame(CONFIG.id);render();
  }
});
const note=(s)=>{message=s;render();};
function layout(body){
  $("app").innerHTML='<div class="toplinks"><a class="linkbtn secondary" href="./">Portal del alumnado</a><a class="linkbtn secondary" href="./profesor.html">Panel del profesor</a></div>'+
  (message?'<div class="alert" role="status">'+esc(message)+'</div>':"")+
  '<div class="card"><h2>'+esc(CONFIG.title)+'</h2><p>'+esc(CONFIG.description)+'</p><h3>Ronda '+game.round+' de 5 · '+esc(CONFIG.rounds[game.round-1].title)+'</h3><p>'+esc(CONFIG.rounds[game.round-1].description)+'</p><p class="muted">Estado: '+(game.phase==="decisions"?"Recepción de decisiones":"Resultados publicados")+'</p></div>'+body+
  '<footer>Versión 4 · DEMOSTRACIÓN LOCAL. Los portales comparten datos solo cuando se abren en el mismo navegador y dispositivo. Sin autenticación segura ni sincronización multiusuario.</footer>';
}
function cards(t){return '<div class="grid">'+[
 ["Tesorería",euros(t.cash)],["Calidad",t.quality.toFixed(1)+"/100"],["Marca",t.brand.toFixed(1)+"/100"],
 ["Eficiencia",t.efficiency.toFixed(1)+"/100"],["Innovación",t.innovation.toFixed(1)+"/100"],["Capacidad",Math.round(t.capacity).toLocaleString("es-ES")+" ud."]
].map(([k,v])=>'<div class="metric">'+esc(k)+'<b>'+esc(v)+'</b></div>').join("")+'</div>';}
function resultsTable(res){
 return '<div class="card"><h2>Resultados · Ronda '+res.round+'</h2><p>Escenario: '+esc(CONFIG.events[res.event].name)+' · Demanda: '+res.market.toLocaleString("es-ES")+' unidades</p><div class="scroll"><table><thead><tr><th>Empresa</th><th>Estrategia</th><th>Ventas</th><th>Cuota</th><th>Resultado</th><th>Tesorería</th><th>Puntos</th></tr></thead><tbody>'+
 res.rows.map(r=>'<tr><td>'+esc(r.name)+'</td><td>'+esc(CONFIG.strategies.find(s=>s.id===r.strategy)?.name||r.strategy)+'</td><td>'+r.sold.toLocaleString("es-ES")+'</td><td>'+r.share+' %</td><td>'+euros(r.operating)+'</td><td>'+euros(r.cash)+'</td><td>'+r.score+'</td></tr>').join("")+
 '</tbody></table></div><p class="muted">Puntuación indicativa basada en cuota, margen, calidad e innovación. Resultados de un modelo docente simplificado.</p></div>';
}
function csvDownload(filename,text){
 const link=document.createElement("a"),url=URL.createObjectURL(new Blob([text],{type:"text/csv;charset=utf-8"}));
 link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),500);
}
function teacher(){
 let body='<div class="card"><h2>Biblioteca de simulaciones</h2><p class="muted">Crea tantas simulaciones de prueba como necesites (máximo 50 guardadas), duplica una plantilla, exporta o importa configuraciones JSON. Cada escenario conserva su partida local.</p><div class="toplinks"><button id="createScenario">Crear nueva desde la actual</button><button id="exportScenario" class="secondary" '+(isEditableScenario(CONFIG.id)?"":"disabled")+'>Exportar JSON</button><button id="deleteScenario" class="danger" '+(CONFIG.id.startsWith("user-")?"":"disabled")+'>Eliminar escenario</button></div><label for="importScenario">Importar simulación desde archivo JSON</label><input id="importScenario" type="file" accept=".json,application/json"><p class="muted">La biblioteca se guarda únicamente en este navegador. Exporta tus escenarios importantes para conservarlos o trasladarlos a otro equipo.</p></div><div class="card"><h2>Elegir simulación estratégica</h2><label for="scenario">Escenario activo</label><select id="scenario">'+Object.values(SCENARIOS).map(s=>'<option value="'+s.id+'" '+(s.id===CONFIG.id?'selected':'')+'>'+esc(s.title)+'</option>').join('')+'</select><p class="muted">Cada escenario conserva su propia partida en este navegador. Al cambiar, las demás pestañas abiertas se actualizan.</p></div><div class="card"><h2>Panel de control</h2><div class="grid"><div class="metric">Decisiones entregadas<b>'+game.teams.filter(t=>t.submitted).length+'/4</b></div><div class="metric">Partida<b>'+game.round+'/5</b></div></div>'+
 '<label for="event">Acontecimiento de mercado</label><select id="event" '+(game.phase==="results"?"disabled":"")+'>'+Object.entries(CONFIG.events).map(([id,v])=>'<option value="'+id+'" '+(game.event===id?"selected":"")+'>'+esc(v.name)+'</option>').join("")+'</select>'+
 '<p><button id="calculate" '+(game.phase!=="decisions"||game.teams.some(t=>!t.submitted)?"disabled":"")+'>Calcular y publicar resultados</button>'+
 '<button id="next" class="secondary" '+(game.phase!=="results"||game.round===5?"disabled":"")+'>Abrir siguiente ronda</button></p>'+
 '<button id="export" class="secondary">Exportar resultados CSV</button><button id="reset" class="danger">Reiniciar demostración</button></div>'+
 '<div class="card"><h2>Empresas y códigos</h2><div class="scroll"><table><thead><tr><th>Empresa</th><th>Código</th><th>Estado</th><th>Tesorería</th></tr></thead><tbody>'+
 game.teams.map(t=>'<tr><td>'+esc(t.name)+'</td><td><code>'+esc(t.code)+'</code></td><td>'+(t.submitted?"Entregado":"Pendiente")+'</td><td>'+euros(t.cash)+'</td></tr>').join("")+
 '</tbody></table></div></div>';
 if(game.results.length)body+=resultsTable(game.results.at(-1));
 if(game.results.length)body+='<div class="card"><h2>Clasificación acumulada</h2><ol>'+ranking(game).map(t=>'<li>'+esc(t.name)+' · '+t.score+' puntos · '+euros(t.cash)+'</li>').join("")+'</ol></div>';
 layout(body);
 $("scenario").onchange=e=>switchScenario(e.target.value);
 $("createScenario").onclick=()=>{
   try{
     if(!confirm("¿Crear una copia nueva de esta simulación? La partida actual se conservará."))return;
     save();
     const scenario=createScenario(CONFIG.id);
     activateScenario(scenario.id);game=readGame(scenario.id);selected=null;
     save();note("Escenario creado. Cambia sus datos en el editor y guarda la configuración.");
   }catch(e){note("No se pudo crear el escenario: "+e.message);}
 };
 $("exportScenario").onclick=()=>{
   try{
     const content=exportScenario(CONFIG.id);
     const url=URL.createObjectURL(new Blob([content],{type:"application/json;charset=utf-8"}));
     const link=document.createElement("a");link.href=url;link.download="simulacion-"+CONFIG.id+".json";
     document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
   }catch(e){note(e.message);}
 };
 $("deleteScenario").onclick=()=>{
   if(!CONFIG.id.startsWith("user-"))return;
   if(!confirm("¿Eliminar este escenario de la biblioteca local? Se eliminará también su partida en este navegador. Exporta primero el JSON si quieres conservarlo."))return;
   try{
     const id=CONFIG.id;
     deleteScenario(id);localStorage.removeItem(gameKey(id));
     activateScenario("porter");game=readGame("porter");selected=null;
     save();note("Escenario eliminado de la biblioteca.");
   }catch(e){note(e.message);}
 };
 $("importScenario").onchange=async e=>{
   const file=e.target.files?.[0];if(!file)return;
   if(file.size>150000){note("El archivo supera el límite de 150 KB.");return;}
   try{
     const raw=await file.text();
     const s=importScenario(raw);save();
     activateScenario(s.id);game=readGame(s.id);selected=null;
     save();note("Escenario importado correctamente. Puedes editarlo y jugar.");
   }catch(err){note("No se pudo importar: "+err.message);}
 };
 bindScenarioEditor(game,()=>{activateScenario("custom");note("Configuración guardada. Ya puedes jugar con sus reglas.");},err=>note("Error al guardar: "+err));
 $("event").onchange=e=>{game.event=e.target.value;save();render();};
 $("calculate").onclick=()=>{try{game=calculate(game);save();note("Ronda calculada. Resultados disponibles en este navegador.");}catch(e){note(e.message);}};
 $("next").onclick=()=>{try{game=advance(game);save();message="";render();}catch(e){note(e.message);}};
 $("reset").onclick=()=>{if(confirm("¿Reiniciar toda la partida local?")){game=newGame();selected=null;save();note("Partida reiniciada.");}};
 $("export").onclick=()=>{
 const rows=[["ronda","empresa","estrategia","ventas","cuota","ingresos","resultado_operativo","tesoreria","puntos"]];
 game.results.forEach(g=>g.rows.forEach(r=>rows.push([g.round,r.name,r.strategy,r.sold,r.share,r.revenue,r.operating,r.cash,r.score])));
 csvDownload("resultados-"+CONFIG.id+".csv","\uFEFF"+rows.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(";")).join("\n"));
 };
}
function student(){
 if(selected&&!game.teams.some(t=>t.id===selected))selected=null;
 if(!selected){
  layout('<div class="card"><h2>Acceso a la empresa</h2><p>Introduce un código de demostración proporcionado por el profesor. Solo funciona como identificación local, no como contraseña segura.</p><label for="code">Código de equipo</label><input id="code" autocomplete="off" placeholder="EQUIPO1"><button id="login">Entrar</button></div>');
  $("login").onclick=()=>{const team=game.teams.find(t=>t.code.toLowerCase()===$("code").value.trim().toLowerCase());if(!team){note("Código no válido.");return;}selected=team.id;message="";render();};
  return;
 }
 const t=game.teams.find(t=>t.id===selected),d=t.decision||Object.fromEntries(CONFIG.decisions.map(f=>[f.id,f.initial]));
 let body='<div class="card"><h2>'+esc(t.name)+'</h2>'+cards(t)+'<button class="secondary" id="logout">Cambiar de equipo</button></div>';
 if(game.phase==="results"){
  body+='<div class="success">El profesor ha publicado los resultados de la ronda.</div>'+resultsTable(game.results.at(-1));
 }else if(t.submitted){
  body+='<div class="success">Decisiones entregadas. Espera a que el profesor calcule los resultados.</div>';
 }else{
  body+='<div class="card"><h2>Decisiones estratégicas</h2><p>Selecciona el posicionamiento de tu empresa. Los efectos se acumulan durante las cinco rondas.</p><form id="decisionForm"><label for="strategy">Estrategia competitiva</label><select name="strategy" id="strategy">'+CONFIG.strategies.map(s=>'<option value="'+s.id+'" '+((t.decision?.strategy||"cost")===s.id?"selected":"")+'>'+esc(s.name)+'</option>').join("")+'</select><div class="grid">'+
  CONFIG.decisions.map(f=>'<div><label for="'+f.id+'">'+esc(f.label)+'</label><input type="number" required id="'+f.id+'" name="'+f.id+'" min="'+f.min+'" max="'+f.max+'" step="'+f.step+'" value="'+d[f.id]+'"></div>').join("")+
  '</div><p id="budget" class="alert"></p><button type="submit">Enviar decisiones</button></form></div>';
 }
 if(t.history.length)body+='<div class="card"><h2>Historial de la empresa</h2><div class="scroll"><table><thead><tr><th>Ronda</th><th>Ventas</th><th>Resultado</th><th>Puntos</th></tr></thead><tbody>'+t.history.map(h=>'<tr><td>'+h.round+'</td><td>'+h.sold.toLocaleString("es-ES")+'</td><td>'+euros(h.operating)+'</td><td>'+h.score+'</td></tr>').join("")+'</tbody></table></div></div>';
 layout(body);
 $("logout").onclick=()=>{selected=null;message="";render();};
 const form=$("decisionForm");
 if(form){
  const read=()=>Object.fromEntries([["strategy",form.elements.strategy.value],...CONFIG.decisions.map(f=>[f.id,Number(form.elements[f.id].value)])]);
  const budget=()=>{$("budget").textContent="Inversión total: "+euros(investment(read()))+" · Disponible para invertir: "+euros(Math.max(0,t.cash-10000));};
  form.oninput=budget;budget();
  form.onsubmit=e=>{e.preventDefault();const decision=read(),error=validate(t,decision);if(error){note(error);return;}t.decision=decision;t.submitted=true;save();note("Decisiones entregadas correctamente.");};
 }
}
function render(){portal==="profesor"?teacher():student();}
render();
