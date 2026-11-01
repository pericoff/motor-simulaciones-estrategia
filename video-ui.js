import {VIDEO_SLOTS,readVideos,writeVideos,parseVideoUrl,exportVideoConfig,importVideoConfig} from "./video-config.js";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $=id=>document.getElementById(id);
const download=(name,content)=>{
 const blob=new Blob([content],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
};
export function videoPlayer(url,title){
 if(!url)return "";
 let info;
 try{info=parseVideoUrl(url);}catch{return '<div class="alert">El enlace de vídeo configurado no es compatible.</div>';}
 if(!info)return "";
 const player=info.type==="video"?
  '<video controls preload="metadata" playsinline src="'+esc(info.src)+'"></video>':
  '<iframe loading="lazy" src="'+esc(info.src)+'" title="'+esc(title)+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
 return '<div class="video-panel"><div class="video-frame">'+player+'</div><p class="muted">Fuente: '+esc(info.label)+' · <a href="'+esc(info.url)+'" target="_blank" rel="noopener noreferrer">Abrir vídeo en otra pestaña</a></p></div>';
}
export function studentVideos(scenarioId,round,includePresentation=true){
 const videos=readVideos(scenarioId),intro=includePresentation&&videos.presentation?'<div class="card"><h2>Presentación de la simulación</h2>'+videoPlayer(videos.presentation,"Presentación general")+'</div>':"";
 const key="round"+round;
 const slot=VIDEO_SLOTS.find(x=>x.id===key);
 const current=videos[key]?'<div class="card"><h2>'+esc(slot?.label||"Vídeo de la ronda")+'</h2>'+videoPlayer(videos[key],slot?.label||"Vídeo de la ronda")+'</div>':"";
 return intro+current;
}
export function teacherVideoSettings(scenarioId){
 const videos=readVideos(scenarioId);
 let html='<div class="card"><h2>Vídeos docentes · Presentación y cinco rondas</h2>'+
 '<p>Introduce enlaces de YouTube, Vimeo, vídeos de Google Drive o archivos MP4 accesibles por HTTPS. Puedes dejar espacios vacíos y completarlos más adelante.</p>'+
 '<p class="muted">Los enlaces se guardan en este navegador. Para trasladar la configuración a otro dispositivo, exporta el JSON y vuelve a importarlo allí. No se publican automáticamente en GitHub.</p>'+
 '<form id="videoLinksForm">';
 for(const slot of VIDEO_SLOTS){
  const val=videos[slot.id];
  html+='<div class="video-setting"><label for="video_'+slot.id+'">'+esc(slot.label)+'</label>'+
   '<input type="url" name="'+slot.id+'" id="video_'+slot.id+'" placeholder="https://youtu.be/..." value="'+esc(val)+'" maxlength="2048">'+
   (val?'<div class="video-small-preview">'+videoPlayer(val,slot.label)+'</div>':'<p class="muted">Sin vídeo configurado.</p>')+
   '</div>';
 }
 html+='<button type="submit">Guardar enlaces de vídeos</button><button type="button" class="secondary" id="exportVideos">Exportar configuración JSON</button></form>'+
 '<label for="importVideos">Importar configuración de vídeos (.json)</label><input id="importVideos" type="file" accept=".json,application/json">'+
 '<p class="muted">Para Google Drive, el archivo debe tener permisos que permitan verlo; algunos proveedores impiden la reproducción integrada. En ese caso, utiliza el enlace para abrirlo en otra pestaña.</p></div>';
 return html;
}
export function bindTeacherVideoSettings(scenarioId,onSuccess,onError){
 const form=$("videoLinksForm");if(!form)return;
 form.onsubmit=e=>{
  e.preventDefault();
  try{
   const values=Object.fromEntries(VIDEO_SLOTS.map(s=>[s.id,form.elements[s.id].value]));
   writeVideos(scenarioId,values);
   onSuccess("Enlaces de vídeos guardados para este escenario.");
  }catch(err){onError(err.message);}
 };
 $("exportVideos").onclick=()=>{
  try{download("videos-"+scenarioId+".json",exportVideoConfig(scenarioId));}
  catch(err){onError(err.message);}
 };
 $("importVideos").onchange=async e=>{
  const file=e.target.files?.[0];if(!file)return;
  if(file.size>20000){onError("El archivo supera 20 KB.");return;}
  try{importVideoConfig(await file.text(),scenarioId);onSuccess("Configuración de vídeos importada y guardada.");}
  catch(err){onError(err.message);}
 };
}
