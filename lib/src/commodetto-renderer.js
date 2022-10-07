import parseBMF from "commodetto/parseBMF";
import Resource from "Resource";
let poco
let bg, fg
let font

export const init = (newPoco) => {
  poco = newPoco
  font = parseBMF(new Resource("OpenSans-Semibold-18.bf4"));
  bg = poco.makeColor(0, 0, 0)
  fg = poco.makeColor(255, 255, 255);
  clear()
}

export const clear = () => {
  trace(`clear: (${poco.width}x${poco.height})\n`)
  poco.begin(0, 0, poco.width, poco.height)
  poco.fillRectangle(bg, 0, 0, poco.width, poco.height)
  poco.end()
}

export const drawText = (text, x, y) => {
  trace(`drawText: "${text}" into (${x}, ${y})\n`)
  let h = font.height
  let w = poco.getTextWidth(text, font)
  poco.begin(x, y, w, h)
	poco.fillRectangle(bg, x, y, w, h);
  poco.drawText(text, font, fg, x, y)
  poco.end()
}

export const drawRect = (x, y, width, height, color = fg) => {
  trace(`drawRect: (${width}, ${height}) into (${x}, ${y})\n`)
  poco.begin(x, y, width, height)
	poco.fillRectangle(color, x, y, width, height);
  poco.end()
}

export const drawPixel = (x, y) => {
  trace(`drawPixel: into (${x}, ${y})\n`)
  poco.begin(x, y, 2, 2)
	poco.fillRectangle(fg, x, y, 2, 2);
  poco.end()
}
