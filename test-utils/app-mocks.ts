/**
 * Shared mocks for rendering the real Settings screen in Jest.
 * Native modules are stubbed; MMKV and the file system are in-memory fakes that
 * behave like the real ones where it matters (MMKV throws on non-primitive values).
 * Require this before any app module.
 */
import { act } from '@testing-library/react-native';

// Any property is a component that renders its children, and also callable as a function.
function stubModule(overrides: Record<string, any> = {}) {
    const R = require('react');
    const make = (name: string) => {
        const C: any = (props: any) => R.createElement(R.Fragment, null, props?.children ?? null);
        C.displayName = name;
        return C;
    };
    const target: any = { __esModule: true, ...overrides };
    return new Proxy(target, {
        get(t, prop: string) {
            if (prop in t) return t[prop];
            if (prop === 'then') return undefined;
            t[prop] = make(String(prop));
            return t[prop];
        },
    });
}

jest.doMock('react-native-mmkv', () => {
    class MMKV {
        // seeded from global.__mmkvSeed, so a test can start from a captured install
        map = new Map<string, any>(Object.entries((global as any).__mmkvSeed || {}));
        set(key: string, v: any) {
            if (!['boolean', 'number', 'string'].includes(typeof v)) {
                throw new Error("MMKV::set: 'value' argument is not of type bool, number, string or buffer!");
            }
            this.map.set(key, v);
        }
        getString(k: string) { const v = this.map.get(k); return typeof v === 'string' ? v : undefined; }
        getNumber(k: string) { const v = this.map.get(k); return typeof v === 'number' ? v : undefined; }
        getBoolean(k: string) { const v = this.map.get(k); return typeof v === 'boolean' ? v : undefined; }
        delete(k: string) { this.map.delete(k); }
        getAllKeys() { return [...this.map.keys()]; }
    }
    return { MMKV };
});

jest.doMock('react-native-fs', () => {
    const files = new Map<string, string>();
    const dirs = new Set<string>(['/docs', '/tmp', '/bundle']);
    const norm = (p: string) => p.replace(/^file:\/\//, '').replace(/\/+/g, '/');
    const missing = (p: string) => Promise.reject(new Error('ENOENT ' + p));
    return {
        __files: files,
        DocumentDirectoryPath: '/docs',
        TemporaryDirectoryPath: '/tmp',
        MainBundlePath: '/bundle',
        exists: async (p: string) => files.has(norm(p)) || dirs.has(norm(p)),
        mkdir: async (p: string) => { dirs.add(norm(p)); },
        // files are kept as text; base64 reads/writes convert like the native side does
        readFile: async (p: string, enc?: string) => !files.has(norm(p)) ? missing(p) :
            enc == 'base64' ? Buffer.from(files.get(norm(p))!, 'utf8').toString('base64') : files.get(norm(p)),
        writeFile: async (p: string, c: string, enc?: string) => {
            files.set(norm(p), enc == 'base64' ? Buffer.from(c, 'base64').toString('utf8') : c);
        },
        unlink: async (p: string) => files.delete(norm(p)) ? undefined : missing(p),
        moveFile: async (a: string, b: string) => {
            if (!files.has(norm(a))) return missing(a);
            files.set(norm(b), files.get(norm(a))!); files.delete(norm(a));
        },
        copyFile: async (a: string, b: string) => {
            if (!files.has(norm(a))) return missing(a);
            files.set(norm(b), files.get(norm(a))!);
        },
        copyFileAssets: async () => undefined,
        readDir: async (p: string) => {
            const d = norm(p).replace(/\/$/, '');
            return [...files.keys()].filter(f => f.startsWith(d + '/') && !f.slice(d.length + 1).includes('/'))
                .map(f => ({ name: f.slice(d.length + 1), path: f, isFile: () => true }));
        },
    };
});

jest.doMock('@beitissieshapiro/issie-shared', () => ({
    translate: (k: string) => k,
    fTranslate: (k: string, ...args: any[]) => [k, ...args].join(' '),
    isRTL: () => true,
    gCurrentLang: { languageTag: 'he' },
    initLang: () => undefined,
    loadLanguage: () => undefined,
    findMissingTranslations: () => [],
    MyIcon: () => null,
}));
jest.doMock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 1180, height: 820 }),
    SafeAreaProvider: ({ children }: any) => children,
}));
jest.doMock('react-native-toast-message', () => {
    const Toast: any = () => null;
    Toast.show = jest.fn();
    return { __esModule: true, default: Toast, BaseToast: () => null, ErrorToast: () => null, SuccessToast: () => null };
});
jest.doMock('react-native-really-awesome-button', () => {
    const R = require('react');
    return { __esModule: true, default: (p: any) => R.createElement(R.Fragment, null, typeof p.children === 'string' ? null : p.children) };
});
jest.doMock('react-native/Libraries/Settings/Settings', () => ({ __esModule: true, default: { get: () => undefined, set: () => undefined, watchKeys: () => 0, clearWatch: () => undefined } }));
jest.doMock('react-native-nitro-sound', () => ({ createSound: () => ({}) }));
jest.doMock(require('path').join(__dirname, '../src/common/icons'), () => ({ MyIcon: () => null, MyCloseIcon: () => null }));
for (const m of [
    'react-native-camera-kit', 'react-native-image-picker', 'react-native-permissions', 'react-native-progress',
    'react-native-share', 'react-native-splash-screen', 'react-native-svg', 'react-native-wheel-color-picker',
    'react-native-zip-archive', '@rneui/themed', 'react-native-localize', '@bam.tech/react-native-screen-sizer',
    'react-native-vector-icons/AntDesign', 'axios', '@react-native-community/image-editor',
]) {
    jest.doMock(m, () => stubModule({ getLocales: () => [{ languageTag: 'he' }], request: async () => 'granted', PERMISSIONS: { IOS: {}, ANDROID: {} }, RESULTS: {} }), { virtual: true });
}


export async function flush() {
    for (let i = 0; i < 10; i++) await act(async () => { await new Promise(r => setTimeout(r, 0)); });
}
