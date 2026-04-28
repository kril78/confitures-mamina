// ===================================
// VÉRIFICATION SESSION
// ===================================

async function protegerPage() {
    const connecte = await verifierSession();
    if (!connecte) {
        window.location.href = 'gestion.html';
    }
}

protegerPage();