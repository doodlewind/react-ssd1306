/* global globalThis */
import Timer from 'timer'
globalThis.process = { env: { NODE_ENV: 'development' } }

if (!globalThis.setTimeout) globalThis.setTimeout = Timer.set

const consoleLog = s => trace(`${s}\n`)
if (!globalThis.console) {
  globalThis.console = {
    log: consoleLog,
    warn: consoleLog,
    error: consoleLog
  }
}
