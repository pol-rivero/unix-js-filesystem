import { ExecutionContext } from "unix-core"

export async function execute(context: ExecutionContext, args: string[]) {
    if (args.length < 2) {
        await context.stdout.write(`Usage: ${args[0]} <mode>\n`)
        await context.stdout.write(`Modes: line, character\n`)
        return
    }

    if (args[1] === "line") {
        await line(context)
    } else if (args[1] === "character") {
        await character(context)
    } else {
        await context.stdout.write("Invalid mode, use 'line' or 'character'\n")
    }
}

async function character(context: ExecutionContext) {
    context.stdout.write("Type here:\n")
    while (true) {
        await context.stdout.write(`> `)
        
        const char = await context.stdin.read()
        const charCode = char.charCodeAt(0)
        await context.stderr.write(`You typed: '${char}' (${charCode})\n`)

        if (charCode === 4 || charCode === 3) {
            await context.stdout.write("Goodbye!\n")
            break
        }
    }
}

async function line(context: ExecutionContext) {
    const handle = context.stdin.open()
    context.stdout.write("Type here and press enter:\n")
    while (true) {
        await context.stdout.write(`> `)
        
        const line = await handle.readLine()
        await context.stderr.write(`You typed: '${line}'\n`)

        if (line === "exit") {
            await context.stdout.write("Goodbye!\n")
            break
        }
    }
}
