// ===================================
// AUTHENTIFICATION
// ===================================

async function verifierMdp() {
    const email = document.getElementById('champ-email').value.trim();
    const mdp = document.getElementById('champ-mdp').value;

    if (!email || !mdp) {
        document.getElementById('msg-erreur').style.display = 'block';
        return;
    }

    const resultat = await connecter(email, mdp);

    if (resultat.access_token) {
        localStorage.setItem('sb_token', resultat.access_token);
        localStorage.setItem('sb_refresh_token', resultat.refresh_token);
        document.getElementById('ecran-mdp').remove();
        await chargerStats();
    } else {
        document.getElementById('msg-erreur').style.display = 'block';
        document.getElementById('champ-mdp').value = '';
    }
}

async function init() {
    const connecte = await verifierSession();
    if (connecte) {
        document.getElementById('ecran-mdp').remove();
        await chargerStats();
    }
}

init();

// ===================================
// CHARGEMENT
// ===================================

async function chargerStats() {
    const visites = await db.get('visites');
    afficherChiffresCles(visites);
    afficherPages(visites);
    afficherAppareils(visites);
    afficherLangues(visites);
    afficherConfitures(visites);
    afficherJours(visites);
    afficherHeures(visites);
}

// ===================================
// CHIFFRES CLÉS
// ===================================

function afficherChiffresCles(visites) {
    const total = visites.length;
    const mobiles = visites.filter(v => v.appareil === 'mobile').length;
    const pages = [...new Set(visites.map(v => v.page))].length;
    const clics = visites.filter(v => v.element && v.element.startsWith('confiture:')).length;

    const bloc = document.getElementById('chiffres-cles');
    const stats = [
        { label: 'Visites totales', valeur: total, icone: '👁' },
        { label: 'Visiteurs mobile', valeur: mobiles, icone: '📱' },
        { label: 'Pages visitées', valeur: pages, icone: '📄' },
        { label: 'Clics confitures', valeur: clics, icone: '🍓' },
    ];

    bloc.innerHTML = stats.map(s => `
        <div style="
            background: white;
            border: 2px solid var(--couleur-dore);
            border-radius: 10px;
            padding: 25px 35px;
            text-align: center;
            flex: 1;
            min-width: 150px;
        ">
            <div style="font-size:2em; margin-bottom:8px;">${s.icone}</div>
            <div style="font-size:2em; color:var(--couleur-dore); font-family:Georgia,serif;">${s.valeur}</div>
            <div style="color:var(--couleur-texte-secondaire); font-size:0.9em; margin-top:5px;">${s.label}</div>
        </div>
    `).join('');
}

// ===================================
// VISITES PAR PAGE
// ===================================

function afficherPages(visites) {
    const compteur = {};
    visites.forEach(v => {
        compteur[v.page] = (compteur[v.page] || 0) + 1;
    });

    const tries = Object.entries(compteur).sort((a, b) => b[1] - a[1]);
    const max = tries[0]?.[1] || 1;

    document.getElementById('stats-pages').innerHTML = tries.map(([page, nb]) => `
        <div style="margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="color:var(--couleur-texte);">${page}</span>
                <span style="color:var(--couleur-dore); font-weight:bold;">${nb}</span>
            </div>
            <div style="background:#eee; border-radius:4px; height:10px;">
                <div style="background:var(--couleur-dore); width:${Math.round(nb/max*100)}%; height:100%; border-radius:4px;"></div>
            </div>
        </div>
    `).join('');
}

// ===================================
// APPAREILS
// ===================================

function afficherAppareils(visites) {
    const mobile = visites.filter(v => v.appareil === 'mobile').length;
    const desktop = visites.filter(v => v.appareil === 'desktop').length;
    const total = visites.length || 1;

    document.getElementById('stats-appareils').innerHTML = `
        <div style="display:flex; gap:20px; flex-wrap:wrap;">
            <div style="background:white; border:1px solid #eee; border-radius:8px; padding:20px 30px; text-align:center; flex:1; min-width:120px;">
                <div style="font-size:2em;">🖥</div>
                <div style="font-size:1.6em; color:var(--couleur-dore);">${desktop}</div>
                <div style="color:var(--couleur-texte-secondaire); font-size:0.85em;">Desktop</div>
                <div style="color:#aaa; font-size:0.8em;">${Math.round(desktop/total*100)}%</div>
            </div>
            <div style="background:white; border:1px solid #eee; border-radius:8px; padding:20px 30px; text-align:center; flex:1; min-width:120px;">
                <div style="font-size:2em;">📱</div>
                <div style="font-size:1.6em; color:var(--couleur-dore);">${mobile}</div>
                <div style="color:var(--couleur-texte-secondaire); font-size:0.85em;">Mobile</div>
                <div style="color:#aaa; font-size:0.8em;">${Math.round(mobile/total*100)}%</div>
            </div>
        </div>
    `;
}

// ===================================
// LANGUES
// ===================================

