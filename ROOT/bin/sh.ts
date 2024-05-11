import { Signal, UnixJsError, type File } from "unix-core"

const ESC = "\x1b"
const BACKSPACE = "\x7f"
const runningProcesses: Set<number> = new Set()

export async function execute() {
    process.registerSignalHandler(Signal.SIGINT, async () => {
        await process.stdout.write("\n")
        await setCurrentLine("")
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
    const line = await readLine()
    await parseLine(line)
}

async function printPrompt() {
    const pwd = process.currentWorkingDirectory.absolutePath
    await process.stdout.write(`${ESC}[32m${pwd}${ESC}[0m$ `)
}

async function parseLine(line: string) {
    storeCommandInHistory(line)
    const args = line.trim().split(" ")
    const command = args.shift()
    try {
        if (command) {
            await runCommand(command, args, false)
        }
    } catch (e) {
        if (e instanceof UnixJsError) {
            await process.stdout.write(`sh: ${e.linuxDescription}: ${command}\n`)
            return
        }
        throw e
    }
}



// COMMAND EXECUTION

async function runCommand(command: string, args: string[], background: boolean) {
    if (await runBuiltInCommand(command, args)) {
        return
    }
    const commandFile = await lookupCommand(command)
    if (!commandFile) {
        return
    }
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

async function lookupCommand(command: string): Promise<File | undefined> {
    if (command.includes("/")) {
        return process.resolvePath(command).asFile()
    }
    const path = process.env.PATH.split(":")
    for (const directory of path) {
        try {
            return process.resolvePath(`${directory}/${command}`).asFile()
        } catch (e) {
            if (!(e instanceof UnixJsError)) {
                throw e
            }
        }
    }
    await process.stdout.write(`${command}: command not found\n`)
}

function terminate(exitCode: number): never {
    for (const pid of runningProcesses) {
        process.sendSignal(pid, Signal.SIGHUP)
    }
    process.exit(exitCode)
}



// READLINE IMPLEMENTATION

let currentLineBuffer = ""
let currentLineIndex = 0

async function readLine(): Promise<string> {
    while (true) {
        const char = await process.stdin.read()
        if (![ESC, BACKSPACE].includes(char)) {
            await process.stdout.write(char)
        }
        switch (char) {
            case "\n": {
                const line = currentLineBuffer
                currentLineBuffer = ""
                currentLineIndex = 0
                return line
            }
            case BACKSPACE:
                if (removeCharFromBuffer()) {
                    await process.stdout.write("\b")
                    await printRemainingLine(currentLineBuffer + " ")
                }
                break
            case ESC: {
                if (await process.stdin.read() === "[") {
                    handleEscapeSequence()
                }
                break
            }
            default:
                addCharToBuffer(char)
                await printRemainingLine(currentLineBuffer)
        }
    }
}

async function handleEscapeSequence() {
    switch (await process.stdin.read()) {
        case "A":
            await setCurrentLine(getPreviousCommand())
            break
        case "B":
            await setCurrentLine(getNextCommand())
            break
        case "D":
            if (moveCursorLeft()) {
                await process.stdout.write(`${ESC}[D`)
            }
            break
        case "C":
            if (moveCursorRight()) {
                await process.stdout.write(`${ESC}[C`)
            }
            break
        case "3":
            if (await process.stdin.read() === "~") {
                removeCharFromBuffer()
                await printRemainingLine(currentLineBuffer + " ")
            }
            break
    }
}

async function printRemainingLine(text: string) {
    if (currentLineIndex < text.length) {
        await process.stdout.write(text.slice(currentLineIndex))
        await process.stdout.write("\b".repeat(text.length - currentLineIndex))
    }
}

function addCharToBuffer(char: string) {
    currentLineBuffer = currentLineBuffer.slice(0, currentLineIndex) + char + currentLineBuffer.slice(currentLineIndex)
    currentLineIndex++
}

function removeCharFromBuffer() {
    if (currentLineIndex === 0) {
        return false
    }
    currentLineBuffer = currentLineBuffer.slice(0, currentLineIndex - 1) + currentLineBuffer.slice(currentLineIndex)
    return moveCursorLeft()
}

function moveCursorLeft(): boolean {
    if (currentLineIndex > 0) {
        currentLineIndex--
        return true
    }
    return false
}

function moveCursorRight(): boolean {
    if (currentLineIndex < currentLineBuffer.length) {
        currentLineIndex++
        return true
    }
    return false
}

async function setCurrentLine(text: string) {
    currentLineBuffer = text
    currentLineIndex = text.length
    await process.stdout.write(`\r${ESC}[K`) // Clear line
    await printPrompt()
    await process.stdout.write(text)
}



// COMMAND HISTORY

const commandHistory: string[] = []
let commandHistoryIndex = 0

function storeCommandInHistory(line: string) {
    line = line.trim()
    if (line && line !== commandHistory[commandHistory.length - 1]) {
        commandHistory.push(line)
    }
    commandHistoryIndex = commandHistory.length
}

function getPreviousCommand(): string {
    if (commandHistoryIndex > 0) {
        commandHistoryIndex--
    }
    return commandHistory[commandHistoryIndex] ?? ""
}

function getNextCommand(): string {
    if (commandHistoryIndex < commandHistory.length) {
        commandHistoryIndex++
    }
    return commandHistory[commandHistoryIndex] ?? ""
}

