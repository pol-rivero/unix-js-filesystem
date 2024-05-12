import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { UnixShell } from "unix-core"

// Don't forget to run `npm run bundle` to generate this file
import virtualFS from "./filesystem.js"

const CTRL_C = '\u0003'

const term = new Terminal({
  convertEol: true,
})
term.open(document.getElementById('terminal'))

function prepareStdin(unixShell) {
  window.TERM_OBJECT = term
  window.KEY_BUFFER = []
  
  term.onData(text => {
    for (const key of text) {
      if (key === CTRL_C) {
        unixShell.interrupt()
      } else {
        KEY_BUFFER.push(key)
      }
    }
  })
}

async function main() {
  const unixShell = new UnixShell(virtualFS)
  prepareStdin(unixShell)
  await unixShell.start()
  window.close()
}

main()
