// SELECT CANVAS ELEMENT
const cvs = document.getElementById("breakout");

// GET CONTEXT OF CANVAS
const ctx = cvs.getContext("2d");

// ADD A BORDER TO CANVAS
cvs.style.border = "1px solid #0ff";

// CAHNGE LINE WIDTH WHEN DRAWING TO CANVAS
ctx.lineWidth   = 3;

// CREATE GAME VARIABLES AND CONSTANTS
let SCORE = 0;
const SCORE_UNIT = 10;
let LIFE = 3;
let GAME_OVER = false;
let gameLevel = 1;
const MAX_LEVEL = 7;
const PADDLE_WIDTH = 100, PADDLE_HEIGHT = 20, PADDLE_MARGIN_BOTTOM = 50;
const BALL_RADIUS = 8;

// LEFT AND RIGHT ARROWS
let rightArrow = false;
let leftArrow = false;

// PADDLE OBJECT
const paddle = {
    x : cvs.width/2 - PADDLE_WIDTH/2,
    y : cvs.height - PADDLE_HEIGHT - PADDLE_MARGIN_BOTTOM,
    height : PADDLE_HEIGHT,
    width : PADDLE_WIDTH,
    dx : 5
}

// DRAW PADDLE TO CANVAS
function drawPaddle(){
    // fill rectangle
    ctx.fillStyle = "#2e3548";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // stroke
    ctx.strokeStyle = "#ffcd05";
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);

}

// PADDLE COLLISION DETECTION
function paddleCollision(){
    if(ball.y > paddle.y && ball.x < paddle.x + paddle.width && ball.x > paddle.x && ball.y < paddle.y + paddle.height){
        
        let collidePoint = (ball.x - (paddle.x + paddle.width/2))/ (paddle.width/2);
        
        let angle = collidePoint * (Math.PI/3);        
        
        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = -1 * ball.speed * Math.cos(angle);
        
        paddle_hit.play();
    }
}

// LSTEN TO KEY UP AND KEY DOWN EVENTS
document.addEventListener("keydown", function(event){
    if(event.keyCode == 37){
        leftArrow = true;
    }else if(event.keyCode == 39){
        rightArrow = true;
    }
});
document.addEventListener("keyup", function(event){
    if(event.keyCode == 37){
        leftArrow = false;
    }else if(event.keyCode == 39){
        rightArrow = false;
    }
});

// MOVE PADDLE LEFT AND RIGHT
function movePaddle(){
    if(rightArrow && paddle.x + paddle.width < cvs.width){
        paddle.x += paddle.dx;
    }else if(leftArrow && paddle.x > 0){
        paddle.x -= paddle.dx;
    }
}

// BALL OBJECT
const ball = {
    x : cvs.width/2,
    y : paddle.y - BALL_RADIUS,
    radius : BALL_RADIUS,
    speed : 4,
    dx : 3 * (Math.random() * 2 - 1),
    dy : -3
}

// MOVE BALL
function moveBall(){
    ball.x += ball.dx;
    ball.y += ball.dy;
}

// BALL COLLISION DETECTION
function ballWallCollision(){
    // HIT LEFT AND RIGHT BALL
    if(ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0){
        ball.dx = - ball.dx;
        wall.play();
    }
    
    // HIT TOP WALL
    if(ball.y - ball.radius < 0){
        ball.dy = - ball.dy;
        wall.play();
    }
    
    // HIT BOTTOM WALL, LOSE A LIFE
    if(ball.y > cvs.height){
        life_lost.play();
        // LOSE A LIFE
        LIFE--;
        // RESET BALL POSITION
        resetBall();
    }
}

// RESET BALL POSITION AFTER LOSE A LIFE
function resetBall(){
    ball.x = cvs.width/2;
    ball.y = paddle.y - BALL_RADIUS;
    ball.dx = 3 * (Math.random() * 2 - 1); 
    ball.dy = -3;
}

// DRAW BALL TO CANVAS
function drawBall(){
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = "#ffcd05";
    ctx.fill();
    // stroke
    ctx.strokeStyle = "#2e3548";
    ctx.stroke();
    ctx.closePath();
}

// BRICKS OBJECT
const brick = {
    bricks : [],
    row : 1,
    column : 5,
    width : 55,
    height : 20,
    offSetLeft : 20,
    offSetTop : 20,
    marginTop : 40,
    fillColor : "#2e3548",
    strokeColor : "#FFF",
}

// CREATE BRICKS
function createBricks(){
    for(let c = 0; c < brick.column; c++) {
        brick.bricks[c] = [];
        for(let r = 0; r < brick.row; r++) {
            brick.bricks[c][r] = {
                x : (c *( brick.width + brick.offSetLeft)) + brick.offSetLeft,
                y : (r *( brick.height + brick.offSetTop)) + brick.offSetTop + brick.marginTop,
                status: 1
            };
        }
    }
}
createBricks();

