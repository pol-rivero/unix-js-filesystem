# Device files

Programs communicate with the user through device files. By default, the used files are `stdin`, `stdout` and `stderr`.
This template assumes that unix.js is being executed in a browser. If you want to use it in a Node.js environment delete the files `stdin.ts`, `stdout.ts` and `stderr.ts` and replace them with the ones in the `node` directory.

TODO: Implement node.js device files
