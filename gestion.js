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
        <td>${c.type || '—'}</td>
        <td>${c.fruits || '—'}</td>
        <td>${c.categorie || '—'}</td>
        <td>${c.presence || '—'}</td>
        <td>${c.ingredients || '—'}</td>
        <td>${c.description_courte || '—'}</td>
        <td>${c.description_longue || '—'}</td>
        <td>${c.image ? `<img src="${c.image}" style="height:50px; border-radius:4px;">` : '—'}</td>
        <td><button class="btn-supprimer" onclick="confirmerSuppression(this)">Supprimer</button></td>
    `;
    tbody.appendChild(tr);
}

// ===================================
// AJOUT D'UNE CONFITURE
// ===================================

function ajouterLigne() {
    const existante = document.querySelector('.ligne-saisie');
    if (existante) existante.remove();

    const tbody = document.getElementById('corps-admin');
    const tr = document.createElement('tr');
    tr.className = 'ligne-saisie';
    tr.innerHTML = `
    <td><input class="champ-texte" type="text" placeholder="Nom"></td>
    <td>
        <select class="champ-select">
            <option value="Confiture">Confiture</option>
            <option value="Gelée">Gelée</option>
            <option value="Autre">Autre</option>
        </select>
    </td>
    <td><input class="champ-texte" type="text" placeholder="Ex: Fraise, Framboise"></td>
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
    <td><input class="champ-texte" type="text" placeholder="Ex: 60% fruits, 40% sucre"></td>
    <td><input class="champ-texte" type="text" placeholder="Description courte..."></td>
    <td><textarea class="champ-texte" placeholder="Description longue..." rows="3"></textarea></td>
    <td>
        <input type="file" id="input-image" accept="image/*" style="display:none;" onchange="previewImage(this)">
        <button class="btn-valider" onclick="document.getElementById('input-image').click()">📷 Photo</button>
        <div id="preview-image" style="margin-top:6px;"></div>
    </td>
    <td class="td-actions">
        <button class="btn-valider" onclick="validerLigne(this)">✓ Valider</button>
        <button class="btn-supprimer" onclick="this.closest('tr').remove()">✕</button>
    </td>
`;
    tbody.appendChild(tr);
    tr.querySelector('input').focus();
}

// ===================================
// UPLOAD IMAGE
// ===================================

async function uploadImage(fichier) {
    const nomFichier = fichier.name;
    const res = await fetch(`https://csfybuftonpewqytxwpk.supabase.co/storage/v1/object/image/${nomFichier}`, {
        method: 'POST',
        headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZnlidWZ0b25wZXdxeXR4d3BrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTAzMzgsImV4cCI6MjA5MjU4NjMzOH0.DLyq_zU4AzNWqT6rcz6tQw26groCxiUL8Pt3SzIIl-o',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZnlidWZ0b25wZXdxeXR4d3BrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTAzMzgsImV4cCI6MjA5MjU4NjMzOH0.DLyq_zU4AzNWqT6rcz6tQw26groCxiUL8Pt3SzIIl-o`,
            'Content-Type': fichier.type
        },
        body: fichier
    });

    if (res.ok) {
        return `https://csfybuftonpewqytxwpk.supabase.co/storage/v1/object/public/image/${nomFichier}`;
    }
    return '';
}

// ===================================
// VALIDATION D'UNE CONFITURE
// ===================================

async function validerLigne(btn) {
    const tr = btn.closest('tr');
    const inputs = tr.querySelectorAll('input[type="text"]');
    const textareas = tr.querySelectorAll('textarea');
    const selects = tr.querySelectorAll('select');

    const nom         = inputs[0].value || 'Sans nom';
    const fruits      = inputs[1].value || '';
    const ingredients = inputs[2].value || '';
    const desc_courte = inputs[3].value || '';
    const desc_longue = textareas[0].value || '';
    const type        = selects[0].value;
    const categories  = [...tr.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value).join(', ') || '—';
    const presence    = selects[1].value;

    const inputImage = document.getElementById('input-image');
    let imageUrl = '';
    if (inputImage && inputImage.files[0]) {
        imageUrl = await uploadImage(inputImage.files[0]);
    }

    await db.add('confitures', {
        nom,
        fruits,
        ingredients,
        description_courte: desc_courte,
        description_longue: desc_longue,
        type,
        categorie: categories,
        presence,
        image: imageUrl
    });

    tr.className = '';
    tr.innerHTML = `
        <td>${nom}</td>
        <td>${type}</td>
        <td>${fruits}</td>
        <td>${categories}</td>
        <td>${presence}</td>
        <td>${ingredients}</td>
        <td>${c.description_courte ? c.description_courte.substring(0, 50) + '...' : '—'}</td>
        <td>${c.description_longue ? c.description_longue.substring(0, 50) + '...' : '—'}</td>
        <td>${imageUrl ? `<img src="${imageUrl}" style="height:50px; border-radius:4px;">` : '—'}</td>
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

// ===================================
// PREVIEW IMAGE
// ===================================

function previewImage(input) {
    const preview = document.getElementById('preview-image');
    const fichier = input.files[0];
    if (!fichier) return;
    const url = URL.createObjectURL(fichier);
    preview.innerHTML = `<img src="${url}" style="height:50px; border-radius:4px;">`;
}
