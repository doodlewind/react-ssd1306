import './polyfill.js'
import React from 'react/cjs/react.development.js'
import { MyRenderer, Rect, Text } from './renderer.js'

class Container extends React.Component {
  componentDidMount () {

  }

  render () {
    return this.props.children
  }
}

const App = (
  <Container>
    <Rect />
    <Rect />
    <Text>demo</Text>
  </Container>
)

MyRenderer.render(App)
