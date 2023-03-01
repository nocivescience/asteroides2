const fps = 30;
const SHIP_THRUST=5;
const FRICTION=0.7;
const turn_speed = 360;
const ROID_NUM = 3;
const ROID_SIZE = 100;
const ROID_SPD = 50;
const ROID_VERT = 10;
const ROID_JAG = 0.4;
const SHOW_BOUNDING = false;
const SHIP_INV_DUR=3;
const SHIP_BLINK_DUR=.1;
const EXPLODE_DUR=0.3;
const LASER_MAX=10;
const LASER_SPD=300;
const TURN_SPEED=360;
const SHIP_SIZE=30;
const COLORS=[
    "red",
    "green",
    "white",
    "yellow",
    "orange",
    "pink",
    "purple",
    "brown",
    "cyan",
    "lime",
    "magenta",
]
var roids, ship, level
const canv=document.getElementById("gameCanvas");
const ctx=canv.getContext("2d");
setInterval(
    update,1000/fps
)
function createAsteroideBelt(){
    roids=[];
    roidsTotal = (ROID_NUM + level) * 7;
    roidsLeft = roidsTotal;
    var x, y;
    for (var i = 0; i < roidsTotal; i++) {
        do{
            x=Math.floor(Math.random() * canv.width);
            y=Math.floor(Math.random() * canv.height);
        }while(distBetweenPoints(ship.x, ship.y, x, y) < ROID_SIZE * 2 + ship.r);
        roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 2)))}
}
function destryAsteroid(index){
    var x = roids[index].x;
    var y = roids[index].y;
    var r = roids[index].r;
    //split the asteroid in two if necessary
    if(r == Math.ceil(ROID_SIZE / 2)){
        roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 4)));
        roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 4)));
    }else if(r == Math.ceil(ROID_SIZE / 4)){
        roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 8)));
        roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 8)));
    }
    roids.splice(index, 1);
    roidsLeft--;
    //calculate the new score
    score += ROID_PTS * (roid_num + level);
    if(roidsLeft == 0){
        level++;
        newLevel();
    }
}
function distBetweenPoints(x1, y1, x2, y2){
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
function newShip(){
    return {
        x: canv.width / 2,
        y: canv.height / 2,
        a: 90 / 180 * Math.PI, //convert to radians
        r: SHIP_SIZE / 2,
        rot: 0,
        blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
        blinkTime: Math.ceil(SHIP_BLINK_DUR * fps),
        canShoot: true,
        lasers: [],
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        },
        explodeTime: 0,
        dead: false,
    }
}

