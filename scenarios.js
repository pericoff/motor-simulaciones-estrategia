// Catálogo docente: cada escenario define narrativas y parámetros del mismo motor.
// Los coeficientes son supuestos pedagógicos calibrables, no predicciones empíricas.
const fields=(names)=>[
 {id:"price",label:names[0],min:60,max:160,step:5,initial:105,kind:"price"},
 ...["marketing","quality","efficiency","innovation","capacity"].map((id,i)=>({id,label:names[i+1]+" (€)",min:0,max:30000,step:5000,initial:[10000,10000,10000,5000,5000][i]}))
];
export const SCENARIOS={
 porter:{
  id:"porter",title:"Estrategias competitivas de Porter",sector:"Mercado de bienes de consumo",
  description:"Compite por precio, diferenciación y especialización en un mercado compartido.",
  rounds:[
   {title:"Diagnóstico y posicionamiento",description:"Define tu posición en el mercado y asigna recursos iniciales."},
   {title:"Recursos y capacidades",description:"Refuerza las capacidades que sustentan tu ventaja competitiva."},
   {title:"Crecimiento",description:"Equilibra inversión en capacidad y demanda."},
   {title:"Crisis y adaptación",description:"Adapta tu estrategia ante la incertidumbre."},
   {title:"Consolidación",description:"Protege la liquidez y consolida tu ventaja."}
  ],
  events:{
   normal:{name:"Mercado estable",demand:1,cost:1,quality:0,innovation:0},
   recession:{name:"Recesión",demand:.8,cost:1,quality:0,innovation:0},
   supply:{name:"Crisis de suministros",demand:1,cost:1.22,quality:0,innovation:0},
   quality:{name:"Clientes exigentes",demand:1,cost:1,quality:.28,innovation:0},
   disruption:{name:"Disrupción tecnológica",demand:1.08,cost:1,quality:0,innovation:.36}
  },
  strategies:[
   {id:"cost",name:"Liderazgo en costes",trait:"efficiency"},
   {id:"different",name:"Diferenciación",trait:"quality"},
   {id:"focus",name:"Enfoque",trait:"brand"}
  ],
  decisions:fields(["Precio por unidad (€)","Marketing y marca","Calidad","Eficiencia","Innovación","Ampliación de capacidad"]),
  model:{market:50000,baseCost:89,priceSensitivity:38,baselinePrice:100,fixedCost:18000,marketingEffect:.011,qualityEffect:.012,innovationEffect:.008,efficiencyCostEffect:.32,capacityFactor:.5,alignmentBonus:.18}
 },
 global:{
  id:"global",title:"Global Expansion Challenge",sector:"Empresas exportadoras",
  description:"Selecciona vías de entrada exterior, invierte en adaptación y gestiona riesgos internacionales.",
  rounds:[
   {title:"Análisis de mercados exteriores",description:"Elige tu modo de entrada y el compromiso inicial de recursos."},
   {title:"Adaptación internacional",description:"Invierte en marca local, adaptación y capacidades transfronterizas."},
   {title:"Expansión geográfica",description:"Aumenta tu alcance sin sobrepasar tu capacidad operativa."},
   {title:"Riesgo internacional",description:"Responde a restricciones logísticas, divisas y cambios de demanda."},
   {title:"Consolidación global",description:"Optimiza el equilibrio entre alcance, costes y resiliencia."}
  ],
  events:{
   normal:{name:"Comercio internacional estable",demand:1,cost:1,quality:0,innovation:0},
   tariffs:{name:"Nuevos aranceles",demand:.94,cost:1.25,quality:0,innovation:0},
   currency:{name:"Depreciación cambiaria",demand:1.08,cost:1.12,quality:0,innovation:0},
   localization:{name:"Preferencia por marcas locales",demand:1,cost:1,quality:.3,innovation:0},
   digital:{name:"Apertura de canales digitales",demand:1.12,cost:1,quality:0,innovation:.28}
  },
  strategies:[
   {id:"export",name:"Exportación gradual",trait:"efficiency"},
   {id:"alliance",name:"Alianza internacional",trait:"brand"},
   {id:"subsidiary",name:"Filial propia",trait:"capacity"}
  ],
  decisions:fields(["Precio en mercado exterior (€)","Promoción internacional","Adaptación al mercado","Optimización logística","Canales digitales","Capacidad exterior"]),
  model:{market:46000,baseCost:93,priceSensitivity:43,baselinePrice:105,fixedCost:22000,marketingEffect:.014,qualityEffect:.016,innovationEffect:.010,efficiencyCostEffect:.28,capacityFactor:.55,alignmentBonus:.20}
 },
 innovation:{
  id:"innovation",title:"Innovation & Disruption Challenge",sector:"Tecnología empresarial",
  description:"Elige entre innovación incremental, plataforma y disrupción, gestionando inversión y adopción del mercado.",
  rounds:[
   {title:"Apuesta tecnológica",description:"Escoge tu enfoque de innovación y una propuesta de valor."},
   {title:"Desarrollo del producto",description:"Destina recursos a producto, talento y notoriedad."},
   {title:"Escalabilidad",description:"Convierte la adopción tecnológica en crecimiento sostenible."},
   {title:"Disrupción competitiva",description:"Responde a cambios tecnológicos y presión de nuevos entrantes."},
   {title:"Dominio y renovación",description:"Defiende la innovación y consolida la posición en el mercado."}
  ],
  events:{
   normal:{name:"Adopción tecnológica habitual",demand:1,cost:1,quality:0,innovation:0},
   boom:{name:"Aceleración digital",demand:1.24,cost:1,quality:0,innovation:.3},
   shortage:{name:"Escasez de componentes",demand:1,cost:1.28,quality:0,innovation:0},
   regulation:{name:"Mayor exigencia regulatoria",demand:.88,cost:1.05,quality:.34,innovation:0},
   disruption:{name:"Nueva tecnología disruptiva",demand:1.08,cost:1,quality:0,innovation:.55}
  },
  strategies:[
   {id:"incremental",name:"Innovación incremental",trait:"quality"},
   {id:"platform",name:"Ecosistema y plataforma",trait:"brand"},
   {id:"disruptive",name:"Innovación disruptiva",trait:"innovation"}
  ],
  decisions:fields(["Precio de la solución (€)","Adquisición de usuarios","Experiencia de producto","Automatización","Investigación y desarrollo","Escalado operativo"]),
  model:{market:58000,baseCost:82,priceSensitivity:48,baselinePrice:110,fixedCost:27000,marketingEffect:.014,qualityEffect:.017,innovationEffect:.019,efficiencyCostEffect:.30,capacityFactor:.65,alignmentBonus:.24}
 }
};
export function scenarioById(id){return SCENARIOS[id]||SCENARIOS.porter;}
