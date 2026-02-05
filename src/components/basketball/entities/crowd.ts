import { platform } from './platform'

export const crowd = {
  x: platform.x,
  y: platform.y - 20,
  w: 200,
  h: 48,

  imgIdle: new Image(),
  imgCheer: new Image(),

  bobOffset: 0,
  bobSpeed: 0.02,
  bobAmount: 2,

  cheering: false,
  cheerFrames: 0,
}

crowd.imgIdle.src = '/crowd_idle.png'
crowd.imgCheer.src = '/crowd_cheering.png'
