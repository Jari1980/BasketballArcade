<template>
  <div class="game-container">
    <canvas
      ref="canvas"
      width="600"
      height="400"
      @mousedown="startDrag"
      @mousemove="dragging"
      @mouseup="endDrag"
      tabindex="0"
    ></canvas>

    <div class="ui">
      <p>Score: {{ score }}</p>
      <p>Shots Left: {{ shotsLeft }}</p>
      <p>Time Left: {{ timeLeft }}s</p>

      <div class="power-bar">
        <div class="power-fill" :style="{ width: powerPercent + '%' }"></div>
      </div>

      <p v-if="perfectShot">✨ Perfect Swish! ✨</p>
      <p v-if="announcement" class="announcement">{{ announcement }}</p>

      <button class="restart-btn" @click="restartGame">Restart Game</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// --------------------
// Canvas
// --------------------
const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D

// --------------------
// Game state
// --------------------
const score = ref(0)
const shotsLeft = ref(10)
const timeLeft = ref(60)
const powerPercent = ref(0)
const perfectShot = ref(false)
const announcement = ref('')
let announcementTimeout: number | null = null
let timerInterval: number | null = null

// --------------------
// Player
// --------------------
const player = {
  x: 80,
  y: 260,
  w: 32,
  h: 32,
  speed: 4,
  sprite: new Image(),
  shootingFrame: 0,
  frameCount: 2,
  frameWidth: 32,
  frameHeight: 32,
}
player.sprite.src = '/player.png' // vertical 2-frame sprite sheet

// --------------------
// Ball
// --------------------
const ball = {
  x: 0,
  y: 0,
  r: 8,
  vx: 0,
  vy: 0,
  shooting: false,
}

// --------------------
// Hoop
// --------------------
const hoop = { x: 450, y: 200, w: 60, h: 10, rimRadius: 6 }

// Physics
const gravity = 0.25
const bounce = 0.6

// Shot tuning
const MIN_POWER = 6
const MAX_POWER = 12
const MAX_DRAG = 120

// Input
let isDragging = false
let dragStart = { x: 0, y: 0 }
let dragCurrent = { x: 0, y: 0 }

// --------------------
// Helpers
// --------------------
function resetBall() {
  ball.x = player.x + player.w
  ball.y = player.y + 10
  ball.vx = 0
  ball.vy = 0
  ball.shooting = false
  player.shootingFrame = 0
}

function showAnnouncement(msg: string, duration = 1000) {
  announcement.value = msg
  if (announcementTimeout) clearTimeout(announcementTimeout)
  announcementTimeout = window.setTimeout(() => {
    announcement.value = ''
  }, duration)
}

function restartGame() {
  score.value = 0
  shotsLeft.value = 10
  timeLeft.value = 60
  perfectShot.value = false
  announcement.value = ''
  resetBall()

  // Restart timer
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = window.setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--
    if (timeLeft.value <= 0) {
      if (timerInterval) clearInterval(timerInterval)
      showAnnouncement('Game Over!')
    }
  }, 1000)
}

// --------------------
// Input
// --------------------
function startDrag(e: MouseEvent) {
  if (ball.shooting || shotsLeft.value <= 0) return
  const dx = e.offsetX - ball.x
  const dy = e.offsetY - ball.y
  if (Math.sqrt(dx * dx + dy * dy) < 20) {
    isDragging = true
    dragStart = { x: e.offsetX, y: e.offsetY }
    dragCurrent = { ...dragStart }
  }
}

function dragging(e: MouseEvent) {
  if (!isDragging) return
  dragCurrent = { x: e.offsetX, y: e.offsetY }
  updatePower()
}

function updatePower() {
  const dx = dragStart.x - dragCurrent.x
  const dy = dragStart.y - dragCurrent.y
  const dist = Math.min(Math.sqrt(dx * dx + dy * dy), MAX_DRAG)
  powerPercent.value = (dist / MAX_DRAG) * 100
}

function endDrag() {
  if (!isDragging || shotsLeft.value <= 0) return

  const dx = dragStart.x - dragCurrent.x
  const dy = dragStart.y - dragCurrent.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1

  const dirX = dx / len
  const dirY = dy / len

  const power = MIN_POWER + (Math.min(len, MAX_DRAG) / MAX_DRAG) * (MAX_POWER - MIN_POWER)

  ball.vx = dirX * power
  ball.vy = dirY * power
  ball.shooting = true
  player.shootingFrame = 1

  isDragging = false
  powerPercent.value = 0
  shotsLeft.value--

  if (shotsLeft.value <= 0) {
    showAnnouncement('Game Over!')
    timeLeft.value = 0
  }
}

// --------------------
// Collision & scoring
// --------------------
function rimCollision(cx: number) {
  const dx = ball.x - cx
  const dy = ball.y - hoop.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < ball.r + hoop.rimRadius) {
    ball.vx *= -bounce
    ball.vy *= bounce
  }
}

