/* eslint-disable react/jsx-fragments */ // rollup plugin workaround
import './polyfill.js'
import Timer from 'timer'
import React, { useEffect, useState, Fragment } from 'react'
import { SSD1306Renderer, Text, Pixel } from './renderer.js'
import Poco from "commodetto/Poco";

const App = () => {
  const [hello, setHello] = useState("Hello React!")
  const [p, setP] = useState(0);
  useEffect(() => {
    console.log("APP DID MOUNT!\n");
    Timer.set(() => {
      console.log("repeat\n");
      let initial = hello.substring(0,1)
      setHello(hello.substring(1) + initial)
      setP(p + 1)
    }, 500);
  }, [hello]);
  return (
    <Fragment>
      <Text key={1} row={10} col={50}>
        {hello}
      </Text>
      <Pixel key={2} x={p} y={p} />
    </Fragment>
  );
};

export default function draw(screen) {
  let render = new Poco(screen, { displayListLength: 2048 });
  SSD1306Renderer.render(<App />, render);
}
