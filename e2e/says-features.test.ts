// IssieSays end to end: the settings (number of buttons, background, buttons layout), editing a button
// (name, color, recording), playing it on the main screen, "one after the other" mode, and keeping the
// settings after a restart. Runs on iPad simulators and Android tablets (see .detoxrc.js).
// Each step checks the app's state through hidden views (dev builds only): `main-state`
// ("buttons:2 shown:0,1 bg:dark names:Hello,- colors:..."), `settings-state`, `recorder-state` and
// `main-button-state-<n>` ("playing:1").
import { by, device, element, waitFor } from 'detox';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = process.env.E2E_SCREENSHOT_DIR;
const GREEN = '#20ad57';

type State = Record<string, string>;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function shot(name: string) {
  const file = await device.takeScreenshot(name);
  if (SCREENSHOT_DIR) fs.copyFileSync(file, path.join(SCREENSHOT_DIR, `${device.getPlatform()}-${name}.png`));
}

async function readLabel(id: string): Promise<State> {
  const attrs: any = await element(by.id(id)).getAttributes();
  const label: string = attrs.label ?? attrs.elements?.[0]?.label ?? '';
  return Object.fromEntries(label.split(' ').map(kv => {
    const i = kv.indexOf(':');
    return [kv.substring(0, i), kv.substring(i + 1)];
  }));
}

// waits until the state passes the check
async function expectLabel(id: string, what: string, check: (s: State) => boolean, timeout = 10000) {
  await waitFor(element(by.id(id))).toExist().withTimeout(timeout);
  const until = Date.now() + timeout;
  let s = await readLabel(id);
  while (!check(s) && Date.now() < until) {
    await sleep(300);
    s = await readLabel(id);
  }
  if (!check(s)) throw new Error(`${id}: expected ${what}, got ${JSON.stringify(s)}`);
  return s;
}

const mainState = (what: string, check: (s: State) => boolean, timeout?: number) =>
  expectLabel('main-state', what, check, timeout);
const settingsState = (what: string, check: (s: State) => boolean, timeout?: number) =>
  expectLabel('settings-state', what, check, timeout);

async function tapId(id: string, timeout = 5000) {
  await waitFor(element(by.id(id))).toExist().withTimeout(timeout);
  await sleep(300); // screens and pickers slide in
  await element(by.id(id)).tap();
}

// taps until the next element shows: while the keyboard is up, the first tap in a scroll view only
// closes the keyboard
async function tapUntil(id: string, nextId: string) {
  for (let i = 0; ; i++) {
    await tapId(id);
    try {
      await waitFor(element(by.id(nextId))).toExist().withTimeout(2000);
      return;
    } catch (e) {
      if (i >= 2) throw e;
    }
  }
}

// (in dev builds the settings button opens at once; in release it must be held for 3 seconds)
async function openSettings() {
  await tapId('settings-btn', 15000);
  await waitFor(element(by.id('settings-state'))).toExist().withTimeout(5000);
}

// a main-screen button: its face (the button library's own content view, in the buttons' order)
// takes the press
async function pressMainButton(i: number) {
  await element(by.id('aws-btn-content-view')).atIndex(i).tap();
}

async function closeSettings() {
  await tapId('screen-close-btn');
  await waitFor(element(by.id('main-state'))).toExist().withTimeout(5000);
}

