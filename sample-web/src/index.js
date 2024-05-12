import { UnixShell } from "unix-core"

// Don't forget to run `npm run bundle` to generate this file
import virtualFS from "./filesystem.js"
import { getTerminal } from "./xterm.js"

const CTRL_C = '\u0003'

function prepareStdin(unixShell) {
  const terminal = getTerminal()
  window.TERM_OBJECT = terminal
  window.KEY_BUFFER = []

  terminal.onData(text => {
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
