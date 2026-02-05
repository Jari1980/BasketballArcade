import { ball } from './entities/ball'
import { basket } from './entities/basket'

export const gravity = 0.25
const bounce = 0.6

/**
 * Check rim collision for the left and right edges of the basket rim
 * cx = x coordinate of the rim edge
 */
export function rimCollision(cx: number) {
  const rimY = basket.y + basket.rimHeight // top of the scoring rim
  const rimRadius = 5 // small radius for collision with ball

  const dx = ball.x - cx
  const dy = ball.y - rimY
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist < ball.r + rimRadius) {
    // simple bounce effect
    ball.vx *= -bounce
    ball.vy *= bounce
  }
}

