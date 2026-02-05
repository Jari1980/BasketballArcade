import { ball } from './entities/ball'
import { basket } from './entities/basket'
import { score, perfectShot } from './state'
import { showAnnouncement } from './state'

export let basketFlashFrames = 0

export function checkScore(resetBall: () => void) {
  if (
    ball.x > basket.x + 10 &&
    ball.x < basket.x + basket.w - 10 &&
    ball.y > basket.y &&
    ball.y < basket.y + basket.h
  ) {
    score.value++
    perfectShot.value = true
    basketFlashFrames = 10
    showAnnouncement('✨ Perfect Shot! ✨')
    setTimeout(() => (perfectShot.value = false), 1000)
    resetBall()
  } else if (
    ball.x > basket.x &&
    ball.x < basket.x + basket.w &&
    ball.y > basket.y &&
    ball.y < basket.y + basket.h
  ) {
    score.value++
    basketFlashFrames = 10
    showAnnouncement('Score!')
    resetBall()
  }
}