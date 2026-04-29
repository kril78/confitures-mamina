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

    const stats = [
        { label: 'Visites totales', valeur: total, icone: '👁', desc: 'Toutes pages confondues' },
        { label: 'Visiteurs mobile', valeur: mobiles, icone: '📱', desc: `${Math.round(mobiles/total*100)||0}% du total` },
        { label: 'Pages distinctes', valeur: pages, icone: '📄', desc: 'Pages visitées' },
        { label: 'Clics confitures', valeur: clics, icone: '🍓', desc: 'Fiches consultées' },
    ];

    document.getElementById('chiffres-cles').innerHTML = stats.map(s => `
        <div style="
            background: white;
            border-radius: 12px;
            padding: 28px 30px;
            flex: 1;
            min-width: 150px;
            box-shadow: 0 4px 20px rgba(184,134,11,0.12);
            border-top: 4px solid var(--couleur-dore);
            text-align: center;
            transition: transform 0.2s;
        " onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <div style="font-size:2.2em; margin-bottom:10px;">${s.icone}</div>
            <div style="font-size:2.4em; color:var(--couleur-dore); font-family:Georgia,serif; font-weight:normal; line-height:1;">${s.valeur}</div>
            <div style="color:var(--couleur-texte); font-size:0.95em; margin-top:8px; font-weight:bold;">${s.label}</div>
            <div style="color:#aaa; font-size:0.8em; margin-top:4px; font-style:italic;">${s.desc}</div>
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
    const total = visites.length || 1;

    document.getElementById('stats-pages').innerHTML = tries.map(([page, nb], i) => `
        <div style="margin-bottom:18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="
                        background:var(--couleur-dore);
                        color:white;
                        font-size:0.7em;
                        padding:2px 8px;
                        border-radius:10px;
                        min-width:20px;
                        text-align:center;
                    ">#${i+1}</span>
                    <span style="color:var(--couleur-texte); font-size:0.95em;">${page}</span>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="color:#aaa; font-size:0.8em;">${Math.round(nb/total*100)}%</span>
                    <span style="color:var(--couleur-dore); font-weight:bold; min-width:30px; text-align:right;">${nb}</span>
                </div>
            </div>
            <div style="background:#f0ebe0; border-radius:6px; height:8px; overflow:hidden;">
                <div style="
                    background: linear-gradient(90deg, var(--couleur-dore), var(--couleur-dore-clair));
                    width:${Math.round(nb/max*100)}%;
                    height:100%;
                    border-radius:6px;
                    transition: width 0.6s ease;
                "></div>
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
    const pctDesktop = Math.round(desktop/total*100);
    const pctMobile = Math.round(mobile/total*100);

    document.getElementById('stats-appareils').innerHTML = `
        <div style="display:flex; gap:20px; flex-wrap:wrap;">
            <div style="background:white; border-radius:12px; padding:25px 30px; text-align:center; flex:1; min-width:120px; box-shadow:0 4px 20px rgba(184,134,11,0.08);">
                <div style="font-size:2.5em; margin-bottom:8px;">🖥</div>
                <div style="font-size:2em; color:var(--couleur-dore); font-family:Georgia,serif;">${desktop}</div>
                <div style="color:var(--couleur-texte); font-size:0.9em; margin-top:6px; font-weight:bold;">Desktop</div>
                <div style="margin-top:12px; background:#f0ebe0; border-radius:6px; height:6px;">
                    <div style="background:linear-gradient(90deg, var(--couleur-dore), var(--couleur-dore-clair)); width:${pctDesktop}%; height:100%; border-radius:6px;"></div>
                </div>
                <div style="color:#aaa; font-size:0.85em; margin-top:6px;">${pctDesktop}%</div>
            </div>
            <div style="background:white; border-radius:12px; padding:25px 30px; text-align:center; flex:1; min-width:120px; box-shadow:0 4px 20px rgba(184,134,11,0.08);">
                <div style="font-size:2.5em; margin-bottom:8px;">📱</div>
                <div style="font-size:2em; color:var(--couleur-dore); font-family:Georgia,serif;">${mobile}</div>
                <div style="color:var(--couleur-texte); font-size:0.9em; margin-top:6px; font-weight:bold;">Mobile</div>
                <div style="margin-top:12px; background:#f0ebe0; border-radius:6px; height:6px;">
                    <div style="background:linear-gradient(90deg, var(--couleur-dore), var(--couleur-dore-clair)); width:${pctMobile}%; height:100%; border-radius:6px;"></div>
                </div>
                <div style="color:#aaa; font-size:0.85em; margin-top:6px;">${pctMobile}%</div>
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
    const total = visites.length || 1;

    document.getElementById('stats-langues').innerHTML = tries.map(([lang, nb]) => `
        <div style="margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="color:var(--couleur-texte); font-size:0.95em;">🌐 ${lang}</span>
                <div style="display:flex; gap:10px; align-items:center;">
                    <span style="color:#aaa; font-size:0.8em;">${Math.round(nb/total*100)}%</span>
                    <span style="color:var(--couleur-dore); font-weight:bold;">${nb}</span>
                </div>
            </div>
            <div style="background:#f0ebe0; border-radius:6px; height:8px; overflow:hidden;">
                <div style="background:linear-gradient(90deg, var(--couleur-dore), var(--couleur-dore-clair)); width:${Math.round(nb/max*100)}%; height:100%; border-radius:6px;"></div>
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

    const medailles = ['🥇', '🥈', '🥉'];

    if (tries.length === 0) {
        document.getElementById('stats-confitures').innerHTML = '<p style="color:#aaa; font-style:italic; text-align:center; padding:20px;">Aucun clic enregistré pour le moment.</p>';
        return;
    }

    document.getElementById('stats-confitures').innerHTML = tries.map(([nom, nb], i) => `
        <div style="
            margin-bottom:16px;
            background:${i < 3 ? '#fffdf5' : 'transparent'};
            border-radius:8px;
            padding:${i < 3 ? '12px 15px' : '0'};
            border:${i < 3 ? '1px solid #f0ebe0' : 'none'};
        ">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:6px;">
                <span style="font-size:${i < 3 ? '1.4em' : '1em'}; min-width:30px; text-align:center;">
                    ${i < 3 ? medailles[i] : `<span style="color:#aaa; font-size:0.85em;">#${i+1}</span>`}
                </span>
                <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span style="color:var(--couleur-texte); font-size:0.95em; font-weight:${i < 3 ? 'bold' : 'normal'};">${nom}</span>
                        <span style="color:var(--couleur-dore); font-weight:bold;">${nb} clic${nb > 1 ? 's' : ''}</span>
                    </div>
                    <div style="background:#f0ebe0; border-radius:6px; height:8px; overflow:hidden;">
                        <div style="
                            background:${i === 0 ? 'linear-gradient(90deg, #B8860B, #FFD700)' : i === 1 ? 'linear-gradient(90deg, #888, #bbb)' : i === 2 ? 'linear-gradient(90deg, #8B4513, #CD853F)' : 'linear-gradient(90deg, var(--couleur-dore), var(--couleur-dore-clair))'};
                            width:${Math.round(nb/max*100)}%;
                            height:100%;
                            border-radius:6px;
                        "></div>
                    </div>
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
        if (key && compteur[key] !== undefined) compteur[key]++;
    });

    const entries = Object.entries(compteur);
    const max = Math.max(...entries.map(e => e[1])) || 1;
    const total30 = entries.reduce((s, e) => s + e[1], 0);
    const moy = Math.round(total30 / 30 * 10) / 10;

    document.getElementById('stats-jours').innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
            <span style="color:#aaa; font-size:0.85em; font-style:italic;">Survolez les barres pour le détail</span>
            <div style="display:flex; gap:20px;">
                <span style="color:var(--couleur-texte-secondaire); font-size:0.85em;">Total : <strong style="color:var(--couleur-dore);">${total30}</strong></span>
                <span style="color:var(--couleur-texte-secondaire); font-size:0.85em;">Moy/jour : <strong style="color:var(--couleur-dore);">${moy}</strong></span>
            </div>
        </div>
        <div style="display:flex; align-items:flex-end; gap:3px; height:140px; padding:0 0 10px 0;">
            ${entries.map(([date, nb]) => `
                <div style="flex:1; display:flex; flex-direction:column; align-items:center; height:100%;">
                    <div style="flex:1; display:flex; align-items:flex-end; width:100%;">
                        <div title="${date.substring(5)} : ${nb} visite(s)" style="
                            width:100%;
                            height:${nb > 0 ? Math.max(Math.round(nb/max*100), 4) : 0}%;
                            background:linear-gradient(180deg, var(--couleur-dore-clair), var(--couleur-dore));
                            border-radius:3px 3px 0 0;
                            cursor:default;
                            transition:opacity 0.2s;
                            opacity:0.85;
                        " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.85'"></div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:4px; color:#aaa; font-size:0.75em; padding:0 2px;">
            <span>${entries[0]?.[0]?.substring(5)}</span>
            <span>${entries[9]?.[0]?.substring(5)}</span>
            <span>${entries[19]?.[0]?.substring(5)}</span>
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
    const heureMax = entries.reduce((a, b) => b[1] > a[1] ? b : a, ['0', 0]);

    document.getElementById('stats-heures').innerHTML = `
        <div style="margin-bottom:15px;">
            <span style="color:var(--couleur-texte-secondaire); font-size:0.85em;">
                Pic d'activité : <strong style="color:var(--couleur-dore);">${heureMax[0]}h</strong>
                (${heureMax[1]} visite${heureMax[1] > 1 ? 's' : ''})
            </span>
        </div>
        <div style="display:flex; align-items:flex-end; gap:3px; height:140px; padding:0 0 10px 0;">
            ${entries.map(([heure, nb]) => `
                <div style="flex:1; display:flex; flex-direction:column; align-items:center; height:100%;">
                    <div style="flex:1; display:flex; align-items:flex-end; width:100%;">
                        <div title="${heure}h : ${nb} visite(s)" style="
                            width:100%;
                            height:${nb > 0 ? Math.max(Math.round(nb/max*100), 4) : 0}%;
                            background:${nb === parseInt(heureMax[0]) && nb === heureMax[1]
                                ? 'linear-gradient(180deg, #FFD700, var(--couleur-dore))'
                                : 'linear-gradient(180deg, var(--couleur-dore-clair), var(--couleur-dore))'};
                            border-radius:3px 3px 0 0;
                            cursor:default;
                            opacity:0.85;
                            transition:opacity 0.2s;
                        " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.85'"></div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:4px; color:#aaa; font-size:0.75em;">
            <span>0h</span>
            <span>6h</span>
            <span>12h</span>
            <span>18h</span>
            <span>23h</span>
        </div>
    `;
}
