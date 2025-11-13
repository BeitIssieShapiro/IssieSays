import { Image, ImageSize, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AwesomeButton from "react-native-really-awesome-button";

import { isRTL, translate } from "./lang";
import { increaseColor } from "./color-picker";
import { BACKGROUND } from "./settings";
import { AudioWaveForm } from "./audio-progress";
import { useCallback, useEffect, useRef, useState } from "react";
import { audioRecorderPlayer } from "./App";
import { playRecording, stopPlayback } from "./recording";
import { MyIcon } from "./common/icons";
import { denormOffset, FIX_IMAGE_SCALE, getIsMobile, isLandscape as isLandscapeUtil } from "./utils";

export const BTN_COLOR = "#6E6E6E";
const BTN_FOR_COLOR = "#CD6438";

export function Spacer({ h, w, bc }: { h?: Number, w?: Number, bc?: string }) {
    {/* @ts-ignore*/ }
    return <View style={{ height: h, width: w, backgroundColor: bc }} />
}

export function ColorButton({ callback, color, size, icon, index, iconColor }: any) {
    let borderStyle = {}
    if (isTooWhite(color)) {
        borderStyle = { borderWidth: 1, borderColor: "gray" }
    }

    return <TouchableOpacity
        onPress={callback}
        activeOpacity={0.7}
        key={"" + index}
    >
        <View style={[{
            backgroundColor: color,
            borderRadius: size / 2,
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center'

        }, borderStyle]}
        >

            {icon && <MyIcon info={{ type: "AntDesign", color: iconColor || "white", size: size / 2, name: icon }} />}

        </View>
    </TouchableOpacity>
}

export function getNumButtonsSelection(num: number, size: number) {
    const btnSize = (num == 1) ? size / 2 : size * .7 / 2
    return <RectView width={size} height={size}>
        {Array.from(Array(num).keys()).map((i: any) => (
            <View key={i} style={{ backgroundColor: "#2958af", borderRadius: btnSize / 2, width: btnSize, height: btnSize, margin: 5 }}>
            </View>
        ))}
    </RectView>
}

export function RectView({ children, width, height, buttonWidth, isLandscape }: any) {

    // Use utility function to detect mobile vs tablet/iPad
    const windowSize = { width, height };
    const isMobile = getIsMobile(windowSize);
    const isIPad = !isMobile;

   
    return <View style={{
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        alignContent: "center",
        width,
        height,

    }}>{children}
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
    </View >

}

export function MainButton({ name, showName, width, fontSize, raisedLevel, color, imageUrl, appBackground,
    showProgress, recName, onPlayComplete, imageOffset = { x: 0, y: 0 }, scale = 1, hMargin = 0,
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
    onPlayComplete?: () => void,
    imageOffset?: { x: number, y: number },
    scale?: number,
    hMargin?:number,
}) {
    const [playing, setPlaying] = useState<string | undefined>(undefined);
    const [playingInProgress, setPlayingInProgress] = useState(false);
    const [currDuration, setCurrDuration] = useState(0.0);
    const [duration, setDuration] = useState(0.0);
    const playCompleteSent = useRef<boolean>(false);

    const [imageSize, setImageSize] = useState<ImageSize>({ width: 500, height: 500 });

    useEffect(() => {
        if (imageUrl)
            Image.getSize(imageUrl).then((size) => setImageSize(size))
    }, [imageUrl]);

    const onStartPlay = useCallback(async () => {
        if (playingInProgress) return;
        playCompleteSent.current = false;

        const success = await playRecording(recName, (e) => {
            setCurrDuration(e.currentPosition);
            setDuration(e.duration);

            const newState = {
                currentPositionSec: e.currentPosition,
                currentDurationSec: e.duration,
                playTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
                duration: audioRecorderPlayer.mmssss(Math.floor(e.duration)),
            }
            if (e.currentPosition >= e.duration - 100) {
                // We’re within 100ms of the end → treat it as “finished”.
                setPlaying(undefined);
                setPlayingInProgress(false);
                stopPlayback();
                if (onPlayComplete && !playCompleteSent.current) {
                    onPlayComplete();
                    playCompleteSent.current = true;
                }

            }
            //setState(newState);
            console.log(newState)
            return;
        })
        if (success) {
            setPlaying(recName);
            setPlayingInProgress(true)
        } else {
            if (onPlayComplete) {
                onPlayComplete();
            }
        }
    }, [playing, playingInProgress, recName]);

    const cWidth = width * 5.5 / 6
    const actOffset = denormOffset(imageOffset, cWidth);
    const baseScale = cWidth / imageSize.height;
    const imageLeft = cWidth / 2 - imageSize.width * baseScale / 2;

    const footerHeight = cWidth / 5;

    //console.log("imgSize", (imageLeft + actOffset.x) * scale / cWidth)
    return (
        <View style={{ alignItems: "center", justifyContent: "center" , marginHorizontal:hMargin}}>
            <View style={{
                backgroundColor: color,
                width: width * 1.3,
                height: width * 1.3,
                padding: width * .15,
                borderRadius: width * 1.3 / 2,
            }}>
                <AwesomeButton
                    borderColor={color}
                    borderWidth={3}
                    backgroundColor={increaseColor(color, 15)}
                    backgroundDarker={color}
                    raiseLevel={raisedLevel}
                    width={width}
                    height={width}
                    borderRadius={width / 2}
                    onPress={onStartPlay}
                    animatedPlaceholder={false}
                    paddingHorizontal={0}
                    paddingTop={0}
                >
                    {imageUrl && imageUrl.length > 0 ? <View
                        style={{
                            overflow: 'hidden',
                            direction: "ltr",
                            width: cWidth,
                            height: cWidth,
                            borderRadius: cWidth / 2,
                            backgroundColor: "white"
                        }}
                    >
                        <Image source={{ uri: imageUrl }}
                            resizeMode="stretch"
                            style={{
                                transform: [
                                    //{ scale: FIX_IMAGE_SCALE },
                                    { translateX: imageLeft + actOffset.x },
                                    { translateY: actOffset.y },
                                    { scale: scale }
                                ],
                                width: imageSize.width * baseScale,
                                height: imageSize.height * baseScale,
                            }} />
                    </View> :
                        " "}

                </AwesomeButton>
            </View>

            {/* <View style={{ height: fontSize * 1.1, flexDirection: "row", alignItems: "center", justifyContent: "center" }}> */}
            {showName ?
                <Text allowFontScaling={false} style={{
                    fontSize,
                    textAlign: "center",
                    color: appBackground == BACKGROUND.LIGHT ? "black" : "white"
                }}>{name}</Text> :
                <Spacer h={fontSize} />
            }
            {/* </View> */}


            {showProgress && (playing ? <AudioWaveForm width={width} height={footerHeight} progress={duration && currDuration && currDuration / duration || 0} color={BTN_FOR_COLOR} baseColor={"lightgray"} /> :
                <Spacer h={footerHeight} />)}

        </View>

    )
}


export function isTooWhite(color: string) {
    try {
        const limit = 210;
        const bigint = parseInt(color.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return (r > limit && g > limit && b > limit);
    } catch (e) {
    }
    return false;
}
