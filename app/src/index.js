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
      p: 0
    }
  }

  render () {
    const { hello, p } = this.state
    return (
      <Fragment>
        <Text row={0} col={0}>
          {hello}
        </Text>
        <Pixel x={p} y={p} />
      </Fragment>
    )
  }

  componentDidMount () {
    console.log('APP DID MOUNT!')

    // XXX: emulate event driven update
    setTimeout(() => this.setState({ hello: 'Hello Pi!', p: 42 }), 2000)
    setTimeout(() => this.setState({ hello: '', p: -1 }), 4000)
  }
}

MyRenderer.render(<App />)
