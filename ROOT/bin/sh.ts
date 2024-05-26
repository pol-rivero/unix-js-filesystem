import { Signal, UnixJsError, type File } from "unix-core"

const ESC = "\x1b"
const BACKSPACE = "\x7f"
const runningProcesses = new Set<number>()

export async function execute(): Promise<void> {
    process.registerSignalHandler(Signal.SIGINT, async () => {
        await process.stdout.write("\n")
        setCurrentLine("")
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

async function mainLoop(): Promise<void> {
    await printPrompt()
    const line = await readLine()
    await parseLine(line)
}

async function printPrompt(): Promise<void> {
    const pwd = process.currentWorkingDirectory.absolutePath
    await process.stdout.write(`${ESC}[32m${pwd}${ESC}[0m$ `)
}

async function parseLine(line: string): Promise<void> {
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

async function runCommand(command: string, args: readonly string[], background: boolean): Promise<void> {
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

async function runBuiltInCommand(command: string, args: readonly string[]): Promise<boolean> {
    switch (command) {
        case "exit":
            terminate(0)
            // eslint-disable-next-line no-fallthrough -- terminate does not return
        case "cd":
            try {
                process.changeDirectory(args[0] ?? '~')
            } catch (e) {
                if (e instanceof UnixJsError) {
                    await process.stdout.write(`cd: ${e.linuxDescription}: ${args[0]}\n`)
                }
            }
            return true
        default:
            return false
    }
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
    return undefined
}

function terminate(exitCode: number): never {
    for (const pid of runningProcesses) {
        void process.sendSignal(pid, Signal.SIGHUP);
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
            case "\r": {
                await process.stdin.write("\n")
                const line = currentLineBuffer
                currentLineBuffer = ""
                currentLineIndex = 0
                return line
            }
            case BACKSPACE:
                if (removeCharBack()) {
                    await process.stdout.write("\b")
                    await printRemainingLine(currentLineBuffer + " ")
                }
                break
            case ESC: {
                if (await process.stdin.read() === "[") {
                    await handleEscapeSequence()
                }
                break
            }
            default:
                addCharToBuffer(char)
                await printRemainingLine(currentLineBuffer)
        }
    }
}

async function handleEscapeSequence(): Promise<void> {
    switch (await process.stdin.read()) {
        case "A":
            await setCurrentLineAndUpdateDisplay(getPreviousCommand())
            break
        case "B":
            await setCurrentLineAndUpdateDisplay(getNextCommand())
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
                removeCharForward()
                await printRemainingLine(currentLineBuffer + " ")
            }
            break
        default:
            // Unrecognized escape sequence, ignore
            break
    }
}

async function printRemainingLine(text: string): Promise<void> {
    if (currentLineIndex < text.length) {
        await process.stdout.write(text.slice(currentLineIndex))
        await process.stdout.write("\b".repeat(text.length - currentLineIndex))
    }
}

function addCharToBuffer(char: string): void {
    currentLineBuffer = currentLineBuffer.slice(0, currentLineIndex) + char + currentLineBuffer.slice(currentLineIndex)
    currentLineIndex++
}

function removeCharBack(): boolean {
    if (currentLineIndex === 0) {
        return false
    }
    currentLineBuffer = currentLineBuffer.slice(0, currentLineIndex - 1) + currentLineBuffer.slice(currentLineIndex)
    return moveCursorLeft()
}

function removeCharForward(): void {
    if (currentLineIndex < currentLineBuffer.length) {
        currentLineBuffer = currentLineBuffer.slice(0, currentLineIndex) + currentLineBuffer.slice(currentLineIndex + 1)
    }
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

function setCurrentLine(text: string): void {
    currentLineBuffer = text
    currentLineIndex = text.length
}

async function setCurrentLineAndUpdateDisplay(text: string): Promise<void> {
    if (currentLineIndex > 0) {
        // Move cursor back to the end of the prompt
        await process.stdout.write(`${ESC}[${currentLineIndex}D`)
    }
    // Clear the rest of the line
    await process.stdout.write(`${ESC}[K`)
    await process.stdout.write(text)
    setCurrentLine(text)
}



// COMMAND HISTORY

const commandHistory: string[] = []
let commandHistoryIndex = 0

function storeCommandInHistory(line: string): void {
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

