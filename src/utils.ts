import { Platform, PermissionsAndroid, ImageSize } from "react-native";
import * as RNFS from "react-native-fs";


export interface WinSize {
  width: number;
  height: number;
}
export type Point = { x: number; y: number };

export function joinPaths(...segments: string[]) {
  return segments
    .map((seg) => seg.replace(/\/+$/, ""))
    .join("/");
}

export function ensureAndroidCompatible(path: string, forceFilePrefix?: boolean): string {
  if ((forceFilePrefix || Platform.OS === 'android') && !path.startsWith("file")) {
    return "file://" + path
  }
  return path
}

export const getIsMobile = (windowSize: ImageSize) => windowSize.width < 500 || windowSize.height < 500;
export const isLandscape = (windowSize: ImageSize) => windowSize.width > windowSize.height

export const normOffset = (offset: Point, size: number) => ({ x: offset.x / size, y: offset.y / size });
export const denormOffset = (offset: Point, size: number) => ({ x: offset.x * size, y: offset.y * size });
export const FIX_IMAGE_SCALE = 0.86;


export async function requestAudioPermission() {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Permission to use audio recorder',
          message: 'We need your permission to record audio.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the recorder');
        return true;
      } else {
        console.log('RECORD_AUDIO permission denied');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true; // iOS auto-allows if you declared NSMicrophoneUsageDescription
}
// react-native-fs converts utf8 text with a slow JS codec (seconds for a profile with photos),
// so JSON files go through its native base64 path and the engine's atob/btoa instead
export async function readJsonFile(path: string): Promise<any> {
  const bin = atob(await RNFS.readFile(ensureAndroidCompatible(path), 'base64'));
  // utf8 bytes -> string, only needed when there are non-ascii chars
  return JSON.parse(/[\x80-\xff]/.test(bin) ? decodeURIComponent(escape(bin)) : bin);
}

export function writeJsonFile(path: string, data: any, space?: string): Promise<void> {
  // non-ascii chars are written as \uXXXX escapes, keeping the file ascii (still valid utf8 JSON)
  const ascii = JSON.stringify(data, undefined, space).replace(/[\u0080-￿]/g,
    c => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"));
  return RNFS.writeFile(ensureAndroidCompatible(path), btoa(ascii), 'base64');
}
