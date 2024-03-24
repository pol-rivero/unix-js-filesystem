import type { Process } from "unix-core"

export async function execute(process: Process, args: string[]) {
    // TODO: implement

    const ioTest = process.resolvePath("/bin/testing/io-test").asFile()
    const newProcessPid = process.execute(ioTest, ['character'], true)
    process.updateProcessGroup(newProcessPid, newProcessPid)
    process.updateForegroundProcessGroup(newProcessPid)
    await process.wait(newProcessPid)
    process.updateForegroundProcessGroup(process.pid)
}
