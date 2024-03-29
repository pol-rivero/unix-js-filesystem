# Web sample

1. Install dependencies: `npm install`

2. Modify the I/O routines to match your setup. For this sample, do the following:
  - Open `ROOT/dev/tty0.ts` and `ROOT/dev/tty1.ts`
  - Remove the currently uncommented code
  - Uncomment the code that targets the browser

3. Parse the sample filesystem: `npm run build-web`

4. Start the server: `npm run start-web`

5. Open `http://localhost:8080` in your browser
