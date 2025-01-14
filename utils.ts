import { Platform } from "react-native";

export function joinPaths(...segments:string[]) {
    return segments
        .map((seg) => seg.replace(/\/+$/, ""))
        .join("/");
}

export function ensureAndroidCompatible(path:string, forceFilePrefix?:boolean):string {
    if ((forceFilePrefix || Platform.OS === 'android') && !path.startsWith("file")) {
        return "file://" + path
    }
    return path
}