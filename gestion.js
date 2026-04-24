// ===================================
// PROTECTION MOT DE PASSE
// ===================================

function verifierMdp() {
    const mdp = document.getElementById('champ-mdp').value;
    if (mdp === '1245') {
        document.getElementById('ecran-mdp').style.display = 'none';
    } else {
        document.getElementById('msg-erreur').style.display = 'block';
        document.getElementById('champ-mdp').value = '';
    }
}

// ===================================
// CHARGEMENT DES CONFITURES
// ===================================

db.get('confitures').then(confitures => {
    confitures.forEach(c => afficherLigne(c));
});

// ===================================
// AFFICHAGE LECTURE
// ===================================

function afficherLigne(c) {
    const tbody = document.getElementById('corps-admin');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${c.nom}</td>
        <td>${c.description || '—'}</td>
        <td>${c.type}</td>
        <td>${c.categorie || '—'}</td>
        <td>${c.presence || '—'}</td>
        <td><button class="btn-supprimer" onclick="confirmerSuppression(this)">Supprimer</button></td>
    `;
    tbody.appendChild(tr);
}

// ===================================
// AJOUT D'UNE CONFITURE
// ===================================

function ajouterLigne() {

    // Si une ligne de saisie existe déjà → on la remet à zéro
    const existante = document.querySelector('.ligne-saisie');
    if (existante) {
        existante.remove();
    }

    const tbody = document.getElementById('corps-admin');
    const tr = document.createElement('tr');
    tr.className = 'ligne-saisie';
    tr.innerHTML = `
    <td><input class="champ-texte" type="text" placeholder="Ex : Fraise Gariguette"></td>
    <td><input class="champ-texte" type="text" placeholder="Description courte..."></td>
    <td>
        <select class="champ-select">
            <option value="Confiture">Confiture</option>
            <option value="Gelée">Gelée</option>
            <option value="Autre">Autre</option>
        </select>
    </td>
    <td>
        <div class="filtre-custom">
            <button class="filtre-bouton" onclick="this.parentElement.classList.toggle('ouvert')">
                Catégories ▾
            </button>
            <div class="filtre-panneau">
                <label class="filtre-option"><input type="checkbox" value="Fruits rouges"> Fruits rouges</label>
                <label class="filtre-option"><input type="checkbox" value="Agrumes"> Agrumes</label>
                <label class="filtre-option"><input type="checkbox" value="Fruits à noyau"> Fruits à noyau</label>
                <label class="filtre-option"><input type="checkbox" value="Exotiques"> Exotiques</label>
                <label class="filtre-option"><input type="checkbox" value="Mélange"> Mélange</label>
            </div>
        </div>
    </td>
    <td>
        <select class="champ-select">
            <option value="Permanente">Permanente</option>
            <option value="Temporaire">Temporaire</option>
        </select>
    </td>
    <td>
        <input type="file" id="input-image" accept="image/*" style="display:none;" onchange="previewImage(this)">
        <button class="btn-valider" onclick="document.getElementById('input-image').click()">📷 Photo</button>
        <div id="preview-image" style="margin-top:6px;"></div>
    </td>
    <td class="td-actions">
        <button class="btn-valider" onclick="validerLigne(this)">✓ Valider</button>
        <button class="btn-supprimer" onclick="confirmerSuppression(this)">✕</button>
    </td>
`;
    tbody.appendChild(tr);
    tr.querySelector('input').focus();
}

// ===================================
// VALIDATION D'UNE CONFITURE
// ===================================

async function uploadImage(fichier) {
    const nomFichier = fichier.name;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/image/${nomFichier}`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': fichier.type
        },
        body: fichier
    });
    
    if (res.ok) {
        return `https://csfybuftonpewqytxwpk.supabase.co/storage/v1/object/public/image/${nomFichier}`;
    }
    return '';
}

async function validerLigne(btn) {
    const tr = btn.closest('tr');
    const nom = tr.querySelectorAll('input[type="text"]')[0].value || 'Sans nom';
    const desc = tr.querySelectorAll('input[type="text"]')[1].value || '—';
    const type = tr.querySelector('select').value;
    const categories = [...tr.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value).join(', ') || '—';
    const presence = tr.querySelectorAll('select')[1].value;

    // Upload image si présente
    const inputImage = document.getElementById('input-image');
    let imageUrl = '';
    if (inputImage && inputImage.files[0]) {
        imageUrl = await uploadImage(inputImage.files[0]);
    }

    // Sauvegarde dans Supabase
    await db.add('confitures', {
        nom, 
        description_courte: desc,
        type,
        categorie: categories,
        presence,
        image: imageUrl
    });

    tr.className = '';
    tr.innerHTML = `
        <td>${nom}</td>
        <td>${desc}</td>
        <td>${type}</td>
        <td>${categories}</td>
        <td>${presence}</td>
        <td><button class="btn-supprimer" onclick="confirmerSuppression(this)">Supprimer</button></td>
    `;
}
// ===================================
// CONFIRMATION SUPPRESSION
// ===================================

function confirmerSuppression(btn) {
    if (confirm("Supprimer cette confiture ?")) {
        btn.closest('tr').remove();
    }
}
