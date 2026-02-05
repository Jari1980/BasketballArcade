export const basket = {
  x: 450,
  y: 200,
  w: 64,       // width of the basket image
  h: 64,       // height of the basket image
  rimHeight: 10, // actual scoring rectangle height
  imgNormal: new Image(),
  imgGoal: new Image(),
  flashFrames: 0,
}
basket.imgNormal.src = '/basket.png'
basket.imgGoal.src = '/basket_goal.png'