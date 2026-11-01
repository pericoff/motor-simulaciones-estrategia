export const CONFIG = {
  title: "Competitive Strategy Challenge",
  storageKey: "motor-estrategia-porter-v1",
  rounds: [
    {title:"Diagnóstico y posicionamiento",description:"Define tu posición en el mercado y asigna recursos iniciales."},
    {title:"Recursos y capacidades",description:"Refuerza las capacidades que sustentan tu ventaja competitiva."},
    {title:"Crecimiento",description:"Equilibra inversión en capacidad y demanda."},
    {title:"Crisis y adaptación",description:"Adapta tu estrategia ante la incertidumbre."},
    {title:"Consolidación",description:"Protege la liquidez y consolida tu ventaja."}
  ],
  events: {
    normal:{name:"Mercado estable",demand:1,cost:1,quality:0,innovation:0},
    recession:{name:"Recesión",demand:.8,cost:1,quality:0,innovation:0},
    supply:{name:"Crisis de suministros",demand:1,cost:1.22,quality:0,innovation:0},
    quality:{name:"Clientes exigentes",demand:1,cost:1,quality:.28,innovation:0},
    disruption:{name:"Disrupción tecnológica",demand:1.08,cost:1,quality:0,innovation:.36}
  },
  strategies: [
    {id:"cost",name:"Liderazgo en costes"},
    {id:"different",name:"Diferenciación"},
    {id:"focus",name:"Enfoque"}
  ],
  decisions: [
    {id:"price",label:"Precio por unidad (€)",min:60,max:160,step:5,initial:105,kind:"price"},
    {id:"marketing",label:"Marketing y marca (€)",min:0,max:30000,step:5000,initial:10000},
    {id:"quality",label:"Calidad (€)",min:0,max:30000,step:5000,initial:10000},
    {id:"efficiency",label:"Eficiencia (€)",min:0,max:30000,step:5000,initial:10000},
    {id:"innovation",label:"Innovación (€)",min:0,max:30000,step:5000,initial:5000},
    {id:"capacity",label:"Ampliación de capacidad (€)",min:0,max:30000,step:5000,initial:5000}
  ]
};
