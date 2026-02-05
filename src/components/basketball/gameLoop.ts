import { ball } from './entities/ball'
import { player } from './entities/player'
import { basket } from './entities/basket'
import { platform } from './entities/platform'
import { gravity, rimCollision } from './physics'
import { score, perfectShot, shotsLeft, showAnnouncement } from './state'

export function startGameLoop(
  ctx: CanvasRenderingContext2D,
  resetBall: () => void,
  isDraggingGetter?: () => boolean,
  dragCurrentGetter?: () => { x: number; y: number },
) {
  function loop() {
    // --- Background ---
    ctx.fillStyle = '#2c2c2c'
    ctx.fillRect(0, 0, 600, 400)

    // Draw the platform (pixel art)
    ctx.imageSmoothingEnabled = false // keep crisp pixels
    ctx.drawImage(platform.img, platform.x, platform.y, platform.w, platform.h)

    // --- Floor ---
    ctx.fillStyle = '#3a3a3a'
    ctx.fillRect(0, 330, 600, 70)

    // --- Basket ---
    const currentBasket = basket.flashFrames > 0 ? basket.imgGoal : basket.imgNormal
    ctx.drawImage(currentBasket, basket.x, basket.y, basket.w, basket.h)
    if (basket.flashFrames > 0) basket.flashFrames--

    // --- Player ---
    const frameY = ball.shooting ? player.frameHeight : 0
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
      rimCollision(basket.x + 5)
      rimCollision(basket.x + basket.w - 5)

      // Score detection
      checkScore(resetBall)
    } else if (!ball.shooting && !ball.justScored){
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

const perfectRimMargin = 10 // perfect swish is the center 10px in from edges
const normalRimMargin = 2 // normal score includes almost entire rim width

// --- Score check ---
function checkScore(resetBall: () => void) {
  const perfectRimMargin = 10 // center area for perfect swish
  const normalRimMargin = 2 // slightly larger area for normal score
  const rimTop = basket.y
  const rimBottom = basket.y + basket.rimHeight
  // Perfect swish (inner rectangle)
  if (
    ball.x > basket.x + perfectRimMargin &&
    ball.x < basket.x + basket.w - perfectRimMargin &&
    ball.y > rimTop &&
    ball.y < rimBottom
  ) {
    score.value++
    perfectShot.value = true
    basket.flashFrames = 40
    ball.justScored = true
    showAnnouncement('✨ Perfect Shot! ✨')
    setTimeout(() => (perfectShot.value = false), 1000)
    setTimeout(() => {
      perfectShot.value = false
      resetBall()
      ball.justScored = false
    }, 400)
  }
  // Normal score
  else if (
    ball.x > basket.x + normalRimMargin &&
    ball.x < basket.x + basket.w - normalRimMargin &&
    ball.y > rimTop &&
    ball.y < rimBottom
  ) {
    score.value++
    basket.flashFrames = 40
    ball.justScored = true
    showAnnouncement('Score!')
    setTimeout(() => {
      resetBall()
      ball.justScored = false
    }, 400)
  }
  // Missed
  else if (!ball.justScored && (ball.y > 400 || ball.x < 0 || ball.x > 600)) {
    showAnnouncement('Miss!')
    setTimeout(() => {
      resetBall()
    }, 200)
  }
}
