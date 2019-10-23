
class NativeRenderer {
  constructor (props) {
    this.props = props
  }
}

class NativeText {
  constructor (props) {
    this.props = props
  }
}

class NativeRect {
  constructor (props) {
    this.props = props
  }
}

export const createNativeInstance = (type, props) => {
  if (type === 'SCREEN') {
    return new NativeRenderer(props)
  } else if (type === 'TEXT') {
    return new NativeText(props)
  } else if (type === 'RECT') {
    return new NativeRect(props)
  } else {
    console.warn(`Native type: ${type} is not supported`)
  }
}

let RootNodeInstance

export const getHostContextNode = rootNode => {
  if (rootNode) RootNodeInstance = rootNode
  else {
    console.warn(`${rootNode} is not an valid root instance`)
    RootNodeInstance = new NativeRenderer()
  }
  return RootNodeInstance
}
