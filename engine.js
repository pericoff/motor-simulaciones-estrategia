import {CONFIG} from "./config.js";
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const euros=n=>Number(n).toLocaleString("es-ES",{style:"currency",currency:"EUR",maximumFractionDigits:0});
export function newGame(){
  return {scenarioId:CONFIG.id,round:1,phase:"decisions",event:"normal",teams:Array.from({length:4},(_,i)=>({
    id:i+1,name:"Empresa "+(i+1),code:"EQUIPO"+(i+1),cash:250000,
    quality:50,brand:50,efficiency:50,innovation:40,capacity:15000,
    decision:null,submitted:false,history:[]
  })),results:[]};
}
export const investment=d=>CONFIG.decisions.reduce((s,f)=>s+(f.kind==="price"?0:Number(d[f.id]||0)),0);
export function validate(t,d){
  if(!d||!CONFIG.strategies.some(s=>s.id===d.strategy))return "Selecciona una estrategia.";
  for(const f of CONFIG.decisions){
    const v=Number(d[f.id]);
    if(!Number.isFinite(v)||v<f.min||v>f.max||Math.abs((v-f.min)/f.step-Math.round((v-f.min)/f.step))>1e-8)return "Valor incorrecto: "+f.label;
  }
  if(investment(d)>t.cash-10000)return "La inversión debe dejar 10.000 € de reserva.";
  return "";
}
export function calculate(game){
  if((game.scenarioId||"porter")!==CONFIG.id)throw Error("La partida no corresponde al escenario actual.");
  if(game.phase!=="decisions"||game.teams.some(t=>!t.submitted||validate(t,t.decision)))throw Error("Faltan decisiones válidas de las cuatro empresas.");
  const ev=CONFIG.events[game.event];
  if(!ev)throw Error("Acontecimiento no válido.");
  const m=CONFIG.model,market=Math.round(m.market*ev.demand);
  const plans=game.teams.map(t=>{
    const d=t.decision;
    const quality=clamp(t.quality+d.quality/2600,0,100);
    const brand=clamp(t.brand+d.marketing/2600,0,100);
    const efficiency=clamp(t.efficiency+d.efficiency/2400,0,100);
    const innovation=clamp(t.innovation+d.innovation/2400,0,100);
    const capacity=t.capacity+d.capacity*m.capacityFactor,price=Number(d.price),unitCost=Math.max(37,(m.baseCost-efficiency*m.efficiencyCostEffect)*ev.cost);
    const trait=CONFIG.strategies.find(s=>s.id===d.strategy)?.trait;
    const index={quality,brand,efficiency,innovation,capacity:Math.min(100,capacity/225)}[trait]||50;
    const strategy=1+(index-45)/55*m.alignmentBonus;
    const weight=Math.max(.01,Math.exp(-(price-m.baselinePrice)/m.priceSensitivity)*
      (1+(quality-50)*(m.qualityEffect+ev.quality*.022))*
      (1+(innovation-40)*(m.innovationEffect+ev.innovation*.025))*
      (1+(brand-50)*m.marketingEffect)*strategy);
    return {t,d,quality,brand,efficiency,innovation,capacity,price,unitCost,weight};
  });
  const total=plans.reduce((s,p)=>s+p.weight,0);
  const rows=plans.map(p=>{
    const sold=Math.max(0,Math.round(Math.min(p.capacity,market*p.weight/total)));
    const revenue=sold*p.price,operating=revenue-sold*p.unitCost-m.fixedCost;
    const cash=Math.round(p.t.cash-investment(p.d)+operating);
    const share=sold/market*100,margin=revenue?operating/revenue*100:0;
    const score=Math.round((clamp(share*1.25,0,40)+clamp(margin*.55,0,25)+p.quality*.13+p.innovation*.13)*10)/10;
    return {id:p.t.id,name:p.t.name,strategy:p.d.strategy,sold,share:Math.round(share*10)/10,revenue:Math.round(revenue),operating:Math.round(operating),cash,score,quality:p.quality,brand:p.brand,efficiency:p.efficiency,innovation:p.innovation,capacity:p.capacity,price:p.price};
  });
  const result=structuredClone(game);
  for(const r of rows){const t=result.teams.find(t=>t.id===r.id);Object.assign(t,{cash:r.cash,quality:r.quality,brand:r.brand,efficiency:r.efficiency,innovation:r.innovation,capacity:r.capacity});t.history.push({round:game.round,...r});}
  result.results.push({round:game.round,event:game.event,market,rows});result.phase="results";return result;
}
export function advance(game){
  if(game.phase!=="results"||game.round>=5)throw Error("No se puede avanzar.");
  const g=structuredClone(game);g.round++;g.phase="decisions";g.event="normal";g.teams.forEach(t=>{t.submitted=false;t.decision=null;});return g;
}
export function ranking(game){return game.teams.map(t=>({name:t.name,cash:t.cash,score:Math.round(t.history.reduce((n,r)=>n+r.score,0)*10)/10})).sort((a,b)=>b.score-a.score);}