function drawShip(x, y, a, colour = "white"){
    ctx.strokeStyle = colour;
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo( //nose of the ship
        x + 4 / 3 * ship.r * Math.cos(a),
        y - 4 / 3 * ship.r * Math.sin(a)
    );
    ctx.lineTo( //rear left
        x - ship.r * (2 / 3 * Math.cos(a) + Math.sin(a)),
        y + ship.r * (2 / 3 * Math.sin(a) - Math.cos(a))
    );
    ctx.lineTo( //rear right
        x - ship.r * (2 / 3 * Math.cos(a) - Math.sin(a)),
        y + ship.r * (2 / 3 * Math.sin(a) + Math.cos(a))
    );
    ctx.closePath();
    ctx.stroke();
    return ctx
}
ship = newShip();
function explodeShip(){
    ship.explodeTime = Math.ceil(EXPLODE_DUR * fps);
}
function gameOver(){
    ship.dead = true;
    text = "Game Over";
    textAlpha = 1.0;
}
function newLevel(){
    text = "Level " + (level + 1);
    textAlpha = 1.0;
    createAsteroideBelt();
}
function newAsteroid(x, y, r){
    var lvlMult = 1 + 0.1 * level;
    var roid = {
        x: x,
        y: y,
        xv: Math.random() * ROID_SPD * lvlMult / fps * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ROID_SPD * lvlMult / fps * (Math.random() < 0.5 ? 1 : -1),
        r: r,
        a: Math.random() * Math.PI * 2, //in radians
        vert: Math.floor(Math.random() * (ROID_VERT + 1) + ROID_VERT / 2),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        offs: []
    };
    //create the vertex offsets array
    for (var i = 0; i < roid.vert; i++) {
        roid.offs.push(Math.random() * ROID_JAG * 2 + 1 - ROID_JAG);
    }
    return roid;
}
function shootLaser(){
    //create the laser object
    if(ship.canShoot && ship.lasers.length < LASER_MAX){
        ship.lasers.push({ //from the nose of the ship
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: LASER_SPD * Math.cos(ship.a) / fps,
            yv: -LASER_SPD * Math.sin(ship.a) / fps,
            dist: 0,
            explodeTime: 0
        });
    }
    //prevent further shooting
    ship.canShoot = false;
}
function drawLaser(laser){
    ctx.fillStyle = "salmon";
    ctx.beginPath();
    ctx.arc(laser.x, laser.y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
    ctx.fill();
}
function moveLasers(){
    //loop over the lasers
    for (var i = ship.lasers.length - 1; i >= 0; i--) {
        //check distance travelled
        if(ship.lasers[i].dist > LASER_DIST * canv.width){
            ship.lasers.splice(i, 1);
            continue;
        }
        //handle the explosion
        if(ship.lasers[i].explodeTime > 0){
            ship.lasers[i].explodeTime--;
            //destroy the laser after the duration is up
            if(ship.lasers[i].explodeTime == 0){
                ship.lasers.splice(i, 1);
                continue;
            }
        } else {
            //move the laser
            ship.lasers[i].x += ship.lasers[i].xv;
            ship.lasers[i].y += ship.lasers[i].yv;
            //calculate the distance travelled
            ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
        }
        //handle edge of screen
        if(ship.lasers[i].x < 0){
            ship.lasers[i].x = canv.width;
        } else if(ship.lasers[i].x > canv.width){
            ship.lasers[i].x = 0;
        }
        if(ship.lasers[i].y < 0){
            ship.lasers[i].y = canv.height;
        } else if(ship.lasers[i].y > canv.height){
            ship.lasers[i].y = 0;
        }
    }
}
function detectLaserHit(roid){
    var ax, ay, ar, lx, ly;
    //get the asteroid properties
    ax = roid.x;
    ay = roid.y;
    ar = roid.r;
    //loop over the lasers
    for (var i = ship.lasers.length - 1; i >= 0; i--) {
        //get the laser properties
        lx = ship.lasers[i].x;
        ly = ship.lasers[i].y;
        //detect hits
        if(ship.lasers[i].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar){
            //destroy the asteroid and activate the laser explosion
            destroyAsteroid(roid, i);
            break;
        }
    }
}
function destroyAsteroid(index){
    var x = roids[index].x;
    var y = roids[index].y;
    var r = roids[index].r;
    //split the asteroid in two if necessary
    if(r == Math.ceil(SMALL_ROID_SIZE / 2)){
        roids.push(newAsteroid(x, y, Math.ceil(SMALL_ROID_SIZE / 4)));
        roids.push(newAsteroid(x, y, Math.ceil(SMALL_ROID_SIZE / 4)));
        score += SMALL_ROID_SCORE;
    } else if(r == Math.ceil(SMALL_ROID_SIZE / 4)){
        roids.push(newAsteroid(x, y, Math.ceil(SMALL_ROID_SIZE / 8)));
        roids.push(newAsteroid(x, y, Math.ceil(SMALL_ROID_SIZE / 8)));
        score += SMALL_ROID_SCORE / 2;
    } else {
        score += BIG_ROID_SCORE;
    }
    //check high score
    if(score > scoreHigh){
        scoreHigh = score;
        localStorage.setItem(SAVE_KEY_SCORE, scoreHigh);
    }
    //destroy the asteroid
    roids.splice(index, 1);
    //calculate the ratio of remaining asteroids to determine the music tempo
    music.setAsteroidRatio(roids.length == 0 ? 1 : roids.length / ROIDS_NUM);
    //new level when no more asteroids
    if(roids.length == 0){
        level++;
        newLevel();
    }
}
function keyDown(/** @type {KeyboardEvent} */ ev){
    if(ship.dead){
        return;
    }
    switch(ev.keyCode){
        case 32: //space bar (shoot laser)
            shootLaser();
            break;
        case 37: //left arrow (rotate ship left)
            ship.rot = TURN_SPEED / 180 * Math.PI / fps;
            break;

    }
}
function keyUp(/** @type {KeyboardEvent} */ ev){
    if(ship.dead){
        return;
    }
    switch(ev.keyCode){
        case 32: //space bar (allow shooting again)
            ship.canShoot = true;
            break;
        case 37: //left arrow (stop rotating left)
            ship.rot = 0;
            break;
        case 38:
            ship.thrusting = false;
            break;
        case 39: //right arrow (stop rotating right)
            ship.rot = 0;
            break;
    }
}
function update(){
    var blinkOn = ship.blinkNum % 2 == 0;
    var exploding = ship.explodeTime > 0;
    score = 1;
    level = Math.floor(score / 1000) + 1;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);
    drawShip(ship.x, ship.y, ship.a);
    createAsteroideBelt();
    // drawasteroide
    var a, r, x, y, offs, vert;
    for (var i = 0; i < roids.length; i++) {
        ctx.strokeStyle = roids[i].color;
        ctx.fillStyle = roids[i].color;
        ctx.lineWidth = SHIP_SIZE / 20;
        //get the asteroid properties
        a = roids[i].a;
        r = roids[i].r;
        x = roids[i].x;
        y = roids[i].y;
        //draw a path
        ctx.beginPath();
        ctx.moveTo(
            x + r * Math.cos(a),
            y + r * Math.sin(a)
        );
        //draw the polygon
        for (var j = 0; j < roids[i].vert; j++) {
            offs = a + Math.PI * 2 / roids[i].vert * j;
            vert = r * (0.8 + Math.random() * 0.4);
            ctx.lineTo(
                x + vert * Math.cos(offs),
                y + vert * Math.sin(offs)
            );
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }
}