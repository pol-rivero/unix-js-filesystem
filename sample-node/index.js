import { UnixShell } from "unix-core"

// Don't forget to run `npm run bundle` to generate this file
import virtualFS from "./filesystem.js"

const CTRL_C = '\u0003'

function prepareStdin(unixShell) {
  globalThis.KEY_BUFFER = []

  process.stdin.on("data", text => {
    for (const key of text) {
      if (key === CTRL_C) {
        unixShell.interrupt()
      } else {
        KEY_BUFFER.push(key.replace('\r', '\n'))
      }
    }
  })

  process.stdin.setRawMode(true);
  process.stdin.setEncoding("utf8")
}

async function main() {
  const unixShell = new UnixShell(virtualFS)
  prepareStdin(unixShell)
  await unixShell.start()
  process.exit()
}

main()
