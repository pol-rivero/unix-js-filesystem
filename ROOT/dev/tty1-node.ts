export function write(text: string): void {
    void process.stderr.write(text)
}
