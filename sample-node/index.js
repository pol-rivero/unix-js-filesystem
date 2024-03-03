import { Unix } from "unix-core"

// Don't forget to run `npm run bundle` to generate the dist directory
import virtualFS from "../dist/filesystem.js"

const unixJs = new Unix(virtualFS)
await unixJs.start()

