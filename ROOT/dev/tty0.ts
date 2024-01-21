/* global process */

// IF YOU TARGET NODE.JS, KEEP THIS CODE

export async function read(): Promise<string> {
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding("utf8")
    return new Promise((resolve, reject) => {
        process.stdin.once("data", (data) => {
            process.stdin.pause()
            process.stdin.setRawMode(false)
            resolve(data.toString())
        })
    })
}

export function write(text: string) {
    process.stdout.write(text)
}


// IF YOU TARGET THE BROWSER, REMOVE THE CODE ABOVE AND UNCOMMENT THE CODE BELOW.
// CHANGE THE ELEMENT ID "terminal-element" TO THE ID OF YOUR TERMINAL ELEMENT.

// export async function read(): Promise<string> {
//     const terminal = document.getElementById("terminal-element")
//     if (!terminal) {
//         throw new Error("Terminal not found")
//     }
//     terminal.focus()
//     return new Promise((resolve, reject) => {
//         terminal.addEventListener("keypress", (event) => {
//             if (event.keyCode === 13) {
//                 const input = terminal.value
//                 terminal.value = ""
//                 resolve(input)
//             }
//         })
//     })
// }

// export function write(text: string) {
//     const terminal = document.getElementById("terminal-element")
//     if (!terminal) {
//         throw new Error("Terminal not found")
//     }
//     terminal.value += text
// }
