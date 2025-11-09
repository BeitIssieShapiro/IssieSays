import * as RNFS from 'react-native-fs';
import * as path from 'path';
import { BACKGROUND, BUTTONS, BUTTONS_COLOR, BUTTONS_DIRTY, BUTTONS_IMAGE_URLS, BUTTONS_NAMES, BUTTONS_OFFSET_X, BUTTONS_OFFSET_Y, BUTTONS_SCALES, BUTTONS_SHOW_NAMES, CURRENT_PROFILE, INSTALL, LAST_COLORS, ONE_AFTER_THE_OTHER } from './settings';
import Button from 'react-native-really-awesome-button';
import { Settings } from './setting-storage';
import { Platform, Settings as RNSettings } from 'react-native'
import { MMKV } from 'react-native-mmkv';
import { ensureAndroidCompatible, joinPaths } from './utils';
import { DefaultProfileName } from './profile-picker';
import { EditedButton } from './edit-button';
import { colors } from './common/common-style';
import { Point } from 'react-native-svg/lib/typescript/elements/Shape';
import { gCurrentLang, translate } from './lang';
import { doNothing } from './import-export';

export const enum Folders {
    Profiles = "profiles",
    Buttons = "buttons",
}

export class AlreadyExists extends Error { }
export class InvalidFileName extends Error { }
export class ReservedFileName extends Error { }


export const InvalidCharachters = "<, >, :, \", /, \, |, ?, *,"

export interface Button {
    // index: number;
    name: string;
    color: string;
    imageUrl: string;
    imageB64: string | undefined;
    showName: boolean;
    recording: string | undefined; // base64 of the audio binary

    scale: number;
    offset: Point;
    dirty: boolean;
}

export interface Profile {
    oneAfterTheOther: boolean;
    buttons: Button[]
}

export const getRecordingFileName = (recName: string | number, forceFilePrefix?: boolean) => {
    return ensureAndroidCompatible(joinPaths(RNFS.DocumentDirectoryPath, recName + ".mp4"), forceFilePrefix);
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
        let oneAfterTheOther = false;
        if (numOfButtons >= 1 && numOfButtons <= 4) {
            console.log("migrating old persistancy", numOfButtons)
            const currName = getSetting(CURRENT_PROFILE.name, "");

            // move settings:
            const buttonColors = getSetting(BUTTONS_COLOR.name, [
                colors.defaultVoiceButtonBGColor,
                colors.defaultVoiceButtonBGColor,
                colors.defaultVoiceButtonBGColor,
                colors.defaultVoiceButtonBGColor,
            ]);
            const buttonImageUrls = getSetting(BUTTONS_IMAGE_URLS.name, ["", "", "", ""]);
            const buttonShowNames = getSetting(BUTTONS_SHOW_NAMES.name, [false, false, false, false]);
            const buttonTexts = getSetting(BUTTONS_NAMES.name, ["", "", "", ""]);

            const buttons = [] as Button[];
            for (let i = 0; i < numOfButtons; i++) {
                buttons.push({
                    color: buttonColors[i],
                    name: buttonTexts[i],
                    imageUrl: buttonImageUrls[i],
                    imageB64: undefined,
                    showName: buttonShowNames[i],
                    recording: undefined,
                    scale: 1,
                    offset: { x: 0, y: 0 },
                    dirty: false,
                });
            }

            writeCurrentProfile({ buttons, oneAfterTheOther }, currName);

            RNSettings.set({ [BUTTONS.name]: 0 })


            const bg = RNSettings.get(BACKGROUND.name);
            if (bg) {
                Settings.set(BACKGROUND.name, bg);
            }

            const lastColors = getSetting(LAST_COLORS.name);
            if (lastColors) {
                Settings.setArray(LAST_COLORS.name, lastColors);
            }
            console.log("Migration of Settings completed!")
        } else {
            console.log("Persistancy is new")
        }
    }
    const numOfButtons = Settings.getNumber(BUTTONS.name, -1);
    const settingsVersion = Settings.getString(INSTALL.version, "1.0");

    if (numOfButtons == -1) {
        const filePath = getRecordingFileName(0);
        if (Platform.OS == 'android') {
            await RNFS.copyFileAssets(`welcome_${gCurrentLang}.mp4`, filePath)
        } else {
            const sourcePath = `${RNFS.MainBundlePath}/welcome_${gCurrentLang}.mp4`;
            await RNFS.copyFile(sourcePath, filePath).catch(doNothing); // probably already exists
        }
        Settings.setArray(BUTTONS_NAMES.name, [(translate("Welcome"))]);
        Settings.setArray(BUTTONS_SHOW_NAMES.name, [true]);
        Settings.set(INSTALL.fresh, false);
        Settings.set(INSTALL.version, "2.0");
    } else if (settingsVersion == "1.0") {
        // migrate persistency
        // update the imageUrl of the current
        const buttonImageUrls = Settings.getArray<string>(BUTTONS_IMAGE_URLS.name, "string", ["", "", "", ""]);
        for (let i = 0; i < buttonImageUrls.length; i++) {
            if (buttonImageUrls[i].length > 0 && !buttonImageUrls[i].startsWith("http")) {
                buttonImageUrls[i] = buttonImageUrls[i].split('/').pop() || ""; // Extract the file name
            }
        }
        Settings.setArray(BUTTONS_IMAGE_URLS.name, buttonImageUrls);

        // iterate over all profiles and migrate them
        const listPath = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles);
        const dir = await RNFS.readDir(ensureAndroidCompatible(listPath));

        for (const elem of dir) {
            if (elem.name.endsWith(".json")) {
                await migrateProfile_1_to_2(elem.path);
            }
        }
        Settings.set(INSTALL.fresh, false);
        Settings.set(INSTALL.version, "2.0");

        // Migrate to home profile
        const currName = Settings.getString(CURRENT_PROFILE.name, "");
        if (currName == "") return;

        const p = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles, `${DefaultProfileName}.json`);
        const homeExists = await RNFS.exists(ensureAndroidCompatible(p));
        if (!homeExists) {
            // Add the home profile - empty:
            createHomeProfile();
            console.log("Home profile created")
        } else {
            console.log("Home profile exists")
        }
    }
}

