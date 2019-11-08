// Mock canvas renderer for Web emulation
let canvas, ctx

export const init = () => {
  canvas = document.querySelector('canvas')
  ctx = canvas.getContext('2d')
}

export const clear = () => {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

export const drawText = (text, row, col) => {
  ctx.font = '8px'
  ctx.fillStyle = 'white'
  const x = col * 8
  const y = (row + 1) * 8
  ctx.fillText(text, x, y)
}

export const drawPixel = (x, y) => {
  ctx.fillStyle = 'white'
  ctx.fillRect(x, y, 1, 1)
}
