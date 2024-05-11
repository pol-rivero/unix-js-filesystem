
export async function execute() {
    const pwd = process.currentWorkingDirectory.absolutePath
    await process.stdout.write(`${pwd}\n`)
}
