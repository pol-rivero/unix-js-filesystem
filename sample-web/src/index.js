import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { UnixShell } from "unix-core"

// Don't forget to run `npm run bundle` to generate this file
import virtualFS from "./filesystem.js"

const term = new Terminal();
term.options.convertEol = true;
term.open(document.getElementById('terminal'));

const CTRL_C = '\u0003'

function prepareStdin(unixShell) {
  window.TERM_OBJECT = term
  window.KEY_BUFFER = []
  term.onData(data => {
    for (let i = 0; i < data.length; i++) {
      const char = data.charAt(i)
      if (char === CTRL_C) {
        unixShell.interrupt()
      } else {
        KEY_BUFFER.push(char)
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
