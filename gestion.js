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
    tr.dataset.id = c.id;
    tr.innerHTML = `
        <td>${c.nom}</td>
        <td>${c.type || '—'}</td>
        <td>${c.fruits || '—'}</td>
        <td>${c.categorie || '—'}</td>
        <td>${c.presence || '—'}</td>
        <td>${c.ingredients || '—'}</td>
        <td>${c.description_courte ? c.description_courte.substring(0, 50) + '...' : '—'}</td>
        <td>${c.description_longue ? c.description_longue.substring(0, 50) + '...' : '—'}</td>
        <td>${c.image ? `<img src="${c.image}" style="height:50px; border-radius:4px;">` : '—'}</td>
        <td class="td-actions">
            <button class="btn-valider" onclick="modifierLigne(this)">Modifier</button>
            <button class="btn-supprimer" onclick="confirmerSuppression(this)">Supprimer</button>
        </td>
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
            <button class="btn-supprimer" id="btn-suppr-image" style="display:none; margin-top:4px; font-size:0.8em;" onclick="supprimerImageNouvelle()">🗑 Supprimer</button>
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
    fichier = await compresserImage(fichier, 0.8, 1200);
    const nomFichier = fichier.name;
    const urlPublique = `https://csfybuftonpewqytxwpk.supabase.co/storage/v1/object/public/image/${nomFichier}`;

    const test = await fetch(urlPublique);
    if (test.ok) return urlPublique;

    const res = await fetch(`https://csfybuftonpewqytxwpk.supabase.co/storage/v1/object/image/${nomFichier}`, {
        method: 'POST',
        headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZnlidWZ0b25wZXdxeXR4d3BrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTAzMzgsImV4cCI6MjA5MjU4NjMzOH0.DLyq_zU4AzNWqT6rcz6tQw26groCxiUL8Pt3SzIIl-o',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZnlidWZ0b25wZXdxeXR4d3BrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTAzMzgsImV4cCI6MjA5MjU4NjMzOH0.DLyq_zU4AzNWqT6rcz6tQw26groCxiUL8Pt3SzIIl-o`,
            'Content-Type': 'image/jpeg'
        },
        body: fichier
    });

    if (res.ok) return urlPublique;
    return '';
}

// ===================================
// COMPRESSION IMAGE
// ===================================

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

// ===================================
// PREVIEW IMAGE NOUVELLE LIGNE
// ===================================

function previewImage(input) {
    const preview = document.getElementById('preview-image');
    const btnSuppr = document.getElementById('btn-suppr-image');
    const fichier = input.files[0];
    if (!fichier) return;
    const url = URL.createObjectURL(fichier);
    preview.innerHTML = `<img src="${url}" style="height:50px; border-radius:4px;">`;
    if (btnSuppr) btnSuppr.style.display = 'block';
}

function supprimerImageNouvelle() {
    const preview = document.getElementById('preview-image');
    const input = document.getElementById('input-image');
    const btnSuppr = document.getElementById('btn-suppr-image');
    preview.innerHTML = '';
    input.value = '';
    if (btnSuppr) btnSuppr.style.display = 'none';
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

    const result = await db.add('confitures', {
        nom, fruits, ingredients,
        description_courte: desc_courte,
        description_longue: desc_longue,
        type, categorie: categories, presence,
        image: imageUrl
    });

    tr.className = '';
    tr.dataset.id = result && result[0] ? result[0].id : '';
    tr.innerHTML = `
        <td>${nom}</td>
        <td>${type}</td>
        <td>${fruits}</td>
        <td>${categories}</td>
        <td>${presence}</td>
        <td>${ingredients}</td>
        <td>${desc_courte ? desc_courte.substring(0, 50) + '...' : '—'}</td>
        <td>${desc_longue ? desc_longue.substring(0, 50) + '...' : '—'}</td>
        <td>${imageUrl ? `<img src="${imageUrl}" style="height:50px; border-radius:4px;">` : '—'}</td>
        <td class="td-actions">
            <button class="btn-valider" onclick="modifierLigne(this)">Modifier</button>
            <button class="btn-supprimer" onclick="confirmerSuppression(this)">Supprimer</button>
        </td>
    `;
}

