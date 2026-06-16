// public/games/system/core/ui/panels/debug.js
// Gestion du Panneau de Debug

(function () {
    const UI = window.UIManager;
    if (!UI) return;

    UI.Panels = UI.Panels || {};
    UI.Panels.Debug = {
        toggle: function () {
            const panel = document.getElementById('debug-panel');
            if (panel) {
                panel.classList.toggle('visible');
                this.render();
            }
        },

        render: function () {
            const container = document.getElementById('debug-content');
            if (!container) return;

            // Check if toggle already exists to avoid dupes (simple check)
            if (!document.getElementById('debug-toggle-hidden')) {
                const toggleDiv = document.createElement('div');
                toggleDiv.className = 'debug-row';
                toggleDiv.innerHTML = `
                    <label>
                        <input type="checkbox" id="debug-toggle-hidden" ${window.Config.debugMode ? 'checked' : ''}>
                        Show System/Hidden Buildings
                    </label>
                 `;
                container.insertBefore(toggleDiv, container.firstChild);

                document.getElementById('debug-toggle-hidden').addEventListener('change', (e) => {
                    window.Config.debugMode = e.target.checked;
                    console.log("Debug Mode:", window.Config.debugMode);
                    // Refresh build menu if it's open or next time it opens
                    if (window.UIManager && window.UIManager.Panels && window.UIManager.Panels.Build) {
                        // Re-render current category
                        window.UIManager.Panels.Build.render();
                    }

                    // Toggle Base tab visibility
                    const baseTab = document.getElementById('tab-base');
                    if (baseTab) {
                        if (window.Config.debugMode) baseTab.classList.remove('hidden');
                        else baseTab.classList.add('hidden');
                    }
                });
            }
        },

        modifyResource: function (type, amount) {
            console.log(`Debug: Modify ${type} by ${amount}`);
            if (window.ResourceManager) {
                if (amount > 0) ResourceManager.add(type, amount);
                else ResourceManager.consume(type, Math.abs(amount));
            }
        }
    };

    // Shortcuts
    window.toggleDebugMenu = () => UI.Panels.Debug.toggle();
    window.modifyResource = (t, a) => UI.Panels.Debug.modifyResource(t, a);

})();
