import { ball } from './entities/ball'
import { player } from './entities/player'
import { hoop } from './entities/hoop'
import { gravity, rimCollision } from './physics'
import { score, perfectShot, shotsLeft, showAnnouncement } from './state'

// Basket images
const basketNormal = new Image()
basketNormal.src = '/basket.png'

const basketGoal = new Image()
basketGoal.src = '/basket_goal.png'

// Flash counter for goal
let basketFlashFrames = 0

export function startGameLoop(
  ctx: CanvasRenderingContext2D,
  resetBall: () => void,
  isDraggingGetter?: () => boolean,
  dragCurrentGetter?: () => { x: number; y: number }
) {
  function loop() {
    // --- Background ---
    ctx.fillStyle = '#2c2c2c'
    ctx.fillRect(0, 0, 600, 400)

    // --- Floor ---
    ctx.fillStyle = '#3a3a3a'
    ctx.fillRect(0, 330, 600, 70)

    // --- Basket ---
    const currentBasket = basketFlashFrames > 0 ? basketGoal : basketNormal
    ctx.drawImage(currentBasket, hoop.x - 2, hoop.y - 32, 64, 64)
    if (basketFlashFrames > 0) basketFlashFrames--

    // --- Player ---
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
      player.h
    )

    // Shooting animation increment
    if (player.shootingFrame > 0) {
      player.shootingFrame++
      if (player.shootingFrame > 10) player.shootingFrame = 0
    }

    // --- Ball ---
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
    ctx.fillStyle = 'orange'
    ctx.fill()

    // --- Ball physics ---
    if (ball.shooting) {
      ball.vy += gravity
      ball.x += ball.vx
      ball.y += ball.vy

      // Rim collision (both sides)
      rimCollision(hoop.x)
      rimCollision(hoop.x + hoop.w)

      // Score detection
      checkScore(resetBall)
    } else {
      // Reset ball on player
      ball.x = player.x + player.w
      ball.y = player.y + 10
    }

    // --- Aim line ---
    if (isDraggingGetter && dragCurrentGetter && isDraggingGetter()) {
      const dragCurrent = dragCurrentGetter()
      ctx.beginPath()
      ctx.moveTo(ball.x, ball.y)
      ctx.lineTo(dragCurrent.x, dragCurrent.y)
      ctx.strokeStyle = '#eee'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    requestAnimationFrame(loop)
  }

  loop()
}

// --- Score check ---
function checkScore(resetBall: () => void) {
  // Perfect swish
  if (
    ball.x > hoop.x + 10 &&
    ball.x < hoop.x + hoop.w - 10 &&
    ball.y > hoop.y &&
    ball.y < hoop.y + hoop.h
  ) {
    score.value++
    perfectShot.value = true
    basketFlashFrames = 10
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
    basketFlashFrames = 10
    showAnnouncement('Score!')
    resetBall()
  }
  // Missed
  else if (ball.y > 400 || ball.x < 0 || ball.x > 600) {
    showAnnouncement('Miss!')
    resetBall()
  }
}
