/* eslint-disable @typescript-eslint/no-namespace */

declare namespace globalThis {
    const KEY_BUFFER: string[]
    const TERM_OBJECT: { write: (text: string) => void }
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
    globalThis.TERM_OBJECT.write(text)
}
