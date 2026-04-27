// ===================================
// CHARGEMENT DES MARCHÉS
// ===================================

db.get('marches').then(marches => {
    marches.forEach(m => afficherLigne(m));
});

// ===================================
// AFFICHAGE LECTURE
// ===================================

function afficherLigne(m) {
    const tbody = document.getElementById('corps-marches');
    const tr = document.createElement('tr');
    tr.dataset.id = m.id;
    tr.innerHTML = `
        <td>${m.nom}</td>
        <td>${m.date}</td>
        <td>${m.date_fin || m.date}</td>
        <td>${m.heure_ouverture} – ${m.heure_fermeture}</td>
        <td>${m.ville}</td>
        <td>${m.adresse}</td>
        <td>${m.theme || '—'}</td>
        <td>${m.flyer ? `<img src="${m.flyer}" style="height:40px; border-radius:4px;">` : '—'}</td>
        <td class="td-actions">
            <button class="btn-valider" onclick="modifierLigne(this)">Modifier</button>
            <button class="btn-supprimer" onclick="confirmerSuppression(this)">Supprimer</button>
        </td>
    `;
    tbody.appendChild(tr);
}

// ===================================
// AJOUT D'UN MARCHÉ
// ===================================

function ajouterMarche() {
    const existante = document.querySelector('.ligne-saisie');
    if (existante) existante.remove();

    const tbody = document.getElementById('corps-marches');
    const tr = document.createElement('tr');
    tr.className = 'ligne-saisie';
    tr.innerHTML = `
        <td><input class="champ-texte" type="text" placeholder="Nom du marché"></td>
        <td><input class="champ-texte" type="date"></td>
        <td><input class="champ-texte" type="date"></td>
        <td>
            <div style="display:flex; gap:6px; align-items:center;">
                <input class="champ-texte" type="time">
                <span style="color:#f0f0f0;">–</span>
                <input class="champ-texte" type="time">
            </div>
        </td>
        <td><input class="champ-texte" type="text" placeholder="Ville"></td>
        <td><input class="champ-texte" type="text" placeholder="Adresse"></td>
        <td><input class="champ-texte" type="text" placeholder="Thème"></td>
        <td>
            <input type="file" id="input-flyer" accept="image/*,.pdf" style="display:none;" onchange="previewFlyer(this)">
            <button class="btn-valider" onclick="document.getElementById('input-flyer').click()">📎 Importer</button>
            <div id="preview-flyer" style="margin-top:6px;"></div>
        </td>
        <td class="td-actions">
            <button class="btn-valider" onclick="validerMarche(this)">✓ Valider</button>
            <button class="btn-supprimer" onclick="this.closest('tr').remove()">✕</button>
        </td>
    `;
    tbody.appendChild(tr);
}

// ===================================
// PREVIEW FLYER
// ===================================

function previewFlyer(input) {
    const preview = document.getElementById('preview-flyer');
    const fichier = input.files[0];
    if (!fichier) return;
    if (fichier.type === 'application/pdf') {
        preview.innerHTML = `<span style="color: var(--couleur-dore); font-size:0.85em;">📄 ${fichier.name}</span>`;
    } else {
        const url = URL.createObjectURL(fichier);
        preview.innerHTML = `<img src="${url}" style="height:50px; border-radius:4px; margin-top:4px;">`;
    }
}

// ===================================
// VALIDATION
// ===================================

async function validerMarche(btn) {
    const tr = btn.closest('tr');
    const inputs = tr.querySelectorAll('input[type="text"], input[type="date"]');
    const times = tr.querySelectorAll('input[type="time"]');

    const nom       = inputs[0].value || '—';
    const dateDebut = inputs[1].value || '—';
    const dateFin   = inputs[2].value || dateDebut;
    const ville     = inputs[3].value || '—';
    const adresse   = inputs[4].value || '—';
    const theme     = inputs[5].value || '—';
    const ouverture = times[0].value || '—';
    const fermeture = times[1].value || '—';

    const result = await db.add('marches', {
        nom,
        date: dateDebut,
        date_fin: dateFin,
        heure_ouverture: ouverture,
        heure_fermeture: fermeture,
        ville,
        adresse,
        theme,
        flyer: ''
    });

    tr.className = '';
    tr.dataset.id = result && result[0] ? result[0].id : '';
    tr.innerHTML = `
        <td>${nom}</td>
        <td>${dateDebut}</td>
        <td>${dateFin}</td>
        <td>${ouverture} – ${fermeture}</td>
        <td>${ville}</td>
        <td>${adresse}</td>
        <td>${theme}</td>
        <td>—</td>
        <td class="td-actions">
            <button class="btn-valider" onclick="modifierLigne(this)">Modifier</button>
            <button class="btn-supprimer" onclick="confirmerSuppression(this)">Supprimer</button>
        </td>
    `;
}

// ===================================
// MODIFICATION
// ===================================