describe('IssieSays', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true, launchArgs: { e2e: '1' },
      permissions: { microphone: 'YES', camera: 'YES', photos: 'YES' },
    });
    if (device.getPlatform() === 'android') {
      // (Detox's permissions option is iOS only)
      execSync(`adb -s ${device.id} shell pm grant com.IssieSays android.permission.RECORD_AUDIO`);
    }
    // The Nitro sound engine / RN 0.88.1 event loop keeps the main run loop active after
    // launch; disable synchronization for the initial wait so Detox can find the element.
    // Use 90s to cover cold Hermes bundle evaluation on the first run.
    await device.disableSynchronization();
    await waitFor(element(by.id('main-state'))).toExist().withTimeout(90000);
    await device.enableSynchronization();
  });

  it('starts with one button on a light background', async () => {
    await mainState('one button', s => s.buttons === '1' && s.shown === '0' && s.bg === 'light');
    await shot('start');
  });

  it('changes the number of buttons (1 to 4)', async () => {
    await openSettings();
    for (let i = 0; i < 4; i++) await tapId('buttons-plus'); // the 4th is beyond the maximum
    await settingsState('four buttons at most', s => s.buttons === '4');
    await tapId('buttons-minus');
    await tapId('buttons-minus');
    await settingsState('two buttons', s => s.buttons === '2');
  });

  it('edits a button: name, color and a recording', async () => {
    await tapId('edit-button-0');
    await waitFor(element(by.id('edit-button-name'))).toExist().withTimeout(5000);
    await element(by.id('edit-button-name')).clearText();
    await element(by.id('edit-button-name')).typeText('Hello');
    await tapUntil('edit-button-color', `color-${GREEN}`);
    await tapId(`color-${GREEN}`);

    // while recording, the app's timers keep it busy: Detox would wait for it to be idle
    await device.disableSynchronization();
    try {
      await sleep(500);
      await element(by.id('record-btn')).tap(); // start
      await sleep(2500);
      await element(by.id('record-btn')).tap(); // stop
      await sleep(1500);
    } finally {
      await device.enableSynchronization();
    }
    await expectLabel('recorder-state', 'a recording', s => s.exists === '1' && s.recording === '0');
    await shot('edit-button');

    await tapId('edit-button-save');
    await settingsState('the button named', s => s.names.split(',')[0] === 'Hello');
  });

  it('saves a button as a template, and shows it in the templates library', async () => {
    await tapId('edit-button-0');
    await waitFor(element(by.id('edit-button-name'))).toExist().withTimeout(5000);
    await element(by.id('edit-button-name')).tapReturnKey(); // (its keyboard covers the buttons)
    await tapId('save-template-btn');
    await sleep(1500);
    await tapId('templates-btn');
    // visible, not only there: the list used to keep no height when the panel opened
    await waitFor(element(by.id('picker-load-Hello'))).toBeVisible().withTimeout(5000);
    await shot('templates');
    await tapId('picker-close');
    await tapId('edit-button-cancel');
    await waitFor(element(by.id('settings-state'))).toExist().withTimeout(5000);
  });

  it('switches to a dark background', async () => {
    await tapId('bg-dark');
    await settingsState('a dark background', s => s.bg === 'dark');
  });

  it('shows the buttons on the main screen', async () => {
    await closeSettings();
    await mainState('two buttons, the first one edited', s => s.buttons === '2' && s.shown === '0,1' &&
      s.bg === 'dark' && s.names.split(',')[0] === 'Hello' && s.colors.split(',')[0] === GREEN);
    await shot('main');
  });

  it('plays a button\'s recording', async () => {
    await pressMainButton(0); // (Detox waits for the app to be idle: the short recording has played)
    await expectLabel('main-button-state-0', 'played once, and done', s => s.played === '1' && s.playing === '0', 15000);
  });

  it('shows one button after the other', async () => {
    await openSettings();
    await tapId('mode-one-by-one');
    await settingsState('one after the other', s => s.oneByOne === '1');
    await closeSettings();
    await mainState('only the first button', s => s.shown === '0');

    await pressMainButton(0);
    await device.disableSynchronization(); // (playback timers)
    try {
      await mainState('the next button, after the first played', s => s.shown === '1', 15000);
    } finally {
      await device.enableSynchronization();
    }
    await tapId('reset-btn');
    await mainState('the first button again', s => s.shown === '0');
  });

  it('keeps the settings after a restart', async () => {
    await device.launchApp({ newInstance: true, launchArgs: { e2e: '1' } });
    await device.disableSynchronization();
    await waitFor(element(by.id('main-state'))).toExist().withTimeout(90000);
    await device.enableSynchronization();
    await mainState('the same settings', s => s.buttons === '2' && s.bg === 'dark' && s.shown === '0' &&
      s.names.split(',')[0] === 'Hello', 20000);
  });

  it('restores the defaults', async () => {
    await openSettings();
    await tapId('mode-all');
    await tapId('bg-light');
    await tapId('buttons-minus');
    await settingsState('the defaults', s => s.buttons === '1' && s.bg === 'light' && s.oneByOne === '0');
    await closeSettings();
    await mainState('one button on a light background', s => s.buttons === '1' && s.bg === 'light');
  });
});
