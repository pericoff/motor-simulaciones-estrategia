import test from "node:test";
import assert from "node:assert/strict";
import {parseVideoUrl,blankVideoConfig,validateVideoConfig,writeVideos,readVideos,exportVideoConfig,importVideoConfig,loadPublishedVideos} from "../video-config.js";

function memoryStorage(){
 const data=new Map();
 return {getItem:key=>data.get(key)??null,setItem:(key,val)=>data.set(key,val)};
}
test("enlaces HTTPS de YouTube, Vimeo, Drive y MP4",()=>{
 assert.equal(parseVideoUrl("https://youtu.be/_DbF1xeQ8cU").src,"https://www.youtube-nocookie.com/embed/_DbF1xeQ8cU");
 assert.equal(parseVideoUrl("https://www.youtube.com/watch?v=_DbF1xeQ8cU").type,"iframe");
 assert.equal(parseVideoUrl("https://vimeo.com/123456789").src,"https://player.vimeo.com/video/123456789");
 assert.equal(parseVideoUrl("https://drive.google.com/file/d/1r_3Wj4kIIcuaypvuhChwVVQ2ulkFm1dZ/view").src,"https://drive.google.com/file/d/1r_3Wj4kIIcuaypvuhChwVVQ2ulkFm1dZ/preview");
 assert.equal(parseVideoUrl("https://example.org/video.mp4").type,"video");
 assert.equal(parseVideoUrl(""),null);
});
test("rechaza URL inseguras o servicios no compatibles",()=>{
 for(const link of ["javascript:alert(1)","http://youtu.be/_DbF1xeQ8cU","https://malicioso.org/watch?v=_DbF1xeQ8cU","https://youtube.com/watch?v=falso"]){
  assert.throws(()=>parseVideoUrl(link));
 }
});
test("seis espacios con persistencia y exportación independiente por escenario",()=>{
 const storage=memoryStorage(),conf=blankVideoConfig();
 assert.equal(Object.keys(conf).length,6);
 conf.presentation="https://youtu.be/_DbF1xeQ8cU";
 conf.round4="https://vimeo.com/123456789";
 writeVideos("repaso-temas-2-5",conf,storage);
 assert.equal(readVideos("repaso-temas-2-5",storage).round4,conf.round4);
 assert.equal(readVideos("porter",storage).presentation,"");
 const raw=exportVideoConfig("repaso-temas-2-5",storage);
 importVideoConfig(raw,"porter",storage);
 assert.equal(readVideos("porter",storage).presentation,conf.presentation);
 assert.throws(()=>importVideoConfig("{}", "porter",storage),/formato/);
});
test("configuración inválida no sobrescribe enlaces guardados",()=>{
 const storage=memoryStorage(),conf=blankVideoConfig();
 conf.round1="https://youtu.be/_DbF1xeQ8cU";
 writeVideos("porter",conf,storage);
 assert.throws(()=>writeVideos("porter",{...conf,round2:"https://fake.test/video"},storage));
 assert.equal(readVideos("porter",storage).round1,conf.round1);
});

test("configuración pública compartida y prioridad de los ajustes locales",async()=>{
 const published=blankVideoConfig();
 published.presentation="https://youtu.be/_DbF1xeQ8cU";
 const loaded=await loadPublishedVideos(async()=>({ok:true,json:async()=>({porter:published})}));
 assert.equal(loaded,true);
 const storage=memoryStorage();
 assert.equal(readVideos("porter",storage).presentation,published.presentation);
 const local=blankVideoConfig();local.round1="https://vimeo.com/123456789";
 writeVideos("porter",local,storage);
 assert.equal(readVideos("porter",storage).presentation,"");
 assert.equal(readVideos("porter",storage).round1,local.round1);
});
