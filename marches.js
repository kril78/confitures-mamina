// ===================================
// DONNÉES ET VARIABLES GLOBALES
// ===================================

let tousLesMarches = [];
let moisAffiche = new Date().getMonth();
let anneeAffichee = new Date().getFullYear();

const MOIS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin',
                 'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const JOURS_FR = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

fetch('marches.json')
    .then(r => r.json())
    .then(data => {
        const aujourdHui = new Date();
        aujourdHui.setHours(0,0,0,0);

        tousLesMarches = data.filter(m => new Date(m.date + 'T00:00:00') >= aujourdHui);
        tousLesMarches.sort((a, b) => new Date(a.date) - new Date(b.date));

        afficherProchain();
        afficherCalendrier();
        afficherListe();
    });

const aujourdHui = new Date();
aujourdHui.setHours(0,0,0,0);

tousLesMarches = donneesTest.filter(m => new Date(m.date + 'T00:00:00') >= aujourdHui);
tousLesMarches.sort((a, b) => new Date(a.date) - new Date(b.date));

afficherProchain();
afficherCalendrier();
afficherListe();

// ===================================
// PROCHAIN MARCHÉ
// ===================================

function afficherProchain() {
    const bloc = document.getElementById('bloc-prochain');

    if (tousLesMarches.length === 0) {
        bloc.innerHTML = '<p class="aucun-marche">Aucun marché de prévu pour le moment.</p>';
        return;
    }

    const m = tousLesMarches[0];
    const date = new Date(m.date + 'T00:00:00');
    const joursRestants = Math.ceil((date - aujourdHui) / (1000 * 60 * 60 * 24));

    const flyerHTML = m.flyer ? `<img src="${m.flyer}" alt="Flyer ${m.nom}">` : '';

    bloc.innerHTML = `
        <div class="bloc-prochain-inner">
            ${flyerHTML}
            <div class="bloc-prochain-infos">
                <h3>${m.nom}</h3>
                <p><span class="label">📅 Date :</span> ${formaterDate(m.date)}</p>
                <p><span class="label">🕐 Horaires :</span> ${m.heure_ouverture} – ${m.heure_fermeture}</p>
                <p><span class="label">📍 Adresse :</span> ${m.adresse}, ${m.ville}</p>
                <p><span class="label">🎨 Thème :</span> ${m.theme || '—'}</p>
                <p class="compte-a-rebours">
                    ${joursRestants === 0 ? "C'est aujourd'hui !" : `Dans ${joursRestants} jour${joursRestants > 1 ? 's' : ''}`}
                </p>
            </div>
        </div>
    `;
}

// ===================================
// CALENDRIER
// ===================================

function afficherCalendrier() {
    document.getElementById('mois-titre').textContent =
        `${MOIS_FR[moisAffiche]} ${anneeAffichee}`;

    const grille = document.getElementById('calendrier-grille');
    grille.innerHTML = '';

    // Entêtes jours
    JOURS_FR.forEach(j => {
        const div = document.createElement('div');
        div.className = 'jour-entete';
        div.textContent = j;
        grille.appendChild(div);
    });

    const premierJour = new Date(anneeAffichee, moisAffiche, 1);
    const nbJours = new Date(anneeAffichee, moisAffiche + 1, 0).getDate();

    let decalage = premierJour.getDay() - 1;
    if (decalage < 0) decalage = 6;

    for (let i = 0; i < decalage; i++) {
        const div = document.createElement('div');
        div.className = 'jour vide';
        grille.appendChild(div);
    }

    for (let d = 1; d <= nbJours; d++) {
        const div = document.createElement('div');
        div.className = 'jour';
        div.textContent = d;

        const dateStr = `${anneeAffichee}-${String(moisAffiche + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const dateActuelle = new Date(dateStr + 'T00:00:00');

        // Weekends
        const jourSemaine = dateActuelle.getDay();
        if (jourSemaine === 0 || jourSemaine === 6) {
            div.classList.add('weekend');
        }

        // Périodes de marché
        tousLesMarches.forEach(m => {
            const debut = new Date(m.date + 'T00:00:00');
            const fin = new Date((m.date_fin || m.date) + 'T00:00:00');

            if (dateActuelle >= debut && dateActuelle <= fin) {
                div.classList.add('marche-periode');
                div.title = m.nom;
                if (dateActuelle.getTime() === debut.getTime()) div.classList.add('marche-debut');
                if (dateActuelle.getTime() === fin.getTime())   div.classList.add('marche-fin');
            }
        });

        // Aujourd'hui
        if (dateActuelle.getTime() === aujourdHui.getTime()) {
            div.classList.add('aujourd-hui');
        }

        grille.appendChild(div);
    }
}

function changerMois(direction) {
    moisAffiche += direction;
    if (moisAffiche > 11) { moisAffiche = 0; anneeAffichee++; }
    if (moisAffiche < 0)  { moisAffiche = 11; anneeAffichee--; }
    afficherCalendrier();
}

// ===================================
// LISTE DES MARCHÉS
// ===================================

function afficherListe() {
    const liste = document.getElementById('liste-marches');

    if (tousLesMarches.length === 0) {
        liste.innerHTML = '<p class="aucun-marche">Aucun marché à venir.</p>';
        return;
    }

    tousLesMarches.forEach(m => {
        const date = new Date(m.date + 'T00:00:00');
        const jour = date.getDate();
        const moisNom = MOIS_FR[date.getMonth()].substring(0, 3).toUpperCase();

        liste.innerHTML += `
            <div class="carte-marche">
                <div class="carte-marche-date">
                    <span class="jour-num">${jour}</span>
                    ${moisNom}
                </div>
                <div class="carte-marche-infos">
                    <h3>${m.nom}</h3>
                    <p>📍 ${m.adresse}, ${m.ville}</p>
                    <p>🕐 ${m.heure_ouverture} – ${m.heure_fermeture}</p>
                    <p>🎨 ${m.theme || '—'}</p>
                </div>
            </div>
        `;
    });
}

// ===================================
// UTILITAIRES
// ===================================

function formaterDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
