// systems/editor/TextureEditor.js
// Module d'édition des définitions de textures

window.TextureEditor = {
    // Configuration des dossiers d'assets
    assetFolders: [
        { id: 'ground', name: '🌿 Sol (Ground)', path: '/games/system/assets/ground/' },
        { id: 'house', name: '🏠 Maisons', path: '/games/system/assets/house/' },
        { id: 'decor', name: '🌳 Décor', path: '/games/system/assets/decor/' },
        { id: 'box', name: '📦 Boîtes', path: '/games/system/assets/box/' },
        { id: 'tent', name: '⛺ Tentes', path: '/games/system/assets/tent/' },
        { id: 'tiled', name: '🗺️ Tiled Files', path: '/games/system/assets/Tiled_files/' }
    ],

    // État actuel
    currentFolder: null,
    currentFile: null,
    currentImage: null,
    definitions: {}, // Stockage des définitions par fichier

    // Configuration par défaut
    baseTileSize: 32,

    /**
     * Initialise l'éditeur de textures
     */
    init: function () {
        console.log("🎨 TextureEditor.init()");
        this.renderSidebar();
    },

    /**
     * Détruit l'éditeur (appelé à la fermeture)
     */
    destroy: function () {
        console.log("🎨 TextureEditor.destroy()");
        this.currentFolder = null;
        this.currentFile = null;
        this.currentImage = null;
    },

    /**
     * Render la sidebar avec la liste des dossiers
     */
    renderSidebar: function () {
        const sidebar = document.getElementById('editor-sidebar');
        if (!sidebar) return;

        let html = '<h3 style="color: #e94560; margin: 0 0 15px 0;">📁 Assets</h3>';
        html += '<ul class="editor-file-list">';

        this.assetFolders.forEach(folder => {
            const isOpen = this.currentFolder === folder.id;
            html += `
                <li class="editor-folder-item">
                    <div class="editor-folder-header" onclick="TextureEditor.toggleFolder('${folder.id}')">
                        <span>${isOpen ? '📂' : '📁'}</span>
                        <span>${folder.name}</span>
                    </div>
                    <div class="editor-folder-content ${isOpen ? 'open' : ''}" id="folder-${folder.id}">
                        ${isOpen ? this.renderFolderContent(folder) : ''}
                    </div>
                </li>
            `;
        });

        html += '</ul>';
        sidebar.innerHTML = html;
    },

    /**
     * Toggle l'ouverture d'un dossier
     */
    toggleFolder: function (folderId) {
        if (this.currentFolder === folderId) {
            this.currentFolder = null;
        } else {
            this.currentFolder = folderId;
            this.loadFolderFiles(folderId);
        }
        this.renderSidebar();
    },

    /**
     * Charge la liste des fichiers d'un dossier
     */
    loadFolderFiles: function (folderId) {
        const folder = this.assetFolders.find(f => f.id === folderId);
        if (!folder) return;

        // Pour l'instant, liste statique basée sur ce qu'on connaît
        // Dans une vraie implémentation, on ferait une requête au serveur
        const knownFiles = {
            'ground': this.generateFileList('FieldsTile_', 64, '.png'),
            'house': ['1.png', '2.png', '3.png', '4.png'],
            'decor': this.generateFileList('', 17, '.png', 1),
            'box': ['1.png', '2.png', '3.png', '4.png', '5.png'],
            'tent': [],
            'tiled': [
                'exterior.png', 'Interior.png', 'walls_floor.png',
                'house_details.png', 'ground_grass_details.png',
                'Trees_animation.png', 'Smoke_animation.png',
                'Doors_windows_animation.png', 'cat_animation.png',
                'bird_fly_animation.png', 'bird_jump_animation.png'
            ]
        };

        folder.files = knownFiles[folderId] || [];
    },

    /**
     * Génère une liste de fichiers numérotés
     */
    generateFileList: function (prefix, count, suffix, startAt = 1) {
        const files = [];
        for (let i = startAt; i <= count; i++) {
            const num = prefix.includes('_') ? String(i).padStart(2, '0') : i;
            files.push(`${prefix}${num}${suffix}`);
        }
        return files;
    },

    /**
     * Render le contenu d'un dossier
     */
    renderFolderContent: function (folder) {
        if (!folder.files || folder.files.length === 0) {
            return '<p style="color: #666; font-size: 12px; padding: 5px;">Aucun fichier</p>';
        }

        let html = '';
        folder.files.forEach(file => {
            const isActive = this.currentFile === file && this.currentFolder === folder.id;
            html += `
                <div class="editor-file-item ${isActive ? 'active' : ''}" 
                     onclick="TextureEditor.selectFile('${folder.id}', '${file}')">
                    🖼️ ${file}
                </div>
            `;
        });
        return html;
    },

    /**
     * Sélectionne un fichier pour l'éditer
     */
    selectFile: function (folderId, fileName) {
        const folder = this.assetFolders.find(f => f.id === folderId);
        if (!folder) return;

        this.currentFolder = folderId;
        this.currentFile = fileName;

        const imagePath = folder.path + fileName;
        console.log(`🎨 Chargement de: ${imagePath}`);

        this.loadImage(imagePath, fileName);
        this.renderSidebar(); // Refresh pour mettre à jour l'état actif
    },

    /**
     * Charge une image et l'affiche
     */
    loadImage: function (path, fileName) {
        const main = document.getElementById('editor-main');
        if (!main) return;

        // Afficher un loader
        main.innerHTML = '<p style="color: #888;">Chargement...</p>';

        // Créer l'image
        const img = new Image();
        img.onload = () => {
            this.currentImage = img;
            this.renderPreview(fileName, img);
        };
        img.onerror = () => {
            main.innerHTML = `<p style="color: #e74c3c;">❌ Erreur de chargement: ${path}</p>`;
        };
        img.src = path;
    },

    /**
     * Affiche la preview de l'image avec les outils de configuration
     */
    renderPreview: function (fileName, img) {
        const main = document.getElementById('editor-main');
        if (!main) return;

        // Récupérer ou créer la définition pour ce fichier
        const defKey = `${this.currentFolder}/${fileName}`;
        if (!this.definitions[defKey]) {
            this.definitions[defKey] = {
                file: fileName,
                baseTileSize: 32,
                elements: []
            };
        }
        const def = this.definitions[defKey];

        main.innerHTML = `
            <div class="editor-preview-container">
                <h3 class="editor-preview-title">🖼️ ${fileName}</h3>
                <p style="color: #888; margin: 0;">Dimensions: ${img.width} × ${img.height}px</p>
                
                <div class="editor-image-scroll" id="image-scroll" style="position: relative; width: 100%; height: 100%; overflow: auto; display: flex; justify-content: flex-start; align-items: flex-start;">
                    <!-- LE POINT ZÉRO : Container Relatif Explicite -->
                    <div class="editor-image-anchor" id="image-anchor" style="position: relative; display: inline-block; margin: 0; padding: 0; line-height: 0;">
                        <img src="${img.src}" class="editor-preview-image" id="preview-image" style="display: block; max-width: none;">
                        <canvas id="grid-overlay" class="editor-grid-overlay" style="position: absolute; top: 0; left: 0; pointer-events: none; width: 100%; height: 100%;"></canvas>
                    </div>
                </div>

                <div class="editor-config-form">
                    <div class="editor-form-row">
                        <label class="editor-form-label">Taille de bloc:</label>
                        <input type="number" class="editor-form-input" id="input-tile-size" 
                               value="${def.baseTileSize}" min="8" max="256" step="8"
                               onchange="TextureEditor.updateTileSize(this.value)">
                        <span style="color: #888;">px</span>
                    </div>

                    <div class="editor-form-row">
                        <label class="editor-form-label">Éléments:</label>
                        <button class="editor-btn" onclick="TextureEditor.addElement()">+ Ajouter</button>
                    </div>

                    <ul class="editor-elements-list" id="elements-list">
                        ${this.renderElementsList(def.elements)}
                    </ul>

                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button class="editor-btn" onclick="TextureEditor.saveDefinition()">💾 Sauvegarder</button>
                        <button class="editor-btn editor-btn-secondary" onclick="TextureEditor.loadDefinition()">📂 Charger</button>
                    </div>
                </div>
            </div>
        `;

        // Dessiner la grille
        this.drawGrid(img, def.baseTileSize);
    },

    /**
     * Dessine la grille et les éléments sur l'image
     */
    drawGrid: function (img, tileSize) {
        let canvas = document.getElementById('grid-overlay');
        const anchor = document.getElementById('image-anchor');

        // Sécurité : Si le canvas n'est pas dans l'anchor, on le déplace
        if (canvas && anchor && canvas.parentNode !== anchor) {
            console.warn("⚠️ Canvas déplacé dans le bon conteneur 'anchor'");
            anchor.appendChild(canvas);
        }

        if (!canvas || !img || !anchor) return;

        // Ajuster la taille de l'anchor container pour matcher exactement l'image
        anchor.style.width = img.width + 'px';
        anchor.style.height = img.height + 'px';

        // FORCE BRUTE des styles pour garantir le Point Zéro
        canvas.style.cssText = `
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: ${img.width}px !important;
            height: ${img.height}px !important;
            pointer-events: none !important;
            z-index: 10 !important;
            display: block !important;
        `;

        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Style de la grille
        ctx.strokeStyle = 'rgba(233, 69, 96, 0.3)';
        ctx.lineWidth = 1;

        // Lignes verticales
        for (let x = 0; x <= img.width; x += tileSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, img.height);
            ctx.stroke();
        }

        // Lignes horizontales
        for (let y = 0; y <= img.height; y += tileSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(img.width, y);
            ctx.stroke();
        }

        // Dessiner les éléments définis
        this.drawElements(ctx, tileSize);
    },

    /**
     * Dessine les rectangles des éléments définis
     */
    drawElements: function (ctx, tileSize) {
        const defKey = `${this.currentFolder}/${this.currentFile}`;
        const def = this.definitions[defKey];
        if (!def || !def.elements) return;

        const colors = [
            'rgba(255, 0, 0, 0.8)',    // Rouge
            'rgba(0, 255, 0, 0.8)',    // Vert
            'rgba(0, 0, 255, 0.8)',    // Bleu
            'rgba(255, 255, 0, 0.8)',  // Jaune
            'rgba(255, 0, 255, 0.8)',  // Magenta
            'rgba(0, 255, 255, 0.8)',  // Cyan
            'rgba(255, 128, 0, 0.8)',  // Orange
            'rgba(128, 0, 255, 0.8)'   // Violet
        ];

        def.elements.forEach((el, idx) => {
            const color = colors[idx % colors.length];
            const x = el.x;
            const y = el.y;
            const w = el.widthInTiles * tileSize;
            const h = el.heightInTiles * tileSize;

            // Rectangle de l'élément
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, w, h);

            // Fond semi-transparent
            ctx.fillStyle = color.replace('0.8', '0.2');
            ctx.fillRect(x, y, w, h);

            // Nom de l'élément
            ctx.fillStyle = color;
            ctx.font = 'bold 12px Arial';
            ctx.fillText(el.name, x + 3, y + 14);

            // Index dans un coin
            ctx.fillStyle = 'white';
            ctx.font = 'bold 10px Arial';
            ctx.fillText(`#${idx + 1}`, x + w - 20, y + h - 5);
        });
    },

    /**
     * Redessine la grille et les éléments
     */
    redrawOverlay: function () {
        if (!this.currentImage) return;
        const defKey = `${this.currentFolder}/${this.currentFile}`;
        const def = this.definitions[defKey];
        if (!def) return;
        this.drawGrid(this.currentImage, def.baseTileSize);
    },

    /**
     * Met à jour la taille des tuiles
     */
    updateTileSize: function (value) {
        const tileSize = parseInt(value) || 32;
        const defKey = `${this.currentFolder}/${this.currentFile}`;

        if (this.definitions[defKey]) {
            this.definitions[defKey].baseTileSize = tileSize;
        }

        this.redrawOverlay();
    },

    /**
     * Ajoute un nouvel élément
     */
    addElement: function () {
        const defKey = `${this.currentFolder}/${this.currentFile}`;
        if (!this.definitions[defKey]) return;

        const elements = this.definitions[defKey].elements;
        const newElement = {
            name: `element_${elements.length + 1}`,
            x: 0,
            y: 0,
            widthInTiles: 1,
            heightInTiles: 1
        };
        elements.push(newElement);

        this.refreshElementsList();
        this.redrawOverlay();
    },

    /**
     * Supprime un élément
     */
    removeElement: function (index) {
        const defKey = `${this.currentFolder}/${this.currentFile}`;
        if (!this.definitions[defKey]) return;

        this.definitions[defKey].elements.splice(index, 1);
        this.refreshElementsList();
        this.redrawOverlay();
    },

    /**
     * Rafraîchit la liste des éléments
     */
    refreshElementsList: function () {
        const list = document.getElementById('elements-list');
        const defKey = `${this.currentFolder}/${this.currentFile}`;
        if (!list || !this.definitions[defKey]) return;

        list.innerHTML = this.renderElementsList(this.definitions[defKey].elements);
    },

    /**
     * Render la liste des éléments
     */
    renderElementsList: function (elements) {
        if (!elements || elements.length === 0) {
            return '<li style="color: #666; padding: 10px;">Aucun élément défini</li>';
        }

        let html = '';
        elements.forEach((el, idx) => {
            html += `
                <li class="editor-element-item">
                    <input type="text" class="editor-form-input" style="flex: 1;" 
                           value="${el.name}" placeholder="Nom"
                           onchange="TextureEditor.updateElement(${idx}, 'name', this.value)">
                    <input type="number" class="editor-form-input" style="width: 50px;" 
                           value="${el.x}" placeholder="X" title="Position X (px)"
                           onchange="TextureEditor.updateElement(${idx}, 'x', this.value)">
                    <input type="number" class="editor-form-input" style="width: 50px;" 
                           value="${el.y}" placeholder="Y" title="Position Y (px)"
                           onchange="TextureEditor.updateElement(${idx}, 'y', this.value)">
                    <input type="number" class="editor-form-input" style="width: 40px;" 
                           value="${el.widthInTiles}" placeholder="W" title="Largeur (en tuiles)"
                           onchange="TextureEditor.updateElement(${idx}, 'widthInTiles', this.value)">
                    <input type="number" class="editor-form-input" style="width: 40px;" 
                           value="${el.heightInTiles}" placeholder="H" title="Hauteur (en tuiles)"
                           onchange="TextureEditor.updateElement(${idx}, 'heightInTiles', this.value)">
                    <button class="editor-btn" style="padding: 5px 10px; background: #c0392b;" 
                            onclick="TextureEditor.removeElement(${idx})">🗑️</button>
                </li>
            `;
        });
        return html;
    },

    /**
     * Met à jour un élément
     */
    updateElement: function (index, field, value) {
        const defKey = `${this.currentFolder}/${this.currentFile}`;
        if (!this.definitions[defKey]) return;

        const element = this.definitions[defKey].elements[index];
        if (!element) return;

        if (field === 'name') {
            element[field] = value;
        } else {
            element[field] = parseInt(value) || 0;
        }

        this.redrawOverlay();
    },

    /**
     * Sauvegarde la définition actuelle dans le dossier des assets
     */
    saveDefinition: async function () {
        const defKey = `${this.currentFolder}/${this.currentFile}`;
        const def = this.definitions[defKey];
        if (!def) {
            alert('Aucune définition à sauvegarder');
            return;
        }

        // Trouver le dossier pour obtenir le path
        const folder = this.assetFolders.find(f => f.id === this.currentFolder);
        const folderPath = folder ? folder.path : `/games/system/assets/${this.currentFolder}/`;

        // Données à sauvegarder
        const saveData = {
            file: this.currentFile,
            folder: this.currentFolder,
            path: folderPath + this.currentFile,
            baseTileSize: def.baseTileSize,
            elements: def.elements
        };

        try {
            const response = await fetch('/api/save-texture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    folder: this.currentFolder,
                    file: this.currentFile,
                    data: saveData
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('💾 Définition sauvegardée:', result.path);
                alert(`✅ Sauvegardé avec succès !\n\n📁 ${this.currentFile.replace('.png', '.json')}`);
            } else {
                console.error('❌ Erreur:', result.message);
                alert(`❌ Erreur: ${result.message}`);
            }
        } catch (error) {
            console.error('❌ Erreur réseau:', error);
            alert(`❌ Erreur réseau: ${error.message}`);
        }
    },

    /**
     * Charge la définition depuis le serveur (JSON à côté de l'image)
     */
    loadDefinition: async function () {
        const folder = this.assetFolders.find(f => f.id === this.currentFolder);
        if (!folder || !this.currentFile) {
            alert('Sélectionnez d\'abord un fichier');
            return;
        }

        const jsonPath = folder.path + this.currentFile.replace('.png', '.json').replace('.jpg', '.json');

        try {
            const response = await fetch(jsonPath);

            if (!response.ok) {
                if (response.status === 404) {
                    alert('Aucune définition trouvée pour ce fichier.\nCréez-en une nouvelle !');
                } else {
                    alert(`Erreur de chargement: ${response.status}`);
                }
                return;
            }

            const def = await response.json();
            const defKey = `${this.currentFolder}/${this.currentFile}`;
            this.definitions[defKey] = def;

            // Rafraîchir l'affichage
            if (this.currentImage) {
                this.renderPreview(this.currentFile, this.currentImage);
            }

            console.log('📂 Définition chargée:', def);
            alert(`✅ Définition chargée: ${def.elements?.length || 0} éléments`);
        } catch (err) {
            console.error('Erreur de chargement:', err);
            alert(`❌ Erreur: ${err.message}`);
        }
    }
};

// Enregistrer le module dans EditorManager
if (window.EditorManager) {
    EditorManager.registerEditor('texture', TextureEditor);
}
