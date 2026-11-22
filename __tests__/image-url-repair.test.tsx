/**
 * The 1.0 -> 2.0 migration cut picture-search URLs to "<id>?download=false" (seen in an
 * exported profile from a tester). Startup repairs them once, in settings and profile files.
 */
(global as any).__mmkvSeed = {
    'settings-version': '2.0',
    'current_profile': 'שלום',
    'buttons': 2,
    'buttons_image_urls': 2,
    'buttons_image_urls_0': '37848?download=false',
    'buttons_image_urls_1': 'camera_1763800000000.jpg',
};
require('../test-utils/app-mocks');

const RNFS = require('react-native-fs');
RNFS.__files.set('/docs/profiles/שלום.json', JSON.stringify({
    oneAfterTheOther: false,
    buttons: [
        { color: '#20ad57', name: 'סוכות', imageUrl: '37848?download=false', showName: true, recording: '', offset: { x: 0, y: 0 }, scale: 1, rotation: 0, dirty: false },
        { color: '#C8572A', name: 'חג שמח לכולם', imageUrl: '', showName: true, recording: '', offset: { x: 0, y: 0 }, scale: 1, rotation: 0, dirty: true },
    ],
}));

test('cut picture-search URLs are repaired at startup, local files are left alone', async () => {
    const profile = require('../src/profile');
    await profile.Init();

    const buttons = profile.readCurrentProfile().buttons;
    expect(buttons[0].imageUrl).toBe('https://api.arasaac.org/api/pictograms/37848?download=false');
    expect(buttons[1].imageUrl).toBe('camera_1763800000000.jpg');

    const saved = JSON.parse(RNFS.__files.get('/docs/profiles/שלום.json'));
    expect(saved.buttons[0].imageUrl).toBe('https://api.arasaac.org/api/pictograms/37848?download=false');
    expect(saved.buttons[1].name).toBe('חג שמח לכולם');
});
