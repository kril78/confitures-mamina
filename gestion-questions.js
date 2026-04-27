// ===================================
// CHARGEMENT DES QUESTIONS
// ===================================

async function chargerQuestions() {
    const questions = await db.get('questions');
    afficherQuestions(questions);
}

// ===================================
// AFFICHAGE
// ===================================

function afficherQuestions(questions) {
    const liste = document.getElementById('liste-questions');
    liste.innerHTML = '';

    const triees = [...questions].sort((a, b) => a.lu - b.lu);

    if (triees.length === 0) {
        liste.innerHTML = '<p style="color:#aaa; text-align:center; padding:40px;">Aucune question pour le moment.</p>';
        return;
    }

    triees.forEach(q => {
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
                    <button class="btn-valider" onclick="repondre(${q.id}, '${q.email}', '${q.prenom}', \`${q.message}\`)">✉ Répondre</button>
                    <button class="btn-supprimer" onclick="supprimerQuestion(${q.id})">Supprimer</button>
                </div>
            </div>
            <p class="question-message">${q.message}</p>
        `;
        liste.appendChild(div);
    });
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
