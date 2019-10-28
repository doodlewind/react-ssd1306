import * as std from 'std'
import * as os from 'os'
import { open, close } from 'process'

const CHUNK_SIZE = 200000 // 200KB

const fd = open('curl 2>/dev/null https://jsonplaceholder.typicode.com/users', 'r')

os.setReadHandler(fd, () => {
  const readBuf = new Uint8Array(CHUNK_SIZE)
  const l = os.read(fd, readBuf.buffer, 0, readBuf.length)

  if (!l) {
    std.out.printf('\n')

    os.setReadHandler(fd, null)
    close(fd)
  }

  const string = String.fromCharCode.apply(null, readBuf)
  std.out.printf('%s', string)
})

console.log('This line appears first')
