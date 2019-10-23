/* global globalThis */
import * as os from 'os'
globalThis.process = { env: { NODE_EMV: 'development' } }
globalThis.setTimeout = os.setTimeout
