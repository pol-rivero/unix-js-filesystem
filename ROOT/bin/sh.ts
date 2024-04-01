import { Signal, UnixJsError, type File, type Process } from "unix-core"

let currentLine = ""

export async function execute(process: Process) {
    while (true) {
        await mainLoop(process)
    }
}

async function mainLoop(process: Process) {
    await printPrompt(process)
    while (true) {
        const char = await process.stdin.read()
        await process.stdout.write(char)
        if (char === "\n") {
            break
        } else {
            currentLine += char
        }
    }
    await parseLine(process)
}

async function parseLine(process: Process) {
    const args = currentLine.trim().split(" ")
    currentLine = ""
    const command = args.shift()
    try {
        if (command) {
            await runForegroundCommand(process, command, args)
        }
    } catch (e) {
        if (e instanceof UnixJsError) {
            await process.stdout.write(`${command}: ${e.message}`)
            return
        }
        throw e
    }
}

async function runForegroundCommand(process: Process, command: string, args: string[]) {
    const commandFile = lookupCommand(process, command)
    const newProcessPid = process.execute(commandFile, args, true)
    process._table.updateProcessGroup(newProcessPid, newProcessPid)
    process._table.foregroundPgid = newProcessPid
    await process.wait(newProcessPid)
    process._table.foregroundPgid = process.pid
}

function lookupCommand(process: Process, command: string): File {
    // TODO: Use PATH environment variable to find command
    if (command === "exit") {
        process.exit(0)
    }
    return process.resolvePath(command).asFile()
}

async function printPrompt(process: Process) {
    const pwd = process.currentWorkingDirectory.absolutePath
    await process.stdout.write(`\n${pwd}$ `)
}

export async function handleSignal(process: Process, signal: Signal) {
    if (signal === Signal.SIGINT) {
        await handleInterrupt(process)
    }
}

async function handleInterrupt(process: Process) {
    currentLine = ""
    await printPrompt(process)
}
