import * as RNFS from 'react-native-fs';
import * as path from 'path';
import { BUTTONS, BUTTONS_COLOR, BUTTONS_IMAGE_URLS, BUTTONS_NAMES, BUTTONS_SHOW_NAMES, CURRENT_PROFILE, getSetting } from './settings';
import { BTN_BACK_COLOR } from './App';
import Button from 'react-native-really-awesome-button';
import { Settings } from 'react-native';

const enum Folders {
    Profiles = "profiles",
    Buttons = "buttons",
}

export class AlreadyExists extends Error { }

export interface Button {
    index: number;
    name: string;
    color?: string;
    imageUrl: string;
    showName: boolean;
    recording: string; // base64 of the audio binary
}

export interface Profile {
    buttons: Button[]
}

export const getRecordingFileName = (recName: string | number) => {
    return RNFS.DocumentDirectoryPath + "/" + recName + ".mp4";
}

export async function Init() {
    const profilePath = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles);
    const exists = await RNFS.exists(profilePath);
    if (!exists) {
        await RNFS.mkdir(profilePath);
    }
}

export async function SaveProfile(name: string, p: Profile, overwrite = false) {
    // todo verify name is a valid file name
    const profilePath = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles, `${name}.json`);
    if (!overwrite) {
        if (await RNFS.exists(profilePath)) {
            throw new AlreadyExists(name);
        }
    }

    const profileToSave = { ...p, buttons: [] } as Profile;
    // load the audio into the json
    for (const btn of p.buttons) {
        const audioB64 = await RNFS.exists(getRecordingFileName(btn.index)) ?
            await RNFS.readFile(getRecordingFileName(btn.index), 'base64') :
            "";
        profileToSave.buttons.push({
            ...btn,
            recording: audioB64,
        } as Button);
    }

    const str = JSON.stringify(profileToSave);
    return RNFS.writeFile(profilePath, str, 'utf8');
}

export async function renameProfile(previousName: string, newName: string) {
    const prevPath = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles, `${previousName}.json`);
    const newPath = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles, `${newName}.json`);
    if (await RNFS.exists(newPath)) {
        throw new AlreadyExists(newName);
    }

    // only rename if file existed
    if (await RNFS.exists(prevPath)) {
        await RNFS.moveFile(prevPath, newPath);
    }
}

export async function verifyProfileNameFree(name: string) {
    const p = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles, `${name}.json`);
    if (await RNFS.exists(p)) {
        throw new AlreadyExists(name);
    }
}

export async function LoadProfile(name: string) {

    // First saves current (if named)
    const currName = getSetting(CURRENT_PROFILE.name, "");
    if (currName.length) {
        console.log("Save profile", currName);
        const currentProfile = await readCurrentProfile();
        await SaveProfile(currName, currentProfile, true);
    }

    const profilePath = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles, `${name}.json`);
    const fileContents = await RNFS.readFile(profilePath, 'utf8');
    const p: Profile = JSON.parse(fileContents);

    console.log("Loaded profile", name, "btnCount",p.buttons.length);

    Settings.set({ [CURRENT_PROFILE.name]: name });

    p.buttons.sort((b1, b2) => b1.index - b2.index);

    Settings.set({ [BUTTONS.name]: p.buttons.length });
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
            if (btn.recording.length > 0) {
                await RNFS.writeFile(getRecordingFileName(i), btn.recording, 'base64');
            } else {
                try {
                    await RNFS.unlink(getRecordingFileName(i));
                } catch (e) { }
            }
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

    Settings.set({
        [BUTTONS_COLOR.name]: buttonColors,
        [BUTTONS_IMAGE_URLS.name]: buttonImageUrls,
        [BUTTONS_SHOW_NAMES.name]: buttonShowNames,
        [BUTTONS_NAMES.name]: buttonTexts,
    });
}

export async function ListProfiles(): Promise<string[]> {
    const profilesPath = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles);
    console.log("Profiles Path", profilesPath);
    const dir = await RNFS.readDir(profilesPath);

    const profiles = [];
    for (const profileFile of dir) {
        console.log("profile", profileFile.name)
        if (profileFile.name.endsWith(".json")) {

            profiles.push(profileFile.name.substring(0, profileFile.name.length - 5));
        }
    }
    return profiles;
}


export function readCurrentProfile(): Profile {
    const numOfButtons: number = getSetting(BUTTONS.name, 1) as number;
    const buttonColors = getSetting(BUTTONS_COLOR.name, [BTN_BACK_COLOR, BTN_BACK_COLOR, BTN_BACK_COLOR, BTN_BACK_COLOR]);
    const buttonImageUrls = getSetting(BUTTONS_IMAGE_URLS.name, ["", "", "", ""]);
    const buttonShowNames = getSetting(BUTTONS_SHOW_NAMES.name, [false, false, false, false]);
    const buttonTexts = getSetting(BUTTONS_NAMES.name, ["", "", "", ""]);

    const buttons = [] as Button[];
    for (let i = 0; i < numOfButtons; i++) {
        buttons.push({
            color: buttonColors[i],
            index: i,
            name: buttonTexts[i],
            imageUrl: buttonImageUrls[i],
            showName: buttonShowNames[i],
            recording: "",
        });
    }

    return {
        buttons,
    };
}
