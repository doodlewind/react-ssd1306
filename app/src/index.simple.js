/* eslint-disable react/jsx-fragments */ // rollup plugin workaround
import './polyfill.js'
import React from 'react'
const { Component } = React
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
    trace(hello + '\n')
    return null
  }

  componentDidMount () {
    // XXX: Emulate event driven update
    setTimeout(() => this.setState({ hello: 'Hello Pi!', p: 42 }), 2000)
    setTimeout(() => this.setState({ hello: '', p: -1 }), 4000)
  }
}

console.log(<App hello='hoge' />)