function checkScore() {
  // Perfect swish
  if (
    ball.x > hoop.x + 10 &&
    ball.x < hoop.x + hoop.w - 10 &&
    ball.y > hoop.y &&
    ball.y < hoop.y + hoop.h
  ) {
    score.value++
    perfectShot.value = true
    showAnnouncement('✨ Perfect Shot! ✨')
    setTimeout(() => (perfectShot.value = false), 1000)
    resetBall()
  }
  // Normal score
  else if (
    ball.x > hoop.x &&
    ball.x < hoop.x + hoop.w &&
    ball.y > hoop.y &&
    ball.y < hoop.y + hoop.h
  ) {
    score.value++
    showAnnouncement('Score!')
    resetBall()
  }
  // Miss
  else if (ball.y > 400 || ball.x < 0 || ball.x > 600) {
    showAnnouncement('Miss!')
    resetBall()
  }
}

// --------------------
// Timer
// --------------------
onMounted(() => {
  ctx = canvas.value!.getContext('2d')!
  resetBall()
  canvas.value!.focus()

  timerInterval = window.setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--
    if (timeLeft.value <= 0) {
      if (timerInterval) clearInterval(timerInterval)
      showAnnouncement('Game Over!')
    }
  }, 1000)

  loop()
})

// --------------------
// Game loop
// --------------------
function loop() {
  // Fill playfield with slightly lighter dark
  ctx.fillStyle = '#2c2c2c' // dark gray for playfield
  ctx.fillRect(0, 0, 600, 400)

  // Floor
  ctx.fillStyle = '#3a3a3a' // slightly different gray
  ctx.fillRect(0, 330, 600, 70)

  // Hoop
  ctx.fillStyle = '#e74c3c'
  ctx.fillRect(hoop.x, hoop.y, hoop.w, hoop.h)
  ctx.beginPath()
  ctx.arc(hoop.x, hoop.y, hoop.rimRadius, 0, Math.PI * 2)
  ctx.arc(hoop.x + hoop.w, hoop.y, hoop.rimRadius, 0, Math.PI * 2)
  ctx.fill()

  // Player sprite
  const frameY = player.shootingFrame > 0 ? player.frameHeight : 0
  ctx.drawImage(
    player.sprite,
    0,
    frameY,
    player.frameWidth,
    player.frameHeight,
    player.x,
    player.y,
    player.w,
    player.h,
  )

  // Ball
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
  ctx.fillStyle = 'orange'
  ctx.fill()

  // Shooting animation
  if (player.shootingFrame > 0) {
    player.shootingFrame++
    if (player.shootingFrame > 10) player.shootingFrame = 0
  }

  // Ball movement
  if (ball.shooting) {
    ball.vy += gravity
    ball.x += ball.vx
    ball.y += ball.vy

    rimCollision(hoop.x)
    rimCollision(hoop.x + hoop.w)

    checkScore()
  } else {
    ball.x = player.x + player.w
    ball.y = player.y + 10
  }

  // Aim line
  if (isDragging) {
    ctx.beginPath()
    ctx.moveTo(ball.x, ball.y)
    ctx.lineTo(dragCurrent.x, dragCurrent.y)
    ctx.strokeStyle = '#eee'
    ctx.stroke()
  }

  requestAnimationFrame(loop)
}
</script>

<style>
/* Global reset to remove white borders */
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #121212; /* dark page background */
  overflow: hidden; /* prevent scrollbars */
}
</style>

<style scoped>
canvas {
  display: block;  /* remove inline spacing */
  border: none;    /* remove any border */
  outline: none;   /* remove focus outline */
  box-shadow: 0 0 20px #000; /* optional for style */
}

/* Background outside game */
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #121212; /* very dark page background */
  min-height: 100vh;
  padding: 20px 0;
  font-family: monospace;
  color: #eee;
}

canvas {
  border: 3px solid #555;
  outline: none;
  box-shadow: 0 0 20px #000;
}

.ui {
  margin-top: 8px;
  color: #eee;
}

.power-bar {
  width: 200px;
  height: 12px;
  border: 2px solid #eee;
  margin: 6px auto;
  background: #444;
}

.power-fill {
  height: 100%;
  background: #f1c40f;
}

.announcement {
  font-size: 24px;
  font-weight: bold;
  color: #f1c40f;
  text-shadow: 2px 2px 4px #000;
  margin: 6px 0;
}

.restart-btn {
  padding: 6px 12px;
  margin-top: 8px;
  font-weight: bold;
  border: 2px solid #eee;
  background: #3498db;
  color: #eee;
  cursor: pointer;
}

.restart-btn:hover {
  background: #2980b9;
}
</style>
