'use strict';
// Local prototype only. No fetch, credentials, tracking or remote business writes.
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(n);
const icon = name => {
  const shapes = {
    grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    building:'M4 21V6l8-3v18M12 8h8v13M2 21h20M7 8h2M7 12h2M7 16h2M15 11h2M15 15h2M15 18v3',
    folder:'M3 7V4h6l3 3h9v13H3z',
    bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M9 21h6',
    users:'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M16 3a4 4 0 0 1 0 8M18 14a4 4 0 0 1 4 4v3',
    clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3 2',
    'check-circle':'M21 11v1a9 9 0 1 1-5-8M8 11l4 4 9-10',
    'arrow-up':'M6 18 18 6M6 6h12v12',
    chevron:'m8 10 4 4 4-4',
    logout:'M9 3H3v18h6M9 12h12M17 8l4 4-4 4',
    bank:'m3 8 9-5 9 5H3M5 11v7M10 11v7M15 11v7M20 11v7M2 21h20',
    chart:'M4 21V3M4 21h18M8 16v-5M13 16V7M18 16V4',
    sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
    lock:'M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4M12 14v3',
    edit:'m16 3 5 5-12 12-6 1 1-6zM14 5l5 5',check:'m5 12 4 4L19 6',close:'M6 6l12 12M6 18 18 6',
    plus:'M12 5v14M5 12h14',menu:'M4 6h16M4 12h16M4 18h16',arrow:'M5 12h14M14 7l5 5-5 5',
    left:'M19 12H5M10 7l-5 5 5 5',file:'M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6',
    download:'M12 3v13M7 11l5 5 5-5M4 16v5h16v-5',upload:'M12 16V3M7 8l5-5 5 5M4 15v6h16v-6',
    trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15',alert:'M12 3 2 21h20zM12 9v5M12 17h.01',
    help:'M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
    search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0'
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="${shapes[name]||shapes.file}"/></svg>`;
};
const btn = (label, action, kind='', attrs='') => `<button type="button" class="btn ${kind}" data-action="${action}" ${attrs}>${label}</button>`;
const link = (label, route, kind='') => `<a class="btn ${kind}" href="#/${route}">${label}</a>`;
const alert = (text,kind='info') => `<div class="alert ${kind}" role="${kind==='error'?'alert':'status'}"><strong class="sr-only">${kind==='error'?'Erreur : ':kind==='warn'?'À vérifier : ':''}</strong>${icon(kind==='ok'?'check':kind==='error'||kind==='warn'?'alert':'help')}<div>${text}</div></div>`;
const badge = text => {
  const kind=/expir|refus/i.test(text)?'expired':/Signé|Facturé|Clôturé|Acceptée|accordée/.test(text)?'success':/À signer|Devis envoyé/.test(text)?'sign':/attente|cours/.test(text)?'pending':'neutral';
  return `<span class="badge status-${kind}">${esc(text)}</span>`;
};
const radio = (name,value,label,checked=false,help='') => `<label class="check radio-card"><input type="radio" name="${name}" value="${esc(value)}" ${checked?'checked':''}><span><strong>${label}</strong>${help?`<small>${help}</small>`:''}</span></label>`;
const help = (title,body) => ['entity','project','questions','documents'].includes(currentRoute) ? `<div class="construction-companion">${constructionPanel()}<div class="project-help"><p>${body}</p>${btn('Besoin d’aide ?','help','tertiary')}</div></div>` : `<aside class="card help-card"><h2>${title}</h2><p>${body}</p>${btn('Contacter Pivotek','help','tertiary')}</aside>`;
const STORAGE_KEY='pivotek-wireframes-20261020-'+(window.self!==window.top||new URLSearchParams(location.search).has('view')||new URLSearchParams(location.hash.split('?')[1]).has('review')?'review':'v1');
const draftSeed={entity:'parent',project:'',type:'',phase:'',cost:'',duration:'',companies:'',pvUnit:'m²',payer:'Atelier Loire',signer:'Référent de la maison mère'};
const projectExample={
  ...draftSeed,project:'Réhabilitation Les Tilleuls',description:'Réhabilitation d’un bâtiment existant.',
  address:'12 rue des Ateliers',postal:'49000',city:'Angers',department:'49 · Maine-et-Loire',
  type:'Réhabilitation',market:'Public',consultation:'Appel d’offres',cost:'850000',lots:'6',
  companies:'6',allotment:'Lots séparés',phase:'APD',designDuration:'3',duration:'8',
  designStart:'2026-10-31',start:'2027-01-31',phaseCount:'2',occupied:'Oui',icpe:'Non',
  year:'1940',lead:'En cours',asbestos:'Oui',constraints:'Accès aux locaux à maintenir.'
};
const seed={
  role:'referent',session:false,user:{first:'Camille',last:'Martin',email:'camille@atelier-loire.example'},
  company:{name:'Atelier Loire',siren:'123456789',address:'12 rue des Ateliers, 49000 Angers',legal:'SAS',vat:'Non communiqué'},
  draft:structuredClone(draftSeed),activeId:'local-001',nextId:2,records:{},selected:[],quoted:false,bank:false,
  contractState:'Brouillon',projectFiles:[],signChecks:{accuracy:false,terms:false},registration:{},
  members:[
    {first:'Camille',last:'Martin',email:'camille@atelier-loire.example',job:'Responsable de projets',right:'Signer',status:'Acceptée'},
    {first:'Thomas',last:'Bernard',email:'thomas@atelier-loire.example',job:'Chargé d’opérations',right:'Préparer',status:'Acceptée'},
    {first:'Léa',last:'Moreau',email:'lea@atelier-loire.example',job:'Architecte',right:'Préparer',status:'Invitation expirée'}
  ],
  requests:true,domains:['atelier-loire.example'],profile:{function:'Responsable de projets',team:'1 à 20',phone:'',email:'camille@atelier-loire.example'},
  events:[],readNotifications:false,activationUsed:false
};
let state;
try {
  state={...structuredClone(seed),...(JSON.parse(localStorage.getItem(STORAGE_KEY))||{})};
  state.draft={...draftSeed,...state.draft};
  state.records ||= {}; state.signChecks ||= {accuracy:false,terms:false}; state.events ||= [];
} catch { state=structuredClone(seed); }
let scenario='normal',currentRoute='',contractSearch='',contractFilter='Tous',pageNo=1,
  importRows=[],toastTimer,opener,pendingInvite=null,pendingDomain=null,lookupMode=state.registration.mode||'new';
let storageWarning=false;
const routes=[
  ...coverage.map(x=>[x.route,x.page+' · '+x.id,x.nom]),
  ['guide','Index','Vue d’ensemble des écrans']
];
function currentRecord() {
  return {id:state.activeId,name:state.draft.project||'Nouveau projet',status:state.contractState,draft:structuredClone(state.draft),
    selected:[...state.selected],files:structuredClone(state.projectFiles),ref:state.records[state.activeId]?.ref||getFixtures().find(x=>x.id===state.activeId)?.ref||`DEV-2026-${state.activeId.toUpperCase()}`,
    date:'20 oct. 2026',price:total(),type:state.draft.type||'Projet en préparation'};
}
function save() {
  if(state.draft.project || state.draft.entityConfirmed) state.records[state.activeId]=currentRecord();
  try {localStorage.setItem(STORAGE_KEY,JSON.stringify(state));scheduleProjectVisuals();return true;}
  catch {storageWarning=true;return false;}
}
function go(route) {
  scenario='normal';
  if(location.hash===`#/${route}`)render();else location.hash=`/${route}`;
}
function toast(message) {
  $('#live').textContent=message;$('#live').classList.add('show');clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>$('#live').classList.remove('show'),6000);
}
function getFixtures() {
  return [
    ['tilleuls','Réhabilitation Les Tilleuls','À signer',['sps','drone'],'Réhabilitation','06 oct. 2026'],
    ['solaire','Ombrières du parc de Loire','Signé',['sps'],'Centrale Photovoltaïque','02 oct. 2026'],
    ['bureaux','Bureaux du quai Saint-Serge','Facturé',['sps','amo'],'Aménagement / Réfection de plateaux de bureaux','24 sept. 2026'],
    ['vrds','Accès du site des Perrières','Devis envoyé',['infra'],'VRD','22 sept. 2026'],
    ['attente','Extension atelier nord','En attente du référent',['sps'],'Industrie Extension','18 sept. 2026'],
    ['cloture','Rénovation du bâtiment sud','Clôturé',['amo'],'Industrie Rénovation','01 sept. 2026']
  ].map(([id,name,status,selected,type,date],i)=>({
    id,name,status,selected,type,date,ref:`DEV-2026-${String(20+i).padStart(3,'0')}`,
    price:services.filter(s=>selected.includes(s[0])).reduce((sum,s)=>sum+s[3],0),
    draft:{...structuredClone(projectExample),project:name,type},files:[]
  }));
}
function getContracts() {
  const records=new Map(getFixtures().map(x=>[x.id,x]));
  Object.values(state.records).forEach(x=>records.set(x.id,x));
  if(state.draft.project || state.draft.entityConfirmed)records.set(state.activeId,currentRecord());
  return [...records.values()].sort((a,b)=>a.id===state.activeId?-1:b.id===state.activeId?1:0);
}
function loadContract(id) {
  save();
  const r=getContracts().find(x=>x.id===id);
  if(!r)return false;
  state.activeId=id;state.draft=structuredClone(r.draft);state.selected=[...r.selected];
  state.projectFiles=structuredClone(r.files||[]);state.contractState=r.status;state.quoted=r.status!=='Brouillon';
  state.signChecks={accuracy:false,terms:false};save();return true;
}
function newProject() {
  save();
  state.activeId='local-'+String(state.nextId++).padStart(3,'0');state.draft=structuredClone(draftSeed);
  state.selected=[];state.quoted=false;state.contractState='Brouillon';state.projectFiles=[];
  state.signChecks={accuracy:false,terms:false};save();go('entity');
}
function readyDraft() {loadContract('tilleuls');}
function recordEvent(type,message) {state.events.unshift({type,message,at:'20 octobre 2026 · simulation'});save();}
function syncDraft(form) {
  const values=formValues(form);
  Object.assign(state.draft,values);
  const ok=save();
  $$('.save-status').forEach(x=>x.textContent=ok?'Brouillon enregistré':'Stockage indisponible : gardez cet onglet ouvert');
  return ok;
}
function openDialog(title,body,footer='',drawer=false) {
  const d=$('#dialog');
  if(!d.open)opener=document.activeElement;
  if(d.open)d.close();
  d.className=drawer?'drawer':'';
  d.innerHTML=`<header class="dialog-head"><h2 id="dialog-title">${title}</h2><button type="button" class="iconbtn" data-action="close" aria-label="Fermer">${icon('close')}</button></header><div class="dialog-body">${body}</div>${footer?`<footer class="dialog-footer">${footer}</footer>`:''}`;
  d.setAttribute('aria-labelledby','dialog-title');d.showModal();
  d.querySelector('input:not([type=hidden]),select,button')?.focus();
}
function closeDialog() {
  const d=$('#dialog');if(d.open)d.close();
  if(opener?.isConnected)opener.focus();
}
function download(name,text,type='text/plain;charset=utf-8') {
  const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');
  a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('Fichier téléchargé.');
}
function exampleDocument(invoice=false) {
  const id=new URLSearchParams(location.hash.split('?')[1]).get('id')||state.activeId;
  const r=getContracts().find(x=>x.id===id)||currentRecord();
  const title=invoice?'Facture fictive':'Document du dossier fictif';
  download(`${r.id}-${invoice?'facture':'contrat'}-exemple.html`,
    `<!doctype html><html lang="fr"><meta charset="utf-8"><title>${title}</title><style>body{font:16px/1.6 Arial;max-width:760px;margin:48px auto;padding:24px;color:#111}aside{border:1px dashed #777;padding:40px;text-align:center}</style><h1>${title}</h1><p>PROTOTYPE — sans valeur contractuelle ou comptable.</p><h2>${esc(r.name)}</h2><p>${esc(r.ref)} · ${esc(r.status)}</p><p>Entreprise : ${esc(state.company.name)}</p><aside>[Document PDF de production]</aside><p>Total illustratif : ${money(r.price)} HT</p><p>Aucune prestation commandée, signature ou facture réelle.</p></html>`,'text/html;charset=utf-8');
}
function invalidateQuote() {
  if(!['Signé','Facturé','Clôturé'].includes(state.contractState))state.contractState='Brouillon';
  state.quoted=false;state.signChecks={accuracy:false,terms:false};
}
function validIban(value) {
  const s=value.replace(/\s/g,'').toUpperCase();
  if(!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s))return false;
  const rotated=(s.slice(4)+s.slice(0,4)).replace(/[A-Z]/g,c=>String(c.charCodeAt(0)-55));
  let mod=0;for(const digit of rotated)mod=(mod*10+Number(digit))%97;
  return mod===1;
}
async function readXlsx(file) {
  // ZIP/OOXML reader: no third-party dependency, no macro or formula execution.
  const buffer=await file.arrayBuffer(),view=new DataView(buffer),bytes=new Uint8Array(buffer);
  let end=buffer.byteLength-22;
  while(end>=Math.max(0,buffer.byteLength-65557)&&view.getUint32(end,true)!==0x06054b50)end--;
  if(end<0)throw Error('Le classeur XLSX est illisible.');
  let pos=view.getUint32(end+16,true),count=view.getUint16(end+10,true);
  const entries=new Map();
  for(let i=0;i<count;i++){
    if(view.getUint32(pos,true)!==0x02014b50)throw Error('Archive XLSX non reconnue.');
    const method=view.getUint16(pos+10,true),size=view.getUint32(pos+20,true),expanded=view.getUint32(pos+24,true);
    const nl=view.getUint16(pos+28,true),el=view.getUint16(pos+30,true),cl=view.getUint16(pos+32,true),offset=view.getUint32(pos+42,true);
    const name=new TextDecoder().decode(bytes.subarray(pos+46,pos+46+nl));
    entries.set(name,{method,size,expanded,offset});pos+=46+nl+el+cl;
  }
  async function xml(name) {
    const item=entries.get(name);if(!item)return null;
    if(item.expanded>8*1024*1024)throw Error('Classeur trop volumineux pour cet aperçu. Utilisez un CSV.');
    const begin=item.offset+30+view.getUint16(item.offset+26,true)+view.getUint16(item.offset+28,true);
    const packed=bytes.subarray(begin,begin+item.size);let raw;
    if(item.method===0)raw=packed;
    else if(item.method===8)raw=new Uint8Array(await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    else throw Error('Compression non prise en charge. Utilisez le modèle CSV.');
    return new DOMParser().parseFromString(new TextDecoder().decode(raw),'application/xml');
  }
  const stringsDoc=await xml('xl/sharedStrings.xml');
  const shared=stringsDoc?[...stringsDoc.getElementsByTagName('si')].map(x=>x.textContent):[];
  const book=await xml('xl/workbook.xml'),rels=await xml('xl/_rels/workbook.xml.rels');
  const first=book?.getElementsByTagName('sheet')[0],relId=first?.getAttribute('r:id');
  const relation=[...(rels?.getElementsByTagName('Relationship')||[])].find(x=>x.getAttribute('Id')===relId);
  let target=relation?.getAttribute('Target')||'worksheets/sheet1.xml';
  target=target.startsWith('/')?target.slice(1):'xl/'+target.replace(/^\.\//,'');
  const sheet=await xml(target);if(!sheet)throw Error('Premier onglet introuvable. Utilisez le modèle CSV.');
  return [...sheet.getElementsByTagName('row')].map(row=>{
    const out=[];
    for(const c of row.getElementsByTagName('c')){
      const letters=(c.getAttribute('r')||'A').match(/^[A-Z]+/)[0];
      let column=0;for(const letter of letters)column=column*26+letter.charCodeAt(0)-64;
      const value=c.getElementsByTagName('v')[0]?.textContent||'';
      out[column-1]=c.getAttribute('t')==='s'?shared[Number(value)]||'':c.getAttribute('t')==='inlineStr'?(c.getElementsByTagName('is')[0]?.textContent||''):value;
    }
    return out;
  });
}
