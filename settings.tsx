import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';


import { Settings } from 'react-native';
import { ColorButton, RectView, Spacer, getNumButtonsSelection } from "./uielements";
import { useEffect, useState } from "react";
import { RecordButton } from "./recording";
import { MyColorPicker } from "./color-picket";
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


export function getSetting(name: string, def?: any): any {
    let setting = Settings.get(name);
    if (setting === undefined) {
        setting = def;
    }
    return setting;
}


export function SettingsButton({ onPress }: { onPress: () => void }) {
    return <View style={styles.settingButtonHost}>
        <Icon name="cog" size={45} onPress={(e) => onPress()} />
    </View>
}

export function SettingsPage({ onAbout, onClose, windowSize }: { onAbout: () => void, onClose: () => void, windowSize: { width: number, height: number } }) {
    const [revision, setRevision] = useState(0);
    const [colorPickerOpen, setColorPickerOpen] = useState(-1);

    const numOfButtons = getSetting(BUTTONS.name, 1);
    const buttonColors = getSetting(BUTTONS_COLOR.name, [BTN_BACK_COLOR, BTN_BACK_COLOR, BTN_BACK_COLOR, BTN_BACK_COLOR]);

    const setNumOfButtons = (newVal: number) => {
        Settings.set({ [BUTTONS.name]: newVal });
        setRevision(old => old + 1);
    }

    const saveColor = (index: number, newVal: string) => {
        let newColors = [...buttonColors]
        newColors[index] = newVal
        Settings.set({ [BUTTONS_COLOR.name]: newColors });
        setRevision(old => old + 1);
    }

    const btnSize = Math.min(windowSize.width / 3, windowSize.height / 5);

    return <View style={styles.settingHost}    >
        <View style={styles.settingButtonHost}>
            <Icon name="close" size={45} onPress={() => onClose()} />
        </View>
        <TouchableOpacity onPress={() => onAbout()} style={styles.infoButton}>
            <Icon name="info-circle" color='black' size={35} />
            <Text style={{ margin: 10, fontSize: 25 }}>About - אודות</Text>
        </TouchableOpacity>

        <Group name="Buttons - כפתורים" items={[
            {
                icon: getNumButtonsSelection(1, windowSize.width/6),
                //getSvgIcon('lang-he', 45), 
                selected: numOfButtons == 1,
                callback: () => setNumOfButtons(1)
            },
            {
                icon: getNumButtonsSelection(2, windowSize.width/6),
                //getSvgIcon('lang-ar', 45), 
                selected: numOfButtons == 2,
                callback: () => setNumOfButtons(2)
            },
            {
                icon: getNumButtonsSelection(4, windowSize.width/6),
                selected: numOfButtons == 4,
                callback: () => setNumOfButtons(4)
            }
        ]} />
        <Spacer h={60} />
        <RectView width={windowSize.width} height={windowSize.height*.4}>
            {Array.from(Array(numOfButtons).keys()).map((i: any) => (
                <View key={i} style={{
                    flexDirection: "col",
                    paddingTop:btnSize/4,
                    width: btnSize, height: btnSize,
                    alignItems: "center",
                    justifyContent: "center",
                    alignContent:"center",
                    borderWidth: 5,
                    borderColor: buttonColors[i],
                    borderRadius: btnSize/2,
                    margin: 20
                }}>
                    <ColorButton
                        callback={() => {
                            setColorPickerOpen(curr => (curr === i) ? -1 : i)
                        }}
                        color={buttonColors[i]}
                        size={btnSize/3}
                        icon={"paint-brush"}
                    />
                    <Spacer h={10} />
                    <MyColorPicker
                        open={colorPickerOpen === i}
                        top={100}
                        width={btnSize*1.4}
                        color={buttonColors[i]}
                        isScreenNarrow={false}
                        onSelect={(color: string) => {
                            saveColor(i, color);
                            setColorPickerOpen(-1);
                        }}
                        onHeightChanged={(height: number) => {

                        }}
                        maxHeight={500} />
                    <RecordButton name={i} backgroundColor={buttonColors[i]} size={btnSize/3}/>
                </View>
            ))}
        </RectView>

    </View>
}


function Group({ name, items }: any) {
    return <View style={{ width: '100%', paddingTop: 25,  alignItems: "center" }}>
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
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "lightgray",
        paddingTop: 100
    },
    settingButtonHost: {
        position: "absolute",
        right: 50,
        top: 50,
        zIndex: 100
    },
    infoButton: {
        position: "absolute",
        left: 50,
        top: 30,
        flexDirection: "row-reverse",
        alignItems: "center",
        margin: 25
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