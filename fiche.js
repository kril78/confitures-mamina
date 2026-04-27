// ===================================
// RÉCUPÉRATION DE L'URL
// ===================================

const params = new URLSearchParams(window.location.search);
const nomRecherche = params.get('nom');

let toutesLesConfitures = [];

// ===================================
// CHARGEMENT
// ===================================

db.get('confitures').then(confitures => {
    toutesLesConfitures = confitures;
    const c = confitures.find(c => c.nom === nomRecherche);

    if (!c) {
        document.getElementById('fiche-contenu').innerHTML = '<p>Confiture introuvable.</p>';
        return;
    }

    document.title = `${c.nom} — Les Confitures de Mamina`;
    afficherFiche(c, confitures);
});
// ===================================
// AFFICHAGE FICHE
// ===================================

function afficherFiche(c, toutes) {
    const imagePath = c.image || '';
    document.getElementById('fiche-contenu').innerHTML = `

        <div class="fiche-bloc">

            <!-- IMAGE -->
            <div class="fiche-image">
                <img src="${imagePath}" alt="${c.nom}" onerror="this.style.display='none'">
            </div>

            <!-- INFOS DROITE -->
            <div class="fiche-infos">
                <h2>${c.nom}</h2>

                <div class="fiche-badges">
                    <span class="badge">${c.type}</span>
                    <span class="badge badge-presence">${c.presence || 'Permanente'}</span>
                </div>

                <p class="fiche-description-courte">${c.description_courte || ''}</p>

                <div class="fiche-prix">
                    <span class="prix-item">1 pot — <strong>8 €</strong></span>
                    <span class="prix-separateur">|</span>
                    <span class="prix-item">4 pots — <strong>30 €</strong></span>
                </div>

                <div class="fiche-details">
                    <p><span class="label">🍓 Fruits :</span> ${c.fruits}</p>
                    <p><span class="label">📦 Catégorie :</span> ${c.categorie || '—'}</p>
                    <p><span class="label">⚗️ Composition :</span> ${c.ingredients || '60% fruits, 40% sucre'}</p>
                </div>

                <a href="contact.html" class="btn-commander">Commander →</a>
            </div>
        </div>

        <!-- DESCRIPTION LONGUE -->
        <div class="fiche-description-longue">
            <h3>Notre histoire avec cette confiture</h3>
            <p>${c.description_longue || ''}</p>
        </div>

        <!-- CARROUSEL SUGGESTIONS -->
        <div class="fiche-suggestions">
            <h3>Vous aimerez aussi</h3>
            <div class="carrousel-tendances">
            const suggestions = toutes.filter(x => x.nom !== c.nom && x.categorie === c.categorie);
            const fallback = suggestions.length >= 3 ? suggestions : toutes.filter(x => x.nom !== c.nom);
            ${toutes
                .filter(x => x.nom !== c.nom && x.categorie === c.categorie)
                .slice(0, 6)
                .map(x => `
                    <div class="carte-tendance" onclick="window.location.href='fiche.html?nom=${encodeURIComponent(x.nom)}'">
                        <img src="${x.image || ''}" 
                             alt="${x.nom}"
                             onerror="this.style.display='none'">
                        <p>${x.nom}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
