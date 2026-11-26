/**
 * Profiles on disk and the active profile in MMKV (pure logic, no rendering).
 * Uses the in-memory MMKV/file system of test-utils/app-mocks.
 */
require('../test-utils/app-mocks');

const RNFS = require('react-native-fs');
const profile = require('../src/profile');
const { Settings } = require('../src/setting-storage');
const { CURRENT_PROFILE, BUTTONS_NAMES } = require('../src/settings');

const btn = (over: any = {}) => ({
    name: 'כן', color: '#2E9E4A', imageUrl: '', imageB64: undefined, showName: true, recording: undefined,
    scale: 1, offset: { x: 0, y: 0 }, rotation: 0, dirty: false, ...over,
});
const readJson = (p: string) => JSON.parse(RNFS.__files.get(p));

beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => { });
    RNFS.__files.clear();
    await profile.Init(); // fresh MMKV instance
});

describe('active profile <-> settings', () => {
    test('writeCurrentProfile then readCurrentProfile round-trips every button field', async () => {
        const p = {
            oneAfterTheOther: true,
            buttons: [
                btn({ name: 'a', scale: 1.5, offset: { x: 0.1, y: -0.2 }, rotation: 90, dirty: true, imageUrl: 'a.jpg' }),
                btn({ name: 'b', color: '#123456', showName: false }),
            ],
        };
        await profile.writeCurrentProfile(p, 'mine');
        const back = profile.readCurrentProfile();

        expect(Settings.getString(CURRENT_PROFILE.name, '')).toBe('mine');
        expect(back.oneAfterTheOther).toBe(true);
        expect(back.buttons).toHaveLength(2);
        expect(back.buttons[0]).toMatchObject({ name: 'a', scale: 1.5, offset: { x: 0.1, y: -0.2 }, rotation: 90, dirty: true, imageUrl: 'a.jpg' });
        expect(back.buttons[1]).toMatchObject({ name: 'b', color: '#123456', showName: false });
        // audio/images are kept on disk, not in settings
        expect(back.buttons[0].recording).toBeUndefined();
    });

    test('recordings are written per button index, and removed for buttons without one', async () => {
        RNFS.__files.set('/docs/1.mp4', 'old');
        RNFS.__files.set('/docs/5.mp4', 'stale');
        await profile.writeCurrentProfile({ oneAfterTheOther: false, buttons: [btn({ recording: 'UkVD' }), btn({ recording: '' })] }, 'p');

        expect(RNFS.__files.get('/docs/0.mp4')).toBe('REC'); // base64 "UkVD"
        expect(RNFS.__files.has('/docs/1.mp4')).toBe(false);
        expect(RNFS.__files.has('/docs/5.mp4')).toBe(false); // buttons beyond the profile are cleared
    });

    test('an embedded image is restored to disk only if missing', async () => {
        RNFS.__files.set('/docs/keep.png', 'mine');
        await profile.writeCurrentProfile({
            oneAfterTheOther: false,
            buttons: [btn({ imageUrl: 'keep.png', imageB64: 'b3RoZXI=' }), btn({ imageUrl: 'new.png', imageB64: 'bmV3' })],
        }, 'p');
        expect(RNFS.__files.get('/docs/keep.png')).toBe('mine');
        expect(RNFS.__files.get('/docs/new.png')).toBe('new');
    });

    test('first run reads a single default button and marks the default profile current', () => {
        const p = profile.readCurrentProfile();
        expect(p.buttons).toHaveLength(1);
        expect(Settings.getString(CURRENT_PROFILE.name, '')).toBe('DefaultProfile');
    });
});

