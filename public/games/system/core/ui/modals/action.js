// public/games/system/core/ui/modals/action.js
// Gestion de la modale de Validation (Construire / Démolir)

(function () {
    const UI = window.UIManager;
    if (!UI) return;

    /**
     * Ajoute un gestionnaire d'événement compatible tactile et souris
     * @param {HTMLElement} element - L'élément sur lequel ajouter le gestionnaire
     * @param {Function} handler - La fonction à exécuter
     */
    function addTouchFriendlyHandler(element, handler) {
        if (!element || !handler) return;

        // Utiliser un flag pour éviter le double-déclenchement
        let touchHandled = false;

        element.ontouchend = (e) => {
            e.preventDefault();
            e.stopPropagation();
            touchHandled = true;
            handler();
            // Reset après un court délai
            setTimeout(() => { touchHandled = false; }, 300);
        };

        element.onclick = () => {
            if (!touchHandled) {
                handler();
            }
        };
    }

    UI.Modals = UI.Modals || {};
    UI.Modals.Action = {
        show: function (mode, data, onConfirm, onCancel) {
            const modal = document.getElementById('action-modal');
            if (!modal) return;

            // Fermer Detail Panel
            if (UI.hideDetailPanel) UI.hideDetailPanel();

            const titleEl = document.getElementById('action-title');
            const costEl = document.getElementById('action-cost');
            const msgEl = document.getElementById('action-msg');
            const iconEl = document.getElementById('action-icon');

            if (iconEl) iconEl.textContent = data.icon || (mode === 'DEMOLISH' ? '❌' : '🏗️');

            // Clonage pour reset events
            const oldConfirm = document.getElementById('btn-confirm');
            const oldCancel = document.getElementById('btn-cancel');
            const newConfirm = oldConfirm.cloneNode(true);
            const newCancel = oldCancel.cloneNode(true);
            oldConfirm.parentNode.replaceChild(newConfirm, oldConfirm);
            oldCancel.parentNode.replaceChild(newCancel, oldCancel);

            // Gestionnaire pour le bouton Annuler (compatible touch)
            addTouchFriendlyHandler(newCancel, () => {
                this.hide();
                if (onCancel) onCancel();
            });

            if (mode === 'BUILD') {
                if (titleEl) titleEl.textContent = 'CONSTRUCTION';
                const bName = data.name || 'Bâtiment';
                if (msgEl) msgEl.innerHTML = `Voulez-vous construire : <strong>${bName}</strong> ?`;

                let costHtml = '';
                if (data.cost && window.GameState) {
                    costHtml = Object.entries(data.cost).map(([res, val]) => {
                        const have = GameState[res] || 0;
                        const color = have >= val ? '#a5f3fc' : '#ff4444';
                        return `<div style="color:${color}">${val} ${res}</div>`;
                    }).join('');
                }
                if (costEl) costEl.innerHTML = `<div style="display:flex; gap:10px; margin-top:5px;">${costHtml}</div>`;

                newConfirm.textContent = 'CONSTRUIRE';

                if (data.isValid) {
                    newConfirm.disabled = false;
                    modal.style.borderColor = 'var(--frost-blue)';
                    addTouchFriendlyHandler(newConfirm, () => {
                        this.hide();
                        if (onConfirm) onConfirm();
                    });
                } else {
                    newConfirm.disabled = true;
                    modal.style.borderColor = 'var(--accent-red)';
                    if (msgEl) msgEl.innerHTML += `<br><span style="color:#ff4444">${data.error || "Invalide"}</span>`;
                }

            } else if (mode === 'DEMOLISH') {
                if (titleEl) titleEl.textContent = 'DÉMOLITION';
                if (msgEl) msgEl.innerHTML = `Démolir <strong>${data.name}</strong> ?`;
                // Refund display logic here if needed
                if (costEl) costEl.innerHTML = '';

                newConfirm.textContent = 'DÉMOLIR';
                newConfirm.disabled = false;
                modal.style.borderColor = 'var(--accent-red)';
                addTouchFriendlyHandler(newConfirm, () => {
                    this.hide();
                    if (onConfirm) onConfirm();
                });

            } else if (mode === 'UPGRADE') {
                if (titleEl) titleEl.textContent = 'AMÉLIORATION';
                if (iconEl) iconEl.textContent = '⬆️';

                const fromName = data.fromName || 'Bâtiment';
                const toName = data.name || 'Bâtiment';
                if (msgEl) msgEl.innerHTML = `Améliorer <strong>${fromName}</strong> → <strong>${toName}</strong> ?`;

                let costHtml = '';
                if (data.cost && window.GameState) {
                    costHtml = Object.entries(data.cost).map(([res, val]) => {
                        const have = GameState[res] || 0;
                        const color = have >= val ? '#a5f3fc' : '#ff4444';
                        return `<div style="color:${color}">${val} ${res}</div>`;
                    }).join('');
                }
                if (costEl) costEl.innerHTML = `<div style="display:flex; gap:10px; margin-top:5px;">${costHtml}</div>`;

                newConfirm.textContent = 'AMÉLIORER';

                if (data.isValid) {
                    newConfirm.disabled = false;
                    modal.style.borderColor = '#3498db'; // Bleu pour upgrade
                    addTouchFriendlyHandler(newConfirm, () => {
                        this.hide();
                        if (onConfirm) onConfirm();
                    });
                } else {
                    newConfirm.disabled = true;
                    modal.style.borderColor = 'var(--accent-red)';
                    if (msgEl) msgEl.innerHTML += `<br><span style="color:#ff4444">${data.error || "Invalide"}</span>`;
                }
            }

            modal.style.display = 'flex';
            // Permettre le clic à travers l'overlay pour déplacer le ghost
            modal.classList.add('click-through');
        },

        hide: function () {
            const modal = document.getElementById('action-modal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('click-through');
            }
        }
    };

    // Core Mapping
    UI.showActionModal = (m, d, ok, cancel) => UI.Modals.Action.show(m, d, ok, cancel);
    UI.hideActionModal = () => UI.Modals.Action.hide();

})();
