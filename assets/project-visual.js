/* Tour progressive — orientation David, note UX intégrée.
   Illustration symbolique du dossier, jamais un avancement réel de chantier.
   Géométrie isométrique locale ; aucun média, service ou framework externe. */
const constructionSteps = [
  ['Entreprise', 'entity'], ['Chantier', 'project'], ['Précisions', 'questions'],
  ['Documents', 'documents'], ['Prestations', 'services'], ['Signature', 'sign']
];

function constructionProgress(record = null) {
  const d = record?.draft || state.draft;
  const selected = record?.selected || state.selected;
  const status = record?.status || state.contractState;
  const complete = ['Signé', 'Facturé', 'Clôturé'].includes(status);
  const quoted = status !== 'Brouillon';
  const has = key => String(d[key] ?? '').trim() !== '';
  const projectFields = ['project','address','postal','city','department','type','market','consultation','cost','lots','companies','allotment','phase','designDuration','duration','phaseCount'];
  const validProjectField = key => {
    if (!has(key)) return false;
    if (key === 'postal') return /^\d{5}$/.test(d[key]);
    if (['cost','lots','companies','duration','phaseCount'].includes(key)) return Number(d[key]) > 0;
    if (key === 'designDuration') return Number(d[key]) >= 0;
    return true;
  };
  const projectRatio = projectFields.filter(validProjectField).length / projectFields.length;
  const branchFields = ['branchType','branchName','branchAddress','branchPostal','branchCity','branchContact','branchEmail','branchPhone'];
  const entityDone = (d.entityConfirmed || has('project') || quoted) && has('payer') && has('signer') &&
    (d.entity !== 'branch' || branchFields.every(has));
  const questionFields = ['occupied','icpe'];
  const pv = d.type === 'Centrale Photovoltaïque';
  const existing = /Réfection|Étanchéité|Couverture|Démolition|Désamiantage|Déplombage|Rénovation|Ravalement|Réhabilitation/.test(d.type) || pv && d.pvLocation === 'Toiture / Ombrière sur bâtiment existant';
  if (pv) questionFields.push('pvLocation','surface','pvUnit');
  if (existing) {
    questionFields.push('year');
    if (Number(d.year) > 0 && Number(d.year) < 1949) questionFields.push('lead');
    if (Number(d.year) > 0 && Number(d.year) < 1997) questionFields.push('asbestos');
  }
  const questionRatio = has('type') ? questionFields.filter(key => has(key) && (key !== 'surface' || Number(d[key]) > 0) && (key !== 'year' || Number(d[key]) >= 1000 && Number(d[key]) <= 2026)).length / questionFields.length : 0;
  const documentsDone = !!d.documentsReviewed || quoted;
  const serviceDone = selected.some(id => services.slice(0,3).some(s => s[0] === id));
  const done = complete ? Array(6).fill(true) : [!!entityDone, projectRatio === 1, questionRatio === 1, documentsDone, serviceDone, false];
  const percent = complete ? 100 : Math.round((entityDone ? 10 : 0) + projectRatio * 40 + questionRatio * 20 + (documentsDone ? 5 : 0) + (serviceDone ? 15 : 0));
  const stage = [10,25,45,65,80,100].filter(n => percent >= n).length;
  return {percent, stage, done, complete, next: done.findIndex(x => !x), name: d.project || 'Votre prochain projet', type: d.type || ''};
}

