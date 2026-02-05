<template>
  <div class="game-container basketball-game">
    <canvas
      ref="canvas"
      width="600"
      height="400"
      tabindex="0"
      @mousedown="startDrag"
      @mousemove="dragging"
      @mouseup="endDrag"
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

      <button class="restart-btn" @click="restartGame">
        Restart Game
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

// --------------------
// Styles
// --------------------
import './basketball.css'


// --------------------
// State (SAFE imports – no reassignment)
// --------------------
import {
  score,
  shotsLeft,
  timeLeft,
  powerPercent,
  perfectShot,
  announcement,
  resetState,
  showAnnouncement,
} from './state'

// --------------------
// Entities
// --------------------
import { ball } from './entities/ball'
import { player } from './entities/player'

// --------------------
// Game loop
// --------------------
import { startGameLoop } from './gameLoop'

// --------------------
// Canvas
// --------------------
const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

// --------------------
// Local timer (DO NOT put in state.ts)
// --------------------
let timerInterval: number | null = null

// --------------------
// Shot tuning
// --------------------
const MIN_POWER = 6
const MAX_POWER = 12
const MAX_DRAG = 120

// --------------------
// Input state
// --------------------
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

function startTimer() {
  stopTimer()
  timerInterval = window.setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    }
    if (timeLeft.value <= 0) {
      showAnnouncement('Game Over!')
      stopTimer()
    }
  }, 1000)
}

function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function restartGame() {
  resetState()
  resetBall()
  startTimer()
}

// --------------------
// Input handlers
// --------------------
function startDrag(e: MouseEvent) {
  if (ball.shooting || shotsLeft.value <= 0) return

  const dx = e.offsetX - ball.x
  const dy = e.offsetY - ball.y

  if (Math.hypot(dx, dy) < 20) {
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
  const dist = Math.min(Math.hypot(dx, dy), MAX_DRAG)
  powerPercent.value = (dist / MAX_DRAG) * 100
}

function endDrag() {
  if (!isDragging || shotsLeft.value <= 0) return

  const dx = dragStart.x - dragCurrent.x
  const dy = dragStart.y - dragCurrent.y
  const len = Math.hypot(dx, dy) || 1

  const power =
    MIN_POWER + (Math.min(len, MAX_DRAG) / MAX_DRAG) * (MAX_POWER - MIN_POWER)

  ball.vx = (dx / len) * power
  ball.vy = (dy / len) * power
  ball.shooting = true
  player.shootingFrame = 1

  isDragging = false
  powerPercent.value = 0
  shotsLeft.value--
}

// --------------------
// Lifecycle
// --------------------
onMounted(() => {
  ctx = canvas.value!.getContext('2d')!
  resetBall()
  canvas.value!.focus()

  startTimer()

  // Pass getters for the drag line
  startGameLoop(
    ctx,
    resetBall,
    () => isDragging,    // getter for drag state
    () => dragCurrent    // getter for current drag position
  )
})

onBeforeUnmount(() => {
  stopTimer()
})
</script>


<!-- GLOBAL style (no scoped!) -->
<style>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #121212;
  overflow: hidden;
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: monospace;
  color: #eee;
}

/* Canvas styling */
canvas {
  border: 3px solid #555;
  box-shadow: 0 0 20px #000;
  display: block;
  outline: none;
}
</style>