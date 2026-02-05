import { ball } from './entities/ball'
import { hoop } from './entities/hoop'
import { score, perfectShot } from './state'
import { showAnnouncement } from './state'

export let basketFlashFrames = 0

export function checkScore(resetBall: () => void) {
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
  } else if (
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
}