export function getImagePath(fileName?: string, addFilePrefix = true): string {
    if (!fileName || fileName.length == 0) {
        return "";
    }
    if (fileName.startsWith("http")) return fileName;

    if (addFilePrefix)
        return path.join("file://", RNFS.DocumentDirectoryPath, fileName);

    return ensureAndroidCompatible(path.join(RNFS.DocumentDirectoryPath, fileName));
}

export async function file2base64(filePath: string): Promise<string> {
    if (await RNFS.exists(filePath)) {
        return RNFS.readFile(filePath, 'base64')
    }
    return "";
}

async function migrateProfile_1_to_2(filePath: string) {
    const fileContents = await RNFS.readFile(ensureAndroidCompatible(filePath), 'utf8');
    const p: Profile = JSON.parse(fileContents);

    p.oneAfterTheOther = false;
    for (let btn of p.buttons) {
        btn.dirty = false;
        btn.offset = { x: 0, y: 0 };
        btn.scale = 1;
        btn.imageUrl = btn.imageUrl.split('/').pop() || "";
        btn.imageB64 = await file2base64(getImagePath(btn.imageUrl, false))
    }

    return RNFS.writeFile(ensureAndroidCompatible(filePath), JSON.stringify(p, undefined, " "), 'utf8');
}

export async function SaveProfile(name: string, p: Profile, overwrite = false, allowDefProfile = false) {
    if (!isValidFilename(name)) {
        throw new InvalidFileName(name);
    }
    if (!allowDefProfile && name.trim() == DefaultProfileName) {
        throw new ReservedFileName();
    }

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

        const imageB64 = await RNFS.exists(getImagePath(btn.imageUrl, false)) ?
            await file2base64(getImagePath(btn.imageUrl, false)) :
            undefined;

        profileToSave.buttons.push({
            ...btn,
            recording: audioB64,
            imageB64,
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

export async function deleteProfile(name: string) {
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
        await SaveProfile(currName, currentProfile, true, true);
    }

    const profilePath = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles, `${name}.json`);
    const fileContents = await RNFS.readFile(ensureAndroidCompatible(profilePath), 'utf8');
    const p: Profile = JSON.parse(fileContents);

    return writeCurrentProfile(p, name);
}

export async function saveProfileAs(srcName: string, targetName: string) {
    if (targetName == DefaultProfileName) {
        throw new ReservedFileName();
    }

    if (!isValidFilename(targetName)) {
        throw new InvalidFileName(targetName);
    }

    const targetProfilePath = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles, `${targetName}.json`);
    if (await RNFS.exists(ensureAndroidCompatible(targetProfilePath))) {
        throw new AlreadyExists(targetName);
    }

    const srcProfilePath = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles, `${srcName}.json`);
    return RNFS.copyFile(srcProfilePath, targetProfilePath);
}

