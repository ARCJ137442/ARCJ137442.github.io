"use strict";
// 创建游戏画布
// const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const nLayers = 2;
const layers = [];
const layerCtxs = [];
for (let i = 0; i < nLayers; ++i) {
    let layer = document.getElementById(`main_layer${i + 1}`);
    layers.push(layer);
    layerCtxs.push(layer.getContext('2d'));
}
const [layer1, layer2, ...$rest] = layers;
const [ctx1, ctx2] = layerCtxs;
console.info(layers, layerCtxs);
const randomCanvasP = (canvas) => [
    Math.random() * canvas.width,
    Math.random() * canvas.height
];
const centerCanvasP = (canvas) => [
    canvas.width / 2,
    canvas.height / 2,
];
let Player = /** @class */ (() => {
    class Player {
        constructor(x = 0, y = 0, color = 'red', size = 20) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.size = size;
            this.move_random = (xStep, yStep = xStep) => this.move(xStep * (Math.random() * 2 - 1), yStep * (Math.random() * 2 - 1));
            this.follow = (p, step = 1) => {
                const [dx, dy] = [p.x - this.x, p.y - this.y];
                const d = Math.sqrt(dx * dx + dy * dy);
                this.move(step * dx / d, step * dy / d);
            };
        }
        moveTo(x, y) {
            this.x = x;
            this.y = y;
        }
        move(dx, dy) {
            if (dx != undefined)
                this.x += dx;
            if (dx != undefined)
                this.y += dy;
        }
    }
    Player.THIS_IS_MY_CONST = 1;
    return Player;
})();
class Game {
    constructor(players) {
        this.t = 0;
        this.update = () => {
            this.run();
            this.refreshCanvas();
            requestAnimationFrame(() => this.update());
        };
        this.players = players || [
            new Player()
        ];
    }
    launch() {
        this.update();
    }
    run() {
        this.t++;
        const [p1, p2, p3, p4, p5, p6] = this.players;
        p1.move_random(10);
        p2.move(Math.sin(this.t / 10), Math.cos(this.t / 10));
        if (this.t % 100 == 0) {
            p3.moveTo(...randomCanvasP(layer1));
        }
        p4.follow(p1);
        p5.follow(p3, 5);
    }
    refreshCanvas() {
        this.clearCanvases(layers);
        this.drawPlayers(ctx1);
    }
    drawPlayers(ctx) {
        this.players.forEach(player => {
            ctx.fillStyle = player.color;
            ctx.fillRect(player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);
        });
    }
    clearCanvases(canvases) {
        canvases.forEach(canvas => {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        });
    }
    onMouseMove(event) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        const pEnd = this.players[this.players.length - 1];
        pEnd.moveTo(mouseX, mouseY);
        // 清除图层1内容
        // layer1.clearRect(0, 0, 800, 600);
        // // 在图层1中绘制圆形 
        // layer1.fillStyle = 'green';
        // layer1.beginPath();
        // layer1.arc(mouseX, mouseY, 50, 0, 2 * Math.PI);
        // layer1.closePath();
        // layer1.fill();
    }
}
const game = new Game([
    new Player(...centerCanvasP(layer1), 'blue'),
    new Player(...randomCanvasP(layer1), 'green', 15),
    new Player(100, layer1.height / 2, '#00ffff', 30),
    new Player(100, 100, '#ff0000', 20),
    new Player(200, 200, 'yellow'),
    new Player(200, 200, '#66ccff', 24),
]);
game.launch();
document.addEventListener('mousemove', event => game.onMouseMove(event));
