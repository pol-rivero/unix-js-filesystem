import { Signal, UnixJsError, type File } from "unix-core"

let currentLine = ""
const runningProcesses: Set<number> = new Set()

export async function execute() {
    process.registerSignalHandler(Signal.SIGINT, async () => {
        currentLine = ""
        await process.stdout.write("\n")
        await printPrompt()
    })
    for (const signal of [Signal.SIGHUP, Signal.SIGQUIT, Signal.SIGILL, Signal.SIGABRT, Signal.SIGFPE,
            Signal.SIGUSR1, Signal.SIGSEGV, Signal.SIGUSR2, Signal.SIGPIPE, Signal.SIGALRM, Signal.SIGTERM]) {
        process.registerSignalHandler(signal, () => terminate(signal.exitCode))
    }
    while (true) {
        await mainLoop()
    }
}

async function mainLoop() {
    await printPrompt()
    while (true) {
        const char = await process.stdin.read()
        await process.stdout.write(char)
        if (char === "\n") {
            break
        } else {
            currentLine += char
        }
    }
    await parseLine()
}

async function parseLine() {
    const args = currentLine.trim().split(" ")
    currentLine = ""
    const command = args.shift()
    try {
        if (command) {
            await runCommand(command, args, false)
        }
    } catch (e) {
        if (e instanceof UnixJsError) {
            await process.stdout.write(`${command}: ${e.message}\n`)
            return
        }
        throw e
    }
}

async function runCommand(command: string, args: string[], background: boolean) {
    if (await runBuiltInCommand(command, args)) {
        return
    }
    const commandFile = lookupCommand(command)
    const newProcessPid = await process.execute(commandFile, args, true)
    runningProcesses.add(newProcessPid)
    if (background) {
        return
    }

    // Create a new process group for the process and its children, and set it as the foreground process group
    process._table.updateProcessGroup(newProcessPid, newProcessPid)
    process._table.foregroundPgid = newProcessPid

    await process.wait(newProcessPid)
    runningProcesses.delete(newProcessPid)
    process._table.foregroundPgid = process.pgid
}

async function runBuiltInCommand(command: string, args: string[]): Promise<boolean> {
    switch (command) {
        case "exit":
            terminate(0)
        case "cd":
            process.changeDirectory(args[0] ?? '~')
            return true
    }
    return false
}

function lookupCommand(command: string): File {
    // TODO: Use PATH environment variable to find command
    return process.resolvePath(command).asFile()
}

async function printPrompt() {
    const pwd = process.currentWorkingDirectory.absolutePath
    await process.stdout.write(`${pwd}$ `)
}

function terminate(exitCode: number): never {
    for (const pid of runningProcesses) {
        process.sendSignal(pid, Signal.SIGHUP)
    }
    process.exit(exitCode)
}