function towerSvg(progress, variant = '') {
  // Axonometric projection of one coherent volume. Draw back-to-front.
  const p = (x,y,z) => [248 + (x-y)*.88, 304 + (x+y)*.43-z];
  const points = vertices => vertices.map(v => p(...v).map(n => n.toFixed(1)).join(',')).join(' ');
  const face = (vertices, fill, extra='') => `<polygon points="${points(vertices)}" fill="${fill}" ${extra}/>`;
  const box = (x,y,z,w,d,h,top='#f5f3ed',left='#d2dedb',right='#a1bdb8') =>
    face([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],left) +
    face([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],right) +
    face([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],top);
  const line = (a,b,extra='') => `<line x1="${p(...a)[0]}" y1="${p(...a)[1]}" x2="${p(...b)[0]}" y2="${p(...b)[1]}" ${extra}/>`;
  const layer = (level, body) => `<g class="tower-layer ${progress.stage>=level?'is-built':''}" data-build-level="${level}">${body}</g>`;
  let grid = '';
  for (let n=-160;n<=180;n+=25) grid += line([n,-160,-8],[n,160,-8]) + line([-160,n,-8],[180,n,-8]);
  let ghost='';
  const corners=[[-65,-45],[65,-45],[65,45],[-65,45]];
  for(let z=5;z<=200;z+=39) for(let i=0;i<4;i++)ghost+=line([...corners[i],z],[...corners[(i+1)%4],z]);
  corners.forEach(c=>ghost+=line([...c,5],[...c,200]));
  let columns='';
  for(const x of [-63,-3,60])for(const y of [-43,40])columns+=box(x,y,8,5,5,187,'#d0dfda','#89aaa3','#618e87');
  let floors='',windows='',facade='';
  for(let floor=0;floor<5;floor++) {
    const z=10+floor*37;
    floors+=box(-67,-47,z,134,94,5,'#f1eee4','#c7d3cd','#8aa9a4');
    facade+=box(-65,-45,z+5,130,90,31,'#eef0e8','#e2e8df','#adc6bd');
    // Recessed glazed ribbons on the two visible faces.
    for(let x=-57;x<60;x+=24) {
      windows+=face([[x,45.5,z+10],[x+17,45.5,z+10],[x+17,45.5,z+31],[x,45.5,z+31]],'#426e72');
      windows+=face([[x,45.7,z+29],[x+17,45.7,z+29],[x+17,45.7,z+31],[x,45.7,z+31]],'#c7e8df');
      windows+=line([x+7,46,z+10],[x+7,46,z+31],'stroke="#a8ccc2" stroke-width="1"');
    }
    for(let y=-37;y<40;y+=24) {
      windows+=face([[65.5,y,z+10],[65.5,y+17,z+10],[65.5,y+17,z+31],[65.5,y,z+31]],'#30585f');
      windows+=line([66,y+8,z+10],[66,y+8,z+31],'stroke="#88afa8" stroke-width="1"');
    }
  }
  let roof=box(-70,-50,195,140,100,7,'#f8f5e9','#e5dfce','#bcbda9')+box(-56,-36,202,112,72,3,'#a4b9a5','#8ea38d','#738f7b');
  roof+=box(-44,-28,205,38,34,12,'#ece9d9','#c5c9b7','#b3bda9');
  for(let x=8;x<40;x+=16)for(let y=-24;y<24;y+=17)roof+=box(x,y,206,12,13,2,'#3a646b','#63848a','#365b63');
  let landscape='';
  for(const [x,y] of [[-110,80],[-110,-70],[110,65],[100,-75]]) {
    landscape+=box(x-10,y-10,0,20,20,5,'#a2b39b','#91a98e','#75937d');
    const [tx,ty]=p(x,y,5);
    landscape+=`<path d="M${tx} ${ty}v-30" stroke="#7c8870" stroke-width="3"/><ellipse cx="${tx+2}" cy="${ty-34}" rx="15" ry="22" fill="#8eae89"/><ellipse cx="${tx-4}" cy="${ty-38}" rx="10" ry="18" fill="#b3c7a1"/>`;
  }
  const crane = `<g class="tower-crane ${progress.complete?'is-finished':''}">
    ${box(105,-80,0,18,18,7,'#c5d2c5','#95aaa0','#748e85')}
    <g fill="none" stroke="#ba8a43" stroke-width="2">${line([110,-75,7],[110,-75,272])}${line([118,-75,7],[118,-75,272])}
    ${Array.from({length:13},(_,i)=>line([110,-75,9+i*20],[118,-75,29+i*20])+line([118,-75,9+i*20],[110,-75,29+i*20])).join('')}
    ${line([-90,-75,253],[155,-75,253])}${line([-90,-75,262],[155,-75,262])}
    ${Array.from({length:12},(_,i)=>line([-90+i*20,-75,253],[-70+i*20,-75,262])+line([-90+i*20,-75,262],[-70+i*20,-75,253])).join('')}
    ${line([114,-75,285],[-75,-75,262])}${line([114,-75,285],[152,-75,262])}
    ${line([-70,-75,253],[-70,-75,210],'stroke="#657f7a" stroke-width="1.2"')}
    </g>${box(130,-81,243,23,12,9,'#5e7976','#4d6b67','#385651')}${box(103,-90,244,18,14,14,'#dec490','#c9a767','#ba8a43')}
  </g>`;
  return `<svg class="tower-svg ${variant}" viewBox="0 -50 500 485" aria-hidden="true" focusable="false">
    <g class="site-grid" fill="none" stroke="currentColor" stroke-width=".6">${grid}</g>
    <ellipse cx="264" cy="333" rx="137" ry="52" fill="#254b46" opacity=".07"/>
    ${box(-145,-115,-7,290,230,7,'#e4e9dc','#cbd6c8','#b9cbbd')}
    ${face([[-145,67,.2],[145,67,.2],[145,102,.2],[-145,102,.2]],'#f5f4eb')}
    <g class="tower-ghost" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 4">${ghost}</g>
    ${layer(1,box(-73,-53,0,146,106,10,'#dadbd0','#b3c1b7','#8da99c'))}
    ${layer(2,columns)}${layer(3,facade+floors)}${layer(4,windows)}${layer(5,roof)}
    ${layer(6,landscape+box(-15,47,0,30,25,4,'#f3eee0','#d5d3c4','#afbeb0'))}${crane}
  </svg>`;
}

