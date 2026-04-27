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
            <button class="btn-supprimer" id="btn-suppr-flyer" style="display:none; margin-top:4px; font-size:0.8em;" onclick="supprimerFlyerNouveau()">🗑 Supprimer</button>
        </td>
        <td class="td-actions">
            <button class="btn-valider" onclick="validerMarche(this)">✓ Valider</button>
            <button class="btn-supprimer" onclick="this.closest('tr').remove()">✕</button>
        </td>
    `;
    tbody.appendChild(tr);
}

// ===================================
// PREVIEW FLYER NOUVELLE LIGNE
// ===================================

function previewFlyer(input) {
    const preview = document.getElementById('preview-flyer');
    const btnSuppr = document.getElementById('btn-suppr-flyer');
    const fichier = input.files[0];
    if (!fichier) return;
    if (fichier.type === 'application/pdf') {
        preview.innerHTML = `<span style="color: var(--couleur-dore); font-size:0.85em;">📄 ${fichier.name}</span>`;
    } else {
        const url = URL.createObjectURL(fichier);
        preview.innerHTML = `<img src="${url}" style="height:50px; border-radius:4px; margin-top:4px;">`;
    }
    if (btnSuppr) btnSuppr.style.display = 'block';
}

function supprimerFlyerNouveau() {
    const preview = document.getElementById('preview-flyer');
    const input = document.getElementById('input-flyer');
    const btnSuppr = document.getElementById('btn-suppr-flyer');
    preview.innerHTML = '';
    input.value = '';
    if (btnSuppr) btnSuppr.style.display = 'none';
}

// ===================================
// UPLOAD FLYER
// ===================================

async function uploadFlyer(fichier) {
    if (fichier.type.startsWith('image/')) {
        fichier = await compresserImage(fichier, 0.8, 1200);
    }
    const nomFichier = fichier.name;
    const urlPublique = `https://csfybuftonpewqytxwpk.supabase.co/storage/v1/object/public/image/${nomFichier}`;

    const test = await fetch(urlPublique);
    if (test.ok) return urlPublique;

    const res = await fetch(`https://csfybuftonpewqytxwpk.supabase.co/storage/v1/object/image/${nomFichier}`, {
        method: 'POST',
        headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZnlidWZ0b25wZXdxeXR4d3BrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTAzMzgsImV4cCI6MjA5MjU4NjMzOH0.DLyq_zU4AzNWqT6rcz6tQw26groCxiUL8Pt3SzIIl-o',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZnlidWZ0b25wZXdxeXR4d3BrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTAzMzgsImV4cCI6MjA5MjU4NjMzOH0.DLyq_zU4AzNWqT6rcz6tQw26groCxiUL8Pt3SzIIl-o`,
            'Content-Type': fichier.type
        },
        body: fichier
    });

    if (res.ok) return urlPublique;
    return '';
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

    const inputFlyer = document.getElementById('input-flyer');
    let flyerUrl = '';
    if (inputFlyer && inputFlyer.files[0]) {
        flyerUrl = await uploadFlyer(inputFlyer.files[0]);
    }

    const result = await db.add('marches', {
        nom,
        date: dateDebut,
        date_fin: dateFin,
        heure_ouverture: ouverture,
        heure_fermeture: fermeture,
        ville, adresse, theme,
        flyer: flyerUrl
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
        <td>${flyerUrl ? `<img src="${flyerUrl}" style="height:40px; border-radius:4px;">` : '—'}</td>
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
        ${m.flyer ? `
            <img id="flyer-actuel-${id}" src="${m.flyer}" style="height:40px; border-radius:4px; margin-top:4px;">
            <button class="btn-supprimer" style="margin-top:4px; font-size:0.8em;" onclick="supprimerFlyerModif('${id}')">🗑 Supprimer</button>
        ` : `
            <input type="file" id="input-flyer-${id}" accept="image/*,.pdf" style="display:none;" onchange="previewFlyerModif(this, '${id}')">
            <button class="btn-valider" onclick="document.getElementById('input-flyer-${id}').click()">📎 Importer</button>
            <div id="preview-flyer-${id}" style="margin-top:6px;"></div>
        `}
        </td>
        <td class="td-actions">
            <button class="btn-valider" onclick="sauvegarderModification(this, '${id}')">✓ Sauvegarder</button>
            <button class="btn-supprimer" onclick="annulerModification(this, '${id}')">✕ Annuler</button>
        </td>
    `;
}

function supprimerFlyerModif(id) {
    const flyer = document.getElementById(`flyer-actuel-${id}`);
    if (flyer) flyer.style.display = 'none';
    const input = document.getElementById(`input-flyer-${id}`);
    if (input) input.dataset.supprimee = 'true';
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

// ===================================
// SAUVEGARDE MODIFICATION
// ===================================

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
        flyerUrl = await uploadFlyer(inputFlyer.files[0]);
    } else if (inputFlyer && inputFlyer.dataset.supprimee === 'true') {
        flyerUrl = '';
    }

    await db.update('marches', id, {
        nom,
        date: dateDebut,
        date_fin: dateFin,
        heure_ouverture: ouverture,
        heure_fermeture: fermeture,
        ville, adresse, theme,
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

// ===================================
// ANNULER MODIFICATION
// ===================================

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
function supprimerFlyerModif(id) {
    const flyer = document.getElementById(`flyer-actuel-${id}`);
    const td = flyer.closest('td');
    if (flyer) flyer.remove();

    td.innerHTML = `
        <input type="file" id="input-flyer-${id}" accept="image/*,.pdf" style="display:none;" onchange="previewFlyerModif(this, '${id}')">
        <button class="btn-valider" onclick="document.getElementById('input-flyer-${id}').click()">📎 Importer</button>
        <div id="preview-flyer-${id}" style="margin-top:6px;"></div>
    `;

    const input = document.getElementById(`input-flyer-${id}`);
    if (input) input.dataset.supprimee = 'true';
}
function compresserImage(fichier, qualite = 0.8, maxWidth = 1200) {
    return new Promise(resolve => {
        const img = new Image();
        const url = URL.createObjectURL(fichier);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
                height = Math.round(height * maxWidth / width);
                width = maxWidth;
            }
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            canvas.toBlob(blob => {
                resolve(new File([blob], fichier.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
            }, 'image/jpeg', qualite);
        };
        img.src = url;
    });
}
