import * as RNFS from "react-native-fs";
import path from "path";

import { ensureAndroidCompatible, joinPaths, readJsonFile, writeJsonFile } from "./utils";
import { unzip, zip } from "react-native-zip-archive";
import { AlreadyExists, Folders, ListElements, Profile, SaveProfile, writeCurrentProfile } from "./profile";
import { Settings } from "./setting-storage";
import { CURRENT_PROFILE } from "./settings";
import { translate } from "./lang";
import { stampPackage } from "@beitissieshapiro/issie-shared";
export function doNothing() { }

export function getTempFileName(ext: string) {
    const date = new Date()
    let fn = Math.random() + '-' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + ('0' + date.getDate()).slice(-2) + 'T' + ('0' + date.getHours()).slice(-2) + '-' + ('0' + date.getMinutes()).slice(-2) + '-' + ('0' + date.getSeconds()).slice(-2);

    return path.join(RNFS.TemporaryDirectoryPath, fn + "." + ext);
}


// file functions with a position (read/write) want a plain path, without file://
export const plainPath = (p: string) => p.startsWith("file://") ? p.substring(7) : p;

// lets other Issie apps tell this is an IssieSays file; the export works without it
async function stampAsIssieSays(zipPath: string, kind: string) {
    await stampPackage(RNFS, plainPath(zipPath), { app: "issiesays", kind })
        .catch(e => console.log("stamp package failed", zipPath, e));
}

export async function exportProfile(name: string, onProgress?: (percent: number) => void): Promise<string> {
    onProgress?.(10);
    const profilePath = path.join(RNFS.DocumentDirectoryPath, Folders.Profiles, `${name}.json`);
    const p: Profile = await readJsonFile(profilePath);

    onProgress?.(30);
    const metaData = {
        version: "1.0",
        type: "profile",
        name,
        ...p,
    }
    const metadataTargetFile = ensureAndroidCompatible(joinPaths(RNFS.TemporaryDirectoryPath, "metadata__" + name + ".json"))
    await writeJsonFile(metadataTargetFile, metaData, " ");
    onProgress?.(60);
    const targetFile = ensureAndroidCompatible(joinPaths(RNFS.TemporaryDirectoryPath, "profile__" + name + ".zip"));
    // delete if exists before
    await RNFS.unlink(ensureAndroidCompatible(targetFile)).catch(doNothing);

    onProgress?.(80);
    const result = await zip([metadataTargetFile], targetFile);
    await stampAsIssieSays(result, "profile");
    onProgress?.(100);
    return result;
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
    const targetPath = ensureAndroidCompatible(joinPaths(RNFS.TemporaryDirectoryPath, "IssieSays Backup-" + fn + ".zip"));
    await RNFS.unlink(targetPath).catch(doNothing);

    onProgress?.(90);
    const result = await zip(files, targetPath);
    await stampAsIssieSays(result, "backup");
    onProgress?.(100);
    return ensureAndroidCompatible(result);
}

export interface ImportInfo {
    importedProfiles: string[];
    skippedExistingProfiles: string[];
    failedProfiles: string[];
}

export async function importPackage(packagePath: string, importInfo: ImportInfo, subFolder = "", overwrite = false) {
    const unzipTargetPath = ensureAndroidCompatible(joinPaths(RNFS.TemporaryDirectoryPath, "imported", subFolder));
    await RNFS.unlink(unzipTargetPath).catch(doNothing);
    if (packagePath.startsWith("file://")) {
        packagePath = packagePath.substring(7);
    }
    const unzipFolderPath = await unzip(packagePath, unzipTargetPath);

    const items = await RNFS.readDir(ensureAndroidCompatible(unzipFolderPath));
    const metaDataItem = items.find(f => f.name.startsWith("metadata__"));
    if (metaDataItem) {
        const md = await readJsonFile(metaDataItem.path);
        if (md.type == "profile") {
            const name = md.name;
            const p: Profile = {
                buttons: md.buttons,
                oneAfterTheOther: md.oneAfterTheOther,
            };
            try {
                await SaveProfile(name, p, overwrite, true, true);
                if (name == Settings.getString(CURRENT_PROFILE.name, "")) {
                    // the active profile lives in settings, not in its file - without this the
                    // next profile switch would save the old buttons over what was just imported
                    await writeCurrentProfile(p, name);
                }
                importInfo.importedProfiles.push(md.name);
            } catch (err) {
                if (err instanceof AlreadyExists) {
                    importInfo.skippedExistingProfiles.push(md.name);
                } else {
                    console.log("import profile failed", md.name, err);
                    importInfo.failedProfiles.push(md.name);
                }
            }

        } else {
            throw translate("UnknownPackageType");
        }
    } else {
        // list of zips
        let i = 0;
        for (const item of items) {
            // ignore folders and stray files (e.g. __MACOSX, .DS_Store when re-zipped on a mac)
            if (!item.isFile() || !item.name.toLowerCase().endsWith(".zip")) continue;
            await importPackage(item.path, importInfo, i++ + "", overwrite);
        }
    }
}

