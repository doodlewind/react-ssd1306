/* global globalThis */
import * as os from 'os'
globalThis.process = { env: { NODE_ENV: 'development' } }
if (!globalThis.setTimeout) globalThis.setTimeout = os.setTimeout
globalThis.console.warn = console.log
globalThis.console.error = () => {}
