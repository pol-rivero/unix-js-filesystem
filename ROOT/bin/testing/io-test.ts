export async function execute(args: string[]) {
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

async function character() {
    process.stdout.write("Type here:\n")
    while (true) {
        await process.stdout.write(`> `)
        
        const char = await process.stdin.read()
        const charCode = char.charCodeAt(0)
        await process.stderr.write(`You typed: '${char}' (${charCode})\n`)

        // if (charCode === 4 || charCode === 3) {
        //     await context.stdout.write("Goodbye!\n")
        //     break
        // }
    }
}

async function line() {
    const handle = process.stdin.open()
    process.stdout.write("Type here and press enter:\n")
    while (true) {
        await process.stdout.write(`> `)
        
        const line = await handle.readLine()
        await process.stderr.write(`You typed: '${line}'\n`)

        if (line === "exit") {
            await process.stdout.write("Goodbye!\n")
            break
        }
    }
}
