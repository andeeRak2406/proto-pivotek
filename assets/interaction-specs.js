// Repères de reconstruction dans Figma ; le comportement reste exécutable en HTML.
const interactionSpecs={
 '01.1':{states:[['normal','Formulaire de connexion'],['error','Échec de connexion']],items:[
  ['Formulaire de connexion','Arrivée sur l’accueil','Présenter le service et une zone visuelle à gauche, le formulaire e-mail / mot de passe à droite. Sur petit écran, privilégier directement le formulaire. Aucun choix préalable ni fenêtre imposée.',''],
  ['Se connecter','Soumission','Vérifier les champs requis et le format de l’e-mail ; une saisie valide ouvre directement le tableau de bord.','04.1'],
  ['Afficher le mot de passe','Cocher / décocher','Basculer la visibilité du mot de passe sans le conserver.',''],
  ['Mot de passe oublié','Clic','Ouvrir la récupération d’accès.','forgot'],
  ['Créer un compte','Clic','Commencer l’identification de l’entreprise.','02.1'],
  ['Session déjà ouverte','Arrivée sur l’accueil','Accéder directement au tableau de bord.','04.1']]},
 '01.2':{states:[['normal','Formulaire'],['error','Échec de connexion']],items:[
  ['Se connecter','Soumission','Vérifier e-mail et mot de passe requis ; signaler le premier champ invalide. Une saisie valide ouvre le tableau de bord.','04.1'],
  ['Afficher le mot de passe','Cocher / décocher','Basculer uniquement la visibilité du champ. Aucun mot de passe stocké.',''],
  ['Mot de passe oublié','Clic','Ouvrir la récupération avec une confirmation neutre.','forgot']]},
 '02.1':{states:[['normal','Recherche'],['company-found','Entreprise trouvée'],['company-known','Entreprise déjà inscrite'],['manual','Saisie manuelle']],items:[
  ['Rechercher mon entreprise','Soumission','9 chiffres SIREN ou 14 SIRET ; e-mail et entreprise requis. Afficher recherche puis informations officielles en lecture seule.',''],
  ['Saisie manuelle','Clic','Afficher les champs modifiables si le service est indisponible ou l’entreprise introuvable.',''],
  ['Continuer','Soumission valide','Conserver entreprise et e-mail puis saisir les coordonnées du demandeur.','02.2']]},
 '02.2':{states:[['normal','Référent'],['known-company','Collaborateur']],items:[
  ['Retour à l’entreprise','Clic','Conserver les valeurs déjà saisies.','02.1'],
  ['Envoyer ma demande','Soumission','Contrôler prénom, nom, e-mail et téléphone. Un premier référent attend la validation Pivotek.','03.1'],
  ['Demander à rejoindre','Soumission','Pour une entreprise existante, envoyer la demande au référent sans accès automatique.','03.2']]},
 '03.1':{states:[['normal','Vérification en cours'],['approved','Validation accordée']],items:[
  ['Demande reçue','Arrivée','Afficher le statut et les trois étapes. Ne pas inventer de délai de validation.',''],
  ['Simuler la validation Pivotek','Clic de test','Remplacer l’attente par « Validation accordée », puis rendre le lien d’activation disponible.',''],
  ['Ouvrir le lien d’activation','Clic','Accéder au choix du mot de passe après validation.','03.3']]},
 '03.2':{states:[['normal','Attente du référent'],['approved','Demande acceptée'],['refused','Demande refusée']],items:[
  ['Demande de rattachement','Arrivée','Afficher l’entreprise, le référent et le statut. Aucun accès sur la seule base du domaine e-mail.',''],
  ['Accord / refus du référent','Clic de test','Mettre le statut à jour. L’accord rend disponible le lien d’activation.','03.3'],
  ['Assistance','Clic','Ouvrir le panneau d’aide sans perdre la demande.','']]},
 '03.3':{states:[['normal','Activation'],['expired','Lien expiré / utilisé']],items:[
  ['Activer mon espace','Soumission','Deux mots de passe requis et identiques ; activer localement puis ouvrir le tableau de bord.','04.1'],
  ['Lien expiré ou utilisé','Arrivée','Remplacer le formulaire par un message et une action de renouvellement.','forgot']]},
 '04.1':{states:[['normal','Dossiers présents'],['empty','Premier projet'],['loading','Chargement'],['error','Indisponible']],items:[
  ['Déclarer un projet','Clic','Créer un dossier ; si un brouillon existe, proposer de le reprendre ou d’en créer un autre sans l’effacer.','07.1'],
  ['Projet à la une','Clic sur Reprendre / Poursuivre','Ouvrir le brouillon conservé ou le devis du dossier affiché ; la tour reflète ses réponses et son état de signature.','07.2'],
  ['Filtres des dossiers','Tous les projets / À traiter / Confirmés','Filtrer la liste et conserver le focus sur le filtre actif ; les compteurs proviennent des dossiers.',''],
  ['Consulter un dossier','Clic dans la liste','Ouvrir le détail du dossier sélectionné.','06.2'],
  ['Examiner une demande d’accès','Clic du référent','Ouvrir la gestion de l’équipe.','05.2']]},
 '05.1':{states:[['normal','RIB à compléter'],['bank-ready','RIB renseigné']],items:[
  ['Enregistrer les informations','Soumission','Contrôler les coordonnées et la clé IBAN si renseignée ; le RIB reste facultatif à ce stade.',''],
  ['Annuler les modifications','Clic','Revenir aux dernières valeurs enregistrées.',''],
  ['Ajouter / modifier un domaine','Clic','Ouvrir le formulaire puis confirmer le changement. Ne donner aucun accès automatiquement.',''],
  ['Équipe et accès','Onglet','Disponible au référent uniquement.','05.2']]},
 '05.2':{states:[['normal','Équipe'],['empty','Aucun membre']],items:[
  ['Inviter une personne','Clic','Ouvrir le panneau latéral individuel.','05.3'],
  ['Importer une liste','Clic','Ouvrir le panneau de fichier et d’aperçu.','05.4'],
  ['Gérer les droits / examiner','Clic','Choisir préparation ou signature. Confirmer une extension du droit de signature.',''],
  ['Renvoyer','Clic','Renouveler une invitation expirée ou en attente.','']]},
 '05.3':{states:[['normal','Panneau ouvert']],items:[
  ['Envoyer l’invitation','Soumission','Contrôler identité, fonction et e-mail ; bloquer les doublons. Un droit de signature demande une confirmation.','05.2'],
  ['Annuler / fermer / Échap','Clic / touche','Fermer le panneau et restituer le focus. Aucune invitation envoyée.','05.2']]},
 '05.4':{states:[['normal','Choix du fichier'],['import-errors','Erreurs et doublons']],items:[
  ['Choisir / déposer un fichier','CSV ou XLSX','Lire localement les lignes ; afficher un aperçu avant toute invitation.',''],
  ['Corriger / retirer','Clic sur une ligne','Corriger une saisie ou exclure la ligne. Recalculer les erreurs et doublons.',''],
  ['Confirmer les invitations','Clic','Disponible lorsque toutes les lignes sont valides ; confirmer les droits et le nombre de personnes.','05.2'],
  ['Annuler / fermer','Clic / Échap','Fermer sans invitation.','05.2']]},
 '06.1':{states:[['normal','Contrats'],['empty','Aucun contrat'],['loading','Chargement'],['error','Indisponible']],items:[
  ['Rechercher','Soumission','Combiner texte et statut. Afficher les résultats ou un état sans correspondance.',''],
  ['Ouvrir','Clic','Afficher le détail du dossier et garder l’accès aux autres contrats.','06.2'],
  ['Précédent / suivant','Clic','Paginer les résultats filtrés.','']]},
 '06.2':{states:[['normal','Contrat signé']],items:[
  ['Sélectionner un dossier','Clic dans la liste','Afficher ses prestations, documents, montants et historique.',''],
  ['Reprendre / consulter le devis','Clic selon statut','Un brouillon reprend le chantier ; une proposition rejoint les prestations.','07.2'],
  ['Télécharger','Clic','Produire le document fictif du dossier sélectionné. En production : PDF correspondant.',''],
  ['Option complémentaire','Clic','Ouvrir une suggestion fermable ; aucune option ni montant ajouté automatiquement.','']]},
 '07.1':{states:[['normal','Entreprise principale'],['branch','Filiale / agence']],items:[
  ['Tour progressive','Saisie, passage d’étape et reprise','Montrer terrain, fondations, structure, façades, fenêtres, toiture puis finitions selon les réponses conservées. La signature confirmée termine la tour et retire la grue. Illustration masquée aux lecteurs d’écran ; étapes textuelles et version statique en réduction des animations.',''],
  ['Filiale / agence','Sélection','Afficher identité, adresse et contact local. Le SIRET est facultatif, 14 chiffres s’il est rempli.',''],
  ['Payeur et signataire','Sélection','Choix distincts du bénéficiaire. Un choix de signataire n’accorde pas une habilitation.',''],
  ['Continuer','Soumission valide','Sauvegarder et ouvrir les informations du chantier.','07.2'],
  ['Quitter et reprendre plus tard','Clic','Conserver le brouillon.','04.1']]},
 '07.2':{states:[['normal','Exemple renseigné'],['blank','Terrain · 0 %'],['foundations','Fondations · 10 %'],['structure','Structure · 25 %'],['facades','Façades · 50 %']],items:[
  ['Tour progressive','Saisie, passage d’étape et reprise','Montrer terrain, fondations, structure, façades, fenêtres, toiture puis finitions selon les réponses conservées. La signature confirmée termine la tour et retire la grue. Illustration masquée aux lecteurs d’écran ; étapes textuelles et version statique en réduction des animations.',''],
  ['Champs du chantier','Saisie','Sauvegarde locale progressive ; description limitée à 500 caractères ; 19 natures de travaux.',''],
  ['Date et durée de conception','Modification','Calculer le début de réalisation en mois, avec ajustement de fin de mois.',''],
  ['Nature des travaux','Changement','Adapter les prochaines questions et invalider l’ancien chiffrage.',''],
  ['Continuer','Soumission valide','Contrôler les champs obligatoires puis ouvrir le questionnaire adapté.','08.1']]},
 '08.1':{states:[['normal','Réhabilitation ancienne'],['photovoltaic','Photovoltaïque']],items:[
  ['Tour progressive','Saisie, passage d’étape et reprise','Montrer terrain, fondations, structure, façades, fenêtres, toiture puis finitions selon les réponses conservées. La signature confirmée termine la tour et retire la grue. Illustration masquée aux lecteurs d’écran ; étapes textuelles et version statique en réduction des animations.',''],
  ['Année de construction','Saisie','Afficher plomb avant 1949, amiante avant 1997, selon le questionnaire source à confirmer.',''],
  ['Photovoltaïque','Sélection de l’emplacement','Afficher surface et unité ; demander l’année pour une toiture sur bâtiment existant.',''],
  ['Continuer','Soumission valide','Conserver les réponses et passer aux pièces.','08.2']]},
 '08.2':{states:[['normal','Sans document'],['upload-error','Dépôt interrompu']],items:[
  ['Tour progressive','Saisie, passage d’étape et reprise','Montrer terrain, fondations, structure, façades, fenêtres, toiture puis finitions selon les réponses conservées. La signature confirmée termine la tour et retire la grue. Illustration masquée aux lecteurs d’écran ; étapes textuelles et version statique en réduction des animations.',''],
  ['Ajouter / déposer','Sélection de fichiers','PDF, DWG, DXF, ZIP, PNG, JPG, DOCX, XLSX ; 100 Mo par fichier et 1 Go par projet. Progression simulée.',''],
  ['Reprendre / retirer','Clic','Reprendre un dépôt interrompu ; confirmer le retrait d’une pièce.',''],
  ['Choisir mes prestations','Clic','Les pièces sont facultatives et peuvent être complétées plus tard.','09.1']]},
 '09.1':{states:[['normal','Missions proposées'],['empty','Proposition à étudier']],items:[
  ['Tour progressive','Saisie, passage d’étape et reprise','Montrer terrain, fondations, structure, façades, fenêtres, toiture puis finitions selon les réponses conservées. La signature confirmée termine la tour et retire la grue. Illustration masquée aux lecteurs d’écran ; étapes textuelles et version statique en réduction des animations.',''],
  ['Choisir une mission','Cocher / décocher','Mettre immédiatement le total à jour ; conserver le choix.',''],
  ['Options complémentaires','Défilement','Six familles facultatives, aucune ajoutée par défaut.','09.2'],
  ['Passer à la signature','Clic','Au moins une mission requise ; la vérification du devis se fait ici.','10.1']]},
 '09.2':{states:[['normal','Options à la carte']],items:[
  ['Tour progressive','Saisie, passage d’étape et reprise','Montrer terrain, fondations, structure, façades, fenêtres, toiture puis finitions selon les réponses conservées. La signature confirmée termine la tour et retire la grue. Illustration masquée aux lecteurs d’écran ; étapes textuelles et version statique en réduction des animations.',''],
  ['Ajouter / retirer une option','Cocher / décocher','Recalculer le total sans étape cachée ni option précochée.',''],
  ['Total du devis','Visible pendant la sélection','Prix fixes d’illustration dans le prototype ; matrice commerciale à confirmer.',''],
  ['Passer à la signature','Clic','Conserver les sélections pour les engagements.','10.1']]},
 '10.1':{states:[['normal','RIB à renseigner'],['bank-ready','RIB renseigné']],items:[
  ['Tour progressive','Saisie, passage d’étape et reprise','Montrer terrain, fondations, structure, façades, fenêtres, toiture puis finitions selon les réponses conservées. La signature confirmée termine la tour et retire la grue. Illustration masquée aux lecteurs d’écran ; étapes textuelles et version statique en réduction des animations.',''],
  ['Signer le contrat','Bouton en haut','Contrôler séparément exactitude et CGV, puis présence des coordonnées bancaires ; ouvrir la signature simulée.',''],
  ['Consulter les CGV','Clic','Ouvrir le placeholder du document. Aucun devis à relire sur cet écran.',''],
  ['Transmettre au référent','Rôle préparateur','Confirmer l’exactitude et transmettre ; pas de signature ni d’acceptation des CGV au nom du signataire.','waiting'],
  ['Confirmer / annuler la signature','Action dans le module','Succès vers la confirmation ; incident ou annulation laisse le dossier à signer.','10.2']]},
 '10.2':{states:[['normal','Commande confirmée']],items:[
  ['Tour progressive','Saisie, passage d’étape et reprise','Montrer terrain, fondations, structure, façades, fenêtres, toiture puis finitions selon les réponses conservées. La signature confirmée termine la tour et retire la grue. Illustration masquée aux lecteurs d’écran ; étapes textuelles et version statique en réduction des animations.',''],
  ['Confirmation','Arrivée après signature','Afficher les références, le document signé et les prochaines étapes.',''],
  ['Télécharger le contrat','Clic','Document fictif téléchargeable ; envoi simultané au signataire et au payeur simulé.',''],
  ['Voir mon dossier','Clic','Ouvrir le même contrat signé, sans possibilité de modifier la commande signée.','06.2']]},
 'A01':{states:[['normal','Demande de lien']],items:[['Recevoir un lien de réinitialisation','Soumission','Vérifier le format de l’e-mail puis afficher une confirmation neutre. Le lien est envoyé par e-mail en production.',''],['Retour à la connexion','Clic','Revenir au formulaire de connexion.','01.2']]},
 'A02':{states:[['normal','Nouveau mot de passe'],['expired','Lien expiré / utilisé']],items:[['Enregistrer le mot de passe','Soumission','Vérifier les deux saisies identiques. Aucun mot de passe conservé dans le wireframe.','04.1'],['Recevoir un nouveau lien','Clic après expiration','Ouvrir la demande de réinitialisation.','A01']]},
 'A03':{states:[['normal','En attente du référent']],items:[
  ['Tour progressive','Saisie, passage d’étape et reprise','Montrer terrain, fondations, structure, façades, fenêtres, toiture puis finitions selon les réponses conservées. La signature confirmée termine la tour et retire la grue. Illustration masquée aux lecteurs d’écran ; étapes textuelles et version statique en réduction des animations.',''],['Dossier transmis','Arrivée','Afficher le dossier en attente de validation, sans le présenter comme signé.',''],['Voir mon dossier','Clic','Ouvrir le même dossier avec le statut En attente du référent.','06.2'],['Tableau de bord','Clic','Retrouver les dossiers et les actions à faire.','04.1']]},
 'A04':{states:[['normal','Exemples d’e-mails']],items:[['Liens dans les e-mails','Clic','Ouvrir l’écran correspondant au message. Ces exemples sont réservés à la revue.','']]},
 'R01':{states:[['normal','Scénarios']],items:[['Démarrer ce scénario','Clic','Charger les données locales du parcours et ouvrir sa première étape.','']]},
 'R02':{states:[['normal','Composants']],items:[['Champs, boutons et messages','Revue','Vérifier les composants partagés du wireframe.',''],['Tester une fenêtre','Clic','Ouvrir la fenêtre de référence et la fermer au clavier.','']]}
};
