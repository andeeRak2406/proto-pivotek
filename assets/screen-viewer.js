'use strict';
const viewRoot=document.querySelector('#screen-root');
const query=new URLSearchParams(location.search);
const reviewTools=query.get('revue')!=='0';
let selectedScreen=coverage.find(x=>x.id===document.body.dataset.screen)||coverage[0];
let selectedFormat=['desktop','tablet','mobile'].includes(query.get('format'))?query.get('format'):'fluid';
let selectedRole=['referent','preparer','signer'].includes(query.get('role'))?query.get('role'):'referent';
let selectedState=query.get('etat')||'normal';
let lastTrigger;
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function spec(){return interactionSpecs[selectedScreen.id]}
function screenUrl(screen,extras=''){return screen.file+(extras?'?'+extras:'')}
function frameUrl(){
  const [base,params='']=selectedScreen.route.split('?'),p=new URLSearchParams(params);
  p.set('embed','1');p.set('review','1');p.set('role',selectedRole);p.set('state',selectedState);p.set('reviewScreen',selectedScreen.id);
  return '../index.html?view='+encodeURIComponent(selectedScreen.id+'-'+selectedState+'-'+selectedRole)+'#/'+base+'?'+p;
}
function stateOptions(){return spec().states.map(([value,label])=>`<option value="${value}" ${selectedState===value?'selected':''}>${label}</option>`).join('')}
function notes(){
  return `<header><div><p class="spec-kicker">Interactions UX · ${selectedScreen.id}</p><h2 id="spec-title">${safe(selectedScreen.nom)}</h2></div><button type="button" class="viewer-button" id="close-spec" aria-label="Fermer les interactions">✕</button></header><div class="spec-body"><p>${safe(selectedScreen.objectif)}.</p><div class="spec-rule"><strong>Règle de la note UX</strong><br>${safe(selectedScreen.regles)}.</div><h3>Actions et transitions</h3>${spec().items.map(([control,event,result,target],i)=>{
    const destination=coverage.find(x=>x.id===target||x.route===target);
    const link=destination?`<a href="${destination.file}">Ouvrir ${destination.id} · ${safe(destination.nom)} →</a>`:target?`<a href="../index.html#/${target}" target="_blank" rel="noopener">Ouvrir l’état associé →</a>`:'';
    return `<article class="interaction-item"><h3><span class="interaction-number">${String(i+1).padStart(2,'0')}</span>${safe(control)}</h3><span class="trigger">${safe(event)}</span><p>${safe(result)}</p>${link}</article>`;
  }).join('')}<h3>États à prévoir dans Figma</h3><p>${safe(selectedScreen.etats)}.</p><h3>Pour reconstruire cet écran</h3><ul class="spec-states"><li>Desktop : largeur de référence 1440 px ; mobile : 390 px.</li><li>Créer les variantes des champs, boutons et statuts décrites ci-dessus.</li><li>Relier les actions aux écrans cibles ; les panneaux utilisent un overlay latéral.</li><li>La couleur soutient les libellés, sans remplacer les indications de statut.</li></ul><p class="spec-footer">${safe(selectedScreen.source)}. Les prix, données, e-mails et signatures restent simulés. Cet HTML est une référence de conception ; aucun fichier Figma n’est créé.</p></div>`;
}
function renderViewer(){
  const i=coverage.indexOf(selectedScreen);
  if(!reviewTools){
    document.body.classList.add('client-presentation');
    viewRoot.innerHTML=`<main class="screen-stage" id="screen-stage"><iframe class="screen-frame" id="screen-frame" title="${safe(selectedScreen.nom)}" src="${frameUrl()}"></iframe></main>`;
    document.title=selectedScreen.nom+' · Pivotek Anjou';
    return;
  }
  viewRoot.innerHTML=`<header class="screen-toolbar"><a class="screen-home" href="../index.html#/guide">← Tous les écrans</a><div class="screen-picker"><label for="screen-select">Page</label><select id="screen-select">${screenGroups.map(([page,title])=>`<optgroup label="${safe(title)}">${coverage.filter(x=>x.page===page).map(x=>`<option value="${x.id}" ${x.id===selectedScreen.id?'selected':''}>${x.id} · ${safe(x.nom)}</option>`).join('')}${page==='REVUE'?'<option value="index">Index de tous les écrans</option>':''}</optgroup>`).join('')}</select></div><div class="screen-option"><label for="screen-state">État</label><select id="screen-state">${stateOptions()}</select></div><div class="screen-option"><label for="screen-role">Profil</label><select id="screen-role">${[['referent','Référent'],['preparer','Préparateur'],['signer','Signataire']].map(([v,l])=>`<option value="${v}" ${v===selectedRole?'selected':''}>${l}</option>`).join('')}</select></div><div class="screen-option"><label for="screen-format">Largeur</label><select id="screen-format">${[['fluid','Fenêtre'],['desktop','Desktop · 1440'],['tablet','Tablette · 768'],['mobile','Mobile · 390']].map(([v,l])=>`<option value="${v}" ${v===selectedFormat?'selected':''}>${l}</option>`).join('')}</select></div><div class="screen-tools"><button class="viewer-button primary" id="show-spec">Interactions UX</button><a class="viewer-button" id="open-alone" href="${frameUrl()}" target="_blank" rel="noopener">Écran seul ↗</a><div class="screen-prev-next"><button class="viewer-button" id="prev-screen" aria-label="Écran précédent" ${i===0?'disabled':''}>←</button><button class="viewer-button" id="next-screen" aria-label="Écran suivant" ${i===coverage.length-1?'disabled':''}>→</button></div></div></header><main class="screen-stage" id="screen-stage" data-format="${selectedFormat}"><iframe class="screen-frame" id="screen-frame" title="${safe(selectedScreen.id+' '+selectedScreen.nom)}" src="${frameUrl()}"></iframe></main><dialog class="viewer-dialog" id="interaction-dialog" aria-labelledby="spec-title"></dialog>`;
  document.title=selectedScreen.id+' · '+selectedScreen.nom+' · Pivotek Anjou';updateToolbarHeight();
}
function updateToolbarHeight(){
  const header=document.querySelector('.screen-toolbar'),stage=document.querySelector('#screen-stage');
  if(header&&stage)stage.style.height=`calc(100dvh - ${header.offsetHeight}px)`;
}
function updateQuery(){history.replaceState(null,'',selectedScreen.file+'?'+new URLSearchParams({format:selectedFormat,etat:selectedState,role:selectedRole,revue:reviewTools?'1':'0'}))}
function reloadFrame(){document.querySelector('#screen-frame').src=frameUrl();document.querySelector('#open-alone').href=frameUrl();updateQuery()}
function navigateScreen(id){if(id==='index'){location.href='../index.html#/guide';return}const screen=coverage.find(x=>x.id===id);if(screen)location.href=screenUrl(screen,new URLSearchParams({format:selectedFormat,role:selectedRole,revue:reviewTools?'1':'0'}).toString())}
document.addEventListener('change',e=>{
  if(e.target.id==='screen-select')navigateScreen(e.target.value);
  if(e.target.id==='screen-format'){selectedFormat=e.target.value;document.querySelector('#screen-stage').dataset.format=selectedFormat;updateQuery();updateToolbarHeight()}
  if(e.target.id==='screen-state'){selectedState=e.target.value;reloadFrame()}
  if(e.target.id==='screen-role'){selectedRole=e.target.value;reloadFrame()}
});
document.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button)return;
  if(button.id==='show-spec'){const d=document.querySelector('#interaction-dialog');lastTrigger=button;d.innerHTML=notes();d.showModal()}
  if(button.id==='close-spec')document.querySelector('#interaction-dialog').close();
  const i=coverage.indexOf(selectedScreen);
  if(button.id==='prev-screen'&&i>0)navigateScreen(coverage[i-1].id);
  if(button.id==='next-screen'&&i<coverage.length-1)navigateScreen(coverage[i+1].id);
});
window.addEventListener('message',event=>{
  const frame=document.querySelector('#screen-frame');
  if(event.origin!==location.origin||event.source!==frame?.contentWindow||event.data?.type!=='pivotek-screen')return;
  if(['referent','preparer','signer'].includes(event.data.role)){
    selectedRole=event.data.role;if(reviewTools)document.querySelector('#screen-role').value=selectedRole;
  }
  const route=String(event.data.route||'').replace(/^#\/?/,''),[base,params='']=route.split('?'),p=new URLSearchParams(params);
  let match=coverage.find(x=>x.route.split('?')[0]===base);
  if(base==='team'&&p.get('panel'))match=coverage.find(x=>x.id===(p.get('panel')==='invite'?'05.3':'05.4'));
  if(base==='services'&&p.get('section')==='options')match=coverage.find(x=>x.id==='09.2');
  if(!match||match.id===selectedScreen.id)return;
  selectedScreen=match;selectedState='normal';
  frame.title=match.id+' '+match.nom;
  if(!reviewTools){document.title=match.nom+' · Pivotek Anjou';updateQuery();return;}
  document.querySelector('#screen-select').value=match.id;document.querySelector('#screen-state').innerHTML=stateOptions();
  document.querySelector('#prev-screen').disabled=coverage.indexOf(match)===0;
  document.querySelector('#next-screen').disabled=coverage.indexOf(match)===coverage.length-1;
  document.querySelector('#open-alone').href='../index.html#/'+route;
  document.title=match.id+' · '+match.nom+' · Pivotek Anjou';updateQuery();
});
window.addEventListener('resize',updateToolbarHeight);
renderViewer();
document.querySelector('#interaction-dialog')?.addEventListener('close',()=>lastTrigger?.focus());
document.fonts.ready.then(updateToolbarHeight);
