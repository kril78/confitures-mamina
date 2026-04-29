// ===================================
// TRACKER DE VISITES
// ===================================

function tracker(element = null) {
    const appareil = window.innerWidth <= 768 ? 'mobile' : 'desktop';
    const page = window.location.pathname.split('/').pop() || 'index.html';

    db.add('visites', {
        page: page,
        element: element,
        appareil: appareil,
        largeur_ecran: window.innerWidth,
        langue: navigator.language || 'inconnu',
        date: new Date().toISOString()
    });
}

// Tracker automatique au chargement de la page
tracker();