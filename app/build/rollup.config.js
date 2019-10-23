const jsx = require('./jsx-plugin.js')

module.exports = {
  input: 'src/index.js',
  output: {
    file: 'dist/app.js',
    format: 'iife'
  },
  plugins: [
    jsx({ factory: 'React.createElement' })
  ]
}
