/* Dashboard métier : les indicateurs sont calculés depuis les dossiers locaux. */
let dashboardFilter = 'all';

function dashboardShell(content,title) {
  const role=state.role==='referent'?'Référente de l’entreprise':state.role==='signer'?'Collaborateur habilité':'Collaborateur préparateur';
  const sections=[['dashboard','Tableau de bord','grid'],['contracts','Mes contrats','folder'],['profile','Mon entreprise','building']];
  return `<div class="workspace-layout refined-workspace"><aside class="sidebar" id="nav">
    <button class="iconbtn sidebar-close" data-action="close-nav" aria-label="Fermer le menu">${icon('close')}</button>
    <a class="brand dashboard-brand" href="#/dashboard"><span>PIVOTEK<span class="brand-period">.</span><small>ANJOU</small></span></a>
    <div class="workspace"><span class="workspace-avatar">${esc(state.company.name.slice(0,1))}</span><div><strong>${esc(state.company.name)}</strong><small>Votre espace professionnel</small></div></div>
    <span class="nav-caption">ESPACE CLIENT</span><nav class="nav" aria-label="Navigation principale">${sections.map(([route,label,glyph])=>`<a href="#/${route}" ${currentRoute===route||route==='contracts'&&currentRoute==='detail'||route==='profile'&&currentRoute==='team'?'aria-current="page"':''}>${icon(glyph)}<span>${label}</span>${route==='contracts'?`<small>${getContracts().length}</small>`:''}</a>`).join('')}
    <button class="nav-create" data-action="new-project">${icon('plus')}<span>Déclarer un projet</span></button></nav>
    <div class="sidebar-support"><span class="support-icon">${icon('help')}</span><h2>Un projet, une question ?</h2><p>Notre équipe vous accompagne à chaque étape.</p>${btn('Parlons-en '+icon('arrow'),'help')}</div>
    <div class="sidebar-foot">${btn(icon('logout')+'Se déconnecter','logout','tertiary')}<span>PIVOTEK ANJOU · ESPACE CLIENT</span></div>
    </aside><div class="workspace-content"><header class="topbar">
    <button class="iconbtn mobile-menu" data-action="menu" aria-controls="nav" aria-expanded="false" aria-label="Ouvrir le menu">${icon('menu')}</button>
    <span class="topbar-breadcrumb">Espace client <span>/</span> <strong>${esc(title)}</strong></span>
    <div class="topbar-tools"><button class="iconbtn notification-button" data-action="notifications" aria-label="Notifications${state.readNotifications?'':', nouvelles informations'}">${icon('bell')}${!state.readNotifications?'<i></i>':''}</button><a href="#/profile" class="user-menu" aria-label="Profil de ${esc(state.user.first+' '+state.user.last)}"><span class="user-avatar">${esc((state.user.first[0]||'')+(state.user.last[0]||''))}</span><span><strong>${esc(state.user.first+' '+state.user.last)}</strong><small>${role}</small></span>${icon('chevron')}</a></div>
    </header><main class="app-main ${currentRoute==='dashboard'?'dashboard-main':''}" id="main">${storageWarning?alert('Le stockage local est indisponible. Les saisies restent dans cet onglet jusqu’à sa fermeture.','warn'):''}${content}</main></div></div>`;
}