async function modifierLigne(btn) {
    const tr = btn.closest('tr');
    const id = tr.dataset.id;

    const marches = await db.get('marches');
    const m = marches.find(m => m.id == id);

    tr.className = 'ligne-saisie';
    tr.innerHTML = `
        <td><input class="champ-texte" type="text" value="${m.nom || ''}"></td>
        <td><input class="champ-texte" type="date" value="${m.date || ''}"></td>
        <td><input class="champ-texte" type="date" value="${m.date_fin || ''}"></td>
        <td>
            <div style="display:flex; gap:6px; align-items:center;">
                <input class="champ-texte" type="time" value="${m.heure_ouverture || ''}">
                <span style="color:#f0f0f0;">–</span>
                <input class="champ-texte" type="time" value="${m.heure_fermeture || ''}">
            </div>
        </td>
        <td><input class="champ-texte" type="text" value="${m.ville || ''}"></td>
        <td><input class="champ-texte" type="text" value="${m.adresse || ''}"></td>
        <td><input class="champ-texte" type="text" value="${m.theme || ''}"></td>
        <td>
            <input type="file" id="input-flyer-${id}" accept="image/*,.pdf" style="display:none;" onchange="previewFlyerModif(this, '${id}')">
            <button class="btn-valider" onclick="document.getElementById('input-flyer-${id}').click()">📎 Importer</button>
            ${m.flyer ? `<img id="flyer-actuel-${id}" src="${m.flyer}" style="height:40px; border-radius:4px; margin-top:4px;">` : ''}
            <div id="preview-flyer-${id}" style="margin-top:6px;"></div>
        </td>
        <td class="td-actions">
            <button class="btn-valider" onclick="sauvegarderModification(this, '${id}')">✓ Sauvegarder</button>
            <button class="btn-supprimer" onclick="annulerModification(this, '${id}')">✕ Annuler</button>
        </td>
    `;
}

function previewFlyerModif(input, id) {
    const preview = document.getElementById(`preview-flyer-${id}`);
    const flyerActuel = document.getElementById(`flyer-actuel-${id}`);
    const fichier = input.files[0];
    if (!fichier) return;
    if (flyerActuel) flyerActuel.style.display = 'none';
    if (fichier.type === 'application/pdf') {
        preview.innerHTML = `<span style="color: var(--couleur-dore); font-size:0.85em;">📄 ${fichier.name}</span>`;
    } else {
        const url = URL.createObjectURL(fichier);
        preview.innerHTML = `<img src="${url}" style="height:50px; border-radius:4px;">`;
    }
}

async function sauvegarderModification(btn, id) {
    const tr = btn.closest('tr');
    const inputs = tr.querySelectorAll('input[type="text"], input[type="date"]');
    const times = tr.querySelectorAll('input[type="time"]');

    const nom       = inputs[0].value || '—';
    const dateDebut = inputs[1].value || '—';
    const dateFin   = inputs[2].value || dateDebut;
    const ville     = inputs[3].value || '—';
    const adresse   = inputs[4].value || '—';
    const theme     = inputs[5].value || '—';
    const ouverture = times[0].value || '—';
    const fermeture = times[1].value || '—';

    const marches = await db.get('marches');
    const marcheActuel = marches.find(m => m.id == id);
    let flyerUrl = marcheActuel?.flyer || '';

    const inputFlyer = document.getElementById(`input-flyer-${id}`);
    if (inputFlyer && inputFlyer.files[0]) {
        flyerUrl = URL.createObjectURL(inputFlyer.files[0]);
    }

    await db.update('marches', id, {
        nom,
        date: dateDebut,
        date_fin: dateFin,
        heure_ouverture: ouverture,
        heure_fermeture: fermeture,
        ville,
        adresse,
        theme,
        flyer: flyerUrl
    });

    tr.className = '';
    tr.dataset.id = id;
    tr.innerHTML = `
        <td>${nom}</td>
        <td>${dateDebut}</td>
        <td>${dateFin}</td>
        <td>${ouverture} – ${fermeture}</td>
        <td>${ville}</td>
        <td>${adresse}</td>
        <td>${theme}</td>
        <td>${flyerUrl ? `<img src="${flyerUrl}" style="height:40px; border-radius:4px;">` : '—'}</td>
        <td class="td-actions">
            <button class="btn-valider" onclick="modifierLigne(this)">Modifier</button>
            <button class="btn-supprimer" onclick="confirmerSuppression(this)">Supprimer</button>
        </td>
    `;
}

async function annulerModification(btn, id) {
    const tr = btn.closest('tr');
    const marches = await db.get('marches');
    const m = marches.find(m => m.id == id);
    tr.className = '';
    tr.dataset.id = id;
    tr.innerHTML = `
        <td>${m.nom}</td>
        <td>${m.date}</td>
        <td>${m.date_fin || m.date}</td>
        <td>${m.heure_ouverture} – ${m.heure_fermeture}</td>
        <td>${m.ville}</td>
        <td>${m.adresse}</td>
        <td>${m.theme || '—'}</td>
        <td>${m.flyer ? `<img src="${m.flyer}" style="height:40px; border-radius:4px;">` : '—'}</td>
        <td class="td-actions">
            <button class="btn-valider" onclick="modifierLigne(this)">Modifier</button>
            <button class="btn-supprimer" onclick="confirmerSuppression(this)">Supprimer</button>
        </td>
    `;
}

// ===================================
// CONFIRMATION SUPPRESSION
// ===================================

async function confirmerSuppression(btn) {
    if (confirm("Supprimer ce marché ?")) {
        const tr = btn.closest('tr');
        const id = tr.dataset.id;
        if (id) await db.delete('marches', id);
        tr.remove();
    }
}