export function newProfile(): Profile {
    return {
        oneAfterTheOther: false,
        buttons: [
            {
                color: colors.defaultVoiceButtonBGColor,
                imageUrl: "",
                showName: false,
                name: "",
                recording: "", // will delete the file
            }
        ]
    } as Profile;
}

export async function createHomeProfile() {
    const p = newProfile()

    SaveProfile(DefaultProfileName, p, true, true);
}

export async function createNewProfile(name: string) {
    const p = newProfile()

    return SaveProfile(name, p, true, false);
}

async function writeCurrentProfile(p: Profile, name: string) {
    Settings.set(CURRENT_PROFILE.name, name);

    Settings.set(BUTTONS.name, p.buttons.length);
    Settings.set(ONE_AFTER_THE_OTHER.name, p.oneAfterTheOther);

    const buttonColors = [];
    const buttonImageUrls = [];
    const buttonShowNames = [];
    const buttonTexts = [];
    const buttonScales = [];
    const buttonOffsetsX = [];
    const buttonOffsetsY = [];

    for (let i = 0; i < 20; i++) {
        if (p.buttons.length > i) {
            const btn = p.buttons[i];
            buttonColors.push(btn.color);
            buttonImageUrls.push(btn.imageUrl);
            buttonShowNames.push(btn.showName);
            buttonTexts.push(btn.name);
            buttonScales.push(btn.scale);
            buttonOffsetsX.push(btn.offset.x);
            buttonOffsetsY.push(btn.offset.y);

            if (btn.recording && btn.recording.length > 0) {
                await RNFS.writeFile(getRecordingFileName(i), btn.recording, 'base64');
            } else if (btn.recording == "" || !btn.recording) {
                try {
                    await RNFS.unlink(getRecordingFileName(i));
                } catch (e) { }
            } // if btn.recording undefined do nothing

            if (btn.imageUrl && btn.imageB64 && btn.imageB64.length > 0) {
                // save image to disk if do not exist
                const imgPath = getImagePath(btn.imageUrl, false);
                if (!await RNFS.exists(imgPath)) {
                    await RNFS.writeFile(imgPath, imgPath, 'base64');
                }
            }
        } else {
            buttonColors.push(colors.defaultVoiceButtonBGColor);
            buttonImageUrls.push("");
            buttonShowNames.push(false);
            buttonTexts.push("");
            buttonScales.push(1);
            buttonOffsetsX.push(0);
            buttonOffsetsY.push(0);

            try {
                await RNFS.unlink(getRecordingFileName(i));
            } catch (e) { }
        }
    }

    Settings.setArray(BUTTONS_COLOR.name, buttonColors);
    Settings.setArray(BUTTONS_IMAGE_URLS.name, buttonImageUrls);
    Settings.setArray(BUTTONS_SHOW_NAMES.name, buttonShowNames);
    Settings.setArray(BUTTONS_NAMES.name, buttonTexts);
    Settings.setArray(BUTTONS_SCALES.name, buttonScales);
    Settings.setArray(BUTTONS_OFFSET_X.name, buttonOffsetsX);
    Settings.setArray(BUTTONS_OFFSET_Y.name, buttonOffsetsY);

}