function afficherLangues(visites) {
    const compteur = {};
    visites.forEach(v => {
        const lang = v.langue || 'inconnu';
        compteur[lang] = (compteur[lang] || 0) + 1;
    });

    const tries = Object.entries(compteur).sort((a, b) => b[1] - a[1]);
    const max = tries[0]?.[1] || 1;

    document.getElementById('stats-langues').innerHTML = tries.map(([lang, nb]) => `
        <div style="margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="color:var(--couleur-texte);">${lang}</span>
                <span style="color:var(--couleur-dore); font-weight:bold;">${nb}</span>
            </div>
            <div style="background:#eee; border-radius:4px; height:10px;">
                <div style="background:var(--couleur-dore); width:${Math.round(nb/max*100)}%; height:100%; border-radius:4px;"></div>
            </div>
        </div>
    `).join('');
}

// ===================================
// CONFITURES LES PLUS CLIQUÉES
// ===================================

function afficherConfitures(visites) {
    const clics = visites.filter(v => v.element && v.element.startsWith('confiture:'));
    const compteur = {};
    clics.forEach(v => {
        const nom = v.element.replace('confiture:', '');
        compteur[nom] = (compteur[nom] || 0) + 1;
    });

    const tries = Object.entries(compteur).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const max = tries[0]?.[1] || 1;

    if (tries.length === 0) {
        document.getElementById('stats-confitures').innerHTML = '<p style="color:var(--couleur-texte-secondaire); font-style:italic;">Aucun clic enregistré pour le moment.</p>';
        return;
    }

    document.getElementById('stats-confitures').innerHTML = tries.map(([nom, nb], i) => `
        <div style="margin-bottom:12px; display:flex; align-items:center; gap:15px;">
            <span style="color:var(--couleur-dore); font-size:1.1em; min-width:25px;">#${i+1}</span>
            <div style="flex:1;">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--couleur-texte);">${nom}</span>
                    <span style="color:var(--couleur-dore); font-weight:bold;">${nb} clic${nb > 1 ? 's' : ''}</span>
                </div>
                <div style="background:#eee; border-radius:4px; height:10px;">
                    <div style="background:var(--couleur-dore); width:${Math.round(nb/max*100)}%; height:100%; border-radius:4px;"></div>
                </div>
            </div>
        </div>
    `).join('');
}

// ===================================
// VISITES PAR JOUR (30 derniers jours)
// ===================================

function afficherJours(visites) {
    const compteur = {};
    const aujourd = new Date();

    for (let i = 29; i >= 0; i--) {
        const d = new Date(aujourd);
        d.setDate(aujourd.getDate() - i);
        const key = d.toISOString().split('T')[0];
        compteur[key] = 0;
    }

    visites.forEach(v => {
        const key = v.date?.split('T')[0];
        if (key && compteur[key] !== undefined) {
            compteur[key]++;
        }
    });

    const entries = Object.entries(compteur);
    const max = Math.max(...entries.map(e => e[1])) || 1;

    document.getElementById('stats-jours').innerHTML = `
        <div style="display:flex; align-items:flex-end; gap:4px; height:120px;">
            ${entries.map(([date, nb]) => `
                <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; height:100%;">
                    <div style="flex:1; display:flex; align-items:flex-end; width:100%;">
                        <div title="${date}: ${nb} visite(s)" style="
                            width:100%;
                            height:${Math.round(nb/max*100)}%;
                            min-height:${nb > 0 ? '4px' : '0'};
                            background:var(--couleur-dore);
                            border-radius:2px 2px 0 0;
                            cursor:default;
                        "></div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:6px; color:#aaa; font-size:0.75em;">
            <span>${entries[0]?.[0]?.substring(5)}</span>
            <span>${entries[14]?.[0]?.substring(5)}</span>
            <span>${entries[29]?.[0]?.substring(5)}</span>
        </div>
    `;
}

// ===================================
// VISITES PAR HEURE
// ===================================

function afficherHeures(visites) {
    const compteur = {};
    for (let i = 0; i < 24; i++) compteur[i] = 0;

    visites.forEach(v => {
        if (v.date) {
            const heure = new Date(v.date).getHours();
            compteur[heure]++;
        }
    });

    const entries = Object.entries(compteur);
    const max = Math.max(...entries.map(e => e[1])) || 1;

    document.getElementById('stats-heures').innerHTML = `
        <div style="display:flex; align-items:flex-end; gap:4px; height:120px;">
            ${entries.map(([heure, nb]) => `
                <div style="flex:1; display:flex; flex-direction:column; align-items:center; height:100%;">
                    <div style="flex:1; display:flex; align-items:flex-end; width:100%;">
                        <div title="${heure}h : ${nb} visite(s)" style="
                            width:100%;
                            height:${Math.round(nb/max*100)}%;
                            min-height:${nb > 0 ? '4px' : '0'};
                            background:var(--couleur-dore);
                            border-radius:2px 2px 0 0;
                            cursor:default;
                        "></div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:6px; color:#aaa; font-size:0.75em;">
            <span>0h</span>
            <span>6h</span>
            <span>12h</span>
            <span>18h</span>
            <span>23h</span>
        </div>
    `;
}