const jsx = require('jsx-transform')
const MagicString = require('magic-string')
const { createFilter } = require('rollup-pluginutils')

module.exports = (options = {
  factory: 'React.createElement',
  passUnknownTagsToFactory: true
}) => {
  const filter = createFilter(options.include, options.exclude)
  return {
    transform: function sourceToCode (code, id) {
      if (!filter(id)) return null

      const s = new MagicString(code)
      const out = jsx.fromString(code, options)
      s.overwrite(0, code.length, out.toString())

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true })
      }
    }
  }
}
