import readline from 'readline'
import { UnixShell } from "unix-core"

// Don't forget to run `npm run bundle` to generate the dist directory
import virtualFS from "../dist/filesystem.cjs"

const CTRL_C = '\u0003'

function prepareStdin(unixShell) {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.on('keypress', (ch, key) => {
    if (key.sequence === CTRL_C) {
      unixShell.interrupt()
    }
  })
  process.stdin.setRawMode(true);
  process.stdin.setEncoding("utf8")
}

async function main() {
  const unixShell = new UnixShell(virtualFS)
  prepareStdin(unixShell)

  await unixShell.start()
  // Use process.exit() to exit instead of just returning.
  // Otherwise, background processes could keep the process running.
  process.exit()
}

main()
