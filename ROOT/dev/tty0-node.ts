/* eslint-disable @typescript-eslint/no-namespace */

declare namespace globalThis {
    const KEY_BUFFER: string[]
}

export async function read(): Promise<string> {
    const keyBuffer = globalThis.KEY_BUFFER
    let result = keyBuffer.shift()
    while (!result) {
        await new Promise(resolve => {
            setTimeout(resolve, 10)
        })
        result = keyBuffer.shift()
    }
    return result
}

export function write(text: string): void {
    void process.stdout.write(text)
}
