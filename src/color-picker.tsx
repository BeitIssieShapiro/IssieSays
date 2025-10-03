import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
//import Icon from 'react-native-vector-icons/AntDesign';
import ColorPicker from 'react-native-wheel-color-picker'
import { Settings } from './setting-storage';

import { LAST_COLORS } from "./settings";
import FadeInView from "./FadeInView";
import { ColorButton } from "./uielements";
import { MyCloseIcon } from "./common/icons";
export const availableColorPicker = [
    '#000000', '#fee100', '#20ad57', '#5db7dd', '#2958af', '#d62796', '#65309c', '#da3242'
]

export function MyColorPicker(props: any) {
    const [openMore, setOpenMore] = useState(false);
    const [composedColor, setComposedColor] = useState(props.color);
    const [lastColors, setLastColors] = useState<string[]>([]);


    useEffect(() => {
        //load last colors
        const lastC = Settings.getArray<string>(LAST_COLORS.name, "string", []);
        if (lastC?.length > 0) {
            setLastColors(lastC)
        }
    }, [])

    let colorButtonSize = (props.width) / ((availableColorPicker.length + 1) * 1.4);
    if (props.isScreenNarrow) {
        colorButtonSize *= 2;
    }
    let height = props.open ? props.height : 0;

    // useEffect(() => {
    //     props.onHeightChanged(height);
    // }, [openMore, props.open]);


    const _handleSelect = useCallback(() => {
        props.onSelect(composedColor)
        if (lastColors.find(lc => lc === composedColor)) {
            return
        }
        //save the last three colors
        const lastC = [composedColor, ...lastColors];
        while (lastC.length > LAST_COLORS.max) {
            lastC.pop()
        }
        Settings.setArray(LAST_COLORS.name, lastC)
        setLastColors(lastC)

    }, [composedColor, lastColors]);


    if (height === 0) {
        return null;
    }

    //trace("last colors", lastColors)
    //trace("color", props.color, "composed", composedColor)
    return <FadeInView height={height}
        style={[styles.pickerView, { bottom: 0, left: 0, right: 0 }]}>
        <Text allowFontScaling={false} style={{ fontSize: 25, margin: 25 }}>{props.title}</Text>
        <View style={styles.closeButton}>
            <MyCloseIcon onClose={props.onClose}/>
        </View>


        <View
            style={{
                flexDirection: 'row',
                width: '100%',
                margin: 70,
                height: colorButtonSize,
                justifyContent: 'space-evenly', alignItems: 'center'
            }}>
            {availableColorPicker.map((color, i) => <ColorButton
                key={i}
                callback={() => props.onSelect(color)}
                color={color}
                size={colorButtonSize}
                icon={color == props.color ? "check" : undefined}
                index={i} />
            )}
            {/* More color button */}
            {props.allowCustom && <ColorButton
                callback={() => setOpenMore(val => !val)}
                color={"white"}
                size={colorButtonSize}
                icon={openMore ? "chevron-up" : "chevron-down"}
                iconColor="black"
            />}

        </View>
        {openMore && <View style={{ flex: 1, top: 0, left: 0, height: 300, width: "90%", alignItems: "center" }}>
            <View style={{
                position: "absolute",
                top: 30, left: -12,
                //height: colorButtonSize * 3 + 30,
                width: colorButtonSize * 2 + 30,
                flexWrap: "wrap",
                zIndex: 1000, flexDirection: "row",
            }} >
                {lastColors.map((color, i) => <View key={i} style={{ padding: 5 }}>
                    <ColorButton
                        callback={() => props.onSelect(color)}
                        color={color}
                        size={colorButtonSize}
                        icon={color == props.color ? "check" : undefined}
                        index={i} />
                </View>
                )}



            </View>

            <View style={{
                position: "absolute",
                justifyContent: "flex-end",
                top: 95, right: props.isScreenNarrow ? 0 : "15%",
                width: colorButtonSize * 2 + 30,
                flexWrap: "wrap",
                zIndex: 1000, flexDirection: "row",
            }} >
                {
                    composedColor && composedColor != props.color && !lastColors.find(lc => lc === composedColor) &&
                    <View style={{ padding: 5 }}>
                        <ColorButton
                            callback={_handleSelect}
                            color={composedColor}
                            size={colorButtonSize}
                        //false)}
                        />
                    </View>
                }
            </View>
            <View style={{ width: "90%", height: "100%" }}>
                <ColorPicker
                    color={composedColor}
                    onColorChangeComplete={(color) => {
                        if (props.open) {
                            setComposedColor(color)
                        }
                    }}
                    onColorChange={(color) => {
                        if (props.open) {
                            setComposedColor(color)
                        }
                    }}

                    sliderSize={0}
                    noSnap={true}
                    row={false}
                    gapSize={10}
                    thumbSize={25}
                    autoResetSlider={true}

                    swatches={false}
                />
            </View>

        </View>
        }

    </FadeInView>
}

export function increaseColor(hexColor: string, amount: number) {
    if (!hexColor) {
        return "white"
    }
    // Convert hexadecimal color to RGB components
    var r = parseInt(hexColor.substring(1, 3), 16);
    var g = parseInt(hexColor.substring(3, 5), 16);
    var b = parseInt(hexColor.substring(5, 7), 16);

    // Increase each component by the specified amount
    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);

    // Convert RGB components back to hexadecimal color
    var result = '#' +
        (r < 16 ? '0' : '') + r.toString(16) +
        (g < 16 ? '0' : '') + g.toString(16) +
        (b < 16 ? '0' : '') + b.toString(16);

    return result;
}

const styles = StyleSheet.create({
    closeButton: {
        position: "absolute",
        right: 10,
        top: "4%",
        zIndex: 100
    },
    pickerView: {
        flexDirection: 'column',
        position: 'absolute',
        backgroundColor: '#FAFAFA',
        zIndex: 99999,
        left: 0,
        borderColor: 'gray',
        borderBottomColor: "transparent",
        borderWidth: 1,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 2,
        alignItems: 'center',
    }
});