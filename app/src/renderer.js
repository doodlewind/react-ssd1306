import Reconciler from 'react-reconciler/cjs/react-reconciler.development.js'
import {
  createNativeInstance,
  appendNativeElement,
  updateNativeElement,
  removeNativeElement,
  getHostContextNode
} from './native-adapter.js'

// Toggle to checkout reconciler call sequences
const SHOW_RECONCILER_CALLS = false
const log = (...args) => SHOW_RECONCILER_CALLS && console.log(...args)

const hostConfig = {
  // Methods for first-time rendering
  // --------------------------------
  appendInitialChild (parent, stateNode) {
    log('appendInitialChild')
  },
  appendChildToContainer (parent, stateNode) {
    log('appendChildToContainer')
    appendNativeElement(parent, stateNode)
  },
  appendChild (parent, stateNode) {
    log('appendChild')
  },
  createInstance (type, props, internalInstanceHandle) {
    log('createInstance')
    return createNativeInstance(type, props)
  },
  createTextInstance (text, rootContainerInstance, internalInstanceHandle) {
    log('createTextInstance')
    return text
  },
  finalizeInitialChildren (wordElement, type, props) {
    log('finalizeInitialChildren')
    return false
  },
  getPublicInstance (instance) {
    log('getPublicInstance')
    return instance
  },
  now: Date.now,
  prepareForCommit () {
    log('prepareForCommit')
  },
  prepareUpdate (wordElement, type, oldProps, newProps) {
    log('prepareUpdate')
    return true
  },
  resetAfterCommit () {
    log('resetAfterCommit')
  },
  resetTextContent (wordElement) {
    log('resetTextContent')
  },
  getRootHostContext (instance) {
    log('getRootHostContext')
    return getHostContextNode(instance)
  },
  getChildHostContext (instance) {
    log('getChildHostContext')
    return {}
  },
  shouldSetTextContent (type, props) {
    log('shouldSetTextContent')
    return false
  },

  // Methods for updating state
  // --------------------------
  commitTextUpdate (textInstance, oldText, newText) {
    log('commitTextUpdate')
  },
  commitUpdate (
    instance, updatePayload, type, oldProps, newProps, finishedWork
  ) {
    log('commitUpdate')
    updateNativeElement(instance, newProps)
  },
  removeChildFromContainer (parent, stateNode) {
    log('removeChildFromContainer')
    removeNativeElement(parent, stateNode)
  },

  useSyncScheduling: true,
  supportsMutation: true
}

// Singleton
const reconciler = Reconciler(hostConfig)
const nativeContainer = createNativeInstance('SCREEN')
const container = reconciler.createContainer(nativeContainer, false)

export const Text = 'TEXT'
export const Pixel = 'PIXEL'

export const SSD1306Renderer = {
  render (reactElement) {
    return reconciler.updateContainer(reactElement, container)
  }
}
