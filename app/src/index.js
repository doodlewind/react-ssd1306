import './polyfill.js'
import React from 'react/cjs/react.development.js'
import MyRenderer from './renderer.js'

const Content = props => {
  console.log(props.foo)
  return null
}

MyRenderer.render(<Content foo={123} />)