// DRAW BRICKS TO CANVAS
function drawBricks(){
    for(let c = 0; c < brick.column; c++) {
        for(let r = 0; r < brick.row; r++) {
            if(brick.bricks[c][r].status == 1) {

                ctx.beginPath();

                // fill rectangle
                ctx.fillStyle = brick.fillColor;
                ctx.rect(brick.bricks[c][r].x , brick.bricks[c][r].y, brick.width, brick.height);
                ctx.fill();

                // stroke
                ctx.strokeStyle = brick.strokeColor;
                ctx.strokeRect(brick.bricks[c][r].x , brick.bricks[c][r].y, brick.width, brick.height);
                ctx.stroke();

                ctx.closePath();
            }
        }
    }
}

// BRICK COLLISION DETECTION
function brickCollision(){
    for(let c = 0; c < brick.column; c++) {
        for(let r = 0; r < brick.row; r++) {
            let b = brick.bricks[c][r];
            
            if(b.status == 1) {
                if(ball.x + ball.radius > b.x && ball.x - ball.radius < b.x+brick.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y+brick.height) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    brick_hit.play();
                    SCORE += SCORE_UNIT;
                }
            }
        }
    }
}

// LEVEL UP
function levelUp(){
    let isLevelDone = true;
    for(let c = 0; c < brick.column; c++){
        for(let r = 0; r < brick.row; r++){
            let birckStatus = brick.bricks[c][r].status;
            isLevelDone = isLevelDone && !birckStatus;
        }
    }
    
    if(isLevelDone){
        win.play();
        if(gameLevel >= MAX_LEVEL){
            GAME_OVER = true;
            return;
        }
        brick.row++;
        createBricks();
        drawBricks();
        ball.speed += 0.5;
        resetBall();
        
        gameLevel++;
    }
}

// GAME OVER
function gameOver(){
    if(LIFE == 0){
        GAME_OVER = true;
    }
}

// DRAW GAME STATS : SCORE, LIVES, LEVEL
function drawGameStats(value, valueX, valueY, img, imgX, imgY, imgWidth, imgHeight){
    ctx.fillStyle = "#FFF";
    ctx.font = "25px Germania One";
    ctx.fillText(value, valueX, valueY);
    ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
}

// UPDATE GAME LOGIC
function update(){
    movePaddle();
    
    moveBall();
    
    ballWallCollision();
        
    paddleCollision();
    
    brickCollision();
    
    levelUp();
    
    gameOver();
}

// DRAW GAME
function draw(){
    // CLEAR CANVAS WITH BG IMAGE
    ctx.drawImage(BG_IMG,0,0);
        
    drawPaddle();
    
    drawBall();
    
    drawBricks();
    
    // DRAW SCORE
    drawGameStats(SCORE, 35, 25, SCORE_IMG, 5, 5, 25, 25)
    
    // DRAW LIVES
    drawGameStats(LIFE, cvs.width - 25, 25, LIFE_IMG, cvs.width - 70, -8, 50, 50)
    
    // DRAW GAME LEVEL
    drawGameStats(gameLevel, cvs.width/2, 25, LEVEL_IMG, cvs.width/2 - 30, 6, 23, 23)
}

// GAME LOOP
function loop(){  
    draw();
    
    update();
    
    // IF GAME OVER STOP GAME LOOP
    if(!GAME_OVER){
        requestAnimationFrame(loop);
    }
}

loop();

// SELECT SOUND ELEMENT
const soundElement = document.getElementById("sound");

// ADD CLICK EVENT TO SOUND ELEMENT, TO TURN ON/OFF SOUNDS
soundElement.addEventListener("click", function(event){
    // GET STATE OF SOUND - IS IT ON or OFF
    let state = soundElement.getAttribute("state");
    // RUN audioManager FUNCTION
    audioManager(state);
});

// AUDIO MANAGER FUNCTION
function audioManager(state){
    if(state == "off"){
        // SOUND IS OFF WE NEED TO SET IT TO ON
        // CHANGE IMAGE
        soundElement.setAttribute("src", "img/SOUND_ON.png");
        // CHANGE STATE TO ON
        soundElement.setAttribute("state", "on");
        
        // UNMUTE ALL SOUNDS
        wall.muted = false;
        paddle_hit.muted = false;
        life_lost.muted = false;
        brick_hit.muted = false;
        win.muted = false;
        
    }else if(state == "on"){
        // SOUND IS ON WE NEED TO SET IT TO OFF
        // CHANGE IMAGE
        soundElement.setAttribute("src", "img/SOUND_OFF.png");
        // CHANGE STATE TO OFF
        soundElement.setAttribute("state", "off");
        
        // MUTE ALL SOUNDS
        wall.muted = true;
        paddle_hit.muted = true;
        life_lost.muted = true;
        brick_hit.muted = true;
        win.muted = true;
    }
}

















