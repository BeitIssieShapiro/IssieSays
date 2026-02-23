import {
  Image,
  ImageSize,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AwesomeButton from 'react-native-really-awesome-button';

import { isRTL, translate } from './lang';
import { increaseColor } from './color-picker';
import { BACKGROUND } from './settings';
import { AudioWaveForm } from './audio-progress';
import { useCallback, useEffect, useRef, useState } from 'react';
import { audioRecorderPlayer, currentlyPlayingRecName, setCurrentlyPlaying } from './App';
import { playRecording, stopPlayback } from './recording';
import { MyIcon } from './common/icons';
import {
  denormOffset,
  FIX_IMAGE_SCALE,
  getIsMobile,
  isLandscape as isLandscapeUtil,
} from './utils';

export const BTN_COLOR = '#6E6E6E';
const BTN_FOR_COLOR = '#CD6438';

export function Spacer({ h, w, bc }: { h?: Number; w?: Number; bc?: string }) {
  {
    /* @ts-ignore*/
  }
  return <View style={{ height: h, width: w, backgroundColor: bc }} />;
}

export function ColorButton({
  callback,
  color,
  size,
  icon,
  index,
  iconColor,
}: any) {
  let borderStyle = {};
  if (isTooWhite(color)) {
    borderStyle = { borderWidth: 1, borderColor: 'gray' };
  }

  return (
    <TouchableOpacity onPress={callback} activeOpacity={0.7} key={'' + index}>
      <View
        style={[
          {
            backgroundColor: color,
            borderRadius: size / 2,
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
          },
          borderStyle,
        ]}
      >
        {icon && (
          <MyIcon
            info={{
              type: 'AntDesign',
              color: iconColor || 'white',
              size: size / 2,
              name: icon,
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

export function getNumButtonsSelection(num: number, size: number) {
  const btnSize = num == 1 ? size / 2 : (size * 0.7) / 2;
  return (
    <RectView width={size} height={size}>
      {Array.from(Array(num).keys()).map((i: any) => (
        <View
          key={i}
          style={{
            backgroundColor: '#2958af',
            borderRadius: btnSize / 2,
            width: btnSize,
            height: btnSize,
            margin: 5,
          }}
        ></View>
      ))}
    </RectView>
  );
}

export function RectView({
  children,
  width,
  height,
  buttonWidth,
  isLandscape,
}: any) {
  // Use utility function to detect mobile vs tablet/iPad
  const windowSize = { width, height };
  const isMobile = getIsMobile(windowSize);
  const isIPad = !isMobile;

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        width,
        height,
      }}
    >
      {children}
      {/* <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <View style={{
                width,
                alignItems: "center", justifyContent: "center",
                backgroundColor: "yellow", borderWidth: 1, borderStyle: "solid",
                flexDirection:"row",
                // flexDirection: !isLandscape && (children.length < 3 || children.length === 3) ? "column" : (isRTL() ? "row-reverse" : "row")
            }}>
                {children[0]}
                {children.length > 1 && <Spacer w={space} h={space} />}
                {children.length > 1 && children[1]}
                {children.length === 3 && <Spacer w={space} h={space} />} 
                {children.length === 3 && children[2]}
            </View>

            {children.length > 3 && <View style={{ flexDirection: (isRTL() ? "row-reverse" : "row") }}>
                {children[2]}
                {children.length > 3 && <Spacer w={space} h={space} />}
                {children.length > 3 && children[3]}
            </View>}

        </View> */}
    </View>
  );
}

export function MainButton({
  name,
  showName,
  width,
  fontSize,
  raisedLevel,
  color,
  imageUrl,
  appBackground,
  showProgress,
  recName,
  onPlayComplete,
  imageOffset = { x: 0, y: 0 },
  scale = 1,
  rotation = 0,
  hMargin = 0,
}: {
  width: number;
  raisedLevel: number;
  fontSize: number;
  color: string;
  name: string;
  showName: boolean;
  imageUrl?: string;
  appBackground: string;
  showProgress: boolean;
  recName: string;
  onPlayComplete?: () => void;
  imageOffset?: { x: number; y: number };
  scale?: number;
  rotation?: number;
  hMargin?: number;
}) {
  const [playing, setPlaying] = useState<string | undefined>(undefined);
  const [currDuration, setCurrDuration] = useState(0.0);
  const [duration, setDuration] = useState(0.0);
  const playCompleteSent = useRef<boolean>(false);
  const isOperating = useRef<boolean>(false);
  const onPlayCompleteRef = useRef(onPlayComplete);

  const [imageSize, setImageSize] = useState<ImageSize>({
    width: 500,
    height: 500,
  });

  // Keep onPlayCompleteRef up to date
  useEffect(() => {
    onPlayCompleteRef.current = onPlayComplete;
  }, [onPlayComplete]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (currentlyPlayingRecName === recName) {
        console.log(`MainButton ${recName} unmounting while playing, stopping playback`);
        stopPlayback();
      }
    };
  }, [recName]);

  useEffect(() => {
    if (imageUrl) Image.getSize(imageUrl).then(size => setImageSize(size));
  }, [imageUrl]);

  const onStartPlay = useCallback(async () => {
    const clickTime = Date.now();
    console.log(`[${clickTime}] Button ${recName} clicked - isOperating: ${isOperating.current}, currentlyPlaying: ${currentlyPlayingRecName}`);

    // Prevent multiple simultaneous operations
    if (isOperating.current) {
      console.log(`[${clickTime}] Button ${recName} operation already in progress, ignoring click`);
      return;
    }

    // If this button is already playing, ignore
    // Check global state (more reliable than local state due to async updates)
    if (currentlyPlayingRecName === recName) {
      console.log(`[${clickTime}] Button ${recName} already playing (global check), ignoring click`);
      return;
    }

    isOperating.current = true;
    console.log(`[${clickTime}] Button ${recName} starting operation, isOperating set to true`);

    try {
      playCompleteSent.current = false;

      const success = await playRecording(
        recName,
        e => {
          // Only update state if this button is still the active playback
          if (currentlyPlayingRecName !== recName) {
            console.log(
              `Ignoring callback for ${recName}, currently playing: ${currentlyPlayingRecName}`,
            );
            return;
          }

          setCurrDuration(e.currentPosition);
          setDuration(e.duration);

          const newState = {
            currentPositionSec: e.currentPosition,
            currentDurationSec: e.duration,
            playTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
            duration: audioRecorderPlayer.mmssss(Math.floor(e.duration)),
          };
          if (e.currentPosition >= e.duration - 100) {
            const finishTime = Date.now();
            // We're within 100ms of the end → treat it as "finished".
            console.log(`[${finishTime}] Button ${recName} audio finished, clearing global state immediately`);
            // Clear global state immediately so button becomes responsive
            setCurrentlyPlaying(null);
            setPlaying(undefined);
            stopPlayback(); // Clean up player resources (async, but state already cleared)
            if (onPlayCompleteRef.current && !playCompleteSent.current) {
              onPlayCompleteRef.current();
              playCompleteSent.current = true;
            }
          }
          //setState(newState);
          console.log(newState);
          return;
        },
        () => {
          console.log(`Button ${recName} interrupted callback fired`);
          setPlaying(undefined);
        },
      );
      console.log(`[${clickTime}] Button ${recName} playRecording returned, success: ${success}`);
      if (success) {
        setPlaying(recName);
      } else {
        if (onPlayCompleteRef.current) {
          onPlayCompleteRef.current();
        }
      }
    } catch (error) {
      console.error(`Error in onStartPlay for ${recName}:`, error);
      setPlaying(undefined);
    } finally {
      isOperating.current = false;
      console.log(`[${clickTime}] Button ${recName} operation complete, isOperating set to false`);
    }
  }, [recName]);

  const cWidth = (width * 5.5) / 6;
  const actOffset = denormOffset(imageOffset, cWidth);
  const baseScale = cWidth / imageSize.height;
  const imageLeft = cWidth / 2 - (imageSize.width * baseScale) / 2;

  const footerHeight = cWidth / 5;

  //console.log("imgSize", (imageLeft + actOffset.x) * scale / cWidth)
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        margin: hMargin, // Use margin on all sides for consistent spacing
        alignSelf: 'center',
      }}
    >
      <View
        style={{
          backgroundColor: color,
          width: width * 1.3,
          height: width * 1.3,
          padding: width * 0.15,
          borderRadius: (width * 1.3) / 2,

        }}
      >
        <AwesomeButton
          borderColor={color}
          borderWidth={3}
          backgroundColor={increaseColor(color, 15)}
          backgroundDarker={color}
          raiseLevel={raisedLevel}
          width={width}
          height={width}
          borderRadius={width / 2}
          onPress={(next) => {
            console.log(`[${Date.now()}] AwesomeButton onPress fired for ${recName}`);
            onStartPlay();
            if (next) next();
          }}
          animatedPlaceholder={false}
          springRelease={false}
          paddingHorizontal={0}
          paddingTop={0}
        >
          {imageUrl && imageUrl.length > 0 ? (
            <View
              style={{
                overflow: 'hidden',
                direction: 'ltr',
                width: cWidth,
                height: cWidth,
                borderRadius: cWidth / 2,
                backgroundColor: 'white',
              }}
            >
              <Image
                source={{ uri: imageUrl }}
                resizeMode="stretch"
                style={{
                  transform: [
                    //{ scale: FIX_IMAGE_SCALE },
                    { translateX: imageLeft + actOffset.x },
                    { translateY: actOffset.y },
                    { scale: scale },
                    { rotate: `${rotation}deg` },
                  ],
                  width: imageSize.width * baseScale,
                  height: imageSize.height * baseScale,
                }}
              />
            </View>
          ) : (
            ' '
          )}
        </AwesomeButton>
      </View>

      {/* <View style={{ height: fontSize * 1.1, flexDirection: "row", alignItems: "center", justifyContent: "center" }}> */}
      {showName ? (
        <View style={{
          position: 'relative',
          width: width * 1.3, // Fixed width, not maxWidth
          overflow: 'hidden',
          borderRadius: fontSize * 0.3,
          borderWidth: showProgress && playing ? 2 : 0,
          borderColor: appBackground == BACKGROUND.LIGHT ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.4)',
        }}>
          {/* Progress bar background when playing */}
          {showProgress && playing && (() => {
            const progress = (duration && currDuration && (currDuration / duration) * 100) || 0;
            console.log('Progress:', progress, 'currDuration:', currDuration, 'duration:', duration);
            return (
              <View style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${Math.min(100, progress)}%`,
                backgroundColor: appBackground == BACKGROUND.LIGHT ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)',
              }} />
            );
          })()}
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            // ellipsizeMode="tail"
            style={{
              fontSize,
              textAlign: 'center',
              color: appBackground == BACKGROUND.LIGHT ? 'black' : 'white',
              paddingHorizontal: fontSize * 0.5,
              paddingVertical: fontSize * 0.2,
            }}
          >
            {name}
          </Text>
        </View>
      ) : (
        // When name is not shown, display AudioWaveForm in the name's position
        showProgress && playing ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', height: fontSize * 1.2 }}>
            <AudioWaveForm
              width={width / 2}
              height={fontSize * 0.8}
              progress={
                (duration && currDuration && currDuration / duration) || 0
              }
              color={BTN_FOR_COLOR}
              baseColor={'lightgray'}
            />
          </View>
        ) : (
          <Spacer h={fontSize} />
        )
      )}
      {/* </View> */}


    </View>
  );
}

export function isTooWhite(color: string) {
  try {
    const limit = 210;
    const bigint = parseInt(color.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return r > limit && g > limit && b > limit;
  } catch (e) { }
  return false;
}
