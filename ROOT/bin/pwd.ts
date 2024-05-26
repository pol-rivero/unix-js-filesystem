
export async function execute(): Promise<void> {
    const pwd = process.currentWorkingDirectory.absolutePath
    await process.stdout.write(`${pwd}\n`)
}