// ===================================
// MODIFICATION D'UNE CONFITURE
// ===================================

async function modifierLigne(btn) {
    const tr = btn.closest('tr');
    const id = tr.dataset.id;

    const confitures = await db.get('confitures');
    const c = confitures.find(c => c.id == id);

    tr.className = 'ligne-saisie';
    tr.innerHTML = `
        <td><input class="champ-texte" type="text" value="${c.nom || ''}"></td>
        <td>
            <select class="champ-select">
                <option value="Confiture" ${c.type === 'Confiture' ? 'selected' : ''}>Confiture</option>
                <option value="Gelée" ${c.type === 'Gelée' ? 'selected' : ''}>Gelée</option>
                <option value="Autre" ${c.type === 'Autre' ? 'selected' : ''}>Autre</option>
            </select>
        </td>
        <td><input class="champ-texte" type="text" value="${c.fruits || ''}"></td>
        <td>
            <div class="filtre-custom">
                <button class="filtre-bouton" onclick="this.parentElement.classList.toggle('ouvert')">
                    Catégories ▾
                </button>
                <div class="filtre-panneau">
                    <label class="filtre-option"><input type="checkbox" value="Fruits rouges" ${c.categorie?.includes('Fruits rouges') ? 'checked' : ''}> Fruits rouges</label>
                    <label class="filtre-option"><input type="checkbox" value="Agrumes" ${c.categorie?.includes('Agrumes') ? 'checked' : ''}> Agrumes</label>
                    <label class="filtre-option"><input type="checkbox" value="Fruits à noyau" ${c.categorie?.includes('Fruits à noyau') ? 'checked' : ''}> Fruits à noyau</label>
                    <label class="filtre-option"><input type="checkbox" value="Exotiques" ${c.categorie?.includes('Exotiques') ? 'checked' : ''}> Exotiques</label>
                    <label class="filtre-option"><input type="checkbox" value="Mélange" ${c.categorie?.includes('Mélange') ? 'checked' : ''}> Mélange</label>
                </div>
            </div>
        </td>
        <td>
            <select class="champ-select">
                <option value="Permanente" ${c.presence === 'Permanente' ? 'selected' : ''}>Permanente</option>
                <option value="Temporaire" ${c.presence === 'Temporaire' ? 'selected' : ''}>Temporaire</option>
            </select>
        </td>
        <td><input class="champ-texte" type="text" value="${c.ingredients || ''}"></td>
        <td><input class="champ-texte" type="text" value="${c.description_courte || ''}"></td>
        <td><textarea class="champ-texte" rows="3">${c.description_longue || ''}</textarea></td>
        <td>
            <input type="file" id="input-image-${id}" accept="image/*" style="display:none;" onchange="previewImageModif(this, '${id}')">
            <button class="btn-valider" onclick="document.getElementById('input-image-${id}').click()">📷 Photo</button>
            ${c.image ? `
                <img id="img-actuelle-${id}" src="${c.image}" style="height:40px; border-radius:4px; margin-top:4px;">
                <button class="btn-supprimer" style="margin-top:4px; font-size:0.8em;" onclick="supprimerImageModif('${id}')">🗑 Supprimer</button>
            ` : ''}
            <div id="preview-image-${id}" style="margin-top:6px;"></div>
        </td>
        <td class="td-actions">
            <button class="btn-valider" onclick="sauvegarderModification(this, '${id}')">✓ Sauvegarder</button>
            <button class="btn-supprimer" onclick="annulerModification(this, '${id}')">✕ Annuler</button>
        </td>
    `;
}

function supprimerImageModif(id) {
    const img = document.getElementById(`img-actuelle-${id}`);
    if (img) img.style.display = 'none';
    const input = document.getElementById(`input-image-${id}`);
    if (input) input.dataset.supprimee = 'true';
}