function constructionPanel(mode='aside', record=null) {
  const p=constructionProgress(record);
  const info=constructionSteps[p.next] || ['Dossier finalisé','detail'];
  return `<aside class="construction-panel construction-${mode}" data-construction ${record?`data-record="${esc(record.id)}"`:''} aria-label="Progression de votre dossier">
    <div class="construction-heading"><span class="eyebrow">Votre projet prend forme</span><span class="live-dot">${storageWarning?'Dans cet onglet':'Enregistré'}</span></div>
    <div class="construction-scene">${towerSvg(p)}<span class="scene-label">${icon('building')}<span data-build-caption>${['Le terrain est prêt','Les fondations sont posées','La structure s’élève','Les façades prennent forme','Les fenêtres sont posées','Les derniers détails','Votre tour est achevée'][p.stage]}</span></span></div>
    <div class="construction-details"><div class="construction-title"><h2 data-build-name>${esc(p.name)}</h2><strong data-build-percent>${p.percent}<small>%</small></strong></div>
    <div class="construction-meter" role="progressbar" aria-label="Préparation du dossier" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p.percent}"><span style="transform:scaleX(${p.percent/100})"></span></div>
    <p class="construction-next" data-build-next>${p.complete?'Signature confirmée. Votre dossier est finalisé.':'Prochaine étape : '+info[0]}</p>
    <ol class="construction-checklist">${constructionSteps.map(([label,route],i)=>`<li data-build-step="${i}" class="${p.done[i]?'is-done':i===p.next?'is-current':''}"><span>${p.done[i]?icon('check'):String(i+1).padStart(2,'0')}</span><span>${label}</span></li>`).join('')}</ol>
    <p class="construction-note">Cette tour illustre la préparation de votre dossier.</p></div>
  </aside>`;
}

function refreshProjectVisuals() {
  for(const panel of $$('[data-construction]')) {
    const record=panel.dataset.record?getContracts().find(x=>x.id===panel.dataset.record):null;
    const p=constructionProgress(record);
    $('.live-dot',panel).textContent=storageWarning?'Dans cet onglet':'Enregistré';
    $$('[data-build-level]',panel).forEach(el=>el.classList.toggle('is-built',Number(el.dataset.buildLevel)<=p.stage));
    $('.tower-crane',panel)?.classList.toggle('is-finished',p.complete);
    $('[data-build-name]',panel).textContent=p.name;
    $('[data-build-percent]',panel).innerHTML=p.percent+'<small>%</small>';
    $('.construction-meter',panel).setAttribute('aria-valuenow',p.percent);
    $('.construction-meter > span',panel).style.transform=`scaleX(${p.percent/100})`;
    $('[data-build-caption]',panel).textContent=['Le terrain est prêt','Les fondations sont posées','La structure s’élève','Les façades prennent forme','Les fenêtres sont posées','Les derniers détails','Votre tour est achevée'][p.stage];
    $('[data-build-next]',panel).textContent=p.complete?'Signature confirmée. Votre dossier est finalisé.':'Prochaine étape : '+constructionSteps[p.next][0];
    $$('[data-build-step]',panel).forEach((el,i)=>{
      el.classList.toggle('is-done',p.done[i]);el.classList.toggle('is-current',i===p.next);
      el.firstElementChild.innerHTML=p.done[i]?icon('check'):String(i+1).padStart(2,'0');
    });
  }
}

let projectVisualFrame=0;
function scheduleProjectVisuals() {
  cancelAnimationFrame(projectVisualFrame);
  projectVisualFrame=requestAnimationFrame(refreshProjectVisuals);
}
