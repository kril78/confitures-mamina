function envoyerQuestion() {
    const prenom = document.getElementById('prenom').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!prenom || !email || !message) {
        alert('Merci de remplir tous les champs.');
        return;
    }

    // Pour l'instant on simule l'envoi
    document.getElementById('msg-confirmation').style.display = 'block';
    document.getElementById('prenom').value = '';
    document.getElementById('email').value = '';
    document.getElementById('message').value = '';
}