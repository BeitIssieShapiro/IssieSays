// App hides the splash after a minimum time. A file that launched the app waits for it:
// an alert or modal shown while the splash is still closing is dropped by iOS.
let markClosed: () => void = () => { };
const closed = new Promise<void>(resolve => (markClosed = resolve));

export const splashClosed = () => markClosed();
export const whenSplashClosed = () => closed.then(() => new Promise<void>(r => setTimeout(r, 1000)));
