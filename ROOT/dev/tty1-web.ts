export function write(text: string) {
    const terminal = document.getElementById('terminal');
    if (!terminal) {
        throw new Error("Terminal not found")
    }
    terminal.textContent += text;
    terminal.scrollTop = terminal.scrollHeight;
}
