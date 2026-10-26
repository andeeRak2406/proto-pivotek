const pages={welcome,login,register,contact,pending,join:()=>pending(true),activate:()=>activation(),
  forgot,reset:()=>activation(true),dashboard,profile,team,contracts,detail,entity,project,questions,
  documents,services:servicePage,sign,waiting:()=>confirmed(true),confirmed:()=>confirmed(),guide,journeys,kit,emails};
const publicRoutes=['welcome','login','register','contact','pending','join','activate','forgot','reset'];
let reviewReady=false;
function render() {
  const raw=location.hash.replace(/^#\/?/,'').split('?')[0]||'welcome';
  currentRoute=pages[raw]?raw:'welcome';
  const title=routes.find(r=>r[0].split('?')[0]===currentRoute)?.[2]||'Espace client';
  let content=pages[currentRoute]();
  if(['services','sign','confirmed','waiting'].includes(currentRoute) && !['empty','loading','error'].includes(scenario)) content=content.replace('</header>', '</header>'+constructionPanel('banner'));
  if(['entity','project','questions','documents','services'].includes(currentRoute)&&['Signé','Facturé','Clôturé'].includes(state.contractState)){
    content=heading('Dossier signé','Ce dossier est conservé en lecture seule','Déclarez un nouveau projet pour préparer une autre commande.')+link('Consulter le contrat','detail?id='+state.activeId)+btn('Déclarer un projet','new-project','primary');
  }
  if(!publicRoutes.includes(currentRoute)&&['loading','error'].includes(scenario))content=heading('Espace client',title,'')+pageState();
  $('#app').innerHTML=currentRoute==='guide'?workbench():publicRoutes.includes(currentRoute)?content:shell(content,title);
  document.body.classList.toggle('is-workbench',currentRoute==='guide');
  document.body.classList.toggle('embedded',new URLSearchParams(location.hash.split('?')[1]).has('embed')||window.self!==window.top);
  if(currentRoute==='guide')setupBoard();
  document.title=title+' · Pivotek Anjou';
  window.scrollTo(0,0);
  if(currentRoute==='entity')toggleBranch();
  if(currentRoute==='project')calculateStart();
  scheduleProjectVisuals();
  const h=$('h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true})}
  const q=new URLSearchParams(location.hash.split('?')[1]);
  if(q.get('panel')==='invite'&&state.role==='referent')inviteDialog();
  if(q.get('panel')==='import'&&state.role==='referent')importDrawer();
  if(q.get('section')==='options')$('#options')?.scrollIntoView({block:'center'});
  if(scenario==='import-errors'&&$('#import-preview'))importPreview();
  if(scenario==='error'&&['welcome','login'].includes(currentRoute))formError($('form[data-form=login]'),'Connexion impossible. Vérifiez vos identifiants ou réessayez.');
  if(window.self!==window.top)window.parent.postMessage({type:'pivotek-screen',route:location.hash,role:state.role},location.origin);
}
function routeChanged() {
  closeDialog();
  const q=new URLSearchParams(location.hash.split('?')[1]);
  const freshReview=q.has('review')&&!reviewReady;
  if(freshReview){
    reviewReady=true;state=structuredClone(seed);
    const target=location.hash.replace(/^#\/?/,'').split('?')[0];
    if(['project','questions','documents','services','sign'].includes(target)){
      state.draft=structuredClone(projectExample);state.activeId='local-001';state.contractState='Brouillon';
      state.selected=['services','sign'].includes(target)?['sps']:[];if(target==='sign')state.contractState='À signer';
      if(['services','sign'].includes(target))state.draft.documentsReviewed=true;
    }
    save();
  }
  scenario=q.get('state')||'normal';
  if(location.hash.split('?')[0]==='#/welcome'&&state.session&&!q.has('embed')){go('dashboard');return}
  if(['referent','signer','preparer'].includes(q.get('role'))){state.role=q.get('role');save()}
  if(q.get('preview')==='1')loadContract(location.hash.startsWith('#/confirmed')?'solaire':'tilleuls');
  if(freshReview)applyReviewState(q);
  render();
}
function applyReviewState(q){
  const s=q.get('state'),target=location.hash.replace(/^#\/?/,'').split('?')[0];
  if(target==='waiting')loadContract('attente');
  if(['contact','pending','join'].includes(target))state.registration={company:'Atelier Loire',email:'camille@atelier-loire.example',mode:target==='join'?'known':'new'};
  if(s==='approved')state.registration.approved=true;
  if(s==='refused')state.registration.refused=true;
  if(s==='bank-ready')state.bank=true;
  if(s==='known-company')state.registration.mode='known';
  if(['company-found','company-known','manual'].includes(s)){
    state.registration={siren:'123456789',email:'camille@atelier-loire.example',companySearch:'Atelier Loire',company:'Atelier Loire',address:'12 rue des Ateliers, 49000 Angers',legal:'SAS',vat:'Non communiqué',lookupDone:true,manual:s==='manual',mode:s==='company-known'?'known':'new'};
    lookupMode=state.registration.mode;
  }
  if(s==='branch')Object.assign(state.draft,{entity:'branch',branchType:'Agence',branchName:'Atelier Loire — agence sud',branchAddress:'8 rue du Projet',branchPostal:'49100',branchCity:'Angers',branchContact:'Lucie Roux',branchEmail:'lucie@atelier-loire.example',branchPhone:'0600000001'});
  if(s==='blank')state.draft=structuredClone(draftSeed);
  if(['foundations','structure','facades'].includes(s)){
    state.draft={...structuredClone(draftSeed),entityConfirmed:true};
    if(s==='structure')Object.assign(state.draft,{project:'Maison des projets',address:'24 rue des Ateliers',postal:'49000',city:'Angers',department:'49 · Maine-et-Loire',type:'Bâtiment'});
    if(s==='facades')state.draft={...structuredClone(projectExample),entityConfirmed:true,type:'Bâtiment',occupied:'',icpe:''};
  }
  if(s==='photovoltaic')Object.assign(state.draft,{type:'Centrale Photovoltaïque',pvLocation:'Toiture / Ombrière sur bâtiment existant',surface:'2400',pvUnit:'m²',year:'1985'});
  if(s==='upload-error')state.projectFiles=[{name:'Plan du chantier.pdf',size:2048,status:'done'},{name:'Diagnostic amiante.pdf',size:4096,status:'error'}];
  if(s==='import-errors')importRows=[{first:'Nina',last:'Robert',email:'nina@atelier-loire.example',job:'Chargée de projets',right:'Préparer'},{first:'Hugo',last:'Simon',email:'hugo@',job:'Directeur',right:'Signer'},{first:'Camille',last:'Martin',email:'camille@atelier-loire.example',job:'Référente',right:'Signer'}];
  save();
}
window.addEventListener('hashchange',routeChanged);
$('#dialog').addEventListener('close',()=>{if(opener?.isConnected)opener.focus()});
document.addEventListener('click',event=>{
  if(event.target.closest('.skip')){event.preventDefault();const main=$('#main');main.tabIndex=-1;main.focus();return}
  const control=event.target.closest('[data-action]');
  if(!control)return;
  const action=control.dataset.action;
  if(['close','menu','close-nav','guide'].includes(action)){
    event.preventDefault();
    if(action==='close')closeDialog();
    if(action==='guide')go('guide');
    if(action==='menu'){$('#nav').classList.toggle('open');control.setAttribute('aria-expanded',String($('#nav').classList.contains('open')));if($('#nav').classList.contains('open'))$('.sidebar-close').focus()}
    if(action==='close-nav'){$('#nav').classList.remove('open');$('.mobile-menu')?.setAttribute('aria-expanded','false');$('.mobile-menu')?.focus()}
  }
});
document.addEventListener('keydown',event=>{
  if(event.key==='Tab'&&$('#nav')?.classList.contains('open')){
    const list=$$('button,a[href]', $('#nav')).filter(x=>x.getClientRects().length),first=list[0],last=list.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
  if(event.key==='Escape'&&$('#nav')?.classList.contains('open')){
    $('#nav').classList.remove('open');$('.mobile-menu')?.setAttribute('aria-expanded','false');$('.mobile-menu')?.focus();
  }
});
function inviteDialog(index=null,request=false) {
  if(state.role!=='referent')return;
  const m=index!==null?state.members[index]:request?{first:'Julie',last:'Petit',email:'julie@atelier-loire.example',job:'Chargée de projets'}:{};
  openDialog(request?'Valider la demande d’accès':index!==null?'Modifier les droits':'Inviter une personne',
    `<form data-form="invite" data-member="${index??''}" data-request="${request}" novalidate><div class="grid cols2">${field('Prénom','first',m.first||'','text','',true)}${field('Nom','last',m.last||'','text','',true)}</div>${field('Adresse e-mail','email',m.email||'','email','',true)}${field('Fonction','job',m.job||'','text','',true)}${field('Téléphone','phone',m.phone||'','tel','Facultatif')}<fieldset><legend>Droits</legend>${radio('right','Préparer','Peut préparer un dossier à faire valider',m.right!=='Signer')}${radio('right','Signer','Peut signer et engager l’entreprise',m.right==='Signer')}</fieldset><p class="small">Un lien personnel à durée limitée sera envoyé par e-mail. Aucun mot de passe n’est envoyé.</p><div class="form-error"></div><div class="form-footer">${btn('Annuler','close')}<button class="btn primary" type="submit">${index!==null?'Enregistrer les droits':request?'Valider la demande':'Envoyer l’invitation'}</button></div></form>`,'',true);
}
function importDrawer() {
  if(state.role!=='referent')return;
  openDialog('Inviter plusieurs personnes',`<p>Vérifiez chaque ligne avant de confirmer les invitations.</p>${btn('Télécharger le modèle CSV','csv-template')}<div class="upload" id="team-dropzone"><label class="field">Fichier de collaborateurs<input id="team-file" type="file" accept=".csv,.xlsx"><small>CSV ou XLSX · prénom, nom, e-mail, fonction, droit. Dépôt possible dans cette zone.</small></label></div><div id="import-preview"></div>`,'',true);
  if(importRows.length)showImport();
}
function scenarios() {
  openDialog('Scénarios de validation',`<p>Commandes de prototype, sans effet sur la production.</p><label class="field">Rôle de démonstration<select id="demo-role">${[['referent','Référent'],['preparer','Collaborateur préparateur'],['signer','Collaborateur habilité à signer']].map(([v,t])=>`<option value="${v}" ${state.role===v?'selected':''}>${t}</option>`).join('')}</select></label><h3>État de l’écran</h3><div class="actions">${['normal','empty','loading','error','expired'].map((x,i)=>btn(['Normal','Sans données','Chargement','Erreur','Lien expiré'][i],x)).join('')}</div><h3>Parcours</h3><div class="actions">${btn('Créer un compte','demo-onboarding')}${btn('Nouveau projet','demo-project')}${btn('Devis à signer','demo-sign')}${btn('Transmettre au référent','demo-preparer')}</div><hr>${btn('Réinitialiser la démonstration','reset-demo')}`,'',true);
}
document.addEventListener('click',event=>{if(event.target.closest('[data-action=scenarios]'))scenarios()});
routeChanged();

function notifications() {
  state.readNotifications=true;save();
  $('.notification-button i')?.remove();
  $('.notification-button')?.setAttribute('aria-label','Notifications');
  openDialog('Notifications',`${state.requests&&state.role==='referent'?'<article class="notification"><strong>Julie Petit souhaite rejoindre votre équipe</strong><a href="#/team" data-close-link>Examiner la demande</a></article>':''}${getContracts().filter(c=>['À signer','En attente du référent'].includes(c.status)).map(c=>`<article class="notification"><strong>${esc(c.name)}</strong><p>${c.status}</p><a href="#/detail?id=${c.id}" data-close-link>Consulter le dossier</a></article>`).join('')}`,'',true);
}
function bankDialog() {
  openDialog('Coordonnées bancaires',`<p>Renseignez les coordonnées bancaires de l’entreprise facturée.</p><form data-form="bank" novalidate>${field('Titulaire du compte','holder','','text','',true)}${field('IBAN','iban','','text','Format et clé de contrôle vérifiés.',true)}<label class="field">Relevé d’identité bancaire<input name="ribFile" type="file" accept=".pdf,.png,.jpg"><small>Pièce facultative · PDF, PNG, JPG.</small></label><div class="form-error"></div><div class="form-footer">${btn('Annuler','close')}<button type="submit" class="btn primary">Enregistrer le RIB</button></div></form>`,'',true);
}
function signatureDialog() {
  openDialog('Signature électronique',`<div class="document-placeholder">[Module de signature électronique]</div><p>Confirmez la signature de votre contrat.</p><div id="signature-feedback" aria-live="polite"></div>`,btn('Annuler la signature','signature-cancel')+btn('Confirmer la signature','signature-success','primary'));
}
function applyInvitation() {
  if(!pendingInvite||state.role!=='referent')return;
  const {values,index,request}=pendingInvite;
  if(index!=='')state.members[Number(index)]={...state.members[Number(index)],...values};
  else state.members.push({...values,status:request?'Acceptée':'Invitation en attente'});
  if(request)state.requests=false;
  recordEvent('invitation',`${values.first} ${values.last} : ${index!==''?'droits mis à jour':request?'demande acceptée':'invitation préparée'}.`);
  pendingInvite=null;closeDialog();go('team');render();toast('Équipe mise à jour.');
}
function domainDialog(index=null) {
  if(state.role!=='referent')return;
  openDialog(index===null?'Ajouter un domaine':'Modifier le domaine',`<p>Ce domaine sert au rapprochement des demandes, sans donner de droit d’accès.</p><form data-form="domain" data-index="${index??''}" novalidate>${field('Domaine e-mail','domain',index===null?'':state.domains[index],'text','Sans @ ni https://. Gmail et Outlook ne sont pas des domaines d’entreprise.',true)}<div class="form-error"></div><div class="form-footer">${btn('Annuler','close')}<button type="submit" class="btn primary">Vérifier la modification</button></div></form>`);
}
function importErrors() {
  const seen=new Set(state.members.map(x=>x.email.toLowerCase()));
  return importRows.map(row=>{
    const errors=[];
    if(!row.first||!row.last||!row.job)errors.push('Prénom, nom ou fonction manquant');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email))errors.push('E-mail invalide');
    if(seen.has(row.email.toLowerCase()))errors.push('Doublon');
    seen.add(row.email.toLowerCase());
    if(!['Préparer','Signer'].includes(row.right))errors.push('Droit non reconnu');
    return errors;
  });
}
function importPreview() {
  const box=$('#import-preview');if(!box)return;
  const errors=importErrors(),invalid=errors.some(x=>x.length);
  box.innerHTML=`<h3>${importRows.length} ligne(s) à vérifier</h3>${invalid?alert('Corrigez ou retirez les lignes signalées.','error'):alert(importRows.length?'Liste prête à être confirmée.':'Ajoutez un fichier.')}<div class="table-wrap mobile-cards"><table><thead><tr><th>Identité</th><th>E-mail et fonction</th><th>Droit</th><th>Vérification</th><th>Actions</th></tr></thead><tbody>${importRows.map((r,i)=>`<tr><td>${esc(r.first+' '+r.last)}</td><td>${esc(r.email)}<small>${esc(r.job)}</small></td><td data-label="Droit">${esc(r.right)}</td><td data-label="Vérification">${errors[i].length?errors[i].join(' · '):'Valide'}</td><td><div class="actions">${btn('Corriger','edit-import','small',`data-index="${i}"`)}${btn('Retirer','remove-import','small',`data-index="${i}"`)}</div></td></tr>`).join('')}</tbody></table></div>${btn('Confirmer les invitations','confirm-import','primary',invalid||!importRows.length?'disabled':'')}`;
}
// Use the same preview for the initial panel and subsequent corrections.
showImport=importPreview;
async function readTeamFile(file) {
  if(!file)return;
  try{
    if(file.size>2*1024*1024)throw Error('La liste dépasse 2 Mo. Réduisez la taille du fichier.');
    if(!/\.(csv|xlsx)$/i.test(file.name))throw Error('Choisissez un fichier CSV ou XLSX.');
    const rows=/\.xlsx$/i.test(file.name)?await readXlsx(file):parseCSV((await file.text()).replace(/^\uFEFF/,''));
    if(rows.length<2||rows[0].length<5)throw Error('Le fichier doit contenir les cinq colonnes du modèle et au moins une personne.');
    const header=rows[0].slice(0,5).join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    if(!/prenom/.test(header)||!/mail/.test(header)||!/droit/.test(header))throw Error('Les colonnes ne correspondent pas au modèle CSV.');
    importRows=rows.slice(1).filter(row=>row.some(x=>String(x||'').trim())).map(row=>({
      first:String(row[0]||'').trim(),last:String(row[1]||'').trim(),email:String(row[2]||'').trim(),
      job:String(row[3]||'').trim(),right:String(row[4]||'').trim()
    }));
    showImport();
  }catch(error){$('#import-preview').innerHTML=alert(esc(error.message),'error')}
}
function addFiles(files) {
  let totalSize=state.projectFiles.reduce((sum,f)=>sum+f.size,0),messages=[];
  for(const file of files){
    if(!/\.(pdf|dwg|dxf|zip|png|jpg|docx|xlsx)$/i.test(file.name)){messages.push('Format non accepté : '+file.name);continue}
    if(file.size>100*1024*1024||totalSize+file.size>1024*1024*1024){messages.push('Limite de taille dépassée : '+file.name);continue}
    if(state.projectFiles.some(x=>x.name===file.name)){messages.push('Fichier déjà ajouté : '+file.name);continue}
    state.projectFiles.push({name:file.name,size:file.size,status:'loading'});totalSize+=file.size;
  }
  save();if($('#file-list'))$('#file-list').innerHTML=filesList();
  if(messages.length)toast(messages.join(' · '));
  const id=state.activeId;
  setTimeout(()=>{
    if(state.activeId!==id){
      state.records[id]?.files?.forEach(f=>{if(f.status==='loading')f.status='done'});save();return;
    }
    state.projectFiles.forEach(f=>{if(f.status==='loading')f.status='done'});save();
    if($('#file-list'))$('#file-list').innerHTML=filesList();
  },900);
}
document.addEventListener('submit',async event=>{
  const form=event.target,name=form.dataset.form;
  if(!name)return;event.preventDefault();
  if(!validate(form))return;
  const v=formValues(form);
  if(name==='login'){
    if(scenario==='error'){formError(form,'Connexion impossible. Vérifiez vos identifiants ou réessayez.');return}
    state.session=true;save();go('dashboard');
  }
  if(name==='lookup'){
    if(!/^\d{9}(\d{5})?$/.test(v.siren)){formError(form,'Saisissez 9 chiffres pour le SIREN ou 14 pour le SIRET.',form.elements.siren);return}
    state.registration={...state.registration,...v,lookupDone:false,manual:false};
    $('#lookup-result').innerHTML=alert('Recherche des informations de l’entreprise…');
    const submit=$('button[type=submit]',form);submit.disabled=true;
    await new Promise(resolve=>setTimeout(resolve,450));
    if(!form.isConnected)return;
    submit.disabled=false;
    if(v.siren.startsWith('000')||v.siren.startsWith('999')){
      $('#lookup-result').innerHTML=alert(v.siren.startsWith('000')?'Entreprise introuvable. Vérifiez le numéro ou saisissez ses informations.':'Le service de recherche est indisponible. Vous pouvez poursuivre manuellement.','warn')+btn('Saisir manuellement','manual')+btn('Assistance','help');
    }else if(v.siren.startsWith('888')){
      $('#lookup-result').innerHTML=alert('Cette entreprise apparaît inactive. Contactez Pivotek pour vérifier sa situation.','warn')+btn('Contacter Pivotek','help');
    }else{
      lookupMode=v.siren.startsWith('777')||v.email.toLowerCase().endsWith('@atelier-loire.example')?'known':'new';
      Object.assign(state.registration,{mode:lookupMode,company:'Atelier Loire',address:'12 rue des Ateliers, 49000 Angers',legal:'SAS',vat:'Non communiqué',lookupDone:true});
      $('#lookup-result').innerHTML=companyResult(false);
    }
    save();
  }
  if(name==='company'){
    const lookup=$('form[data-form=lookup]');
    if(lookup&&!validate(lookup))return;
    if(lookup&&!/^\d{9}(\d{5})?$/.test(lookup.elements.siren.value)){formError(lookup,'Saisissez 9 chiffres pour le SIREN ou 14 pour le SIRET.',lookup.elements.siren);return}
    Object.assign(state.registration,v,{lookupDone:true,mode:lookupMode});save();go('contact');
  }
  if(name==='contact'){
    if(!/^[+()\d\s.-]{6,20}$/.test(v.phone)){formError(form,'Vérifiez le numéro de téléphone.',form.elements.phone);return}
    Object.assign(state.registration,v,{submitted:true,approved:false,refused:false});state.activationUsed=false;save();
    recordEvent('compte','Demande de compte reçue.');go(state.registration.mode==='known'?'join':'pending');
  }
  if(name==='activate'){
    if(v.password!==v.confirm){formError(form,'Les deux mots de passe doivent être identiques.',form.elements.confirm);return}
    if(currentRoute==='activate'&&state.activationUsed){scenario='expired';render();return}
    state.session=true;state.activationUsed=currentRoute==='activate';
    const r=state.registration;
    if(r.first)state.user={first:r.first,last:r.last,email:r.email};
    if(r.company)state.company={...state.company,name:r.company,address:r.address||state.company.address,legal:r.legal||'SAS',siren:r.siren||'123456789'};
    if(r.mode==='known')state.role='preparer';
    else if(r.first){state.role='referent';Object.assign(state.members[0],state.user);state.profile.email=r.email}
    save();go('dashboard');toast('Votre accès est activé.');
  }
  if(name==='forgot'){
    form.innerHTML=alert('Si cette adresse possède un compte, un lien de réinitialisation sera envoyé.','ok')+link('Retour à la connexion','login');
  }
  if(name==='profile'||name==='bank'){
    if(name==='profile'&&state.role!=='referent')return;
    if(v.iban&&!validIban(v.iban)){formError(form,'Le format ou la clé de l’IBAN est incorrect.',form.elements.iban);return}
    if(v.iban&&!v.holder?.trim()){formError(form,'Renseignez le titulaire du compte.',form.elements.holder);return}
    for(const input of $$('input[type=file]',form)){
      if(input.files[0]&&!/\.(pdf|png|jpg)$/i.test(input.files[0].name)){formError(form,'Choisissez un fichier PDF, PNG ou JPG.',input);return}
    }
    if(name==='profile')state.profile={...state.profile,function:v.function,team:v.team,email:v.email,phone:v.phone,legalFile:form.elements.legalFile.files[0]?.name||state.profile.legalFile};
    state.bank=!!v.iban;save();
    if(name==='bank')closeDialog();
    render();toast('Informations enregistrées.');
  }
  if(name==='invite'){
    if(state.role!=='referent')return;
    const index=form.dataset.member,request=form.dataset.request==='true';
    if(state.members.some((m,i)=>m.email.toLowerCase()===v.email.toLowerCase()&&String(i)!==index)){
      formError(form,'Cette adresse figure déjà dans votre équipe.',form.elements.email);return;
    }
    pendingInvite={values:v,index,request};
    if(v.right==='Signer'&&(index===''||state.members[Number(index)].right!=='Signer')){
      openDialog('Confirmer le droit de signature',`<p>${esc(v.first+' '+v.last)} pourra signer et engager l’entreprise.</p>`,btn('Annuler','cancel-invite')+btn('Confirmer les droits','confirm-invite','primary'));
    }else applyInvitation();
  }
  if(name==='entity'||name==='project'||name==='questions'){
    if(name==='project'&&v.designStart&&v.start&&v.start<v.designStart){formError(form,'La réalisation doit suivre le début de conception.',form.elements.start);return}
    if(name==='entity')state.draft.entityConfirmed=true;
    syncDraft(form);go(name==='entity'?'project':name==='project'?'questions':'documents');
  }
  if(name==='filter'){contractSearch=v.search.trim();contractFilter=v.status;pageNo=1;render()}
  if(name==='sign'){
    if(!state.selected.some(id=>services.slice(0,3).some(s=>s[0]===id))){formError(form,'Sélectionnez au moins une mission.');return}
    state.signChecks={accuracy:!!form.elements.accuracy.checked,terms:!!form.elements.terms?.checked};save();
    const can=state.role!=='preparer'&&state.draft.signer!=='Responsable de la filiale / agence';
    if(!can){
      state.contractState='En attente du référent';recordEvent('contrat','Dossier transmis au référent : '+state.draft.project);go('waiting');return;
    }
    if(!state.bank){formError(form,'Ajoutez les coordonnées bancaires pour finaliser la commande.');return}
    signatureDialog();
  }
  if(name==='domain'){
    if(state.role!=='referent')return;
    const value=v.domain.trim().toLowerCase(),index=form.dataset.index===''?null:Number(form.dataset.index);
    if(!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(value)){formError(form,'Saisissez un domaine sans @ ni protocole.',form.elements.domain);return}
    if(['gmail.com','outlook.com','hotmail.com','hotmail.fr','live.fr','yahoo.fr','yahoo.com'].includes(value)){formError(form,'Un domaine public ne peut pas appartenir à votre entreprise. Les inscriptions avec ces adresses restent autorisées.',form.elements.domain);return}
    if(value==='autre-entreprise.example'||state.domains.some((d,i)=>d===value&&i!==index)){formError(form,'Ce domaine est déjà rattaché à une entreprise.',form.elements.domain);return}
    pendingDomain={value,index};
    openDialog('Confirmer le domaine',`<dl><dt>Avant</dt><dd>${index===null?'Nouveau domaine':esc(state.domains[index])}</dd><dt>Après</dt><dd>${esc(value)}</dd></dl><p>Aucun utilisateur n’est ajouté ou transféré automatiquement.</p>`,btn('Annuler','close')+btn('Confirmer','confirm-domain','primary'));
  }
  if(name==='edit-import'){
    importRows[Number(form.dataset.index)]={...v};importDrawer();
  }
});
document.addEventListener('input',event=>{
  const t=event.target,registration=t.closest('form[data-registration]'),form=t.closest('form[data-autosave]');
  if(registration){Object.assign(state.registration,formValues(registration));save()}
  if(form){
    if(t.name==='type'&&state.draft.type!==t.value){
      ['year','lead','asbestos','pvLocation','surface','occupied','icpe'].forEach(key=>delete state.draft[key]);
      state.selected=[];
    }
    if(t.name==='year'){
      if(Number(t.value)>=1949)delete state.draft.lead;
      if(Number(t.value)>=1997)delete state.draft.asbestos;
    }
    invalidateQuote();syncDraft(form);
  }
  if(t.name==='description'&&$('#description-count'))$('#description-count').textContent=t.value.length;
  if(['designDuration','designStart'].includes(t.name))calculateStart();
  if(t.name==='year'&&$('#diagnostics'))$('#diagnostics').innerHTML=diagnostics(Number(t.value));
});
document.addEventListener('change',async event=>{
  const t=event.target;
  if(t.name==='entity'){
    syncDraft(t.form);
    if(t.value==='parent'){state.draft.payer=state.company.name;state.draft.signer='Référent de la maison mère';save()}
    render();
  }
  if(t.name==='pvLocation'){syncDraft(t.form);render()}
  if(t.dataset.service){
    const id=t.dataset.service;
    state.selected=t.checked?[...new Set([...state.selected,id])]:state.selected.filter(x=>x!==id);
    state.signChecks={accuracy:false,terms:false};save();$('#pricing').innerHTML=pricing();
  }
  if(['accuracy','terms'].includes(t.name)){state.signChecks[t.name]=t.checked;save()}
  if(t.id==='demo-role'){state.role=t.value;save();closeDialog();render()}
  if(t.id==='project-files')addFiles(t.files);
  if(t.id==='team-file')await readTeamFile(t.files[0]);
});
document.addEventListener('click',event=>{
  if(event.target.closest('[data-close-link]'))closeDialog();
  const t=event.target.closest('[data-action]');
  if(!t)return;
  const a=t.dataset.action,i=Number(t.dataset.index);
  if(!['show-password'].includes(a))event.preventDefault();
  if(['normal','empty','loading','error'].includes(a)){scenario=a;closeDialog();render()}
  if(a==='expired'){closeDialog();go('activate?state=expired')}
  if(a==='help')openDialog('Contacter Pivotek Anjou','<p>Pour une question sur votre entreprise, le projet ou un dossier :</p><a href="https://www.pivotek-anjou.bef4prod.com/contact/" target="_blank" rel="noopener">Consulter la page de contact publique</a>',btn('Fermer','close'));
  if(a==='notifications')notifications();
  if(a==='logout'){state.session=false;save();go('login')}
  if(a==='show-password')$$('input[name=password]').forEach(x=>x.type=t.checked?'text':'password');
  if(a==='manual'){
    Object.assign(state.registration,formValues($('form[data-form=lookup]')),{manual:true,lookupDone:true});
    lookupMode='new';state.registration.mode='new';save();$('#lookup-result').innerHTML=companyResult(true);
    $('#lookup-result').scrollIntoView({block:'start'});
  }
  if(a==='approve-account'){state.registration.approved=true;state.registration.refused=false;state.activationUsed=false;recordEvent('compte','Demande validée, lien d’activation disponible.');render()}
  if(a==='refuse-account'){state.registration.refused=true;state.registration.approved=false;save();render()}
  if(a==='activation-link'){state.activationUsed=false;save();go('activate')}
  if(a==='reset-link')go('reset');
  if(a==='new-project'||a==='demo-project'){
    closeDialog();
    if(state.draft.project&&state.contractState==='Brouillon')openDialog('Un brouillon est disponible',`<p>${esc(state.draft.project)}</p><p>Créer un autre projet conserve ce dossier dans Mes contrats.</p>`,btn('Reprendre le brouillon','resume-project','primary')+btn('Créer un autre projet','clear-project'));
    else newProject();
  }
  if(a==='clear-project'){closeDialog();newProject()}
  if(a==='resume-project'){closeDialog();go('project')}
  if(a==='demo-onboarding'){state.registration={};lookupMode='new';state.activationUsed=false;save();closeDialog();go('register')}
  if(a==='demo-team'){state.role='referent';save();closeDialog();go('team')}
  if(a==='demo-sign'||a==='demo-preparer'){
    state.role=a==='demo-preparer'?'preparer':'referent';readyDraft();state.contractState='À signer';save();closeDialog();go('services');
  }
  if(a==='to-services'){state.draft.documentsReviewed=true;save();go('services');}
  if(a==='to-sign'){
    if(!state.selected.some(id=>services.slice(0,3).some(s=>s[0]===id)))return;
    state.quoted=true;state.contractState='À signer';save();go('sign');
  }
  if(a==='as-referent'){
    state.role='referent';
    if(state.draft.signer==='Responsable de la filiale / agence')state.draft.signer='Référent de la maison mère';
    save();go('services');
  }
  if(a==='open-contract'){loadContract(t.dataset.id);go(state.contractState==='Brouillon'?'project':'services')}
  if(a==='edit-documents'){loadContract(t.dataset.id);go('documents')}
  if(a==='bank')bankDialog();
  if(a==='demo-bank'){
    const form=t.closest('form');form.elements.holder.value=state.company.name;form.elements.iban.value='FR76 3000 6000 0112 3456 7890 189';
  }
  if(a==='cancel-profile'){render();toast('Modifications non enregistrées annulées.')}
  if(a==='invite')inviteDialog();
  if(a==='rights')inviteDialog(i);
  if(a==='review-request')inviteDialog(null,true);
  if(a==='confirm-invite')applyInvitation();
  if(a==='cancel-invite'){pendingInvite=null;closeDialog();render()}
  if(a==='resend'){
    if(state.role!=='referent')return;
    state.members[i].status='Invitation en attente';recordEvent('invitation','Invitation renouvelée pour '+state.members[i].email);render();toast('Invitation renouvelée.');
  }
  if(a==='reject-request')openDialog('Refuser cette demande ?','<p>Julie Petit ne sera pas ajoutée à l’entreprise.</p>',btn('Annuler','close')+btn('Refuser la demande','confirm-reject','danger'));
  if(a==='confirm-reject'){if(state.role!=='referent')return;state.requests=false;recordEvent('invitation','Demande de Julie Petit refusée.');closeDialog();render()}
  if(a==='import-drawer')importDrawer();
  if(a==='csv-template')download('modele-equipe.csv','\uFEFFPrénom;Nom;E-mail;Fonction;Droit\r\nNina;Robert;nina@atelier-loire.example;Chargée de projets;Préparer\r\n','text/csv;charset=utf-8');
  if(a==='import-example'||a==='import-valid'){
    importRows=[{first:'Nina',last:'Robert',email:'nina@atelier-loire.example',job:'Chargée de projets',right:'Préparer'}];
    if(a==='import-example')importRows.push({first:'Hugo',last:'Simon',email:'hugo@',job:'Directeur',right:'Signer'},{first:'Camille',last:'Martin',email:'camille@atelier-loire.example',job:'Référente',right:'Signer'});
    showImport();
  }
  if(a==='edit-import'){
    const r=importRows[i];
    openDialog('Corriger une personne',`<form data-form="edit-import" data-index="${i}" novalidate>${field('Prénom','first',r.first,'text','',true)}${field('Nom','last',r.last,'text','',true)}${field('E-mail','email',r.email,'email','',true)}${field('Fonction','job',r.job,'text','',true)}${select('Droit','right',['Préparer','Signer'],r.right,true)}<div class="form-error"></div><div class="actions">${btn('Annuler','import-drawer')}<button type="submit" class="btn primary">Enregistrer la correction</button></div></form>`,'',true);
  }
  if(a==='remove-import'){importRows.splice(i,1);showImport()}
  if(a==='confirm-import'){
    if(state.role!=='referent'||!importRows.length||importErrors().some(x=>x.length))return;
    openDialog('Confirmer les invitations',`<p>${importRows.length} personne(s) seront invitées. ${importRows.filter(x=>x.right==='Signer').length} auront le droit de signer.</p>`,btn('Revenir à la liste','import-drawer')+btn('Envoyer les invitations','send-import','primary'));
  }
  if(a==='send-import'){
    if(state.role!=='referent'||!importRows.length||importErrors().some(x=>x.length))return;
    state.members.push(...importRows.map(r=>({...r,status:'Invitation en attente'})));recordEvent('invitation',importRows.length+' invitations envoyées.');
    importRows=[];closeDialog();go('team');render();
  }
  if(a==='example-file'||a==='interrupted-file'){
    const name=a==='example-file'?'Plan du chantier — exemple.pdf':'Diagnostic — exemple.pdf';
    if(!state.projectFiles.some(f=>f.name===name))state.projectFiles.push({name,size:1024,status:a==='example-file'?'done':'error'});
    save();$('#file-list').innerHTML=filesList();
  }
  if(a==='retry-file'){state.projectFiles[i].status='done';save();$('#file-list').innerHTML=filesList();toast('Document ajouté.')}
  if(a==='remove-file')openDialog('Retirer ce document ?',`<p>${esc(state.projectFiles[i].name)} sera retiré du dossier.</p>`,btn('Annuler','close')+btn('Retirer le document','confirm-remove-file','danger',`data-index="${i}"`));
  if(a==='confirm-remove-file'){state.projectFiles.splice(i,1);save();closeDialog();$('#file-list').innerHTML=filesList()}
  if(a==='domain-add')domainDialog();
  if(a==='domain-edit')domainDialog(i);
  if(a==='confirm-domain'){
    if(state.role!=='referent'||!pendingDomain)return;
    if(pendingDomain.index===null)state.domains.push(pendingDomain.value);else state.domains[pendingDomain.index]=pendingDomain.value;
    pendingDomain=null;save();closeDialog();render();
  }
  if(a==='terms')openDialog('Conditions générales de vente',`<div class="document-placeholder">[Conditions générales de vente PDF]</div>`,btn('Retour à la signature','close'));
  if(a==='signature-success'){
    if(state.role==='preparer'||!state.bank||!state.signChecks.accuracy||!state.signChecks.terms)return;
    state.contractState='Signé';recordEvent('signature','Contrat signé et transmis au payeur et au signataire.');closeDialog();go('confirmed');
  }
  if(a==='signature-cancel'){state.contractState='À signer';save();closeDialog();go('sign');toast('Signature annulée. Le dossier reste disponible.')}
  if(['signature-error','signature-expired','signature-refused'].includes(a)){
    $('#signature-feedback').innerHTML=alert(a==='signature-error'?'Le service de signature est indisponible.':a==='signature-expired'?'Le lien de signature a expiré.':'La signature a été refusée. Le contrat reste non signé.','error')+btn('Réessayer la signature','retry-signature');
    $('[data-action=signature-success]').disabled=true;state.contractState='À signer';save();
  }
  if(a==='retry-signature')signatureDialog();
  if(a==='suggest-option')openDialog('Une option pour votre projet',`<h3>Inspection drone 4K</h3><p>Demandez une proposition complémentaire pour le suivi du chantier.</p><p>Aucune option n’est ajoutée au contrat et aucun montant n’est engagé.</p>`,btn('Fermer','close')+btn('Demander une proposition','request-option','primary'));
  if(a==='request-option'){recordEvent('option','Demande de proposition complémentaire reçue.');closeDialog();toast('Votre demande a été transmise. Le contrat et son montant restent inchangés.')}
  if(a==='download-contract')exampleDocument();
  if(a==='download-invoice')exampleDocument(true);
  if(a==='clear-filter'){contractSearch='';contractFilter='Tous';pageNo=1;render()}
  if(a==='next-page'){pageNo++;render()}
  if(a==='prev-page'){pageNo=Math.max(1,pageNo-1);render()}
  if(a==='sample')toast('Action de démonstration exécutée.');
  if(a==='sample-modal')openDialog('Fenêtre de démonstration','<p>Échap ferme cette fenêtre. Le focus revient au bouton d’ouverture.</p>',btn('Fermer','close'));
  if(a==='reset-demo')openDialog('Réinitialiser la démonstration ?','<p>Les dossiers et invitations créés dans ce prototype seront remplacés par les exemples initiaux.</p>',btn('Annuler','close')+btn('Réinitialiser','confirm-reset','danger'));
  if(a==='confirm-reset'){state=structuredClone(seed);save();importRows=[];lookupMode='new';contractSearch='';contractFilter='Tous';pageNo=1;closeDialog();go('guide')}
});
document.addEventListener('dragover',event=>{if(event.target.closest('#dropzone,#team-dropzone'))event.preventDefault()});
document.addEventListener('drop',event=>{
  if(event.target.closest('#dropzone')){event.preventDefault();addFiles(event.dataTransfer.files)}
  if(event.target.closest('#team-dropzone')){event.preventDefault();readTeamFile(event.dataTransfer.files[0])}
});
