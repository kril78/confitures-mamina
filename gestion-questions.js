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

    // Trier : non lus en premier, puis par date décroissante
    const triees = [...questions].sort((a, b) => {
        if (a.lu !== b.lu) return a.lu - b.lu;
        return new Date(b.date) - new Date(a.date);
    });

    if (triees.length === 0) {
        liste.innerHTML = '<p style="color:#aaa; text-align:center; padding:40px;">Aucune question pour le moment.</p>';
        return;
    }

    triees.forEach(q => {
        const messageComplet = q.massage || '';
        const messageCourt = messageComplet.length > 100 
            ? messageComplet.substring(0, 100) + '...' 
            : messageComplet;
        const peutDeplier = messageComplet.length > 100;

        const div = document.createElement('div');
        div.className = `carte-question ${q.lu ? 'lu' : 'non-lu'}`;
        div.dataset.id = q.id;
        div.innerHTML = `
            <div class="question-header">
                <div class="question-meta">
                    ${!q.lu ? '<span class="badge-nouveau">Nouveau</span>' : ''}
                    <span class="question-prenom">${q.prenom}</span>
                    <span class="question-email">${q.email}</span>
                    <span class="question-date">${q.date}</span>
                </div>
                <div class="question-actions">
                    <button class="btn-valider" onclick="repondre(${q.id}, '${q.email}', '${q.prenom}', \`${q.massage}\`)">✉ Répondre</button>
                    <button class="btn-supprimer" onclick="supprimerQuestion(${q.id})">Supprimer</button>
                </div>
            </div>
            <p class="question-message" id="msg-${q.id}">${messageCourt}</p>
            ${peutDeplier ? `
                <button class="btn-deplier" id="btn-${q.id}" onclick="deplierMessage(${q.id}, \`${messageComplet}\`)">
                    Voir plus ▾
                </button>
            ` : ''}
        `;
        liste.appendChild(div);
    });
}

// ===================================
// DÉPLIER MESSAGE
// ===================================

function deplierMessage(id, messageComplet) {
    const msg = document.getElementById(`msg-${id}`);
    const btn = document.getElementById(`btn-${id}`);
    
    if (btn.textContent.includes('Voir plus')) {
        msg.textContent = messageComplet;
        btn.textContent = 'Voir moins ▴';
    } else {
        msg.textContent = messageComplet.substring(0, 100) + '...';
        btn.textContent = 'Voir plus ▾';
    }
}

// ===================================
// RÉPONDRE PAR MAIL
// ===================================

async function repondre(id, email, prenom, message) {
    const sujet = encodeURIComponent(`Réponse à votre message — Les Confitures de Mamina`);
    const corps = encodeURIComponent(`Bonjour ${prenom},\n\nMerci pour votre message :\n"${message}"\n\n`);
    window.location.href = `mailto:${email}?subject=${sujet}&body=${corps}`;

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
