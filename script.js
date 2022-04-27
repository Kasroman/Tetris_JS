// On exécute quand le dom est chargé et avant le css
document.addEventListener('DOMContentLoaded', () => {
    let switchBtn = 0;
    let speedDropDown = 500;
    let timer
    let score = 0;

    const scoreDisplay = document.querySelector('#score-display');
    scoreDisplay.textContent = score;


    const grid = document.querySelector('.grid');
    const pauseReleaseBtn = document.querySelector('#pauseBtn')

    function randomRgbColor(){
        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);
        return `rgb(${r},${g},${b})`;
    }

    // On créer nos 210 div dans notre div .grid dont 10 qui serront la barriere qui stoppe les shapes
    for(let i = 0; i < 210; i++){
        let div = document.createElement('div');
        if(i >= 200){
            div.classList.add('stop');
        }
        grid.appendChild(div);
    }

    let squares = Array.from(document.querySelectorAll('.grid div'));

    // Largeur de la grid (nombre de squares max sur une largeur)
    const width = 10;

    // Créons les formes
    const lShape = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
    ];

    const zShape = [
        [0,width,width+1,width*2+1],
        [width+1, width+2,width*2,width*2+1],
        [0,width,width+1,width*2+1],
        [width+1, width+2,width*2,width*2+1]
    ];

    const tShape = [
        [1,width,width+1,width+2],
        [1,width+1,width+2,width*2+1],
        [width,width+1,width+2,width*2+1],
        [1,width,width+1,width*2+1]
    ];

    const sShape = [
        [0,1,width,width+1],
        [0,1,width,width+1],
        [0,1,width,width+1],
        [0,1,width,width+1]
    ];

    const iShape = [
        [1,width+1,width*2+1,width*3+1],
        [width,width+1,width+2,width+3],
        [1,width+1,width*2+1,width*3+1],
        [width,width+1,width+2,width+3]
    ];

    const shapes= [lShape, zShape, tShape, sShape, iShape];


    // selectionne une shape random
    let randomShape = Math.floor(Math.random()*shapes.length);

    let randomColor = randomRgbColor();

    let currentPosition = 4;
    let currentRotation = 0;

    let current = shapes[randomShape][currentRotation];

    // Dessine la shape dans la grid
    function draw() {
        current.forEach(item => {
            squares[currentPosition + item].classList.add('shape');
            squares[currentPosition + item].setAttribute('style', `background-color: ${randomColor}`);

        });
    }

    // Efface la shape dans la grid
    function undraw() {
        current.forEach(item => {
            squares[currentPosition + item].classList.remove('shape');
            squares[currentPosition + item].removeAttribute('style');
        });
    }

    // Fait tomber la shapes
    function dropDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    // Assigne les fonctions aux touches
    function control(e) {
        switch(e.keyCode) {
            case 37:
                moveLeft();
            break;
                
            case 38:
                rotate();
            break;

            case 39:
                moveRight();
            break;

            case 40:
                dropDown();
            break;
        }
    }
    document.addEventListener('keydown', control);

    // Stoppe la shape
    function freeze() {
        if(current.some(item => squares[currentPosition + item + width].classList.contains('stop'))){

            // On donne la classe .stop a la current shape
            current.forEach(item => squares[currentPosition + item].classList.add('stop'));

            // On draw une nouvelle shape
            randomShape = Math.floor(Math.random()*shapes.length);
            current = shapes[randomShape][currentRotation];
            currentPosition = 4;
            randomColor = randomRgbColor();
            draw();
            addScore();
            gameOver();
            
        }
    }

    // deplacer la shape a gauche et droite, si elle tappe le bord, elle reste bloquée
    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(item => (currentPosition + item) % width === 0);

        if(!isAtLeftEdge && !current.some(item => squares[currentPosition + item - 1].classList.contains('stop'))) {
            currentPosition -= 1;
        }

        draw();
    }

    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(item => (currentPosition + item) % width === width - 1);

        if(!isAtRightEdge && !current.some(item => squares[currentPosition + item + 1].classList.contains('stop'))) {
            currentPosition += 1;
        }

        draw();
    }

    // Fixe les problèmes de rotation sur les bords 
    function isAtRight() {
        return current.some(index=> (currentPosition + index + 1) % width === 0)  
    }
    
    function isAtLeft() {
        return current.some(index=> (currentPosition + index) % width === 0)
    }
    
    function checkRotatedPosition(p){
        p = p || currentPosition;    
        if ((p + 1) % width < 4) {           
            if (isAtRight()){           
                currentPosition += 1  ;  
                checkRotatedPosition(p) ;
                }
        }
        else if (p % width > 5) {
            if (isAtLeft()){
                currentPosition -= 1;
            checkRotatedPosition(p);
            }
        }
    }

    // tourne la shapes
    function rotate() {
        undraw();
        currentRotation ++;

        if(currentRotation >= current.length){
            currentRotation = 0;
        }

        current = shapes[randomShape][currentRotation];
        checkRotatedPosition();
        draw();
    }

    // Fonction de pause au bouton
    pauseReleaseBtn.addEventListener('click', () => {
        switchBtn++
        if(switchBtn % 2 === 0){
            pauseReleaseBtn.textContent = 'Start';
            pauseReleaseBtn.classList.remove('btn-warning');
            pauseReleaseBtn.classList.add('btn-success');
        }else{
            pauseReleaseBtn.textContent = 'Pause';
            pauseReleaseBtn.classList.remove('btn-success');
            pauseReleaseBtn.classList.add('btn-warning');
        }

        if(timer){
            clearInterval(timer);
            timer = null;
        }else {
            draw();
            timer = setInterval(dropDown, speedDropDown);
        }
        
    });

    function addScore(){
        for(let i=0; i < 199; i += width) {
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];

            if (row.every(item => squares[item].classList.contains('stop'))){
                score += 10;
                scoreDisplay.textContent = score;

                row.forEach(item => {
                    squares[item].classList.remove('stop');
                    squares[item].classList.remove('shape');
                    // squares[item].style.backgroundColor = '';
                    squares[item].removeAttribute('style');
                });

                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell));
            }
        }
    }

    //fin du jeu
    function gameOver() {
        if(current.some(index => squares[currentPosition + index].classList.contains('stop'))) {
            clearInterval(timer);
            if (window.confirm(`T'es nul ! Ton score n'est que de ${score} ... Tu rejoues ?`)) {
                location.reload();
            }
        }
    }
});

