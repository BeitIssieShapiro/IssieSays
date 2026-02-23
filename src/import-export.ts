import * as RNFS from "react-native-fs";
import path from "path";

import { ensureAndroidCompatible, joinPaths } from "./utils";
import { unzip, zip } from "react-native-zip-archive";
import { AlreadyExists, Folders, ListElements, Profile, SaveProfile } from "./profile";
import { translate } from "./lang";
export function doNothing() { }

export function getTempFileName(ext: string) {
    const date = new Date()
    let fn = Math.random() + '-' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + ('0' + date.getDate()).slice(-2) + 'T' + ('0' + date.getHours()).slice(-2) + '-' + ('0' + date.getMinutes()).slice(-2) + '-' + ('0' + date.getSeconds()).slice(-2);

    return path.join(RNFS.TemporaryDirectoryPath, fn + "." + ext);
}

export function loadFile(path: string) {
    return RNFS.readFile(ensureAndroidCompatible(path), 'utf8');
}


export async function exportProfile(name: string, onProgress?: (percent: number) => void): Promise<string> {
    onProgress?.(10);
    const profilePath = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles, `${name}.json`);
    const fileContents = await RNFS.readFile(ensureAndroidCompatible(profilePath), 'utf8');
    const p: Profile = JSON.parse(fileContents);

    onProgress?.(30);
    const metaData = {
        version: "1.0",
        type: "profile",
        name,
        ...p,
    }
    const metadataTargetFile = ensureAndroidCompatible(joinPaths(RNFS.TemporaryDirectoryPath, "metadata__" + name + ".json"))
    await RNFS.writeFile(metadataTargetFile, JSON.stringify(metaData, undefined, " "));
    onProgress?.(60);
    const targetFile = ensureAndroidCompatible(joinPaths(RNFS.TemporaryDirectoryPath, "profile__" + name + ".says"));
    // delete if exists before
    await RNFS.unlink(ensureAndroidCompatible(targetFile)).catch(doNothing);

    onProgress?.(80);
    return zip([metadataTargetFile], targetFile).then((result) => {
        onProgress?.(100);
        return result;
    });
}

export async function exportAll(onProgress?: (percent: number) => void): Promise<string> {
    const files = [];

    onProgress?.(5);
    const profileList = await ListElements(Folders.Profiles);
    const totalProfiles = profileList.length;

    for (let i = 0; i < profileList.length; i++) {
        const profileName = profileList[i];
        files.push(
            (await exportProfile(profileName))
        );
        // Progress from 10% to 80% based on profile export completion
        const percent = 10 + Math.floor((i + 1) / totalProfiles * 70);
        onProgress?.(percent);
    }

    onProgress?.(85);
    const date = new Date()
    let fn = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + ('0' + date.getDate()).slice(-2) + ' ' + ('0' + date.getHours()).slice(-2) + '-' + ('0' + date.getMinutes()).slice(-2) + '-' + ('0' + date.getSeconds()).slice(-2);
    console.log("about to zip a says file", files)
    const targetPath = ensureAndroidCompatible(joinPaths(RNFS.TemporaryDirectoryPath, "IssieSays Backup-" + fn + ".says"));
    await RNFS.unlink(targetPath).catch(doNothing);

    onProgress?.(90);
    return zip(files, targetPath).then(path => {
        onProgress?.(100);
        return ensureAndroidCompatible(path);
    });
}

export interface ImportInfo {
    importedProfiles: string[];
    skippedExistingProfiles: string[];
}

export async function importPackage(packagePath: string, importInfo: ImportInfo, subFolder = "") {
    const unzipTargetPath = ensureAndroidCompatible(joinPaths(RNFS.TemporaryDirectoryPath, "imported", subFolder));
    await RNFS.unlink(unzipTargetPath).catch(doNothing);
    if (packagePath.startsWith("file://")) {
        packagePath = packagePath.substring(7);
    }
    const unzipFolderPath = await unzip(packagePath, unzipTargetPath);

    const items = await RNFS.readDir(ensureAndroidCompatible(unzipFolderPath));
    const metaDataItem = items.find(f => f.name.startsWith("metadata__"));
    if (metaDataItem) {
        const metadataStr = await loadFile(metaDataItem.path);
        const md = JSON.parse(metadataStr);
        if (md.type == "profile") {
            const name = md.name;
            const p: Profile = {
                buttons: md.buttons,
                oneAfterTheOther: md.oneAfterTheOther,
            };
            try {
                await SaveProfile(name, p, false, true, true);
                importInfo.importedProfiles.push(md.name);
            } catch (err) {
                if (err instanceof AlreadyExists) {
                    importInfo.skippedExistingProfiles.push(md.name);
                    return;
                }
            }

        } else {
            throw translate("UnknownPackageType");
        }
    } else {
        // list of zips
        let i = 0;
        for (const item of items) {
            await importPackage(item.path, importInfo, i++ + "");
        }
    }
}