function refinedDashboard() {
  const all=scenario==='empty'?[]:getContracts();
  const actionable=all.filter(x=>['Brouillon','À signer','Devis envoyé','En attente du référent'].includes(x.status));
  const signed=all.filter(x=>['Signé','Facturé','Clôturé'].includes(x.status));
  const signatures=all.filter(x=>x.status==='À signer');
  const drafts=all.filter(x=>x.status==='Brouillon');
  const featured=drafts[0] || signatures[0] || actionable[0] || all[0];
  const p=featured?constructionProgress(featured):constructionProgress({draft:draftSeed,selected:[],status:'Brouillon'});
  const activeTeam=state.members.filter(x=>x.status==='Acceptée');
  const amount=signed.reduce((sum,c)=>sum+c.price,0);
  const shown=all.filter(c=>dashboardFilter==='all'||dashboardFilter==='action'&&actionable.includes(c)||dashboardFilter==='signed'&&signed.includes(c));
  const priority=signatures[0]||actionable[0];
  const actionLabel=featured?.status==='Brouillon'?'Reprendre mon projet':p.complete?'Voir mon dossier':'Poursuivre mon dossier';
  return `<header class="dashboard-welcome"><div><p class="eyebrow">Votre tableau de bord</p><h1>Bonjour, <span>${esc(state.user.first)}.</span></h1><p>Vos projets avancent. Gardez une longueur d’avance.</p></div>${btn(icon('plus')+'Déclarer un projet','new-project','primary')}</header>
    <section class="dashboard-metrics" aria-label="Votre activité en chiffres">
      <a class="metric-card metric-mint" href="#/contracts"><div class="metric-label">Projets suivis ${icon('arrow-up')}</div><div class="metric-value">${String(all.length).padStart(2,'0')}<span class="metric-symbol">${icon('building')}</span></div><span class="metric-foot">Tous vos dossiers, au même endroit</span></a>
      <button class="metric-card metric-sand" data-action="dashboard-filter" data-filter="action"><div class="metric-label">À faire avancer ${icon('arrow-up')}</div><div class="metric-value">${String(actionable.length).padStart(2,'0')}<span class="metric-symbol">${icon('clock')}</span></div><span class="metric-foot">${signatures.length} à signer · ${drafts.length} brouillon${drafts.length>1?'s':''}</span></button>
      <button class="metric-card metric-lilac" data-action="dashboard-filter" data-filter="signed"><div class="metric-label">Contrats confirmés ${icon('arrow-up')}</div><div class="metric-value">${String(signed.length).padStart(2,'0')}<span class="metric-symbol">${icon('check-circle')}</span></div><span class="metric-foot">Signés, facturés ou clôturés</span></button>
      <a class="metric-card metric-white" href="#/contracts"><div class="metric-label">Prestations engagées ${icon('arrow-up')}</div><div class="metric-value metric-money">${new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(amount)}<span>€</span></div><span class="metric-foot">Montant HT des contrats confirmés</span></a>
    </section>
    <div class="dashboard-middle"><section class="project-spotlight" aria-labelledby="spotlight-title">
      <div class="spotlight-copy"><div class="spotlight-kicker"><span class="status-dot"></span>${featured?'Votre projet à la une':'Tout commence ici'}</div><h2 id="spotlight-title">${featured?esc(featured.name):'Donnons forme à votre prochain projet.'}</h2><p>${featured?`${esc(featured.draft.city||'Localisation à préciser')} · ${esc(featured.type)}`:'Déclarez votre chantier. Votre tour se construit à chaque étape du dossier.'}</p>
      <div class="spotlight-progress"><div><span>Préparation du dossier</span><strong>${p.percent}<small> %</small></strong></div><div class="light-meter"><span style="transform:scaleX(${p.percent/100})"></span></div><small>${p.complete?'Dossier finalisé · signature confirmée':constructionSteps[p.next][0]+' · prochaine étape'}</small></div>
      ${featured?(p.complete?link(actionLabel+' '+icon('arrow'),'detail?id='+featured.id,'spotlight-cta'):btn(actionLabel+' '+icon('arrow'),'open-contract','spotlight-cta',`data-id="${esc(featured.id)}"`)):btn('Créer mon premier projet '+icon('arrow'),'new-project','spotlight-cta')}
      <span class="spotlight-note">Une tour qui prend forme, un dossier qui avance.</span></div>
      <div class="spotlight-scene">${towerSvg(p)}<span class="model-tag"><i></i> ${p.complete?'Projet finalisé':'Votre projet prend forme'}</span><span class="model-caption">Illustration de la préparation du dossier</span></div>
    </section><section class="dashboard-priorities"><div class="dashboard-section-head"><h2>À vous de jouer</h2><span class="count">${(priority?1:0)+(state.requests&&state.role==='referent'?1:0)+(!state.bank?1:0)}</span></div>
    ${priority?`<a class="priority-item" href="#/detail?id=${priority.id}"><span class="priority-icon mint">${icon('edit')}</span><div><strong>${priority.status==='À signer'?'Un contrat attend votre signature':'Un dossier à faire avancer'}</strong><small>${esc(priority.name)}</small></div>${icon('arrow-up')}</a>`:'<div class="priority-clear">'+icon('check-circle')+'<p>Aucun dossier en attente.<br><small>Vous êtes à jour.</small></p></div>'}
    ${state.requests&&state.role==='referent'?`<a class="priority-item" href="#/team"><span class="priority-icon sand">${icon('users')}</span><div><strong>Une demande pour votre équipe</strong><small>Julie Petit souhaite vous rejoindre</small></div>${icon('arrow-up')}</a>`:''}
    ${!state.bank?`<a class="priority-item" href="#/profile"><span class="priority-icon lilac">${icon('bank')}</span><div><strong>Anticipez votre première commande</strong><small>Complétez vos coordonnées bancaires</small></div>${icon('arrow-up')}</a>`:''}
    <div class="priority-footer">${icon('check-circle')} Vos brouillons sont sauvegardés au fil de la saisie.</div></section></div>
    <div class="dashboard-bottom"><section class="dashboard-projects" id="dashboard-projects"><div class="dashboard-section-head"><div><h2>Vos dossiers</h2><p>Chaque projet, sa prochaine étape.</p></div><a class="textlink" href="#/contracts">Tout voir ${icon('arrow')}</a></div>
    <div class="dashboard-tabs" role="group" aria-label="Filtrer les dossiers">${[['all','Tous les projets',all.length],['action','À traiter',actionable.length],['signed','Confirmés',signed.length]].map(([key,label,count])=>`<button data-action="dashboard-filter" data-filter="${key}" aria-pressed="${dashboardFilter===key}">${label}<span>${count}</span></button>`).join('')}</div>
    <div class="dashboard-project-list">${shown.length?shown.slice(0,4).map((c,i)=>`<a class="dashboard-project-row" href="#/detail?id=${c.id}"><span class="project-glyph tone-${i%3}">${icon(c.type==='Centrale Photovoltaïque'?'sun':'building')}</span><div class="project-row-title"><strong>${esc(c.name)}</strong><small>${esc(c.ref)} · ${esc(c.draft.city||'Localisation à préciser')}</small></div>${badge(c.status)}<span class="project-row-date">${esc(c.date)}</span><span class="row-arrow">${icon('arrow')}</span></a>`).join(''):`<div class="dashboard-empty">${icon('folder')}<h3>${all.length?'Aucun dossier dans cette catégorie':'Votre premier projet commence ici'}</h3><p>${all.length?'Vos autres dossiers restent accessibles dans Tous les projets.':'Ajoutez un chantier pour retrouver ici son avancement.'}</p>${all.length?btn('Tous les projets','dashboard-filter','tertiary','data-filter="all"'):btn('Déclarer un projet','new-project','primary')}</div>`}</div></section>
    <aside class="dashboard-overview"><section class="portfolio-card"><div class="dashboard-section-head"><h2>Vue d’ensemble</h2>${icon('chart')}</div><div class="portfolio-body"><div class="portfolio-ring" role="img" aria-label="${signed.length} dossiers confirmés sur ${all.length}" style="background:conic-gradient(var(--primary) 0 ${all.length?signed.length/all.length*360:0}deg,#a8cec6 ${all.length?signed.length/all.length*360:0}deg ${all.length?(signed.length+signatures.length)/all.length*360:0}deg,#e6ebe7 0)"><div><strong>${all.length}</strong><small>projets</small></div></div><ul><li><i class="ring-dark"></i><span>Confirmés</span><strong>${signed.length}</strong></li><li><i class="ring-mint"></i><span>À signer</span><strong>${signatures.length}</strong></li><li><i class="ring-pale"></i><span>En préparation</span><strong>${all.length-signed.length-signatures.length}</strong></li></ul></div></section>
    <section class="team-summary"><div class="dashboard-section-head"><h2>Votre équipe</h2>${state.role==='referent'?'<a class="btn team-link" href="#/team" aria-label="Gérer votre équipe">'+icon('arrow-up')+'</a>':icon('users')}</div><div class="team-members"><div class="avatar-stack">${activeTeam.slice(0,3).map(m=>`<span title="${esc(m.first+' '+m.last)}">${esc(m.first[0]+m.last[0])}</span>`).join('')}</div><p><strong>${activeTeam.length} collaborateurs</strong><small>Une équipe, des projets partagés.</small></p></div></section></aside></div>
    <footer class="dashboard-footer"><span>${icon('lock')} Votre espace de travail personnel</span><button data-action="help">Besoin d’un coup de main ? ${icon('arrow-up')}</button></footer>`;
}

document.addEventListener('click',event=>{
  const button=event.target.closest('[data-action="dashboard-filter"]');
  if(!button)return;
  dashboardFilter=button.dataset.filter;
  render();
  const active=$('.dashboard-tabs [aria-pressed="true"]');
  active?.focus({preventScroll:true});
  $('#dashboard-projects')?.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
});
