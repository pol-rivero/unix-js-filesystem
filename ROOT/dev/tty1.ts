/* global process */

// IF YOU TARGET NODE.JS, KEEP THIS CODE

export function write(text: string) {
    process.stderr.write(text)
}


// IF YOU TARGET THE BROWSER, REMOVE THE CODE ABOVE AND UNCOMMENT THE CODE BELOW.

// export function write(text: string) {
//     const terminal = document.getElementById('terminal');
//     if (!terminal) {
//         throw new Error("Terminal not found")
//     }
//     terminal.textContent += text;
//     terminal.scrollTop = terminal.scrollHeight;
// }
