// public/games/system/core/ui/tooltips.js
// Système de Tooltips Renforcé

(function () {
    if (!window.UIManager) return;

    window.UIManager.initTooltips = function () {
        let tooltip = document.getElementById('ui-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'ui-tooltip';
            tooltip.className = 'ui-tooltip'; // Use the CSS class from styles.css
            document.body.appendChild(tooltip);
        }
    };

    // Supporte String OU Object {name, description, cost}
    window.UIManager.showTooltip = function (e, data) {
        const tooltip = document.getElementById('ui-tooltip');
        if (!tooltip) return;

        let contentHtml = '';

        if (typeof data === 'string') {
            contentHtml = `<div class="tooltip-body">${data}</div>`;
        } else {
            // Complex object
            let costHtml = '';
            if (data.cost) {
                costHtml = Object.entries(data.cost).map(([res, val]) => {
                    return `<span class="cost-item">${val} ${res}</span>`;
                }).join(' ');
            }

            contentHtml = `
                <div class="tooltip-header">${data.name || ''}</div>
                <div class="tooltip-body">${data.description || ''}</div>
                ${costHtml ? `<div class="tooltip-cost">COÛT : ${costHtml}</div>` : ''}
            `;
        }

        tooltip.innerHTML = contentHtml;
        tooltip.style.display = 'block';
        this.updateTooltipPos(e);
    };

    window.UIManager.updateTooltipPos = function (e) {
        const tooltip = document.getElementById('ui-tooltip');
        if (tooltip) {
            // Offset to avoid cursor overlap
            tooltip.style.left = (e.pageX + 15) + 'px';
            tooltip.style.top = (e.pageY - 100) + 'px';
        }
    };

    window.UIManager.hideTooltip = function () {
        const tooltip = document.getElementById('ui-tooltip');
        if (tooltip) tooltip.style.display = 'none';
    };

    console.log("💬 Enhanced Tooltips Module Loaded");
})();
