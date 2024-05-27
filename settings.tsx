import { NativeSyntheticEvent, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/AntDesign';
import IconMI from 'react-native-vector-icons/Ionicons';

import { Settings } from 'react-native';
import { ColorButton, RectView, Spacer, getNumButtonsSelection } from "./uielements";
import { useEffect, useState } from "react";
import { RecordButton } from "./recording";
import { MyColorPicker } from "./color-picker";
import { BTN_BACK_COLOR } from "./App";
import { fTranslate, isRTL, translate } from "./lang";


export const BUTTONS = {
    name: 'buttons'
}

export const BUTTONS_COLOR = {
    name: 'buttons_colors',
}

export const BUTTONS_NAMES = {
    name: 'buttons_names',
}


export const LAST_COLORS = {
    name: 'lastColors',
    max: 4
}

export const BACKGROUND = {
    name: 'backgroundColor',
    DARK: "black",
    LIGHT: "white"
}


export function getSetting(name: string, def?: any): any {
    let setting = Settings.get(name);
    if (setting === undefined) {
        setting = def;
    }
    return setting;
}


export function SettingsButton({ onPress, backgroundColor }: { onPress: () => void, backgroundColor: string }) {
    const color = (backgroundColor === BACKGROUND.DARK ? BACKGROUND.LIGHT : BACKGROUND.DARK);
    return <View style={styles.settingButtonHost}>
        <Icon name="setting" size={45} onPress={(e) => onPress()} color={color} />
    </View>
}

export function SettingsPage({ onAbout, onClose, windowSize }: { onAbout: () => void, onClose: () => void, windowSize: { width: number, height: number } }) {
    const [revision, setRevision] = useState(0);
    const [colorPickerOpen, setColorPickerOpen] = useState(-1);

    const numOfButtons = getSetting(BUTTONS.name, 1);
    const backgroundColor = getSetting(BACKGROUND.name, BACKGROUND.LIGHT);
    const buttonColors = getSetting(BUTTONS_COLOR.name, [BTN_BACK_COLOR, BTN_BACK_COLOR, BTN_BACK_COLOR, BTN_BACK_COLOR]);
    const buttonTexts = getSetting(BUTTONS_NAMES.name, [fTranslate("ButtonTitle", 1), fTranslate("ButtonTitle", 2),
    fTranslate("ButtonTitle", 3), fTranslate("ButtonTitle", 4)]);

    const isScreenNarrow = windowSize.width < 500;
    console.log("screen", windowSize)
    const changeButtonsNames = (index: number, newName: string) => {
        console.log("change buttun text", index, newName)
        let newButtonNames = [...buttonTexts]
        newButtonNames[index] = newName
        Settings.set({ [BUTTONS_NAMES.name]: newButtonNames });
        setRevision(old => old + 1);
    }

    const changeBackgroundColor = (color: string) => {
        Settings.set({ [BACKGROUND.name]: color });
        setRevision(old => old + 1);
    }

    const changeNumOfButton = (delta: number) => {
        const current = getSetting(BUTTONS.name, 1);
        let newVal = current + delta;
        if (newVal < 1) return;
        if (newVal > 4) return;
        // if (newVal == 3) {
        //     newVal += delta;
        // }
        Settings.set({ [BUTTONS.name]: newVal });
        setRevision(old => old + 1);
    }
    const saveColor = (index: number, newVal: string) => {
        let newColors = [...buttonColors]
        newColors[index] = newVal
        Settings.set({ [BUTTONS_COLOR.name]: newColors });
        setRevision(old => old + 1);
    }

    const colorWidth = Math.min(windowSize.width, windowSize.height);
    const dirStyle: any = { flexDirection: (isRTL() ? "row" : "row-reverse") }
    let marginHorizontal = {}
    if (windowSize.width < 450) {
        marginHorizontal = { marginHorizontal: 5 };
    }


    let textWidth = windowSize.width < 500 ?
        windowSize.width - styles.section.marginHorizontal - 50 :
        (windowSize.width < 900 ?
            windowSize.width / 2 - styles.section.marginHorizontal - 80 :
            windowSize.width / 2 - styles.section.marginHorizontal);



    return <ScrollView style={[styles.settingHost]}    >
        <MyColorPicker
            open={colorPickerOpen >= 0}
            title={fTranslate("ButtonTitle", colorPickerOpen + 1)}
            top={100}
            height={250}
            width={colorWidth}
            color={buttonColors[colorPickerOpen]}
            isScreenNarrow={false}
            onSelect={(color: string) => {
                saveColor(colorPickerOpen, color);
                setColorPickerOpen(-1);
            }}
            onClose={() => setColorPickerOpen(-1)}
            onHeightChanged={(height: number) => {
            }}
            maxHeight={500} />
        <View style={styles.settingTitle}>
            <Text style={styles.settingTitleText}>{translate("Settings")}</Text>
        </View>
        <View style={styles.closeButtonHost}>
            <Icon name="close" size={45} onPress={() => onClose()} />
        </View>
        <TouchableOpacity style={[styles.section, marginHorizontal, dirStyle]} onPress={() => onAbout()}>
            <Icon name="infocirlceo" color='black' size={35} />
            <Text style={{ fontSize: 20 }}>{translate("About")}</Text>
        </TouchableOpacity>
        <View style={[styles.section, marginHorizontal, dirStyle]} >
            <View style={{ flexDirection: "row" }}>
                <TouchableOpacity style={{ width: 25, height: 25, backgroundColor: BACKGROUND.DARK }}
                    onPress={() => changeBackgroundColor(BACKGROUND.DARK)}>
                    {backgroundColor === BACKGROUND.DARK && <Icon name="check" color="white" size={25} />}
                </TouchableOpacity>
                <Spacer w={25} />
                <TouchableOpacity style={{ width: 25, height: 25, backgroundColor: BACKGROUND.LIGHT, borderColor: "black", borderWidth: 1 }}
                    onPress={() => changeBackgroundColor(BACKGROUND.LIGHT)}>
                    {backgroundColor === BACKGROUND.LIGHT && <Icon name="check" color="black" size={25} />}
                </TouchableOpacity>

            </View>
            <Text style={{ fontSize: 20 }}>{translate("BackgroundColor")}</Text>
        </View>

        <View style={[styles.section, marginHorizontal, dirStyle]} >
            <View style={styles.numberSelector}>
                <Icon name="minuscircleo" color={numOfButtons == 1 ? "lightgray" : "black"} size={35} onPress={() => changeNumOfButton(-1)} />
                <Text style={{ fontSize: 30, marginHorizontal: 10 }}>{numOfButtons}</Text>
                <Icon name="pluscircleo" color={numOfButtons == 4 ? "lightgray" : "black"} size={35} onPress={() => changeNumOfButton(1)} />
            </View>
            <Text style={{ fontSize: 20 }}>{translate("Buttons")}</Text>
        </View>

        <View style={[styles.buttons, marginHorizontal]}>
            {
                Array.from(Array(numOfButtons).keys()).map((i: any) => {
                    const textInput = <TextInput
                        style={{
                            width: textWidth, fontSize: 20, textAlign: isRTL() ? "right" : "left", backgroundColor: "#F5F5F5", direction: isRTL() ? "rtl" : "ltr",
                        }}
                        onChange={(e) => changeButtonsNames(i, e.nativeEvent.text)}>{buttonTexts[i]}</TextInput>


                    return <View key={i} style={[styles.button, dirStyle, isScreenNarrow ? { flexDirection: "column-reverse", height: 100 } : { height: 85 }]}>
                        <RecordButton name={i} backgroundColor={buttonColors[i]} size={60} height={isScreenNarrow ? 70 : 60} />
                        <View style={[styles.buttonRight,
                        { alignItems: isScreenNarrow ? "center" : isRTL() ? "flex-end" : "flex-start" },
                        { flexDirection: (isScreenNarrow ? (isRTL() ? "row-reverse" : "row") : "column") }]}>
                            {textInput}
                            <IconMI name="color-palette-outline" style={{ fontSize: 30 }} onPress={() => {
                                setColorPickerOpen(curr => (curr === i) ? -1 : i)
                            }} />
                        </View>

                    </View>
                })
            }
        </View>
    </ScrollView >
}


// function Group({ name, items }: any) {
//     return <View style={{ width: '100%', paddingTop: 25, alignItems: "center" }}>
//         <Text style={styles.SettingsHeaderText}>{name}</Text>
//         <View style={{ flexDirection: "row-reverse" }}>
//             {items.map((item: any, index: number) =>
//                 <TouchableOpacity
//                     key={index}
//                     style={{ flexDirection: "row", paddingRight: 35, paddingTop: 15, alignItems: 'center' }}
//                     onPress={item.callback}
//                 >
//                     {item.icon}
//                     <Spacer />
//                     <View style={styles.circle}>
//                         {item.selected && <View style={styles.checkedCircle} />}
//                     </View>
//                 </TouchableOpacity>
//             )}
//         </View>
//     </View>
// }


const styles = StyleSheet.create({
    settingHost: {
        width: "100%",
        backgroundColor: "#F5F5F5",
    },
    settingTitle: {
        backgroundColor: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 80,
        fontSize: 25,
        borderRadius: 5,
        margin: 10

    },
    settingTitleText: {
        fontSize: 35,

    },

    settingButtonHost: {
        position: "absolute",
        right: 50,
        top: 50,
        zIndex: 100
    },

    closeButtonHost: {
        position: "absolute",
        right: 10,
        top: 25,
        zIndex: 100
    },

    section: {
        backgroundColor: "white",
        height: 60,
        padding: 8,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 45,
        marginTop: 10,
        marginHorizontal: 40
    },
    buttons: {
        backgroundColor: "white",
        padding: 20,
        flexDirection: "column",
        alignItems: "center",
        //justifyContent: "space-between",
        borderRadius: 45,
        marginTop: 15,
        marginHorizontal: 40,
        //backgroundColor: "green",
        height: "60%"
    },
    button: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        margin: 10,
        borderBottomColor: '#E6E6E6',
        borderBottomWidth: 3
    },
    buttonRight: {
        height: 70,
        justifyContent: "space-between",
    },
    numberSelector: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        height: "100%"
    },
    circle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ACACAC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkedCircle: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#979797',
    },
    SettingsHeaderText: {
        fontSize: 27,
        color: "blue",
        fontWeight: 'bold',
        paddingRight: 10,
        paddingLeft: 10
    },
})