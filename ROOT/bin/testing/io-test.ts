export async function execute(args: readonly string[]): Promise<void> {
    if (args.length < 2) {
        await process.stdout.write(`Usage: ${args[0]} <mode>\n`)
        await process.stdout.write(`Modes: line, character\n`)
        return
    }

    if (args[1] === "line") {
        await line()
    } else if (args[1] === "character") {
        await character()
    } else {
        await process.stdout.write("Invalid mode, use 'line' or 'character'\n")
    }
}

async function character(): Promise<void> {
    await process.stdout.write("Type here:\n")
    while (true) {
        await process.stdout.write(`> `)
        
        const char = await process.stdin.read()
        const charCode = char.charCodeAt(0)
        await process.stderr.write(`You typed: '${char}' (${charCode})\n`)
    }
}

async function line(): Promise<void> {
    const handle = process.stdin.open()
    await process.stdout.write("Type here and press enter:\n")
    while (true) {
        await process.stdout.write(`> `)
        
        const typedLine = await handle.readLine()
        await process.stderr.write(`You typed: '${typedLine}'\n`)

        if (typedLine === "exit") {
            await process.stdout.write("Goodbye!\n")
            break
        }
    }
}
