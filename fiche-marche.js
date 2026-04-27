// ===================================
// RÉCUPÉRATION DE L'URL
// ===================================

const params = new URLSearchParams(window.location.search);
const nomRecherche = params.get('nom');

const MOIS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin',
                 'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

// ===================================
// CHARGEMENT
// ===================================

db.get('marches').then(marches => {
    const m = marches.find(m => m.nom === nomRecherche);

    if (!m) {
        document.getElementById('fiche-marche-contenu').innerHTML = '<p>Marché introuvable.</p>';
        return;
    }

    document.title = `${m.nom} — Les Confitures de Mamina`;
    afficherFiche(m);
});

// ===================================
// AFFICHAGE
// ===================================

function afficherFiche(m) {
    const debut = new Date(m.date + 'T00:00:00');
    const fin = new Date((m.date_fin || m.date) + 'T00:00:00');

    const dateTexte = m.date_fin && m.date_fin !== m.date
        ? `Du ${debut.getDate()} au ${fin.getDate()} ${MOIS_FR[fin.getMonth()]} ${fin.getFullYear()}`
        : `Le ${debut.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;

    const aujourdHui = new Date();
    aujourdHui.setHours(0,0,0,0);
    const joursRestants = Math.ceil((debut - aujourdHui) / (1000 * 60 * 60 * 24));

    const compteARebours = joursRestants === 0
        ? "C'est aujourd'hui !"
        : joursRestants > 0
            ? `Dans ${joursRestants} jour${joursRestants > 1 ? 's' : ''}`
            : 'Marché passé';

    const flyerHTML = m.flyer
        ? `<img src="${m.flyer}" alt="Flyer ${m.nom}" class="fiche-marche-flyer">`
        : '';

    document.getElementById('fiche-marche-contenu').innerHTML = `
        <div class="fiche-marche-bloc">

            ${flyerHTML}

            <div class="fiche-marche-infos">
                <h2>${m.nom}</h2>

                <p class="fiche-marche-rebours">${compteARebours}</p>

                <div class="fiche-marche-details">
                    <p><span class="label">📅 Date :</span> ${dateTexte}</p>
                    <p><span class="label">🕐 Horaires :</span> ${m.heure_ouverture} – ${m.heure_fermeture}</p>
                    <p><span class="label">📍 Ville :</span> ${m.ville}</p>
                    <p><span class="label">🗺️ Adresse :</span> ${m.adresse}</p>
                    <p><span class="label">🎨 Thème :</span> ${m.theme || '—'}</p>
                </div>

                <a href="https://maps.google.com/?q=${encodeURIComponent(m.adresse + ' ' + m.ville)}" 
                   target="_blank" class="btn-maps">
                    📍 Voir sur Google Maps →
                </a>
            </div>
        </div>
    `;
}
