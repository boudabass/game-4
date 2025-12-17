function setup() {
    // 1. Canvas 800x600
    createCanvas(800, 600);
    noStroke();
}

function draw() {
    // 2. Background rafraîchi chaque frame (gris foncé)
    background(50);

    // 3. Rectangle fixe rouge (rect(100, 100, 100, 100) visible)
    fill(255, 0, 0);
    rect(100, 100, 100, 100);

    // 4. Couleur change position souris (map(mouseX, 0, 800, 0, 255))
    let mappedColor = map(mouseX, 0, width, 0, 255);
    fill(mappedColor, 100, 255 - mappedColor);
    
    // 5. Ellipse suiveuse fluide
    ellipse(mouseX, mouseY, 50, 50);
}