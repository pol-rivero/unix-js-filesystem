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
            await process.stdout.write(`${command}: ${e.message}\n`)
            return
        }
        throw e
    }
}

async function runForegroundCommand(process: Process, command: string, args: string[]) {
    if (await runBuiltInCommand(process, command, args)) {
        return
    }
    const commandFile = lookupCommand(process, command)
    const newProcessPid = await process.execute(commandFile, args, true)

    // Create a new process group for the process and its children, and set it as the foreground process group
    process._table.updateProcessGroup(newProcessPid, newProcessPid)
    process._table.foregroundPgid = newProcessPid

    await process.wait(newProcessPid)
    process._table.foregroundPgid = process.pgid
}

async function runBuiltInCommand(process: Process, command: string, args: string[]): Promise<boolean> {
    switch (command) {
        case "exit":
            process.exit(0)
        case "cd":
            process.changeDirectory(args[0] ?? '~')
            return true
    }
    return false
}

function lookupCommand(process: Process, command: string): File {
    // TODO: Use PATH environment variable to find command
    return process.resolvePath(command).asFile()
}

async function printPrompt(process: Process) {
    const pwd = process.currentWorkingDirectory.absolutePath
    await process.stdout.write(`${pwd}$ `)
}

export async function handleSignal(process: Process, signal: Signal) {
    if (signal === Signal.SIGINT) {
        await handleInterrupt(process)
    }
}

async function handleInterrupt(process: Process) {
    currentLine = ""
    await process.stdout.write("\n")
    await printPrompt(process)
}
