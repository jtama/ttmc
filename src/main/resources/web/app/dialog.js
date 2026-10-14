// Opens the shared dialog; resolves to true when confirmed, false when cancelled.
function openDialog(message, withConfirmation) {
    const dialog = document.getElementById('custom-dialog');
    const closeButton = document.getElementById('close-dialog-btn');
    document.getElementById('dialog-message').textContent = message;
    document.getElementById('dialog-confirm-buttons').style.display = withConfirmation ? 'flex' : 'none';
    closeButton.style.display = withConfirmation ? 'none' : 'block';
    dialog.showModal();

    return new Promise(resolve => {
        const answer = value => () => {
            dialog.close();
            resolve(value);
        };
        closeButton.onclick = answer(true);
        document.getElementById('confirm-ok-btn').onclick = answer(true);
        document.getElementById('confirm-cancel-btn').onclick = answer(false);
        dialog.oncancel = () => resolve(false); // Escape key
    });
}

export function showDialog(message) {
    return openDialog(message, false);
}

export function showConfirmDialog(message) {
    return openDialog(message, true);
}
