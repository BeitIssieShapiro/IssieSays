import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Image,
    PanResponder,
    StyleSheet,
    ImageSize,
} from "react-native";
import { colors, gStyles } from "./common/common-style";
//import Svg, { Rect, Circle, Mask } from "react-native-svg";
import { denormOffset, normOffset, WinSize } from "./utils";
import { IconButton } from "./common/components";
import { translate } from "./lang";
import { Text } from "@rneui/themed";
import { MainButton } from "./uielements";


interface ImageAdjustModalProps {
    onClose: () => void;
    imageUrl: string;
    initialOffset: { x: number, y: number };
    initialScale: number;
    onSave: (scale: number, offset: { x: number; y: number }) => void;
    windowSize: WinSize;
    backgroundColor: string;
}

export default function ImageResizerModal({
    imageUrl,
    onClose,
    windowSize,
    initialOffset,
    initialScale,
    onSave,
    backgroundColor
}: ImageAdjustModalProps) {
    const cWidth = Math.min(windowSize.width, windowSize.height) * 0.6;
    const denormInitialOffset = denormOffset(initialOffset, cWidth);
    const [scale, setScale] = useState<number>(initialScale);
    const [offset, setOffset] = useState(denormInitialOffset);

    //const [imageSize, setImageSize] = useState<ImageSize>({ width: 500, height: 500 });



    // useEffect(() => {
    //     Image.getSize(imageUrl).then((size) => setImageSize(size))
    // }, []);

    const lastScale = useRef(initialScale);
    const lastPan = useRef(denormInitialOffset);
    const scaleRef = useRef(initialScale);
    const offsetRef = useRef(denormInitialOffset);

    // For pinch
    const initialDistance = useRef<number | null>(null);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,

            onPanResponderMove: (evt, gestureState) => {
                console.log("pan", gestureState.numberActiveTouches, gestureState)
                if (gestureState.numberActiveTouches === 1) {
                    // Drag
                    const newOffset = {
                        x: lastPan.current.x + gestureState.dx,
                        y: lastPan.current.y + gestureState.dy,
                    };
                    setOffset(newOffset);
                    offsetRef.current = newOffset

                } else if (gestureState.numberActiveTouches === 2) {
                    const touches = evt.nativeEvent.touches;
                    if (touches.length === 2) {
                        const dx = touches[0].pageX - touches[1].pageX;
                        const dy = touches[0].pageY - touches[1].pageY;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (initialDistance.current === null) {
                            initialDistance.current = distance;
                        } else {
                            let scaleFactor =
                                (distance / initialDistance.current) * lastScale.current;

                            if (scaleFactor < 1) {
                                //scaleFactor = 1;
                            }
                            setScale(scaleFactor);
                            scaleRef.current = scaleFactor
                        }
                    }
                }
            },

            onPanResponderRelease: () => {
                lastPan.current = offsetRef.current;
                lastScale.current = scaleRef.current;
                initialDistance.current = null;
            },
        })
    ).current;


    return (
        <>
            <View style={[gStyles.screenContainer, { direction: "ltr", zIndex: 100 }]} {...panResponder.panHandlers}>

                <View style={styles.title}>
                    <Text allowFontScaling={false} style={styles.titleText}>{translate("EditImageTitle")}</Text>
                </View>
                <View style={{ position: "absolute", top: windowSize.height / 2 - cWidth/1.5, width: "100%" }}>
                    <MainButton
                        name=""
                        fontSize={22}
                        showName={false}
                        width={cWidth}
                        raisedLevel={8}
                        color={backgroundColor}
                        imageUrl={imageUrl}
                        appBackground={"white"}
                        showProgress={false}
                        recName={""}
                        imageOffset={normOffset(offset, cWidth)}
                        scale={scale}
                    />
                </View>


            </View>
            <View style={styles.buttonContainer}>
                <IconButton
                    text={translate("Save")}
                    onPress={() => onSave(scale, normOffset(offset, cWidth))}
                    backgroundColor={colors.titleButtonsBG}
                    icon={{ name: "check" }}
                />
                <IconButton
                    text={translate("Cancel")}
                    onPress={onClose}
                    backgroundColor={colors.titleButtonsBG}
                    icon={{ name: "close" }}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        position: "absolute",
        width: "100%",
        justifyContent: "center",

        top: "5%"
    },
    titleText: {
        fontSize: 30,
        color: "black",
        textAlign: "center",
        zIndex: 1000
    },
    buttonContainer: {
        position: "absolute",
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        bottom: 100,
        zIndex: 2000,
    },
});