function previewImageModif(input, id) {
    const preview = document.getElementById(`preview-image-${id}`);
    const imgActuelle = document.getElementById(`img-actuelle-${id}`);
    const fichier = input.files[0];
    if (!fichier) return;
    const url = URL.createObjectURL(fichier);
    if (imgActuelle) imgActuelle.style.display = 'none';
    preview.innerHTML = `<img src="${url}" style="height:50px; border-radius:4px;">`;
}

// ===================================
// SAUVEGARDE MODIFICATION
// ===================================

async function sauvegarderModification(btn, id) {
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

    const confitures = await db.get('confitures');
    const confitureActuelle = confitures.find(c => c.id == id);
    let imageUrl = confitureActuelle?.image || '';

    const inputImage = document.getElementById(`input-image-${id}`);
    if (inputImage && inputImage.dataset.supprimee === 'true') {
        imageUrl = '';
    } else if (inputImage && inputImage.files[0]) {
        imageUrl = await uploadImage(inputImage.files[0]);
    }

    await db.update('confitures', id, {
        nom, fruits, ingredients,
        description_courte: desc_courte,
        description_longue: desc_longue,
        type, categorie: categories, presence,
        image: imageUrl
    });

    tr.className = '';
    tr.dataset.id = id;
    tr.innerHTML = `
        <td>${nom}</td>
        <td>${type}</td>
        <td>${fruits}</td>
        <td>${categories}</td>
        <td>${presence}</td>
        <td>${ingredients}</td>
        <td>${desc_courte ? desc_courte.substring(0, 50) + '...' : '—'}</td>
        <td>${desc_longue ? desc_longue.substring(0, 50) + '...' : '—'}</td>
        <td>${imageUrl ? `<img src="${imageUrl}" style="height:50px; border-radius:4px;">` : '—'}</td>
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
    const confitures = await db.get('confitures');
    const c = confitures.find(c => c.id == id);
    tr.className = '';
    tr.dataset.id = id;
    tr.innerHTML = `
        <td>${c.nom}</td>
        <td>${c.type || '—'}</td>
        <td>${c.fruits || '—'}</td>
        <td>${c.categorie || '—'}</td>
        <td>${c.presence || '—'}</td>
        <td>${c.ingredients || '—'}</td>
        <td>${c.description_courte ? c.description_courte.substring(0, 50) + '...' : '—'}</td>
        <td>${c.description_longue ? c.description_longue.substring(0, 50) + '...' : '—'}</td>
        <td>${c.image ? `<img src="${c.image}" style="height:50px; border-radius:4px;">` : '—'}</td>
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
    if (confirm("Supprimer cette confiture ?")) {
        const tr = btn.closest('tr');
        const id = tr.dataset.id;

        if (id) {
            const confitures = await db.get('confitures');
            const c = confitures.find(c => c.id == id);

            if (c && c.image) {
                const autresUtilisateurs = confitures.filter(x => x.id != id && x.image === c.image);
                if (autresUtilisateurs.length === 0) {
                    const nomFichier = c.image.split('/').pop();
                    await fetch(`https://csfybuftonpewqytxwpk.supabase.co/storage/v1/object/image/${nomFichier}`, {
                        method: 'DELETE',
                        headers: {
                            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZnlidWZ0b25wZXdxeXR4d3BrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTAzMzgsImV4cCI6MjA5MjU4NjMzOH0.DLyq_zU4AzNWqT6rcz6tQw26groCxiUL8Pt3SzIIl-o',
                            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZnlidWZ0b25wZXdxeXR4d3BrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTAzMzgsImV4cCI6MjA5MjU4NjMzOH0.DLyq_zU4AzNWqT6rcz6tQw26groCxiUL8Pt3SzIIl-o`
                        }
                    });
                }
            }
            await db.delete('confitures', id);
        }
        tr.remove();
    }
}
