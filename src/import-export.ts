import * as RNFS from "react-native-fs";
import path from "path";

import { ensureAndroidCompatible, joinPaths } from "./utils";
import { unzip, zip } from "react-native-zip-archive";
import { Folders, ListElements, Profile } from "./profile";
export function doNothing() { }

export function getTempFileName(ext: string) {
    const date = new Date()
    let fn = Math.random() + '-' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + ('0' + date.getDate()).slice(-2) + 'T' + ('0' + date.getHours()).slice(-2) + '-' + ('0' + date.getMinutes()).slice(-2) + '-' + ('0' + date.getSeconds()).slice(-2);

    return path.join(RNFS.TemporaryDirectoryPath, fn + "." + ext);
}


export async function exportProfile(name: string): Promise<string> {
    const metaDataFile = getTempFileName("json");

    const profilePath = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles, `${name}.json`);
    const fileContents = await RNFS.readFile(ensureAndroidCompatible(profilePath), 'utf8');
    const p: Profile = JSON.parse(fileContents);

    const metaData = {
        version: "1.0",
        type: "profile",
        name,
        ...p,
    }
    await RNFS.writeFile(metaDataFile, JSON.stringify(metaData, undefined, " "));

    const targetFile = ensureAndroidCompatible(joinPaths(RNFS.TemporaryDirectoryPath, "profile__" + name + ".says"));
    // delete if exists before
    await RNFS.unlink(ensureAndroidCompatible(targetFile)).catch(doNothing);

    return zip([ensureAndroidCompatible(metaDataFile)], targetFile);    
}

export async function exportAll(): Promise<string> {
    const files = [];

    const profileList = await ListElements(Folders.Profiles);
    for (const profileName of profileList) {
        files.push(
            (await exportProfile(profileName))
        );
    }

    const date = new Date()
    let fn = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + ('0' + date.getDate()).slice(-2) + ' ' + ('0' + date.getHours()).slice(-2) + '-' + ('0' + date.getMinutes()).slice(-2) + '-' + ('0' + date.getSeconds()).slice(-2);
    console.log("about to zip a says file", files)
    const targetPath = ensureAndroidCompatible(joinPaths(RNFS.TemporaryDirectoryPath, "IssieSays Backup-" + fn + ".says"));
    await RNFS.unlink(targetPath).catch(doNothing);

    return zip(files, targetPath).then(path => {
        return ensureAndroidCompatible(path);
    });
}

export interface ImportInfo {
    importedDice: string[];
    importedProfiles: string[];
    skippedExistingDice: string[];
    skippedExistingProfiles: string[];
}
/*
export async function importPackage(packagePath: string, importInfo: ImportInfo, subFolder = "") {
    const unzipTargetPath = ensureAndroidCompatible(joinPaths(RNFS.TemporaryDirectoryPath, "imported", subFolder));
    await RNFS.unlink(unzipTargetPath).catch(doNothing);
    const unzipFolderPath = await unzip(packagePath, unzipTargetPath);

    const items = await RNFS.readDir(ensureAndroidCompatible(unzipFolderPath));
    const metaDataItem = items.find(f => f.name.endsWith(".json") && !f.name.startsWith("face"));
    if (metaDataItem) {
        const metadataStr = await loadFile(metaDataItem.path);
        const md = JSON.parse(metadataStr);
        if (md.type == "dice") {
            const targetPath = getCustomTypePath(md.name)

            if (await RNFS.exists(ensureAndroidCompatible(targetPath))) {
                importInfo.skippedExistingDice.push(md.name);
                return;
            }

            await RNFS.mkdir(ensureAndroidCompatible(targetPath));
            for (const file of items.filter(item => item.name != metaDataItem.name)) {
                await RNFS.moveFile(ensureAndroidCompatible(file.path), ensureAndroidCompatible(targetPath + "/" + file.name)).catch(e => console.log("copy file on import failed", e));
            }
            importInfo.importedDice.push(md.name);
        } else if (md.type == "profile") {
            const targetPath = profileFilePath(md.name);
            if (await RNFS.exists(ensureAndroidCompatible(targetPath))) {
                importInfo.skippedExistingProfiles.push(md.name);
                return;
            }

            const p: Profile = {
                dice: md.dice,
                size: md.size,
                recoveryTime: md.recoveryTime,
                tableColor: md.tableColor,
                soundEnabled: md.soundEnabled
            }

            await saveProfileFile(md.name, p, true);
            importInfo.importedProfiles.push(md.name);
        } else {
            throw "Unknown package type";
        }
    } else {
        // list of zips
        let i = 0;
        for (const item of items) {
            await importPackage(item.path, importInfo, i++ + "");
        }
    }
}

*/