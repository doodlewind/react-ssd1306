import { setTimeout } from 'os'
import { init, clear, drawText } from 'renderer'

const wait = timeout =>
  new Promise(resolve => setTimeout(resolve, timeout))

;(async () => {
  const invert = false
  const flip = false
  init(invert, flip)
  clear()
  drawText('Hello world!')
  await wait(2000)

  clear()
  drawText('Again!')
  await wait(2000)

  clear()
})()
