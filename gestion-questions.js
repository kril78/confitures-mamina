// ===================================
// CHARGEMENT DES QUESTIONS
// ===================================

async function chargerQuestions() {
    const result = await db.get('questions');
    const questions = Array.isArray(result) ? result : [];
    afficherQuestions(questions);
}

// ===================================
// AFFICHAGE
// ===================================

function afficherQuestions(questions) {
    const liste = document.getElementById('liste-questions');
    liste.innerHTML = '';

    const triees = [...questions].sort((a, b) => {
        if (a.lu !== b.lu) return a.lu - b.lu;
        return new Date(b.date) - new Date(a.date);
    });

    if (triees.length === 0) {
        liste.innerHTML = '<p style="color:#aaa; text-align:center; padding:40px;">Aucune question pour le moment.</p>';
        return;
    }

    triees.forEach(q => {
        const messageComplet = q.message || '';
        const messageCourt = messageComplet.length > 100
            ? messageComplet.substring(0, 100) + '...'
            : messageComplet;
        const peutDeplier = messageComplet.length > 100;

        const div = document.createElement('div');
        div.className = `carte-question ${q.lu ? 'lu' : 'non-lu'}`;
        div.dataset.id = q.id;

        const messageSafe = messageComplet.replace(/`/g, "'");

        div.innerHTML = `
        <div class="question-header">
            <div class="question-meta">
                ${!q.lu ? '<span class="badge-nouveau">Nouveau</span>' : ''}
                <span class="question-prenom">${q.prenom}</span>
                <span class="question-email">${q.email}</span>
                <span class="question-date">${q.date}</span>
            </div>
            <div class="question-actions">
                <button class="btn-deplier" id="btn-${q.id}" onclick="deplierMessage(${q.id})">Lire ▾</button>
                <button class="btn-valider" onclick="repondre(${q.id})">✉ Répondre</button>
                <button class="btn-supprimer" onclick="supprimerQuestion(${q.id})">Supprimer</button>
            </div>
        </div>
        <div class="question-message" id="msg-${q.id}" style="display:none;"></div>
    `;
    
    // On injecte le texte séparément pour éviter tout problème de caractères spéciaux
    liste.appendChild(div); // d'abord on ajoute au DOM
    document.getElementById(`msg-${q.id}`).textContent = messageComplet; // ensuite on injecte
    });
}

// ===================================
// DÉPLIER MESSAGE
// ===================================

function deplierMessage(id) {
    const msg = document.getElementById(`msg-${id}`);
    const btn = document.getElementById(`btn-${id}`);

    if (msg.style.display === 'none' || msg.style.display === '') {
        msg.style.display = 'block';
        btn.textContent = 'Fermer ▴';
    } else {
        msg.style.display = 'none';
        btn.textContent = 'Lire ▾';
    }
}

// ===================================
// RÉPONDRE PAR MAIL
// ===================================

async function repondre(id) {
    const q_email = document.querySelector(`[data-id="${id}"] .question-email`).textContent;
    const q_prenom = document.querySelector(`[data-id="${id}"] .question-prenom`).textContent;
    const q_message = document.getElementById(`msg-${id}`).textContent;

    const sujet = encodeURIComponent(`Réponse à votre message — Les Confitures de Mamina`);
    const corps = encodeURIComponent(`Bonjour ${q_prenom},\n\nMerci pour votre message :\n"${q_message}"\n\n`);
    window.location.href = `mailto:${q_email}?subject=${sujet}&body=${corps}`;

    await db.update('questions', id, { lu: true });
    chargerQuestions();
}

// ===================================
// SUPPRESSION
// ===================================

async function supprimerQuestion(id) {
    if (confirm("Supprimer cette question ?")) {
        await db.delete('questions', id);
        chargerQuestions();
    }
}

// ===================================
// LANCEMENT
// ===================================

chargerQuestions();
