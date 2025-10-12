import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Image,
    PanResponder,
    Dimensions,
    Modal,
    StyleSheet,
    Button,
    ImageSize,
} from "react-native";
import { colors, gStyles } from "./common/common-style";
import Svg, { Rect, Circle, Mask } from "react-native-svg";
import { denormOffset, isLandscape, normOffset, WinSize } from "./utils";
import { IconButton } from "./common/components";
import { translate } from "./lang";
import { Text } from "@rneui/themed";


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
    const cWidth = windowSize.width * 0.6;
    const denormInitialOffset = denormOffset(initialOffset, cWidth);
    const [scale, setScale] = useState<number>(initialScale);
    const [offset, setOffset] = useState(denormInitialOffset);

    const [imageSize, setImageSize] = useState<ImageSize>({ width: 500, height: 500 });



    useEffect(() => {
        Image.getSize(imageUrl).then((size) => setImageSize(size))
    }, []);

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
                                scaleFactor = 1;
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

    const baseScale = cWidth / imageSize.height;
    const imageLeft = (windowSize.width - imageSize.width * baseScale) / 2
    const imageTop = (windowSize.height - cWidth) / 2;

    console.log("ai", offset, cWidth, baseScale, scale)

    return (
        <View style={[gStyles.screenContainer, { backgroundColor: backgroundColor, }]}>
            <View style={styles.title}>
                <Text style={styles.titleText}>{translate("EditImageTitle")}</Text>
            </View>
            <View

                style={{
                    transform: [
                        { translateX: imageLeft + offset.x },
                        { translateY: imageTop + offset.y },
                        { scale: scale * .86 },
                    ],
                    width: cWidth, height: cWidth,
                }}
            >
                <Image
                    source={{ uri: imageUrl }}
                    resizeMode="stretch"
                    style={{
                        width: imageSize.width * baseScale,
                        height: imageSize.height * baseScale,
                        borderRadius: 10,
                        backgroundColor,
                    }}
                />
            </View>

            {/* Semi-transparent white overlay with circle cutout */}
            <Svg style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
                <Mask id="mask">
                    {/* Full opaque rectangle */}
                    <Rect x={0} y={0} width={windowSize.width} height={windowSize.height} fill="white" />
                    {/* Transparent circle */}
                    <Circle cx={windowSize.width / 2} cy={windowSize.height / 2} r={cWidth / 2} fill="black" />
                </Mask>

                {/* Apply the mask */}
                <Rect
                    x="0"
                    y="0"
                    width={windowSize.width}
                    height={windowSize.height}
                    fill="white"
                    opacity={0.6}
                    mask="url(#mask)"
                />
            </Svg>

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
        </View>
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
    },
});
