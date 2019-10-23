import Reconciler from 'react-reconciler/cjs/react-reconciler.development.js'

const hostConfig = {
  now: Date.now,
  getRootHostContext: () => {}
}
const ReconcilerInst = Reconciler(hostConfig)

let container

export default {
  render (reactElement, env) {
    container = ReconcilerInst.createContainer(env, false)
    return ReconcilerInst.updateContainer(reactElement, container)
  }
}
