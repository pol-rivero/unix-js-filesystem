import { Unix } from "unix-core"

// Don't forget to run `npm run bundle` to generate the dist directory
import virtualFS from "../dist/filesystem.cjs"

const unixJs = new Unix(virtualFS)
process.on("SIGINT", () => unixJs.interrupt())
await unixJs.start()

