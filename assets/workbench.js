function workbench(){
  const params=new URLSearchParams(location.hash.split('?')[1]);
  const selected=coverage.find(x=>x.id===params.get('screen'));
  if(selected){
    const format=params.get('device')==='mobile'?'mobile':params.get('device')==='tablet'?'tablet':'fluid';
    location.replace('ecrans/'+selected.file+'?format='+format);
    return '<p>Ouverture de l’écran…</p>';
  }
  return `<div class="screen-index"><header class="screen-index-head"><div><p class="eyebrow">PIVOTEK ANJOU · ESPACE CLIENT</p><h1>Les écrans, un par un.</h1><p>${coverage.length} vues HTML interactives pour préparer le design dans Figma.</p></div><a class="btn primary" href="ecrans/${coverage[0].file}">Commencer par l’accueil ${icon('arrow')}</a></header><main id="main"><div class="index-explanation"><strong>Chaque écran s’ouvre en pleine largeur.</strong><p>Utilisez les interactions réelles, changez l’état ou le rôle, puis ouvrez « Interactions UX » pour retrouver les règles et les destinations. Les formats 1440, 768 et 390 px restent accessibles.</p><div class="palette-strip"><span><i style="background:#243a52"></i>Bleu nuit</span><span><i style="background:#89c1bd"></i>Turquoise</span><span><i style="background:#9eba83"></i>Vert</span><span>Montserrat · charte du site</span></div></div><div class="screen-index-grid">${screenGroups.map(([page,title])=>`<section class="index-group"><div class="index-group-title"><span>${page}</span><h2>${title}</h2></div>${coverage.filter(x=>x.page===page).map(x=>`<a href="ecrans/${x.file}"><span class="index-screen-number">${x.id}</span><div><strong>${x.nom}</strong><small>${x.objectif}</small></div><span aria-hidden="true">↗</span></a>`).join('')}</section>`).join('')}</div><footer class="index-footer"><a href="#/journeys">Parcours à tester</a><a href="#/kit">Composants communs</a><span>Note UX du 13 octobre 2026 · données fictives</span></footer></main></div>`;
}
function setupBoard(){}
