import { UnixShell } from "unix-core"

// Don't forget to run `npm run bundle` to generate this file
import virtualFS from "./filesystem.js"

const CTRL_OFFSET = -96
const CTRL_C = '\u0003'

function prepareStdin(unixShell) {
  window.KEY_BUFFER = []
  let ctrlPressed = false

  document.addEventListener('keydown', function(event) {
    event.preventDefault()
    let key = event.key
    switch (key) {
      case 'Control':
        ctrlPressed = true
        return
      case 'Shift':
      case 'Alt':
      case 'Meta':
      case 'AltGraph':
        return
      case 'Backspace':
        key = String.fromCharCode(127)
        break
      case 'Enter':
        key = '\n'
        break
    }
    if (ctrlPressed) {
      let keyLowercase = key.toLowerCase()
      if (keyLowercase >= 'a' && keyLowercase <= 'z') {
        key = String.fromCharCode(keyLowercase.charCodeAt(0) + CTRL_OFFSET)
      }
    }
    if (key === CTRL_C) {
      unixShell.interrupt()
    } else {
      KEY_BUFFER.push(key)
    }
  })

  document.addEventListener('keyup', function(event) {
    event.preventDefault()
    if (event.key === 'Control') {
      ctrlPressed = false
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
