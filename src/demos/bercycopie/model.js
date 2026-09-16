export const products=[
 {name:'Dibond',type:'Panneau composite aluminium',old:'http://localhost/index.php/impression-grand-format-paris/panneau-dibond/',target:'https://www.bercycopie.fr/impression-grand-format/panneau-dibond/'},
 {name:'Forex',type:'Panneau PVC expansé',old:'http://localhost/index.php/impression-grand-format-paris/panneau-forex/',target:'https://www.bercycopie.fr/impression-grand-format/panneau-forex/'},
 {name:'Plexiglas',type:'Support transparent',old:'http://localhost/index.php/impression-grand-format-paris/panneau-plexiglas/',target:''},
 {name:'Stickers',type:'Support adhésif',old:'http://localhost/index.php/nos-imprimes/stickers/',target:'https://www.bercycopie.fr/nos-imprimes/stickers/'},
 {name:'Magnets',type:'Support magnétique',old:'http://localhost/index.php/nos-imprimes/magnets/',target:''},
];
export const destinations=[['Choisir une destination',''],['Fiche Dibond',products[0].target],['Fiche Forex',products[1].target],['Fiche Stickers',products[3].target],['Demande de devis','https://www.bercycopie.fr/devis/']];
export function safeTarget(raw){try{const u=new URL(raw);return u.protocol==='https:'&&u.hostname==='www.bercycopie.fr'&&!u.username&&!u.password;}catch{return false;}}
export const escapeHtml=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export function fragment(rows){if(rows.some(x=>!safeTarget(x.target)))throw new Error('Une destination publique manque.');return '<!-- Proposition de liens à intégrer après validation éditoriale. Aucune publication automatique. -->\n<ul>\n'+rows.map(x=>`  <li><a href="${escapeHtml(x.target)}">${escapeHtml(x.name)}</a></li>`).join('\n')+'\n</ul>\n';}
