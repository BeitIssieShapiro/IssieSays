import * as RNFS from 'react-native-fs';
import * as path from 'path';
import { BACKGROUND, BUTTONS, BUTTONS_COLOR, BUTTONS_IMAGE_URLS, BUTTONS_NAMES, BUTTONS_SHOW_NAMES, CURRENT_PROFILE, INSTALL, LAST_COLORS } from './settings';
import { BTN_BACK_COLOR } from './App';
import Button from 'react-native-really-awesome-button';
import { Settings } from './setting-storage';
import { Platform, Settings as RNSettings } from 'react-native'
import { MMKV } from 'react-native-mmkv';
import { ensureAndroidCompatible, joinPaths } from './utils';
import { gCurrentLang } from './lang';

export const enum Folders {
    Profiles = "profiles",
    Buttons = "buttons",
}

export class AlreadyExists extends Error { }
export class InvalidFileName extends Error { }

export const InvalidCharachters = "<, >, :, \", /, \, |, ?, *,"

export interface Button {
    // index: number;
    name: string;
    color: string;
    imageUrl: string;
    showName: boolean;
    recording: string | undefined; // base64 of the audio binary
}

export interface Profile {
    buttons: Button[]
}

export const getRecordingFileName = (recName: string | number, forceFilePrefix?:boolean) => {
    return ensureAndroidCompatible(joinPaths(RNFS.DocumentDirectoryPath , recName + ".mp4"), forceFilePrefix);
}

export let storage: MMKV;

export async function Init() {

    console.log("Initializing MMKV storage");
    try {
        storage = new MMKV({
            id: 'IssieSaysStorage',
        });
        console.log("Initializing MMKV storage Success");

    } catch (e) {
        // https://github.com/mrousavy/react-native-mmkv/issues/776
        console.log("Initializing MMKV failed", e);
    }

    const profilesPath = ensureAndroidCompatible(path.join(RNFS.DocumentDirectoryPath, Folders.Profiles));
    const buttonsPath = ensureAndroidCompatible(path.join(RNFS.DocumentDirectoryPath, Folders.Buttons));
    let exists = await RNFS.exists(profilesPath);
    if (!exists) {
        await RNFS.mkdir(profilesPath);
    }
    exists = await RNFS.exists(buttonsPath);
    if (!exists) {
        await RNFS.mkdir(buttonsPath);
    }

    // Check If Migration is needed
    if (Platform.OS === 'ios') {
        function getSetting(name: string, def?: any): any {
            let setting = RNSettings.get(name);
            if (setting === undefined) {
                setting = def;
            }
            return setting;
        }

        const numOfButtons = RNSettings.get(BUTTONS.name);
        if (numOfButtons >= 1 && numOfButtons <= 4) {
            console.log("migrating old persistancy", numOfButtons)
            const currName = getSetting(CURRENT_PROFILE.name, "");

            // move settings:
            const buttonColors = getSetting(BUTTONS_COLOR.name, [BTN_BACK_COLOR, BTN_BACK_COLOR, BTN_BACK_COLOR, BTN_BACK_COLOR]);
            const buttonImageUrls = getSetting(BUTTONS_IMAGE_URLS.name, ["", "", "", ""]);
            const buttonShowNames = getSetting(BUTTONS_SHOW_NAMES.name, [false, false, false, false]);
            const buttonTexts = getSetting(BUTTONS_NAMES.name, ["", "", "", ""]);

            const buttons = [] as Button[];
            for (let i = 0; i < numOfButtons; i++) {
                buttons.push({
                    color: buttonColors[i],
                    name: buttonTexts[i],
                    imageUrl: buttonImageUrls[i],
                    showName: buttonShowNames[i],
                    recording: undefined,
                });
            }

            writeCurrentProfile({ buttons }, currName);

            RNSettings.set({ [BUTTONS.name]: 0 })


            const bg = RNSettings.get(BACKGROUND.name);
            if (bg) {
                Settings.set(BACKGROUND.name, bg);
            }

            const lastColors = getSetting(LAST_COLORS.name);
            if (lastColors) {
                Settings.setArray(LAST_COLORS.name, lastColors);
            }
            console.log("Migration Completed!")
        } else {
            console.log("Persistancy is new")
        }
    }

    const isFreshInstall = Settings.getBoolean(INSTALL.fresh, true);
    if (isFreshInstall) {
        const filePath = getRecordingFileName(0);
        RNFS.copyFileAssets(`welcome_${gCurrentLang}.mp4`, filePath)
        Settings.set(INSTALL.fresh, false);
    }
}


