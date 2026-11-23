# Atelier d’outils

Des prototypes indépendants pour des opérations très concrètes : préparer un dossier de fabrication, rapprocher des offres, suivre une révision, organiser un départ ou contrôler un fichier avant transmission.

Chaque étude possède son interface, son scénario et ses règles métier. Les données sont fictives. Les noms d’entreprises identifient le destinataire d’une proposition indépendante ; ils n’indiquent ni commande passée ni partenariat.

## Essayer une étude

Le lien d’une étude utilise `?etude=<identifiant>`. La page d’accueil reste volontairement sobre. Les liens directs sont transmis avec le contexte du scénario.

```sh
npm ci
npm run dev
```

Exemple local : `http://127.0.0.1:4173/?etude=kolinkis`.

## Organisation du code

- `src/demos/<identifiant>/App.jsx` porte le parcours interactif.
- `model.js` ou `logic.js` contient les transformations déterministes et les règles de validation.
- `styles.css` porte la composition et les adaptations mobiles propres à l’étude.
- `src/shared/` rassemble les exports, le calendrier et les éléments de contexte communs.
- Les tests sont placés près des règles métier ou dans `tests/`.

Les modules sont chargés à la demande. Il n’y a pas de service distant, de compte de démonstration ni de connexion simulée à un logiciel tiers. Les modifications restent en mémoire dans l’onglet et peuvent être exportées localement.

## Vérification

```sh
npm test
npm run build
```

Les tests portent notamment sur les invariants de quantité et d’argent, les limites de format, les dates, les conflits de planning, l’invalidation des validations après modification et l’exclusion des informations internes. Les exports CSV protègent les cellules contre l’interprétation de formules. Les calendriers respectent l’échappement et le pliage des lignes iCalendar.

Le workflow de publication exécute les tests avant de construire et déployer les fichiers statiques. Les polices utilisées sont livrées par leurs paquets Fontsource, avec leurs licences respectives.

## Portée des démonstrations

Les paramètres illustratifs sont indiqués dans chaque interface. Un schéma de principe ne constitue pas un plan d’exécution ; une préparation de devis n’engage aucun tarif ni disponibilité. Les validations proposées restent des décisions de l’utilisateur.

Un pilote réel commencerait par le format de données existant, les règles validées avec l’équipe, les droits d’accès et les conditions de maintenance. Le prototype permet de tester le parcours avant ce raccordement.

[Autres réalisations](https://imtoocompedidiv.github.io/portfolio/)
