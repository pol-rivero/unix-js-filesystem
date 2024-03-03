import type { ExecutionContext } from "unix-core"

export function execute(context: ExecutionContext, args: string[]) {
    // TODO: implement

    const ioTest = context.resolvePath("/bin/testing/io-test").asFile()
    return ioTest.execute(context, ['character'])
}
