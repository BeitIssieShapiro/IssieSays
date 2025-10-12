import { Platform, PermissionsAndroid, ImageSize } from "react-native";


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

export const normOffset = (offset:Point, size:number)=> ({x:offset.x/size, y:offset.y/size});
export const denormOffset = (offset:Point, size:number)=> ({x:offset.x*size, y:offset.y*size});

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