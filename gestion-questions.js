// ===================================
// DONNÉES DE TEST
// ===================================

const questions = [
    {
        id: 1,
        prenom: "Marie",
        email: "marie@exemple.fr",
        message: "Bonjour, est-ce que vous avez de la confiture de fraise disponible ? Je voudrais en commander 3 pots.",
        date: "2026-04-20",
        lu: false
    },
    {
        id: 2,
        prenom: "Pierre",
        email: "pierre@exemple.fr",
        message: "Serez-vous présents au marché de Rambouillet en juin ?",
        date: "2026-04-22",
        lu: true
    },
    {
        id: 3,
        prenom: "Sophie",
        email: "sophie@exemple.fr",
        message: "Bonjour, je souhaite commander des confitures pour offrir. Livrez-vous à domicile ?",
        date: "2026-04-23",
        lu: false
    }
];

// ===================================
// AFFICHAGE
// ===================================

function afficherQuestions() {
    const liste = document.getElementById('liste-questions');
    liste.innerHTML = '';

    // Trier : non lus en premier
    const triees = [...questions].sort((a, b) => a.lu - b.lu);

    if (triees.length === 0) {
        liste.innerHTML = '<p style="color:#aaa; text-align:center; padding:40px;">Aucune question pour le moment.</p>';
        return;
    }

    triees.forEach(q => {
        const div = document.createElement('div');
        div.className = `carte-question ${q.lu ? 'lu' : 'non-lu'}`;
        div.innerHTML = `
            <div class="question-header">
                <div class="question-meta">
                    ${!q.lu ? '<span class="badge-nouveau">Nouveau</span>' : ''}
                    <span class="question-prenom">${q.prenom}</span>
                    <span class="question-email">${q.email}</span>
                    <span class="question-date">${q.date}</span>
                </div>
                <div class="question-actions">
                    <button class="btn-valider" onclick="repondre(${q.id})">✉ Répondre</button>
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

function repondre(id) {
    const q = questions.find(q => q.id === id);
    const sujet = encodeURIComponent(`Réponse à votre message — Les Confitures de Mamina`);
    const corps = encodeURIComponent(`Bonjour ${q.prenom},\n\nMerci pour votre message :\n"${q.message}"\n\n`);
    window.location.href = `mailto:${q.email}?subject=${sujet}&body=${corps}`;
    
    // Marquer comme lu
    q.lu = true;
    afficherQuestions();
}

// ===================================
// SUPPRESSION
// ===================================

function supprimerQuestion(id) {
    if (confirm("Supprimer cette question ?")) {
        const index = questions.findIndex(q => q.id === id);
        questions.splice(index, 1);
        afficherQuestions();
    }
}

// ===================================
// LANCEMENT
// ===================================

afficherQuestions();