describe('profile files', () => {
    test('SaveProfile embeds the current audio and images; a profile import does not', async () => {
        RNFS.__files.set('/docs/0.mp4', 'REC');
        RNFS.__files.set('/docs/img.png', 'IMG');
        await profile.SaveProfile('p', { oneAfterTheOther: false, buttons: [btn({ imageUrl: 'img.png' })] });
        expect(readJson('/docs/profiles/p.json').buttons[0]).toMatchObject({ recording: 'UkVD', imageB64: 'SU1H' });

        await profile.SaveProfile('imported', { oneAfterTheOther: false, buttons: [btn({ recording: 'X' })] }, false, false, true);
        expect(readJson('/docs/profiles/imported.json').buttons[0].recording).toBe('X');
    });

    test('SaveProfile validates names and protects existing and reserved ones', async () => {
        const p = profile.newProfile();
        await expect(profile.SaveProfile('a/b', p)).rejects.toBeInstanceOf(profile.InvalidFileName);
        await expect(profile.SaveProfile('   ', p)).rejects.toBeInstanceOf(profile.InvalidFileName);
        await expect(profile.SaveProfile('DefaultProfile', p)).rejects.toBeInstanceOf(profile.ReservedFileName);
        await profile.SaveProfile('x', p);
        await expect(profile.SaveProfile('x', p)).rejects.toBeInstanceOf(profile.AlreadyExists);
        await expect(profile.saveProfileAs('x', 'x')).rejects.toBeInstanceOf(profile.AlreadyExists);
        await expect(profile.saveProfileAs('x', 'DefaultProfile')).rejects.toBeInstanceOf(profile.ReservedFileName);
    });

    test('LoadProfile saves the active profile before switching', async () => {
        await profile.writeCurrentProfile({ oneAfterTheOther: false, buttons: [btn({ name: 'edited' })] }, 'first');
        await profile.SaveProfile('second', { oneAfterTheOther: true, buttons: [btn({ name: 's1' }), btn({ name: 's2' })] }, false, false, true);

        await profile.LoadProfile('second');

        expect(readJson('/docs/profiles/first.json').buttons[0].name).toBe('edited');
        expect(Settings.getString(CURRENT_PROFILE.name, '')).toBe('second');
        expect(Settings.getArray(BUTTONS_NAMES.name, 'string', []).slice(0, 2)).toEqual(['s1', 's2']);
    });

    test('rename with overwrite replaces the target (iOS moveFile fails on an existing file)', async () => {
        await profile.SaveProfile('a', profile.newProfile(), false, false, true);
        await profile.SaveProfile('b', { oneAfterTheOther: true, buttons: [] }, false, false, true);
        await expect(profile.renameProfile('a', 'b')).rejects.toBeInstanceOf(profile.AlreadyExists);
        await profile.renameProfile('a', 'b', true);
        expect(RNFS.__files.has('/docs/profiles/a.json')).toBe(false);
        expect(readJson('/docs/profiles/b.json').oneAfterTheOther).toBe(false);
    });

    test('ListElements lists json files, default profile first', async () => {
        for (const n of ['zz', 'DefaultProfile', 'aa']) RNFS.__files.set(`/docs/profiles/${n}.json`, '{}');
        RNFS.__files.set('/docs/profiles/readme.txt', '');
        expect(await profile.ListElements('profiles')).toEqual(['DefaultProfile', 'aa', 'zz']);
    });
});

describe('button templates', () => {
    test('saveButton2 takes the recording from disk when re-recorded, else keeps the loaded one', async () => {
        RNFS.__files.set('/docs/rec7.mp4', 'NEW');
        await profile.saveButton2({ ...btn({ name: 't1', dirty: true }), audioName: 'rec7' }, 0);
        const saved = await profile.loadButton2('t1');
        expect(saved).toMatchObject({ name: 't1', dirty: false, recording: 'TkVX' });
        expect(saved.audioName).toBeUndefined();

        await profile.saveButton2(btn({ name: 't2', recording: 'OLD' }), 0);
        expect((await profile.loadButton2('t2')).recording).toBe('OLD');

        await expect(profile.saveButton2(btn({ name: 't2' }), 0)).rejects.toBeInstanceOf(profile.AlreadyExists);
        await expect(profile.saveButton2(btn({ name: 'a?' }), 0)).rejects.toBeInstanceOf(profile.InvalidFileName);
    });
});
