import { ball } from './entities/ball'
import { hoop } from './entities/hoop'

export const gravity = 0.25
const bounce = 0.6

export function rimCollision(cx: number) {
  const dx = ball.x - cx
  const dy = ball.y - hoop.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < ball.r + hoop.rimRadius) {
    ball.vx *= -bounce
    ball.vy *= bounce
  }
}