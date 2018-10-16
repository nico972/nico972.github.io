const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20,20);

//Variables for the GameOver part
var mouseX = 0; 
var mouseY = 0; 

var btnPlay = new Button(21,112,239,264); 
var btnQuit = new Button(132,224,240,265); 

//Music related variables
var mySound;
var myMusic; 

// Create gradient
var grad = context.createLinearGradient(0, 1, 0, 17);
grad.addColorStop(0, "black");
grad.addColorStop(1, "white");

function arenaSweep(){
    let rowCount=1;
   outer: for(let y = arena.length -1 ; y > 0 ; --y){
        for(let x = 0; x < arena[y].length; ++x){
            if(arena[y][x] === 0){
                continue outer;
            }
        }4

       const row = arena.splice(y,1)[0].fill(0); 
       arena.unshift(row); 
       ++y; 

       player.score += rowCount * 10; 
       rowCount *=2; 
    }
}

function collide(arena,player){
    const [m,o] = [player.matrix,player.pos];
    for(let y = 0; y < m.length; ++y){
        for(let x = 0; x<m[y].length; ++x){
            if(m[y][x] !== 0 &&
                (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0){
                    return true;
                }

            }
        }
        return false;
}

function createMatrix(w,h){
    const matrix = []; 
    while (h-- ){
        matrix.push(new Array(w).fill(0))
    }

    return matrix; 
}

function createPiece(type){
    if(type === 'T'){
        const matrix = [ 
                [0,0,0], 
                [1,1,1],
                [0,1,0],
         ];
        return matrix; 
    } else if (type === 'O') {
        const matrix = [ 
                [2,2], 
                [2,2],
         ];
         return matrix;
    } else if (type === 'L'){
        const matrix = [ 
                [0,3,0], 
                [0,3,0],
                [0,3,3],
         ];
        return matrix; 
    } else if (type === 'J'){
        const matrix = [ 
                [0,4,0], 
                [0,4,0],
                [4,4,0],
         ];
        return matrix; 
    } else if (type === 'I'){
        const matrix = [ 
                [0,5,0,0], 
                [0,5,0,0],
                [0,5,0,0],
                [0,5,0,0],
         ];
        return matrix; 
    } else if (type === 'S'){
        const matrix = [ 
                [0,6,6], 
                [6,6,0],
                [0,0,0],
         ];
        return matrix; 
    } else if (type === 'Z'){
        const matrix = [ 
                [7,7,0], 
                [0,7,7],
                [0,0,0],
         ];
        return matrix; 
    }
}

function draw(){
    // Fill with gradient
    context.fillStyle = grad;
    //context.fillStyle= '#000';
    context.fillRect(0,0,canvas.width, canvas.height);
    drawMatrix(arena, {x:0, y:0});
    drawMatrix(player.matrix,player.pos);
}

function drawMatrix(matrix, offset){
     matrix.forEach((row,y) => {
        row.forEach((value,x) => {
            if(value !== 0){ 
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                y + offset.y,
                                1,1);
            }
        });

     });
}



function merge(arena, player){
    player.matrix.forEach((row,y) => {
        row.forEach((value,x) => {
            if(value !== 0){
                arena[y+player.pos.y][x+player.pos.x] = value; 
            }
        })
    })
}

function playerDrop(){
    player.pos.y++; 
    if(collide(arena,player)){
        player.pos.y--;
        merge(arena,player);
        playerReset();
        arenaSweep(); 
        updateScore();
    }
    dropCounter=0; 

}

function playerMove(dir){
    player.pos.x += dir;
    if(collide(arena,player)){
        player.pos.x -= dir; 
    }

}

function gameOver(){
    myMusic.stop(); 
    mySound.play(); 

    context.fillStyle = "#E0F8F7";
    //context.fillRect(0,canvas.height/(20*4),canvas.width, canvas.height/(20*2)); 
    
    var img = new Image(); 
    img.src = "images/game_over.png";
    img.onload = function () {
         context.drawImage(img,0,5,12,10);   
    };
    
    document.addEventListener('click',mouseClicked, false);
}

function playerReset(){
    // YOU CAN CREATE OTHER PIECES IF YOU LIKE !
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0 ]);
    player.pos.y = 0; 
    player.pos.x = (arena[0].length / 2 | 0 ) - (player.matrix[0].length / 2 | 0);

    if(collide(arena,player)){
        arena.forEach(row => row.fill(0));
        game = 0;
        gameOver(); 
        player.score = 0;
        updateScore();
    }
}

function Button(xL, xR, yT, yB){
    this.xLeft = xL; 
    this.xRight = xR;
    this.yTop = yT; 
    this.yBottom = yB; 
}

//Check if the PLay Again button is clicked
Button.prototype.checkClicked = function(){
    if(this.xLeft <= mouseX && this.xRight >= mouseX
        && this.yTop <= mouseY && mouseY <= this.yBottom){
        return true;
    }  
}

function mouseClicked(e){
    mouseX = e.pageX - canvas.offsetLeft; 
    mouseY = e.pageY - canvas.offsetTop;
    console.log("mouseX: " + mouseX);
    console.log("mouseY: " + mouseY); 
    if(btnPlay.checkClicked()) {
        game=1;
        //myMusic = new sound("music/country.mp3"); 
        myMusic.play();
        update(); 
    }
    else if(btnQuit.checkClicked()){
        console.log("I Quit !");
        window.location.href = "index.html";
    }

}

