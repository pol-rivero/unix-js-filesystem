import parse from "minimist"
import { UnixJsError } from "unix-core"

let flagAll = false

export async function execute(args: readonly string[]): Promise<void> {
    const argv = parse(args.slice(1), {
        boolean: ["l", "a", "all"]
    })
    flagAll = argv.a as boolean || argv.all as boolean
    const directories = argv._
    if (directories.length === 0) {
        await listNode(".", false)
        return
    }
    const printPrefix = directories.length > 1
    for (const dir of directories) {
        await listNode(dir, printPrefix)
    }
}

async function listNode(path: string, printPrefix: boolean): Promise<void> {
    try {
        const node = process.resolvePath(path)
        if (node.isFile()) {
            await process.stdout.write(`${path}\n`)
            return
        }
        if (printPrefix) {
            await process.stdout.write(`${path}:\n`)
        }

        let entries = node.asDirectory().getChildrenNames()
        if (!flagAll) {
            entries = entries.filter(entry => !entry.startsWith("."))
        }

        for (const entry of entries) {
            await process.stdout.write(`${entry}\n`)
        }
        if (printPrefix) {
            await process.stdout.write('\n')
        }
    } catch (e) {
        if (e instanceof UnixJsError) {
            await process.stderr.write(`ls: cannot access '${path}': ${e.linuxDescription}\n`)
        }
    }
}
