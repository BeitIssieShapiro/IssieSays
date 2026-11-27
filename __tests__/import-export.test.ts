/**
 * Export a profile / full backup and import it back (zip is simulated in memory:
 * zip() records which files went in, unzip() writes them back out).
 */
require('../test-utils/app-mocks');

// a "zip" file's content is "ZIP:<id>", so copies of it (e.g. inside an unzipped backup) unzip the same
const zips = new Map<string, { name: string; content: string }[]>();
jest.doMock('react-native-zip-archive', () => {
    const RNFS = require('react-native-fs');
    const norm = (p: string) => p.replace(/^file:\/\//, '').replace(/\/+/g, '/').replace(/\/$/, '');
    const base = (p: string) => p.substring(p.lastIndexOf('/') + 1);
    return {
        zip: jest.fn(async (files: string[], target: string) => {
            const id = 'ZIP:' + target;
            zips.set(id, files.map(f => ({ name: base(f), content: RNFS.__files.get(norm(f)) })));
            RNFS.__files.set(norm(target), id);
            return target;
        }),
        unzip: jest.fn(async (src: string, target: string) => {
            for (const e of zips.get(RNFS.__files.get(norm(src))) ?? []) RNFS.__files.set(`${norm(target)}/${e.name}`, e.content);
            return target;
        }),
    };
});
// app-mocks' issie-shared mock has no stampPackage; add it to that (already loaded) mock object
const stampPackage = jest.fn(async () => { });
require('@beitissieshapiro/issie-shared').stampPackage = stampPackage;

const RNFS = require('react-native-fs');
const profile = require('../src/profile');
const { Settings } = require('../src/setting-storage');
const { CURRENT_PROFILE, BUTTONS_NAMES } = require('../src/settings');
const { exportProfile, exportAll, importPackage } = require('../src/import-export');

const btn = (name: string) => ({
    name, color: '#C8572A', imageUrl: '', imageB64: undefined, showName: true, recording: 'UkVD',
    scale: 1, offset: { x: 0, y: 0 }, rotation: 0, dirty: false,
});
const saveFile = (name: string, buttons: any[]) =>
    RNFS.__files.set(`/docs/profiles/${name}.json`, JSON.stringify({ oneAfterTheOther: false, buttons }));
const emptyInfo = () => ({ importedProfiles: [], skippedExistingProfiles: [], failedProfiles: [] });

beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => { });
    RNFS.__files.clear();
    zips.clear();
    stampPackage.mockClear();
    await profile.Init();
});

test('exportProfile zips one metadata file, stamps it as IssieSays and reports progress', async () => {
    saveFile('חגים', [btn('סוכות')]);
    const progress: number[] = [];
    const out = await exportProfile('חגים', (p: number) => progress.push(p));

    expect(out).toBe('/tmp/profile__חגים.zip');
    const [entry] = zips.get('ZIP:' + out)!;
    expect(entry.name).toBe('metadata__חגים.json');
    expect(JSON.parse(entry.content)).toMatchObject({ type: 'profile', name: 'חגים', version: '1.0', buttons: [{ name: 'סוכות' }] });
    expect(stampPackage).toHaveBeenCalledWith(expect.anything(), out, { app: 'issiesays', kind: 'profile' });
    expect(progress).toEqual([10, 30, 60, 80, 100]);
});

test('a failing stamp does not fail the export', async () => {
    saveFile('p', [btn('x')]);
    stampPackage.mockRejectedValueOnce(new Error('no positional write'));
    await expect(exportProfile('p')).resolves.toBe('/tmp/profile__p.zip');
});

test('backup (exportAll) -> import restores every profile; existing ones are skipped unless overwrite', async () => {
    saveFile('DefaultProfile', [btn('home')]);
    saveFile('a', [btn('a1')]);
    saveFile('b', [btn('b1'), btn('b2')]);
    const backup = await exportAll();
    expect(zips.get('ZIP:' + backup)!.map(e => e.name).sort()).toEqual(['profile__DefaultProfile.zip', 'profile__a.zip', 'profile__b.zip']);
    expect(stampPackage).toHaveBeenLastCalledWith(expect.anything(), backup, { app: 'issiesays', kind: 'backup' });

    // a fresh device that only has "a"
    for (const k of [...RNFS.__files.keys()]) if (k.startsWith('/docs/profiles/')) RNFS.__files.delete(k);
    saveFile('a', [btn('local')]);

    const info = emptyInfo();
    await importPackage(backup, info);
    expect(info.importedProfiles.sort()).toEqual(['DefaultProfile', 'b']);
    expect(info.skippedExistingProfiles).toEqual(['a']);
    expect(JSON.parse(RNFS.__files.get('/docs/profiles/a.json')).buttons[0].name).toBe('local');
    expect(JSON.parse(RNFS.__files.get('/docs/profiles/b.json')).buttons).toHaveLength(2);

    const again = emptyInfo();
    await importPackage(backup, again, '', true);
    expect(again.importedProfiles).toContain('a');
    expect(JSON.parse(RNFS.__files.get('/docs/profiles/a.json')).buttons[0].name).toBe('a1');
});

test('importing over the active profile updates the settings too', async () => {
    await profile.writeCurrentProfile({ oneAfterTheOther: false, buttons: [btn('before')] }, 'active');
    saveFile('active', [btn('from file')]);
    const zip = await exportProfile('active');
    RNFS.__files.set('/docs/profiles/active.json', '{}');

    await importPackage(zip, emptyInfo(), '', true);

    expect(Settings.getString(CURRENT_PROFILE.name, '')).toBe('active');
    expect(Settings.getArray(BUTTONS_NAMES.name, 'string', [])[0]).toBe('from file');
});

test('a backup re-zipped on a Mac (stray files) still imports; unknown package types are rejected', async () => {
    saveFile('p', [btn('x')]);
    const inner = await exportProfile('p');
    RNFS.__files.delete('/docs/profiles/p.json');
    zips.set('ZIP:mac', [{ name: 'profile__p.zip', content: RNFS.__files.get(inner) }, { name: '.DS_Store', content: 'junk' }]);
    RNFS.__files.set('/tmp/mac.zip', 'ZIP:mac');

    const info = emptyInfo();
    await importPackage('file:///tmp/mac.zip', info);
    expect(info.importedProfiles).toEqual(['p']);

    zips.set('ZIP:dice', [{ name: 'metadata__x.json', content: JSON.stringify({ type: 'dice' }) }]);
    RNFS.__files.set('/tmp/dice.zip', 'ZIP:dice');
    await expect(importPackage('/tmp/dice.zip', emptyInfo())).rejects.toBe('UnknownPackageType');
});
