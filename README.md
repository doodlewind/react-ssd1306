# React SSD1306
A React Renderer for SSD1306 OLED chip on Raspberry Pi

![](./docs/demo.jpg)

For those who doesn't have the device, a canvas-based web emulator is also included!

## Introduction
This project demonstrates how to:

* Use React together with [QuickJS](https://bellard.org/quickjs/) on Raspberry Pi.
* Develop basic C module for QuickJS.
* Build a custom "**native & dynamic**" renderer for React.

Checkout my [Chinese blog post](https://ewind.us/2019/react-ssd1306) for details. 

## Getting Started
This project is originally designed to work on Raspberry Pi, but a web emulator is also available and works out of the box. Notice that no matter you run it on web or native, the whole React-related codebase is exactly the same.

### Web Approach
You can try out the reconciler example, even if you don't have a Raspberry Pi. In this way only Node.js and ParcelJS are required:

``` bash
cd react-ssd1306/app
parcel src/index.html
```

Then just open `https://localhost:1234` to see the emulator.

### Native Approach
Connect the chip, make sure you have QuickJS and Node.js installed on your Raspberry Pi, with I2C interface enabled. Few extra packages are also required:

``` bash
sudo apt-get install i2c-tools libi2c-dev
```

> Node.js is only required for JS module bundling and package management here.

Init the project:

``` bash
cd react-ssd1306/app
npm install && cd ..
npm run build # build JS and C modules
npm start # start the compiled binary
```

## Usage
Simply edit `./app/index.js` as main entrance:

``` js
import './polyfill.js'
import React from 'react'
import { SSD1306Renderer, Text, Pixel } from './renderer.js'

class App extends React.Component {
  constructor () {
    super()
    this.state = { hello: 'Hello React!', p: 0 }
  }

  render () {
    const { hello, p } = this.state
    return (
      <React.Fragment>
        <Text row={0} col={0}>{hello}</Text>
        <Text row={1} col={0}>Hello QuickJS!</Text>
        <Pixel x={p} y={p} />
      </React.Fragment>
    )
  }

  componentDidMount () {
    // XXX: Emulate event driven update
    setTimeout(() => this.setState({ hello: 'Hello Pi!', p: 42 }), 2000)
    setTimeout(() => this.setState({ hello: '', p: -1 }), 4000)
  }
}

SSD1306Renderer.render(<App />)
```

## License
MIT