export async function SaveProfile(name: string, p: Profile, overwrite = false) {
    if (!isValidFilename(name)) {
        throw new InvalidFileName(name);
    }
    // todo verify name is a valid file name
    const profilePath = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles, `${name}.json`);
    if (!overwrite) {
        if (await RNFS.exists(ensureAndroidCompatible(profilePath))) {
            throw new AlreadyExists(name);
        }
    }

    const profileToSave = { ...p, buttons: [] } as Profile;
    // load the audio into the json
    let index = 0
    for (const btn of p.buttons) {
        const audioB64 = await RNFS.exists(getRecordingFileName(index)) ?
            await RNFS.readFile(getRecordingFileName(index), 'base64') :
            "";
        profileToSave.buttons.push({
            ...btn,
            recording: audioB64,
        } as Button);
        index++;
    }

    const str = JSON.stringify(profileToSave);
    return RNFS.writeFile(ensureAndroidCompatible(profilePath), str, 'utf8');
}

export async function renameProfile(previousName: string, newName: string, overwrite = false) {
    const prevPath = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles, `${previousName}.json`);
    const newPath = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles, `${newName}.json`);
    if (!overwrite && await RNFS.exists(ensureAndroidCompatible(newPath))) {
        throw new AlreadyExists(newName);
    }

    // only rename if file existed
    if (await RNFS.exists(ensureAndroidCompatible(prevPath))) {
        await RNFS.moveFile(ensureAndroidCompatible(prevPath), ensureAndroidCompatible(newPath));
    }
}

export async function deleteProfile(name:string) {
    const profilePath = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles, `${name}.json`);
    return RNFS.unlink(ensureAndroidCompatible(profilePath));
}

export async function verifyProfileNameFree(name: string) {
    console.log("verifyProfileNameFree", name)
    const p = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles, `${name}.json`);
    if (await RNFS.exists(ensureAndroidCompatible(p))) {
        throw new AlreadyExists(name);
    }
    console.log("verifyProfileNameFree OK")
}

export async function LoadProfile(name: string) {

    // First saves current (if named)
    const currName = Settings.getString(CURRENT_PROFILE.name, "");
    if (currName.length) {
        console.log("Save profile", currName);
        const currentProfile = await readCurrentProfile();
        await SaveProfile(currName, currentProfile, true);
    }

    if (name == "") {
        // create new profile
        await clearProfile()
        return;
    }

    const profilePath = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles, `${name}.json`);
    const fileContents = await RNFS.readFile(ensureAndroidCompatible(profilePath), 'utf8');
    const p: Profile = JSON.parse(fileContents);

    return writeCurrentProfile(p, name);
}

export async function clearProfile() {
    const p = {
        buttons: [
            {
                color:BTN_BACK_COLOR,
                imageUrl:"",
                showName:false,
                name:"",
                recording:"", // will delete the file
            }
        ]
    } as Profile;
    
    writeCurrentProfile(p, "");
}


async function writeCurrentProfile(p: Profile, name: string) {
    Settings.set(CURRENT_PROFILE.name, name);

    Settings.set(BUTTONS.name, p.buttons.length);
    const buttonColors = [];
    const buttonImageUrls = [];
    const buttonShowNames = [];
    const buttonTexts = [];

    for (let i = 0; i < 4; i++) {
        if (p.buttons.length > i) {
            const btn = p.buttons[i];
            buttonColors.push(btn.color);
            buttonImageUrls.push(btn.imageUrl);
            buttonShowNames.push(btn.showName);
            buttonTexts.push(btn.name);
            if (btn.recording && btn.recording.length > 0) {
                await RNFS.writeFile(getRecordingFileName(i), btn.recording, 'base64');
            } else if (btn.recording == "") {
                try {
                    await RNFS.unlink(getRecordingFileName(i));
                } catch (e) { }
            } // if btn.recording undefined do nothing
        } else {
            buttonColors.push(BTN_BACK_COLOR);
            buttonImageUrls.push("");
            buttonShowNames.push(false);
            buttonTexts.push("");
            try {
                await RNFS.unlink(getRecordingFileName(i));
            } catch (e) { }
        }
    }

    Settings.setArray(BUTTONS_COLOR.name, buttonColors);
    Settings.setArray(BUTTONS_IMAGE_URLS.name, buttonImageUrls);
    Settings.setArray(BUTTONS_SHOW_NAMES.name, buttonShowNames);
    Settings.setArray(BUTTONS_NAMES.name, buttonTexts);

}

