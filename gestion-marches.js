// ===================================
// CHARGEMENT DES MARCHÉS
// ===================================

fetch('marches.json')
    .then(r => r.json())
    .then(marches => {
        marches.forEach(m => afficherLigne(m));
    });

// ===================================
// AFFICHAGE LECTURE
// ===================================

function afficherLigne(m) {
    const tbody = document.getElementById('corps-marches');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${m.nom}</td>
        <td>${m.date}</td>
        <td>${m.date_fin || m.date}</td>
        <td>${m.heure_ouverture} – ${m.heure_fermeture}</td>
        <td>${m.ville}</td>
        <td>${m.adresse}</td>
        <td>${m.theme || '—'}</td>
        <td>${m.flyer ? `<img src="${m.flyer}" style="height:40px; border-radius:4px;">` : '—'}</td>
        <td><button class="btn-supprimer" onclick="confirmerSuppression(this)">Supprimer</button></td>
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
        <td><input class="champ-texte" type="date" id="date-debut"></td>
        <td><input class="champ-texte" type="date" id="date-fin"></td>
        <td>
            <div style="display:flex; gap:6px; align-items:center;">
                <input class="champ-texte" type="time" placeholder="Ouverture">
                <span style="color:#f0f0f0;">–</span>
                <input class="champ-texte" type="time" placeholder="Fermeture">
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

function validerMarche(btn) {
    const tr = btn.closest('tr');
    const inputs = tr.querySelectorAll('input[type="text"], input[type="date"]');
    const times = tr.querySelectorAll('input[type="time"]');
    const fichier = document.getElementById('input-flyer')?.files[0];

    const nom        = inputs[0].value || '—';
    const dateDebut  = inputs[1].value || '—';
    const dateFin    = inputs[2].value || dateDebut;
    const ville      = inputs[3].value || '—';
    const adresse    = inputs[4].value || '—';
    const theme      = inputs[5].value || '—';
    const ouverture  = times[0].value || '—';
    const fermeture  = times[1].value || '—';

    const flyerHTML = fichier
        ? (fichier.type === 'application/pdf'
            ? `📄 ${fichier.name}`
            : `<img src="${URL.createObjectURL(fichier)}" style="height:40px; border-radius:4px;">`)
        : '—';

    tr.className = '';
    tr.innerHTML = `
        <td>${nom}</td>
        <td>${dateDebut}</td>
        <td>${dateFin}</td>
        <td>${ouverture} – ${fermeture}</td>
        <td>${ville}</td>
        <td>${adresse}</td>
        <td>${theme}</td>
        <td>${flyerHTML}</td>
        <td><button class="btn-supprimer" onclick="confirmerSuppression(this)">Supprimer</button></td>
    `;
}

// ===================================
// CONFIRMATION SUPPRESSION
// ===================================

function confirmerSuppression(btn) {
    if (confirm("Supprimer ce marché ?")) {
        btn.closest('tr').remove();
    }
}