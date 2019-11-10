# Render React to Embedded LCD
We know that one of React’s biggest selling points, is the versatility of “Learn once, write anywhere”. But how can we render UI with React outside the web browser, or even outside Node.js? This article will take React straight-through the embedded driver layer, allowing modern front-end technology being seamlessly integrated with classic hardware.

## Background Overview
This time our render target is a 0.96 inch dot matrix LCD screen, whose model is SSD1306. Its resolution is only 128x64, you may have used it to scroll through the lyrics in the early days when black and white MP3 was popular. How small is this chip? I took this photo as a physical comparison:

![](https://ewind.us/images/react-ssd1306/chip-view.jpg)

This hardware is obviously not supported by modern PC, so we need an embedded development environment - I chose the convenient Raspberry Pi.

Although Raspberry Pi already has well-established language environments, such as Python and Node.js, I hope to push the limits, trying to run React “with minimal hardware requirement”. In this way we need an ultra-lightweight JS interpreter for embedded hardware, so that we can replace the heavier V8 used by Chrome and Node.js. Finally I found [QuickJS](https://bellard.org/quickjs/), a young and embeddable JS engine.

So, simply put, our goal is to get through these four systems: **React → QuickJS → Raspberry Pi → SSD1306 chip**. This initially difficult goal can be broken down into these following steps:

* Port React to embedded JS environment
* Render to the screen with C
* Building C module for JS engine
* Implement React rendering backend

Although the full setup is not that hard, it’s adequate to write a standalone technical blog for each of these steps. To keep readability, this article can only cover core concepts and key steps as much as possible. But I can assure you that the final project is not only simple, but also free and open source.

Let’s start!

## Port React to embedded JS environment
In fact, QuickJS is not the first embeddable JS engine. There were other JS engines for IoT hardware before, such as DukTape and XS, but they are to some extent, tepid. While as for QuickJS, there are some major appealing points:

* **Almost complete ES2019 support**. From the ES Module to async/await and Proxy, the modern JS syntax we are accustomed to, is already supported by QuickJS and tested by Test262. In contrast, other embedded  JS engines may not even have decent ES6 support.
* **Lightweight, flexible, and highly embeddable**. Many front-end developers are willing to study the V8 engine in depth, but this project is even pretty hard to get compiled. On the contrary, QuickJS has no dependencies, can be compiled by a `make` command, very easy to be embedded into various native projects, with a binary size less than 700KB.
* **The author’s personal impact**. The author of QuickJS, Fabrice Bellard, is famous for developing incredible software infrastructures. His [home page](https://bellard.org/) always reminds me how productive a programmer can be.

However, after all, QuickJS is a new project that has just been released for a few months. There are only few people trying it out. Even with various unit tests, can it really run industry-level JS projects like React, stably? This is a key issue in determining the feasibility of this technical choice.

To do this, we certainly need to use QuickJS at first. Its source code is cross-platform and not only works on Linux or Raspberry Pi. On my macOS, just compile the code and install it:

``` bash
cd quickjs
make
sudo make install
```

Then we can use the `qjs` command in the terminal, for opening the QuickJS interpreter. By using commands like `qjs foo.js`, you can execute your script with it. Together with the `-m` parameter, it supports loading modules in the form of ES Module (ESM) and runs the entire modular JS project directly.

> Note that when using ESM in QuickJS, you must add a `.js` suffix to the path. This is consistent with the requirements for direct usage of ESM in the browser.

However, QuickJS does not directly support “that kind of React we write everyday”. After all, the famous JSX is just a dialect, not an industry standard. As a workaround, I introduced an auxiliary Node.js environment, packaging the code with Rollup, translating them into ESM format, and handing the output to QuickJS. The `node_modules` of this auxiliary environment is less than 10MB in size, the configuration details are omitted here.

So here comes the question, does `qjs react.js` really work? That’s where React's design shines. When React 16.0 was released two years ago, React has separated the upper layer's `react` and the lower layer's default DOM renderer `react-dom`. A standalone `react-reconciler` package is designed in the middle, implementing the Fiber scheduler. So the `react` package does not rely on the DOM, and can be run independently in a pure JS environment. Although such architecture increases the overall size, it is very useful for us to customize the render backend. How can we verify if React works? Try writing a simplest stateless component:

``` js
import './polyfill.js'
import React from 'react'

const App = props => {
  console.log(props.hello)
  return null
}

console.log(<App hello={'QuickJS'} />)
```

Did you notice the `polyfill.js`? This is the compatible code required to port React to the QuickJS context. It seems that such compatibility work can be tough, but it's actually very simple, like this:

``` js
// The global variable in QuickJS is globalThis
globalThis.process = { env: { NODE_ENV: 'development' } }
globalThis.console.warn = console.log
```

After the code being packaged by Rollup, executing `qjs dist.js` yields this result:

``` bash
$ qjs ./dist.js
QuickJS
null
```

This shows that `React.createElement` can be executed correctly and there is no problem in passing props. This result is very cheering, because even if we stop here, it’s enough to prove that:

* QuickJS is fully capable of running the battle-tested framework in the industry.
* The source code of `npm install react` works on JS engine that conforms to the standard, without any modification. 

Ok, QuickJS is awesome! React is awesome! What should we do next?

## Render to the screen with C
We have already run React smoothly on the QuickJS engine. But don't forget our goal - render React directly to the **screen**! How to render content to the LCD screen? The C programming language, which is closest to the hardware, is definitely the most convenient. But before we start coding, we need to understand several essential concepts:

* The easiest way to control the SSD1306 chip is through the I2C protocol. This is just as using the USB protocol with USB devices.
* There is no I2C ports on modern PC motherboard, but there are some compatible pins on the Raspberry Pi.
* Once a device that supports I2C is connected, it can be controlled by the operating system. We know that everything is a “file” in Linux, so this screen will also be treated as a file, mounted in the `/dev` directory.
* For files, simply use Unix system calls like `open` / `write` in C to control them. However, the I2C display is not a normal file after all, it’s controlled by the driver in the Linux kernel. So we need to install a package named [libi2c-dev](https://www.kernel.org/doc/Documentation/i2c/dev-interface), so as to use the `ioctl` system call in user land to control it.

We first need to connect the chip to Raspberry Pi. Here's how (the Raspberry Pi pin number can be viewed with the `pinout` command):

* Chip Vcc is connected to Raspberry Pi pin 1, which is a 3.3V power input
* Chip Gnd is connected to Raspberry Pi pin 14, which is the ground wire
* Chip SCL is connected to Raspberry Pi pin 5, which is the SCL port in the I2C spec
* Chip SDA is connected to Raspberry Pi pin 3, which is the SDA port in the I2C spec

After the setup, this is how it looks like:

![](https://ewind.us/images/react-ssd1306/pi-with-oled.jpg)

Then, in the System Configuration item of the Raspberry Pi start menu, enable I2C support by enabling the I2C entry in the Interface menu (this step can also be done with CLI commands) and reboot.

After the hardware and system are configured, let's install some toolkits for I2C:

``` bash
sudo apt-get install i2c-tools libi2c-dev
```

How to verify if the process above is successful? Just use the `i2cdetect` command. If you see a result with a value in the `3c` position below, the screen is properly mounted:

``` bash
$ i2cdetect -y 1
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:          -- -- -- -- -- -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- 3c -- -- --
40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- --
```

Once the environment is configured, we can write C code that handles system calls to control the screen. This requires some understanding of the I2C protocol, but there are many ready-made libraries available. Here we pick the [oled96](https://github.com/bitbank2/oled_96) library, this is how its sample looks like:

``` c
// demo.c
#include <stdint.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include "oled96.h"

int main(int argc, char *argv[])
{
    // init
    int iChannel = 1, bFlip = 0, bInvert = 0;
    int iOLEDAddr = 0x3c;
    int iOLEDType = OLED_128x64;
    oledInit(iChannel, iOLEDAddr, iOLEDType, bFlip, bInvert);

    // render text and pixel after clearing the screen
    oledFill(0);
    oledWriteString(0, 0, "Hello OLED!", FONT_SMALL);
    oledSetPixel(42, 42, 1);

    // close after user input
    printf("Press ENTER to quit!\n");
    getchar();
    oledShutdown();
}
```

This example only needs the `gcc demo.c` command to compile. If everything goes fine, execute the compiled `./a.out` file can light up the screen. The code written in this step is also very easy to understand, the complicated part is the communication implementation in the oled96 driver library. Interested readers can give a look to its source code.

## Building C module for JS engine
Now, the React world and the hardware world are both working properly. But how do we connect them? We need to develop a C module for the QuickJS engine.

In QuickJS, two native modules `os` and `std` are built in by default. Take a look at the code below we are accustomed to:

``` js
const hello = 'Hello'
console.log(`${hello} World!`)
```

In QuickJS, we can also write in this equivalent style:

``` js
import * as std from 'std'

const hello = 'Hello'
std.out.printf('%s World!', hello)
```

Is there a feeling of using the C programming language? The `std` module here is actually the JS binding that the author implemented for the C  `stdlib.h` and `stdio.h`. So what if we want to implement other C modules? The official document tells you something like "write the code according to my source code" - only excellent programmers can tell you to use his core source code as example.

After some tossing, I found that the design of QuickJS when using the native module is pretty "daring". The first thing we need to know, is that in addition to `qjs`, QuickJS also provides a `qjsc` tool that can compile a `hello.js` Hello World example directly into a binary executable, or C code as below:

``` c
/* File generated automatically by the QuickJS compiler. */
#include "quickjs-libc.h"
const uint32_t qjsc_hello_size = 87;
const uint8_t qjsc_hello[87] = {
 0x01, 0x04, 0x0e, 0x63, 0x6f, 0x6e, 0x73, 0x6f,
 0x6c, 0x65, 0x06, 0x6c, 0x6f, 0x67, 0x16, 0x48,
 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x57, 0x6f, 0x72,
 0x6c, 0x64, 0x22, 0x65, 0x78, 0x61, 0x6d, 0x70,
 0x6c, 0x65, 0x73, 0x2f, 0x68, 0x65, 0x6c, 0x6c,
 0x6f, 0x2e, 0x6a, 0x73, 0x0d, 0x00, 0x06, 0x00,
 0x9e, 0x01, 0x00, 0x01, 0x00, 0x03, 0x00, 0x00,
 0x14, 0x01, 0xa0, 0x01, 0x00, 0x00, 0x00, 0x39,
 0xd0, 0x00, 0x00, 0x00, 0x43, 0xd1, 0x00, 0x00,
 0x00, 0x04, 0xd2, 0x00, 0x00, 0x00, 0x24, 0x01,
 0x00, 0xcc, 0x28, 0xa6, 0x03, 0x01, 0x00,
};

int main(int argc, char **argv)
{
  JSRuntime *rt;
  JSContext *ctx;
  rt = JS_NewRuntime();
  ctx = JS_NewContextRaw(rt);
  JS_AddIntrinsicBaseObjects(ctx);
  js_std_add_helpers(ctx, argc, argv);
  js_std_eval_binary(ctx, qjsc_hello, qjsc_hello_size, 0);
  js_std_loop(ctx);
  JS_FreeContext(ctx);
  JS_FreeRuntime(rt);
  return 0;
}
```

Where is your Hello World? Just in the **bytecode** of this large array. Here are some C methods like `JS_NewRuntime`, which are actually part of the QuickJS public API. You can refer to this pieced code, in order to access QuickJS in the native project - for true excellent programmers, even if you compile his code, it still works as an example.

After understanding this process, we can find out that the simplest way to use native modules in QuickJS, is actually like this:

1. Compile all JS code into `main.c` C entry with `qjsc`.
2. Compile your C libraries using the `gcc -c` command, getting the object files in `.o` format.
3. Compile `main.c` and link these `.o` files, getting the final `main` executable.

In short, the core of this process is to **first compile JS into a normal C, and then link various native modules in the world of C**. Although it's a bit tricky, the advantage is that you don't need to modify the QuickJS source code. In this way, we can implement a C module called `renderer.c` based on oled96, which provides a JS native module called `renderer`. The overall implementation is roughly like this:

``` c
// Native function for initializing OLED
JSValue nativeInit(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    const int bInvert = JS_ToBool(ctx, argv[0]);
    const int bFlip = JS_ToBool(ctx, argv[1]);
    int iChannel = 1;
    int iOLEDAddr = 0x3c;
    int iOLEDType = OLED_128x64;
    oledInit(iChannel, iOLEDAddr, iOLEDType, bFlip, bInvert);
    oledFill(0);
    return JS_NULL;
}

// Native function for drawing pixels
JSValue nativeDrawPixel(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    int x, y;
    JS_ToInt32(ctx, &x, argv[0]);
    JS_ToInt32(ctx, &y, argv[1]);
    oledSetPixel(x, y, 1);
    return JS_NULL;
}

// Define the function name and parameter length for the JS side
const JSCFunctionListEntry nativeFuncs[] = {
    JS_CFUNC_DEF("init", 2, nativeInit),
    JS_CFUNC_DEF("drawPixel", 2, nativeDrawPixel)};

// Some other glue code
// ...
```

The entire project compilation steps is too complicated to be performed manually. So we need the GNU Make to automate the build process. Since it was the first time for me to write Makefile, there are indeed something to learn. But after understanding the principles, it can be straightforward . Interested readers can checkout the actual Makefile in the repo.

As long as the above C module can be compiled successfully, we can directly control the screen with familiar JavaScript:

``` js
// main.js
import { setTimeout } from 'os'
import { init, clear, drawText } from 'renderer'

const wait = timeout =>
  new Promise(resolve => setTimeout(resolve, timeout))

;(async () => {
  const invert = false
  const flip = false
  init(invert, flip)
  clear()
  drawText('Hello world!')
  await wait(2000)

  clear()
  drawText('Again!')
  await wait(2000)

  clear()
})()
```

In fact, there are many Python modules on Raspberry Pi that have done this for you. So why do we have to reinvent the wheel in JS again? Because only JS has the “Learn once, write anywhere” React! Let's come to the last step, connect React to this chip!

## Implement React rendering backend
Implementing a React renderer sounds like challenging. In fact, it’s probably not as complicated as what you imagine. The community has good tutorials like [Making a custom React renderer](https://github.com/nitin42/Making-a-custom-React-renderer), telling you how to implement your own renderer from zero to one. But in our case, this tutorial is not that complete. Two points are not covered:

1. The tutorial only renders React to a static docx format, and does not support a UI interface that can be **continuously updated**.
2. The tutorial does not cover native modules, just like those being used in React Native.

For these two questions, the second one has been solved above: we have already had a native module, that can draw something once being called in JS. So the remaining question is, how can we implement a React renderer, that supports on-demand updates?

The basic design here we chose, is to divide the entire application into three main roles:

* An event-driven React system
* A container maintaining native screen states
* A renderer running in a fixed frame rate, aka the main loop

How do these roles work together? Generally speaking, when a user event triggers `setState` in React, React not only updates its own state tree, but also makes modifications in the native state container. In this way, when the next frame of the main loop arrives, we can lazily refresh the screen, based on the modifications left by React. **From the perspective of event flow**, the overall architecture looks like this:

![](https://ewind.us/images/react-ssd1306/react-arch-1.jpg)

The *Native State Container* in the figure, can be understood as the browser's actual DOM, representing something that is "not difficult to control with JS directly, but is better to let React manage that for you". As long as the configuration is correct, React will update this container in a single direction. Once the container state is updated, this new state will be synchronized to the screen in the next frame. This is quite similar to the classic producer-consumer model, where React is the producer that updates the state of the container, and the screen is the consumer that periodically checks and consumes the state of the container. Sounds straightforward, right?

Implementing the native state container and the main loop is actually trivial. The biggest question for now is, how do we configure React , to have it automatically update this state container? This requires the usage of the famous **React Reconciler**. To implement a React Renderer, you can update the native state container correctly in the Reconciler's lifecycle hooks. **From a hierarchical perspective**, the overall architecture is like this:

![](https://ewind.us/images/react-ssd1306/react-arch-2.jpg)

In this perspective, the JS Renderer we want to use in React, is more like a thinner “shell”. There are two important layers that we need to implement:

* An adapter layer that implements the native state container and native rendering loop
* A real renderer in C programming language

The renderer implementation for React looks like this:

``` js
import Reconciler from 'react-reconciler'
import { NativeContainer } from './native-adapter.js'

const root = new NativeContainer()
const hostConfig = { /* ... */ }
const reconciler = Reconciler(hostConfig)
const container = reconciler.createContainer(root, false)

export const SSD1306Renderer = {
  render (reactElement) {
    return reconciler.updateContainer(reactElement, container)
  }
}
```

A `NativeContainer` is required in this snippet. This container is generally designed in this manner:

``` js
// Import QuickJS native module
import { init, clear, drawText, drawPixel } from 'renderer'
// ...

export class NativeContainer {
  constructor () {
    this.elements = []
    this.synced = true
    // Clear the screen and start the event loop
    init()
    clear()
    mainLoop(() => this.onFrameTick())
  }
  // The method that is handed over to React
  appendElement (element) {
    this.synced = false
    this.elements.push(element)
  }
  // The method that is handed over to React
  removeElement (element) {
    this.synced = false
    const i = this.elements.indexOf(element)
    if (i !== -1) this.elements.splice(i, 1)
  }
  // Executed every frame, but only re-render when the state changes
  onFrameTick () {
    if (!this.synced) this.render()
    this.synced = true
  }
  // Draw various elements after clearing the screen
  render () {
    clear()
    for (let i = 0; i < this.elements.length; i++) {
      const element = this.elements[i]
      if (element instanceof NativeTextElement) {
        const { children, row, col } = element.props
        drawText(children, row, col)
      } else if (element instanceof NativePixelElement) {
        drawPixel(element.props.x, element.props.y)
      }
    }
  }
}
```

It's not hard to see that this `NativeContainer` will call the C render module in the next frame, as long as its internal elements are changed. So how can we make React able to call its methods? This requires the `hostConfig` configuration above. A large number of Reconciler APIs are required in this configuration. For a simplest first-time rendering scenario, these methods are required:

``` js
appendInitialChild () {}
appendChildToContainer () {} // critical
appendChild () {}
createInstance () {} // critical
createTextInstance () {}
finalizeInitialChildren () {}
getPublicInstance () {}
Now () {}
prepareForCommit () {}
prepareUpdate () {}
resetAfterCommit () {}
resetTextContent () {}
getRootHostContext () {} // critical
getChildHostContext () {}
shouldSetTextContent () {}
useSyncScheduling: true
supportsMutation: true
```

The non-trivial implementations here are basically in the items marked as "critical". For example, if I have both `NativeText` and `NativePixel` elements in my `NativeContainer`, then the `createInstance` hook should create the corresponding element instances based on the type of the React component, and add them to the `NativeContainer` in the `appendChildToContainer` hook. Take `createInstance` as an example:

``` js
// Create an instance in native container
createInstance (type, props, internalInstanceHandle) {
  if (type === 'TEXT') {
    return new NativeTextElement(props)
  } else if (type === 'PIXEL') {
    return new NativePixelElement(props)
  } else {
    console.warn(`Component type: ${type} is not supported`)
  }
}
```

After stat initialization, we also need to update and delete elements afterwards. This responds to these Reconciler APIs for the very least:

``` js
commitTextUpdate () {}
commitUpdate () {} // critical
removeChildFromContainer () {} // critical
```

Their implementation can be also done in the same way. Finally, we need to package the Renderer together with some "built-in components":

``` js
export const Text = 'TEXT'
export const Pixel = 'PIXEL'
// ...
export const SSD1306Renderer = {
  render () { /* ... */ }
}
```

In this way, the component type we get from Reconciler can be these constants, which indicates `NativeContainer` to update itself.

**So far, after all the journey, we can finally control the screen directly with React**! After this renderer is implemented, the React app code we need to write, is quite simple:

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

The render result looks like this:

![](https://ewind.us/images/react-ssd1306/pi-success.jpg)

Although the result looks plain, the appearance of these text, has represented that the connection from C driver to modern front end technology, has been established - JSX, component life cycles and potential React hooks / Redux, can be finally used alongside the embedded hardware. Thanks to QuickJS, **eventually the entire binary executable file size, including the JS engine and React, is less than 780KB**.

If you don’t have a Raspberry Pi, a HTML5 canvas-based renderer is also included as an emulator. This render backend is yet trivial to implement:

``` js
// Mock canvas renderer for Web emulation
let canvas, ctx

export const init = () => {
  canvas = document.querySelector('canvas')
  ctx = canvas.getContext('2d')
}

export const clear = () => {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

export const drawText = (text, row, col) => {
  ctx.font = '8px'
  ctx.fillStyle = 'white'
  const x = col * 8
  const y = (row + 1) * 8
  ctx.fillText(text, x, y)
}

export const drawPixel = (x, y) => {
  ctx.fillStyle = 'white'
  ctx.fillRect(x, y, 1, 1)
}
```

By using ParcelJS, all the JavaScript code we mentioned above, can be bundled and run directly inside your web browser, without any modification. That’s the real power of “Learn once, write anywhere”.

## Resources
The entire project code example, is in the [react-ssd1306](https://github.com/doodlewind/react-ssd1306) repository. If you find it interesting, stars are welcomed. There’re also some helpful reference links:

* [QuickJS Home Page](https://bellard.org/quickjs)
* [QuickJS Asynchronous Native Module Development](https://medium.com/@calbertts/how-to-create-asynchronous-apis-for-quickjs-8aca5488bb2e)
* [Use I2C OLED on Raspberry Pi](https://www.raspberrypi-spy.co.uk/2018/04/i2c-oled-display-module-with-raspberry-pi/)
* [Build a custom React Renderer](https://github.com/nitin42/Making-a-custom-React-renderer)

Hope this article helps as a beginner’s guide, to those who are interested in developing custom React renderers.