export function readCurrentProfile(): Profile {
    const numOfButtons = Settings.getNumber(BUTTONS.name, 1);
    const buttonColors = Settings.getArray<string>(BUTTONS_COLOR.name, "string", [BTN_BACK_COLOR, BTN_BACK_COLOR, BTN_BACK_COLOR, BTN_BACK_COLOR]);
    const buttonImageUrls = Settings.getArray<string>(BUTTONS_IMAGE_URLS.name, "string", ["", "", "", ""]);
    const buttonShowNames = Settings.getArray<boolean>(BUTTONS_SHOW_NAMES.name, "boolean", [false, false, false, false]);
    const buttonTexts = Settings.getArray<string>(BUTTONS_NAMES.name, "string", ["", "", "", ""]);

    const buttons = [] as Button[];
    for (let i = 0; i < numOfButtons; i++) {
        buttons.push({
            color: buttonColors[i] || BTN_BACK_COLOR,
            name: buttonTexts[i] || "",
            imageUrl: buttonImageUrls[i] || "",
            showName: buttonShowNames[i] || false,
            recording: undefined,
        });
    }

    console.log("readCurrentProfile", buttons)

    return {
        buttons,
    };
}


export async function loadButton(name: string, index: number) {
    console.log("Load Button", name, index)
    const buttonPath = path.join(RNFS.DocumentDirectoryPath, Folders.Buttons, `${name}.json`);
    const fileContents = await RNFS.readFile(ensureAndroidCompatible(buttonPath), 'utf8');
    const newBtn: Button = JSON.parse(fileContents);

    const p = readCurrentProfile();
    p.buttons = p.buttons.map((btn, i) => i != index ? btn : newBtn);
    console.log("btns", p.buttons.map(b => b.name))
    const currName = Settings.getString(CURRENT_PROFILE.name, "");

    writeCurrentProfile(p, currName);

}

export async function saveButton(name: string, index: number, overwrite = false) {
    if (!isValidFilename(name)) {
        throw new InvalidFileName(name);
    }

    const buttonPath = path.join(RNFS.DocumentDirectoryPath, Folders.Buttons, `${name}.json`);
    console.log("save button", name)
    if (!overwrite && await RNFS.exists(ensureAndroidCompatible(buttonPath))) {
        throw new AlreadyExists(name);
    }

    const p = readCurrentProfile();
    const btn = p.buttons[index]
    if (btn) {

        const audioB64 = await RNFS.exists(getRecordingFileName(index)) ?
            await RNFS.readFile(getRecordingFileName(index), 'base64') :
            "";
        const btnToSave = {
            ...btn,
            recording: audioB64,
        }

        const str = JSON.stringify(btnToSave);
        return RNFS.writeFile(ensureAndroidCompatible(buttonPath), str, 'utf8');
    }
}

export async function deleteButton(name: string) {
    const buttonPath = path.join(RNFS.DocumentDirectoryPath, Folders.Buttons, `${name}.json`);
    return RNFS.unlink(ensureAndroidCompatible(buttonPath));
}


export async function ListElements(folder: Folders): Promise<string[]> {
    const listPath = path.join(RNFS.DocumentDirectoryPath, folder);
    console.log("List Path", folder);
    const dir = await RNFS.readDir(ensureAndroidCompatible(listPath));

    const list = [];
    for (const elem of dir) {
        //console.log("Element", elem.name)
        if (elem.name.endsWith(".json")) {

            list.push(elem.name.substring(0, elem.name.length - 5));
        }
    }
    return list;
}

export function isValidFilename(filename: string): boolean {
    const invalidCharsRegex = /[<>:"/\\|?*\x00-\x1F]/;

    if (invalidCharsRegex.test(filename)) {
        return false;
    }
    return true;
}