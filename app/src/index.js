/* eslint-disable react/jsx-fragments */ // rollup plugin workaround
import './polyfill.js'
import React from 'react/cjs/react.development.js'
import { MyRenderer, Text, Pixel } from './renderer.js'

const { Component, Fragment } = React
class App extends Component {
  constructor () {
    super()
    this.state = {
      hello: 'Hello React!',
      pixelX: 0
    }
  }

  render () {
    const { hello, pixelX } = this.state
    return (
      <Fragment>
        <Text row={0} col={0}>
          {hello}
        </Text>
        <Pixel x={pixelX} y={42} />
      </Fragment>
    )
  }

  componentDidMount () {
    console.log('APP DID MOUNT!')

    // XXX: emulate event driven update
    setTimeout(() => this.setState({ hello: 'Hello Pi!', pixelX: 42 }), 2000)
    setTimeout(() => this.setState({ hello: '' }), 4000)
  }
}

MyRenderer.render(<App />)
