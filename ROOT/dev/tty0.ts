/* global process */

// IF YOU TARGET NODE.JS, KEEP THIS CODE

export async function read(): Promise<string> {
    process.stdin.resume()
    return new Promise(resolve => {
        process.stdin.once("data", text => {
            process.stdin.pause()
            resolve(text.toString())
        })
    })
}

export function write(text: string) {
    process.stdout.write(text)
}


// IF YOU TARGET THE BROWSER, REMOVE THE CODE ABOVE AND UNCOMMENT THE CODE BELOW.

// export async function read(): Promise<string> {
//     const keyBuffer = window.KEY_BUFFER;
//     while (keyBuffer.length === 0) {
//         await new Promise(resolve => setTimeout(resolve, 10));
//     }
//     return keyBuffer.shift();
// }

// export function write(text: string) {
//     const terminal = document.getElementById('terminal');
//     if (!terminal) {
//         throw new Error("Terminal not found")
//     }
//     terminal.textContent += text;
//     terminal.scrollTop = terminal.scrollHeight;
// }
