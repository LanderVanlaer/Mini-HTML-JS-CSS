class Bubble {
    //(Random number between maxSpeed/2 and maxSpeed) & (50% negative or positive)
    speedx = (Math.floor(Math.random() * (config.maxSpeed / 2)) + config.maxSpeed / 2) * (Math.random() >= .5 ? -1 : 1);
    speedy = (Math.floor(Math.random() * (config.maxSpeed / 2)) + config.maxSpeed / 2) * (Math.random() >= .5 ? -1 : 1);
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = config.radius;
    }
    show() {
        ctx.beginPath();
        ctx.fillStyle = config.color;
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }
    update() {
        this.x += this.speedx;
        this.y += this.speedy;
        this.check();
    }
    check() {
        if (this.x - this.radius <= 0) {
            this.speedx = Math.abs(this.speedx);
            this.x = 0 + this.radius
        } else if (this.x + this.radius >= can.width) {
            this.speedx = -Math.abs(this.speedx);
            this.x = can.width - this.radius;
        }
        if (this.y - this.radius <= 0) {
            this.speedy = Math.abs(this.speedy);
            this.y = 0 + this.radius;
        } else if (this.y + this.radius >= can.height) {
            this.speedy = -Math.abs(this.speedy);
            this.y = can.height - this.radius;
        }
    }
    connectBubble(bub) {
        bub.forEach(b => {
            if (Math.hypot((b.y - this.y), (b.x - this.x)) <= config.maxLength)
                this.drawLine(b.x, b.y);
        })
    }
    connectMouse({ x, y }) {
        if (Math.hypot((y - this.y), (x - this.x)) <= config.maxLength)
            this.drawLine(x, y);
    }
    drawLine(x, y) {
        ctx.beginPath();
        ctx.strokeStyle = config.color;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(x, y);
        ctx.lineWidth = config.strokeWidth;
        ctx.stroke();
    }
}

const clearCanvas = () => { ctx.clearRect(0, 0, can.width, can.height) }


const nextFrame = () => {
    clearCanvas();
    bubbles.forEach((b, i) => {
        b.update();
        b.show();
        b.connectBubble(bubbles.slice(i))
        b.connectMouse(mousePos);
    })
    return requestAnimationFrame(nextFrame);
};


/*------------------------- CONFIG -------------------------*/
const config = {
    strokeWidth: 1,
    maxLength: 110,
    radius: 4,
    maxSpeed: 1.5,
    color: "#fff"
}


//onload
const
    can = document.getElementById('can'),
    ctx = can.getContext('2d');
can.width = window.innerWidth;
can.height = window.innerHeight;



const makeBubbles = () => {
    bubbles = [];
    const BUBBLES_WIDTH_HEIGHT = (can.width * can.height) / 9000;
    const AMOUNT_OF_BUBBLES = (BUBBLES_WIDTH_HEIGHT > 1000 ? 1000 : BUBBLES_WIDTH_HEIGHT); //max 1000 bubbles
    for (let i = 0; i < AMOUNT_OF_BUBBLES; i++) {
        bubbles.push(new Bubble(
            Math.floor(Math.random() * can.width),
            Math.floor(Math.random() * can.height)));
    }
}
let bubbles;
makeBubbles();


let
    previousSize = {
        width: can.width,
        height: can.height
    },
    mousePos = { x: 0, y: 0 };

window.addEventListener("resize", () => {
    //change canvas width and height to window
    can.width = window.innerWidth;
    can.height = window.innerHeight;

    //if the resize difference is greater than 150px (height or width)
    //Then make new bubbles
    if (Math.abs(previousSize.width - can.width) > 150 || Math.abs(previousSize.height - can.height) > 150) {
        previousSize = {
            height: can.height,
            width: can.width
        }
        makeBubbles();
    }
});

window.onmousemove = ({ clientX: x, clientY: y }) => mousePos = { x, y };

nextFrame();