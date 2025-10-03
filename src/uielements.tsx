import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AwesomeButton from "react-native-really-awesome-button";

import { isRTL, translate } from "./lang";
import { increaseColor } from "./color-picker";
import { BACKGROUND } from "./settings";
import { AudioWaveForm } from "./audio-progress";
import { useCallback, useState } from "react";
import { audioRecorderPlayer } from "./App";
import { playRecording, stopPlayback } from "./recording";
import { MyIcon } from "./common/icons";

export const BTN_COLOR = "#6E6E6E";
const BTN_FOR_COLOR = "#CD6438";

export function Spacer({ h, w, bc }: { h?: Number, w?: Number, bc?: string }) {
    {/* @ts-ignore*/}
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

    const space = buttonWidth / 3;
    console.log("rectview", height)
    return <View style={{
        flexDirection: "column",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        alignContent: "center",
        width,
        height: height < 450 ? 450 : height,

    }}>
        <View style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <View style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: !isLandscape && children.length < 3 ? "column" : (isRTL() ? "row-reverse" : "row") }}>
                {children[0]}
                {children.length > 1 && <Spacer w={space} h={space} />}
                {children.length > 1 && children[1]}
            </View>

            {children.length > 2 && <View style={{ flexDirection: (isRTL() ? "row-reverse" : "row") }}>
                {children[2]}
                {children.length > 3 && <Spacer w={space} h={space} />}
                {children.length > 3 && children[3]}
            </View>}

        </View>
    </View >

}

export function MainButton({ name, showName, width, fontSize, raisedLevel, color, imageUrl, appBackground,
    showProgress, recName
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
}) {
    const [playing, setPlaying] = useState<string | undefined>(undefined);
    const [playingInProgress, setPlayingInProgress] = useState(false);
    const [currDuration, setCurrDuration] = useState(0.0);
    const [duration, setDuration] = useState(0.0);


    const onStartPlay = useCallback(async () => {
        if (playingInProgress) return;

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
            }
            //setState(newState);
            console.log(newState)
            return;
        })
        if (success) {
            setPlaying(recName);
            setPlayingInProgress(true)
        }


    }, [playing, playingInProgress, recName]);


    return (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
            <View style={{
                backgroundColor: color,
                width: width * 1.3,
                height: width * 1.3,
                padding: width * .15,
                // marginTop: isLandscape() ? "15%" : "40%",
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
                >
                    {imageUrl && imageUrl.length > 0 ? <View
                        style={{
                            justifyContent: "center", alignItems: "center",
                            width: width * 5 / 6,
                            height: width * 5 / 6,
                            backgroundColor: "white",
                            borderRadius: width * 5 / 12,
                        }}
                    >
                        <Image source={{ uri: imageUrl }}
                            style={{
                                borderRadius: width * (5 / 12),
                                height: width * (5 / 6), width: width * (5 / 6),
                                transform: [{ scale: 0.9 }]
                            }} />
                    </View> :
                        " "}

                </AwesomeButton>
            </View>

            {/* <View style={{ height: fontSize * 1.1, flexDirection: "row", alignItems: "center", justifyContent: "center" }}> */}
            {showName &&
                <Text allowFontScaling={false} style={{
                    fontSize,
                    textAlign: "center",
                    color: appBackground == BACKGROUND.LIGHT ? "black" : "white"
                }}>{name}</Text>
            }
            {/* </View> */}


            {showProgress && (playing ? <AudioWaveForm width={width} height={50} progress={duration && currDuration && currDuration / duration || 0} color={BTN_FOR_COLOR} baseColor={"lightgray"} /> :
                <Spacer h={50} />)}

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
export function IconButton({ icon, onPress, text }: { icon?: string, text: string, onPress: () => void }) {

    return <TouchableOpacity style={[styles.iconButton, { flexDirection: isRTL() ? "row" : "row-reverse", justifyContent: "center" }]} onPress={onPress} >
        <Text allowFontScaling={false} style={{ fontSize: 22, marginInlineStart: 5, marginInlineEnd: 5 }}>{text}</Text>
        {icon && <MyIcon info={{ type: "AntDesign", size: 30, name: icon }} />}
    </TouchableOpacity>
}


const styles = StyleSheet.create({

    iconButton: {

        marginInlineEnd: 10,
        maxHeight: 39,
        minHeight: 39,
        minWidth: 80,
        alignItems: "center",
        borderColor: "gray",
        borderStyle: "solid",
        borderWidth: 1,
        padding: 2,
        borderRadius: 20,
    }
});