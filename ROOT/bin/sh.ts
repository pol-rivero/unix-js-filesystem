import { Signal, type Process } from "unix-core"

export async function execute(process: Process, args: string[]) {
    // TODO: implement

    const ioTest = process.resolvePath("/bin/testing/io-test").asFile()
    const newProcessPid = process.execute(ioTest, ['character'], true)
    process.updateProcessGroup(newProcessPid, newProcessPid)
    process.updateForegroundProcessGroup(newProcessPid)
    await process.wait(newProcessPid)
    process.updateForegroundProcessGroup(process.pid)
}

export async function handleSignal(process: Process, signal: Signal) {
    switch (signal) {
        case Signal.SIGINT:
            await handleInterrupt(process)
            break
    }
}

async function handleInterrupt(process: Process) {
    process.stdout.write("\n")
    await printPrompt(process)
}

async function printPrompt(process: Process) {
    const pwd = process.currentWorkingDirectory.absolutePath
    process.stdout.write(pwd + "$ ")
}
