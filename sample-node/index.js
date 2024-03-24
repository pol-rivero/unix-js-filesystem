import { UnixShell } from "unix-core"

// Don't forget to run `npm run bundle` to generate the dist directory
import virtualFS from "../dist/filesystem.cjs"

const unixShell = new UnixShell(virtualFS)

process.on("SIGINT", () => unixShell.interrupt())

await unixShell.start()

// Use process.exit() to exit instead of just returning.
// Otherwise, background processes could keep the process running.
process.exit()
