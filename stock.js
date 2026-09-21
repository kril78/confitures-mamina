// ===================================
// STOCK - Affichage public
// ===================================

// Retourne le badge "Rupture de stock" si besoin, sinon rien.
function badgeStock(c) {
    return c.en_rupture ? '<span class="badge-rupture">Rupture de stock</span>' : '';
}
