import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/AntDesign';
import IconMI from 'react-native-vector-icons/Ionicons';

import { Settings } from 'react-native';
import { ColorButton, RectView, Spacer, getNumButtonsSelection } from "./uielements";
import { useEffect, useState } from "react";
import { RecordButton } from "./recording";
import { MyColorPicker } from "./color-picker";
import { BTN_BACK_COLOR } from "./App";

export const BUTTONS = {
    name: 'buttons'
}

export const BUTTONS_COLOR = {
    name: 'buttons_colors',
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
    let marginHorizontal = {}
    if (windowSize.width < 450) {
        marginHorizontal = { marginHorizontal: 5 };
    }

    let backgroundTitle = "צבע רקע - Background"
    let halfWidth = windowSize.width / 2 - 2 * styles.section.marginHorizontal
    if (windowSize.width < 450) {
        halfWidth = windowSize.width / 2 - 10
        backgroundTitle = "רקע - B/G"
    }


    return <View style={styles.settingHost}    >
        <MyColorPicker
            open={colorPickerOpen >= 0}
            title={"Button " + (colorPickerOpen + 1) + " כפתור"}
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
            <Text style={styles.settingTitleText}>הגדרות - Settings</Text>
        </View>
        <View style={styles.closeButtonHost}>
            <Icon name="close" size={45} onPress={() => onClose()} />
        </View>
        <View style={{ flexDirection: "row" }}>
            <TouchableOpacity style={[styles.section, marginHorizontal, { width: halfWidth }]} onPress={() => onAbout()}>
                <Icon name="infocirlceo" color='black' size={35} />
                <Text style={{ fontSize: 20 }}>About - אודות</Text>
            </TouchableOpacity>
            <View style={[styles.section, marginHorizontal, { width: halfWidth }]} >
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
                <Text style={{ fontSize: 20 }}>{backgroundTitle}</Text>
            </View>
        </View>

        <View style={[styles.section, marginHorizontal]} >
            <View style={styles.numberSelector}>
                <Icon name="minuscircleo" color='black' size={35} onPress={() => changeNumOfButton(-1)} />
                <Text style={{ fontSize: 30, marginHorizontal: 10 }}>{numOfButtons}</Text>
                <Icon name="pluscircleo" color='black' size={35} onPress={() => changeNumOfButton(1)} />
            </View>
            <Text style={{ fontSize: 20 }}>Buttons - כפתורים</Text>
        </View>

        <View style={[styles.buttons, marginHorizontal]}>
            {
                Array.from(Array(numOfButtons).keys()).map((i: any) => {
                    return <View key={i} style={[styles.button, { borderBottomColor: '#E6E6E6', borderBottomWidth: 3, }]}>
                        <View >
                            <RecordButton name={i} backgroundColor={buttonColors[i]} size={60} height={60} />
                        </View>
                        <View style={styles.buttonRight}>
                            <Text style={{ fontSize: 20 }}>Button {i + 1} כפתור </Text>
                            <IconMI name="color-palette-outline" style={{ fontSize: 30 }} onPress={() => {
                                setColorPickerOpen(curr => (curr === i) ? -1 : i)
                            }} />
                        </View>

                    </View>
                })
            }
        </View>
    </View >
}


function Group({ name, items }: any) {
    return <View style={{ width: '100%', paddingTop: 25, alignItems: "center" }}>
        <Text style={styles.SettingsHeaderText}>{name}</Text>
        <View style={{ flexDirection: "row-reverse" }}>
            {items.map((item: any, index: number) =>
                <TouchableOpacity
                    key={index}
                    style={{ flexDirection: "row", paddingRight: 35, paddingTop: 15, alignItems: 'center' }}
                    onPress={item.callback}
                >
                    {item.icon}
                    <Spacer />
                    <View style={styles.circle}>
                        {item.selected && <View style={styles.checkedCircle} />}
                    </View>
                </TouchableOpacity>
            )}
        </View>
    </View>
}


const styles = StyleSheet.create({
    settingHost: {
        width: "100%",
        height: "100%",
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
        height: 75,
        padding: 20,
        flexDirection: "row",
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
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        //backgroundColor: "",
        width: "100%",
        height: 85,
        margin: 10
    },
    buttonRight: {
        height: 70,
        justifyContent: "space-between",
        alignItems: "flex-end"
    },
    numberSelector: {
        display: "flex",
        flexDirection: "row"
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