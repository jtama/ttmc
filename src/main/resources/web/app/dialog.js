export function showDialog(message) {
    const dialog = document.getElementById('custom-dialog');
    const dialogMessage = document.getElementById('dialog-message');
    const confirmButtons = document.getElementById('dialog-confirm-buttons');
    const closeDialogBtn = document.getElementById('close-dialog-btn');

    dialogMessage.textContent = message;
    confirmButtons.style.display = 'none'; // Hide confirm buttons for simple dialog
    closeDialogBtn.style.display = 'block'; // Show simple OK button
    dialog.showModal();

    return new Promise(resolve => {
        closeDialogBtn.onclick = function() {
            dialog.close();
            resolve(true); // Always resolve true for simple dialog
        }
    });
}

export function showConfirmDialog(message) {
    const dialog = document.getElementById('custom-dialog');
    const dialogMessage = document.getElementById('dialog-message');
    const confirmButtons = document.getElementById('dialog-confirm-buttons');
    const closeDialogBtn = document.getElementById('close-dialog-btn');
    const confirmOkBtn = document.getElementById('confirm-ok-btn');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');

    dialogMessage.textContent = message;
    closeDialogBtn.style.display = 'none'; // Hide simple OK button
    confirmButtons.style.display = 'flex'; // Show confirm buttons
    dialog.showModal();

    return new Promise(resolve => {
        confirmOkBtn.onclick = function() {
            dialog.close();
            resolve(true);
        }
        confirmCancelBtn.onclick = function() {
            dialog.close();
            resolve(false);
        }
        // Handle escape key
        dialog.oncancel = function() {
            resolve(false);
        };
    });
}