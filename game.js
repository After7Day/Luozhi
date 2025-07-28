const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// 画布大小
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// 角色大小（像素）
const TILE_SIZE = 32;

// 玩家位置，单位是地图坐标（格子）
let player = { x: 0, y: 0 };

// 键盘状态
const keys = {};

// 监听键盘事件
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// 宝箱地图坐标
const chestPos = { x: -2251, y: -5922 };

// 加载图片
const assets = {};
let loadedCount = 0;
const toLoad = ["player.png", "grass.png", "road.png", "chest.png"];

toLoad.forEach(src => {
  const img = new Image();
  img.src = `assets/${src}`;
  img.onload = () => {
    assets[src] = img;
    loadedCount++;
    if (loadedCount === toLoad.length) {
      gameLoop();
    }
  };
});

// 简单地图块类型（0=草地，1=道路）
function getTile(x, y) {
  // 无限世界简单模拟：
  // - 偶数行为草地，奇数行道路，做简单图案
  return ((x + y) % 2 === 0) ? 0 : 1;
}

function update() {
  const speed = 0.1; // 每帧移动多少格子

  if (keys["ArrowUp"]) player.y -= speed;
  if (keys["ArrowDown"]) player.y += speed;
  if (keys["ArrowLeft"]) player.x -= speed;
  if (keys["ArrowRight"]) player.x += speed;
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // 玩家始终画在屏幕中心
  const centerX = WIDTH / 2;
  const centerY = HEIGHT / 2;

  // 计算可见格子数量
  const visibleCols = Math.ceil(WIDTH / TILE_SIZE) + 2;
  const visibleRows = Math.ceil(HEIGHT / TILE_SIZE) + 2;

  // 计算左上角格子地图坐标
  const startX = Math.floor(player.x - visibleCols / 2);
  const startY = Math.floor(player.y - visibleRows / 2);

  // 画地图图块
  for (let row = 0; row < visibleRows; row++) {
    for (let col = 0; col < visibleCols; col++) {
      const tileX = startX + col;
      const tileY = startY + row;
      const tileType = getTile(tileX, tileY);
      const img = (tileType === 0) ? assets["grass.png"] : assets["road.png"];
      // 计算屏幕坐标
      const screenX = centerX + (tileX - player.x) * TILE_SIZE;
      const screenY = centerY + (tileY - player.y) * TILE_SIZE;
      ctx.drawImage(img, screenX, screenY, TILE_SIZE, TILE_SIZE);
    }
  }

  // 画宝箱（如果在视野内）
  const chestScreenX = centerX + (chestPos.x - player.x) * TILE_SIZE;
  const chestScreenY = centerY + (chestPos.y - player.y) * TILE_SIZE;
  if (
    chestScreenX + TILE_SIZE > 0 && chestScreenX < WIDTH &&
    chestScreenY + TILE_SIZE > 0 && chestScreenY < HEIGHT
  ) {
    ctx.drawImage(assets["chest.png"], chestScreenX, chestScreenY, TILE_SIZE, TILE_SIZE);
  }

  // 画玩家角色（屏幕中心）
  ctx.drawImage(assets["player.png"], centerX - TILE_SIZE / 2, centerY - TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);

  // 画文本
  ctx.fillStyle = "black";
  ctx.font = "16px sans-serif";
  ctx.fillText(`位置: (${player.x.toFixed(2)}, ${player.y.toFixed(2)})`, 10, 20);

  // 宝箱提示
  const dx = player.x - chestPos.x;
  const dy = player.y - chestPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) {
    ctx.fillStyle = "green";
    ctx.fillText("你找到了宝箱！", 10, 40);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