function playerRotate(dir){
    const pos = player.pos;
    let offset = 1; // so we can fix the fact that when we rotate near the wall we can 
    //have part of the piece traversing the wall 
    rotate(player.matrix, dir); 
    while (collide(arena, player)){
        player.pos.x += offset; 
        offset = -(offset + ( offset> 0 ? 1 : -1)); //this does 1 -2 3 -4 5 -6 etc... 
                                        //you can check on the console
        if(offset > player.matrix[0].length){
            rotate(player.matrix, -dir); 
            player.pos.x = pos; 
            return; 
        }
    }
}

function rotate(matrix, dir){
    //First transpose the matrix 
    for(let y=0; y<matrix.length; ++y){
        for(let x=0; x<y; ++x){
          [ matrix[x][y], matrix[y][x], ] = [ matrix[y][x], matrix[x][y] ];
        }
    }

    //Once the matrix transposed -> switch the rows (or columns not sure)
    //For some reason this will make a rotation clockwise or counterclockwise
    //depending on the way you switch
    if (dir > 0){
        matrix.forEach(row => row.reverse());
    }
    else{
        matrix.reverse();
    }
}

let dropCounter = 0; 
let dropInterval = 1000; 

let lastTime = 0; 

function update(time=0){
    

    const deltaTime = time - lastTime; 
    lastTime = time; 

    dropCounter += deltaTime; 
    if(dropCounter > dropInterval){
        playerDrop(); 
    }

    //console.log("deltaTime=" + deltaTime); 
    
    if (game > 0){
        draw(); 
        requestAnimationFrame(update);
    }
    
}

function updateScore(){
    document.getElementById('score').innerText = "Score: " + player.score;
}

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }    
}

//The arena where the piece end up when they get stuck
const arena = createMatrix(12,20);
//console.log(arena); console.table(arena);

const player = {
    pos: {x:0, y:0},
    matrix: null,
    score: 0,
}

let game = 1; 

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',

];

let touched = false;

document.addEventListener('keydown', event => {
    console.log(event);
    if(event.keyCode === 37){
        playerMove(-1);
    }
    else if(event.keyCode === 39){
        playerMove(1);
    }
    else if(event.keyCode === 40){
        playerDrop();
    }
    else if (event.keyCode == 81 || event.keyCode == 32 ){
        playerRotate(-1);
    }
    else if (event.keyCode == 87) { 
        playerRotate(1);
    }
    //if you want to cheat !
    // else if(event.keyCode === 38){
    //     player.pos.y--; 
    // }
} )

// ---------------------- MOBILE TOUCHE TO TURN A PIECE -------------------------
/*window.addEventListener('load', function(){ // on page load
 
    document.body.addEventListener('touchstart', function(e){
        //alert(e.changedTouches[0].pageX) // alert pageX coordinate of touch point
         //playerRotate(-1); 
    }, false)
 
}, false)*/
//--------------------------------------------------------------------------------

//-------------------- MOBILE SWIPE RIGHT ----------------------------------------
function swipedetect(el, callback){
  
    var touchsurface = el,
    swipedir,
    startX,
    startY,
    distX,
    distY,
    threshold = 150, //required min distance traveled to be considered swipe
    restraint = 100, // maximum distance allowed at the same time in perpendicular direction
    allowedTime = 300, // maximum time allowed to travel that distance
    elapsedTime,
    startTime,
    handleswipe = callback || function(swipedir){}
  
    touchsurface.addEventListener('touchstart', function(e){
        var touchobj = e.changedTouches[0]
        swipedir = 'none'
        dist = 0
        startX = touchobj.pageX
        startY = touchobj.pageY
        startTime = new Date().getTime() // record time when finger first makes contact with surface
        e.preventDefault()
    }, false)
  
    touchsurface.addEventListener('touchmove', function(e){
        e.preventDefault() // prevent scrolling when inside DIV
    }, false)
  
    touchsurface.addEventListener('touchend', function(e){
        var touchobj = e.changedTouches[0]
        distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
        distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
        elapsedTime = new Date().getTime() - startTime // get time elapsed
        if (elapsedTime <= allowedTime){ // first condition for awipe met
            if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
                swipedir = (distX < 0)? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
            }
            else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ // 2nd condition for vertical swipe met
                swipedir = (distY < 0)? 'up' : 'down' // if dist traveled is negative, it indicates up swipe
            }
        }
        handleswipe(swipedir)
        e.preventDefault()
    }, false)
}
  
//USAGE:

var el = document.body;
swipedetect(el, function(swipedir){
    //swipedir contains either "none", "left", "right", "top", or "down"
    if (swipedir =='left'){
       playerMove(-1);
    }
    else if (swipedir =='right'){
        playerMove(1);
    }
    else if (swipedir == 'none'){
        playerRotate(-1);
    }
    else if(swipedir == 'down'){
        playerDrop();
    }
})


//music
mySound = new sound("music/game_over.ogg"); 
myMusic = new sound("music/country.mp3"); 
myMusic.play();

playerReset(); 
updateScore();
update(); 