export async function isEmptyButton(btn: Button, recName: string): Promise<boolean> {
    const recPath = getRecordingFileName(recName);

    return btn.name == "" &&
        btn.color == colors.defaultVoiceButtonBGColor &&
        btn.imageUrl == "" &&
        (btn.recording == undefined || btn.recording == "") &&
        RNFS.exists(recPath)
}

export function readCurrentProfile(): Profile {

    // Verify Default Profile
    const currName = Settings.getString(CURRENT_PROFILE.name, "");
    if (currName == "") {
        // this should happen once ever
        Settings.set(CURRENT_PROFILE.name, DefaultProfileName);
    }

    const numOfButtons = Settings.getNumber(BUTTONS.name, 1);
    const oneAfterTheOther = Settings.getBoolean(ONE_AFTER_THE_OTHER.name, false);
    const buttonColors = Settings.getArray<string>(BUTTONS_COLOR.name, "string", [colors.defaultVoiceButtonBGColor, colors.defaultVoiceButtonBGColor, colors.defaultVoiceButtonBGColor, colors.defaultVoiceButtonBGColor]);
    const buttonImageUrls = Settings.getArray<string>(BUTTONS_IMAGE_URLS.name, "string", ["", "", "", ""]);
    const buttonShowNames = Settings.getArray<boolean>(BUTTONS_SHOW_NAMES.name, "boolean", [false, false, false, false]);
    const buttonTexts = Settings.getArray<string>(BUTTONS_NAMES.name, "string", ["", "", "", ""]);
    const buttonScales = Settings.getArray<number>(BUTTONS_SCALES.name, "number", Array(numOfButtons).fill(1));
    const offsetX = Settings.getArray<number>(BUTTONS_OFFSET_X.name, "number", Array(numOfButtons).fill(0));
    const offsetY = Settings.getArray<number>(BUTTONS_OFFSET_Y.name, "number", Array(numOfButtons).fill(0));
    const dirty = Settings.getArray<boolean>(BUTTONS_DIRTY.name, "boolean", [false, false, false, false]);

    const buttons = [] as Button[];
    for (let i = 0; i < numOfButtons; i++) {

        // translate document path
        let imageUrl = buttonImageUrls[i] || "";

        buttons.push({
            color: buttonColors[i] || colors.defaultVoiceButtonBGColor,
            name: buttonTexts[i] || "",
            imageUrl,
            imageB64: undefined,
            showName: buttonShowNames[i] || false,
            recording: undefined,
            offset: { x: offsetX[i], y: offsetY[i] },
            scale: buttonScales[i],
            dirty: dirty[i],
        });
    }

    console.log("readCurrentProfile", buttons)

    return {
        oneAfterTheOther,
        buttons,
    };
}

export async function loadButton2(name: string) {
    console.log("Load Button", name)
    const buttonPath = path.join(RNFS.DocumentDirectoryPath, Folders.Buttons, `${name}.json`);
    const fileContents = await RNFS.readFile(ensureAndroidCompatible(buttonPath), 'utf8');
    return JSON.parse(fileContents);
}

export async function saveButton2(btn: EditedButton, index: number, overwrite = false) {
    if (!isValidFilename(btn.name)) {
        throw new InvalidFileName(btn.name);
    }

    const buttonPath = path.join(RNFS.DocumentDirectoryPath, Folders.Buttons, `${btn.name}.json`);
    console.log("save button", btn.name)
    if (!overwrite && await RNFS.exists(ensureAndroidCompatible(buttonPath))) {
        throw new AlreadyExists(btn.name);
    }

    const filePath = getRecordingFileName(btn.audioName ? btn.audioName : index + "");
    const audioB64 = await RNFS.exists(filePath) ?
        await RNFS.readFile(filePath, 'base64') :
        "";

    const btnToSave = {
        ...btn,
        dirty: false,
        recording: audioB64,
    }
    // voletile field
    delete btnToSave.audioName;

    const str = JSON.stringify(btnToSave);
    return RNFS.writeFile(ensureAndroidCompatible(buttonPath), str, 'utf8');
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
    if (folder == Folders.Profiles) {
        list.sort((a, b) => a == DefaultProfileName ? -1 : b == DefaultProfileName ? 1 : a.localeCompare(b));
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
