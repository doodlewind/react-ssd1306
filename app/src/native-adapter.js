import { init, clear, drawText, drawPixel } from 'renderer'

const FPS = 30
const mainLoop = async (onTick, delay = 1000 / FPS) => {
  const nativeTick = () => new Promise(resolve => {
    onTick()
    setTimeout(resolve, delay)
  })
  while (true) await nativeTick()
}

class NativeScreen {
  constructor () {
    this.elements = []
    this.synced = true
    init()
    clear()
    mainLoop(() => this.onFrameTick())
  }

  appendElement (element) {
    this.synced = false
    this.elements.push(element)
  }

  removeElement (element) {
    this.synced = false
    const i = this.elements.indexOf(element)
    if (i !== -1) this.elements.splice(i, 1)
  }

  onFrameTick () {
    // console.log('Native frame tick!')
    if (!this.synced) this.render()
    this.synced = true
  }

  render () {
    clear()
    for (let i = 0; i < this.elements.length; i++) {
      const element = this.elements[i]
      if (element instanceof NativeTextElement) {
        const { children, row, col } = element.props
        drawText(children[0], row, col)
      } else if (element instanceof NativePixelElement) {
        drawPixel(element.props.x, element.props.y)
      }
      console.log(JSON.stringify(element.props))
    }
  }
}

class NativeTextElement {
  constructor (props) {
    this.props = props
    this.parent = null
  }
}

class NativePixelElement {
  constructor (props) {
    this.props = props
    this.parent = null
  }
}

export const createNativeInstance = (type, props) => {
  if (type === 'SCREEN') {
    const screen = new NativeScreen()
    // window.screen = screen // browser debug
    return screen
  } else if (type === 'TEXT') {
    return new NativeTextElement(props)
  } else if (type === 'PIXEL') {
    return new NativePixelElement(props)
  } else {
    console.warn(`Component type: ${type} is not supported`)
  }
}

let RootNodeInstance

export const getHostContextNode = rootNode => {
  if (rootNode) RootNodeInstance = rootNode
  else {
    console.warn(`${rootNode} is not an valid root instance.`)
    RootNodeInstance = new NativeScreen()
  }
  return RootNodeInstance
}

export const appendNativeElement = (screen, stateNode) => {
  stateNode.parent = screen
  screen.appendElement(stateNode)
}

export const removeNativeElement = (screen, stateNode) => {
  stateNode.parent = screen
  screen.removeElement(stateNode)
}

export const updateNativeElement = (element, newProps) => {
  element.props = newProps
  element.parent.synced = false
}
