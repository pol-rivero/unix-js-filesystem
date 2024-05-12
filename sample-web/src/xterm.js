import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'

const theme = {
  foreground: "#eeeeec",
  background: "#1c1b1e",
  black: "#000000",
  blue: "#1093f5",
  cyan: "#00cdcd",
  green: "#00cd00",
  magenta: "#cd00cd",
  red: "#cd0000",
  white: "#faebd7",
  yellow: "#cdcd00",
  brightBlack: "#404040",
  brightBlue: "#11b5f6",
  brightCyan: "#00ffff",
  brightGreen: "#00ff00",
  brightMagenta: "#ff00ff",
  brightRed: "#ff0000",
  brightWhite: "#ffffff",
  brightYellow: "#ffff00",
  selectionBackground: "#eeeeec",
  cursorAccent: "#bbbbbb"
}

export function getTerminal() {
  const terminal = new Terminal({
    fontSize: 20,
    smoothScrollDuration: 50,
    convertEol: true,
    cursorBlink: true,
    theme
  })
  const fitAddon = new FitAddon()
  terminal.loadAddon(fitAddon)
  terminal.loadAddon(new WebLinksAddon())
  terminal.open(document.getElementById('terminal'))
  fitAddon.fit()
  fitOnResize(fitAddon)
  return terminal
}

function fitOnResize(fitAddon) {
  window.addEventListener('resize', () => {
    fitAddon.fit()
  })
}
