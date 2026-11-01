// Configuración de vídeos por escenario (almacenamiento local + portabilidad JSON).
// Se aceptan únicamente URLs HTTPS de YouTube, Vimeo, Google Drive y archivos .mp4 HTTPS.
export const VIDEO_KEY_PREFIX="motor-videos-v1-";
let publishedVideos=Object.create(null);
export async function loadPublishedVideos(fetcher=fetch){
 try{
  const response=await fetcher("./videos.json",{cache:"no-cache"});
  if(!response.ok)return false;
  const data=await response.json();
  if(!data||typeof data!=="object"||Array.isArray(data))return false;
  const next=Object.create(null);
  for(const [id,value] of Object.entries(data)){
   if(!/^[a-z0-9-]{1,80}$/.test(id))continue;
   try{next[id]=validateVideoConfig(value);}catch{}
  }
  publishedVideos=next;return true;
 }catch{return false;}
}

export const VIDEO_SLOTS=[
 {id:"presentation",label:"Vídeo 0 · Presentación general"},
 {id:"round1",label:"Vídeo 1 · Entorno empresarial"},
 {id:"round2",label:"Vídeo 2 · Análisis interno y capacidades"},
 {id:"round3",label:"Vídeo 3 · Objetivos y creación de valor"},
 {id:"round4",label:"Vídeo 4 · Estrategia competitiva"},
 {id:"round5",label:"Vídeo 5 · Decisiones bajo incertidumbre"}
];
const clean=s=>String(s??"").trim();
export function parseVideoUrl(input){
 const raw=clean(input);
 if(!raw)return null;
 let url;
 try{url=new URL(raw);}catch{throw Error("Introduce un enlace HTTPS válido.");}
 if(url.protocol!=="https:")throw Error("Solo se permiten enlaces HTTPS.");
 const h=url.hostname.toLowerCase().replace(/^www\./,"").replace(/^m\./,"");
 const segments=url.pathname.split("/").filter(Boolean);
 const youtubeId=h==="youtu.be"?segments[0]:
  ["youtube.com","youtube-nocookie.com"].includes(h)?(
   segments[0]==="watch"?url.searchParams.get("v"):
   ["embed","shorts","live"].includes(segments[0])?segments[1]:null
  ):null;
 if(youtubeId){
  if(!/^[a-zA-Z0-9_-]{11}$/.test(youtubeId))throw Error("Identificador de YouTube no válido.");
  return {type:"iframe",src:"https://www.youtube-nocookie.com/embed/"+youtubeId,label:"YouTube",url:raw};
 }
 if(["youtube.com","youtube-nocookie.com","youtu.be"].includes(h))throw Error("Este enlace de YouTube no apunta a un vídeo.");
 if(h==="vimeo.com"||h==="player.vimeo.com"){
  const id=h==="vimeo.com"?segments[0]:segments[0]==="video"?segments[1]:null;
  if(!/^\d{6,12}$/.test(id||""))throw Error("Enlace de Vimeo no válido.");
  return {type:"iframe",src:"https://player.vimeo.com/video/"+id,label:"Vimeo",url:raw};
 }
 if(h==="drive.google.com"){
  const id=segments[0]==="file"&&segments[1]==="d"?segments[2]:
   segments[0]==="open"||segments[0]==="uc"?url.searchParams.get("id"):null;
  if(!/^[\w-]{15,120}$/.test(id||""))throw Error("Usa un enlace de archivo de vídeo de Google Drive.");
  return {type:"iframe",src:"https://drive.google.com/file/d/"+id+"/preview",label:"Google Drive",url:raw};
 }
 if(/\.mp4$/i.test(url.pathname)&&!url.username&&!url.password){
  return {type:"video",src:raw,label:"Vídeo MP4",url:raw};
 }
 throw Error("Formato no admitido. Usa YouTube, Vimeo, Google Drive o un enlace directo MP4.");
}
export const videoKey=id=>VIDEO_KEY_PREFIX+id;
export function blankVideoConfig(){
 return Object.fromEntries(VIDEO_SLOTS.map(v=>[v.id,""]));
}
export function validateVideoConfig(input){
 if(!input||typeof input!=="object"||Array.isArray(input))throw Error("La configuración de vídeos no es válida.");
 const result=blankVideoConfig();
 for(const slot of VIDEO_SLOTS){
  const value=input[slot.id]??"";
  if(typeof value!=="string"||value.length>2048)throw Error("Enlace demasiado largo o no válido: "+slot.label);
  if(value.trim())parseVideoUrl(value);
  result[slot.id]=value.trim();
 }
 return result;
}
export function readVideos(scenarioId,storage=localStorage){
 try{
  const raw=storage.getItem(videoKey(scenarioId));
  return raw?validateVideoConfig(JSON.parse(raw)):(publishedVideos[scenarioId]||blankVideoConfig());
 }catch{return publishedVideos[scenarioId]||blankVideoConfig();}
}
export function writeVideos(scenarioId,config,storage=localStorage){
 const valid=validateVideoConfig(config);
 storage.setItem(videoKey(scenarioId),JSON.stringify(valid));
 return valid;
}
export function exportVideoConfig(scenarioId,storage=localStorage){
 return JSON.stringify({format:"motor-estrategia-videos",version:1,scenarioId,videos:readVideos(scenarioId,storage)},null,2);
}
export function importVideoConfig(raw,scenarioId,storage=localStorage){
 if(typeof raw!=="string"||raw.length>20000)throw Error("Archivo de configuración demasiado grande.");
 let data;
 try{data=JSON.parse(raw);}catch{throw Error("El archivo no es un JSON válido.");}
 if(data?.format!=="motor-estrategia-videos"||data.version!==1)throw Error("El archivo no tiene el formato de vídeos del motor.");
 return writeVideos(scenarioId,data.videos,storage);
}
