import { Keyboard, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import Icon from 'react-native-vector-icons/AntDesign';
import IconIonic from 'react-native-vector-icons/Ionicons';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';

import { Spacer } from "./uielements";
import { useEffect, useRef, useState } from "react";
import { RecordButton } from "./recording";
import { MyColorPicker } from "./color-picker";
import { fTranslate, isRight2Left, isRTL, translate } from "./lang";
import { deleteFile, SearchImage, SelectFromGallery } from "./search-image";
import { AnimatedButton } from "./animatedButton";
import { ProfilePicker } from "./profile-picker";
import { AlreadyExists, Folders, InvalidCharachters, InvalidFileName, isValidFilename, loadButton, LoadProfile, Profile, readCurrentProfile, renameProfile, saveButton, verifyProfileNameFree } from "./profile";
import Toast from 'react-native-toast-message';
import { Settings } from './setting-storage';

const BTN_COLOR = "#6E6E6E";

export const BUTTONS = {
    name: 'buttons'
}

export const CURRENT_PROFILE = {
    name: "current_profile"
}


export const BUTTONS_COLOR = {
    name: 'buttons_colors',
}

export const BUTTONS_NAMES = {
    name: 'buttons_names',
}

export const BUTTONS_IMAGE_URLS = {
    name: 'buttons_image_urls',
}

export const BUTTONS_SHOW_NAMES = {
    name: 'button_show_names',
}

// export const BUTTONS_VIBRATE = {
//     name: 'button_vibrate',
// }

export const LAST_COLORS = {
    name: 'lastColors',
    max: 4
}

export const BACKGROUND = {
    name: 'backgroundColor',
    DARK: "black",
    LIGHT: "white"
}

export function SettingsButton({ onPress, backgroundColor }: { onPress: () => void, backgroundColor: string }) {
    const color = (backgroundColor === BACKGROUND.DARK ? BACKGROUND.LIGHT : BACKGROUND.DARK);
    return <View style={styles.settingButtonHost}>
        <AnimatedButton size={45} color={color} icon="setting" onPress={onPress} duration={0} />
    </View>
}

export function SettingsPage({ onAbout, onClose, windowSize }: { onAbout: () => void, onClose: () => void, windowSize: { width: number, height: number } }) {
    const [revision, setRevision] = useState<number>(0);
    const [colorPickerOpen, setColorPickerOpen] = useState(-1);
    const [imageSearchOpen, setImageSearchOpen] = useState(-1);
    const [textInEdit, setTextInEdit] = useState<boolean[]>([false, false, false, false]);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [openLoadProfile, setOpenLoadProfile] = useState<boolean>(false);
    const [openLoadButton, setOpenLoadButton] = useState<number>(-1);
    const textInputRef = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)];
    const scrollViewRef = useRef<ScrollView>(null);

    const [profile, setProfile] = useState<Profile>(readCurrentProfile());
    const [profileName, setProfileName] = useState<string>(Settings.getString(CURRENT_PROFILE.name, ""));
    const [backgroundColor, setBackgroundColor] = useState<string>(Settings.getString(BACKGROUND.name, BACKGROUND.LIGHT));
    const [profileBusy, setProfileBusy] = useState<boolean>(false);
    const [buttonBusy, setButtonBusy] = useState<number>(-1);

    useEffect(() => {
        setBackgroundColor(Settings.getString(BACKGROUND.name, BACKGROUND.LIGHT));
        const p = readCurrentProfile();
        setProfile(p);
        setProfileName(Settings.getString(CURRENT_PROFILE.name, ""));
        console.log("reload settings", p.buttons.map(b => b.name))
    }, [revision]);

    useEffect(() => {
        const onKeyboardShow = (e: any) => {
            setKeyboardHeight(e.endCoordinates.height);
            setTextInEdit(curr => {
                const edited = curr.findIndex(t => t === true)
                if (edited < 0) curr;

                textInputRef[edited]?.current?.measureLayout(
                    scrollViewRef.current?.getNativeScrollRef() || 0,
                    (x, y, width, height) => {
                        //console.log("textBox", x, y, width, height, "window", windowSize, "kb", e.endCoordinates.height)

                        const kbTop = windowSize.height - e.endCoordinates.height;
                        const textButtom = y + height + 70;
                        const delta = kbTop - textButtom < 0 ? kbTop - textButtom : 0
                        //console.log("kb", kbTop, textButtom, delta)
                        //                        setYOffset(delta)
                        scrollViewRef.current?.scrollTo({ x: 0, y: -delta, animated: true });


                    }
                );

                return curr;
            })
        };

        const onKeyboardHide = () => {
            setKeyboardHeight(0);
        };

        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', onKeyboardHide);

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);


    const isScreenNarrow = windowSize.width < 500;
    const changeButtonsNames = (index: number, newName: string) => {
        console.log("change buttun text", index, newName)
        let newButtonNames = profile.buttons.map(b => b.name);
        newButtonNames[index] = newName
        Settings.setArray(BUTTONS_NAMES.name, newButtonNames);
        setRevision(old => old + 1);
    }

    const changeBackgroundColor = (color: string) => {
        Settings.set(BACKGROUND.name, color);
        setRevision(old => old + 1);
    }

    const changeNumOfButton = (delta: number) => {
        const current = Settings.getNumber(BUTTONS.name, 1);
        let newVal = current + delta;
        if (newVal < 1) return;
        if (newVal > 4) return;
        Settings.set(BUTTONS.name, newVal);
        setRevision(old => old + 1);
    }
    const saveColor = (index: number, newVal: string) => {
        let newColors = profile.buttons.map(b => b.color);
        newColors[index] = newVal
        Settings.setArray(BUTTONS_COLOR.name, newColors);
        setRevision(old => old + 1);
    }

    const saveImageUrl = (index: number, newVal: string) => {
        let newBtnImageUrls = profile.buttons.map(b => b.imageUrl);
        newBtnImageUrls[index] = newVal
        Settings.setArray(BUTTONS_IMAGE_URLS.name, newBtnImageUrls);
        console.log("new button ImageUrl", newBtnImageUrls, index)
        setRevision(old => old + 1);
    }

    const saveShowNames = (index: number, newVal: boolean) => {
        let newBtnShowNames = profile.buttons.map(b => b.showName);
        newBtnShowNames[index] = newVal
        Settings.setArray(BUTTONS_SHOW_NAMES.name, newBtnShowNames);
        setRevision(old => old + 1);
    }

    const handleEdit = (i: number) => {
        // tougle edit mode
        setTextInEdit(curr => {
            const newVal = [...curr];
            if (curr[i]) {
                // was in edit
                textInputRef[i].current?.blur();
            } else {
                textInputRef[i].current?.focus();
            }

            newVal[i] = !curr[i]
            return newVal;
        })
    }

    const addNewProfile = async () => {
        const currName = Settings.getString(CURRENT_PROFILE.name, "");
        if (currName.length > 0) {
            await LoadProfile("");
            setRevision(prev => prev + 1)
        }
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


    const doProfileSave = async (name: string, overwrite = false) => {
        if (!isValidFilename(name)) {
            throw new InvalidFileName(name);
        }
        const previousName = Settings.getString(CURRENT_PROFILE.name, "");
        if (previousName == "") {
            // new profile
            // const p = readCurrentProfile();
            if (!overwrite) {
                return verifyProfileNameFree(name).then(() => {
                    Settings.set(CURRENT_PROFILE.name, name);
                });
            } else {
                Settings.set(CURRENT_PROFILE.name, name );
            }
        } else {
            // rename profile
            return renameProfile(previousName, name).then(() => {
                Settings.set(CURRENT_PROFILE.name, name );
            })
        }
    }

    const handleProfileEditName = () => {
        const previousName = Settings.getString(CURRENT_PROFILE.name, "");
        const isRename = previousName != "";
        Alert.prompt(isRename ? translate("RenameProfile") : translate("SetProfileName"), undefined, [
            {
                text: translate("Save"),
                onPress: (newName) => {
                    if (newName) {
                        doProfileSave(newName)
                            .then(() => {
                                Toast.show({
                                    autoHide: true,
                                    type: 'success',
                                    text1: translate(isRename ? "ProfileSuccessRenamed" : "ProfileSuccessfulyCreated")
                                })
                            })
                            .catch((err) => {
                                if (err instanceof AlreadyExists) {
                                    Alert.alert(translate("ProfileExistsTitle"), translate("ProfileExists"),
                                        [
                                            {
                                                text: translate("Overwrite"), onPress: () => {
                                                    doProfileSave(newName, true).then(() => {
                                                        Toast.show({
                                                            autoHide: true,
                                                            type: 'success',
                                                            text1: translate(isRename ? "ProfileSuccessRenamed" : "ProfileSuccessfulyCreated")
                                                        })
                                                    })
                                                }
                                            },
                                            { text: translate("Cancel") }
                                        ])
                                } else if (err instanceof InvalidFileName) {
                                    Alert.alert(fTranslate("InvalidName", InvalidCharachters));
                                } else {
                                    Toast.show({
                                        autoHide: true,
                                        type: 'error',
                                        text1: translate(translate("ProfileSaveFailed"))
                                    })
                                }
                            });
                    }
                }
            },
            { text: translate("Cancel"), style: "cancel" }
        ], 'plain-text', previousName);
    }


    const handleSaveButton = (name: string, index: number) => {
        saveButton(name, index)
            .then(() => {
                Toast.show({
                    autoHide: true,
                    type: 'success',
                    text1: translate("ButtonSaved")
                });
            })
            .catch(err => {
                if (err instanceof AlreadyExists) {
                    Alert.alert(translate("ButtonExistsTitle"), translate("buttonExists"),
                        [
                            {
                                text: translate("Overwrite"), onPress: () => {
                                    saveButton(name, index, true)
                                        .then(() => {
                                            Toast.show({
                                                // autoHide: true,
                                                type: 'success',
                                                text1: translate("ButtonSaved")
                                            });
                                        })
                                }
                            },
                            { text: translate("Cancel") }
                        ])
                } else if (err instanceof InvalidFileName) {
                    Alert.alert(fTranslate("InvalidName", InvalidCharachters));
                } else {
                    Toast.show({
                        autoHide: true,
                        type: 'error',
                        text1: translate(translate("ButtonSaveFailed"))
                    })
                }
            })
    }

    return <View style={{ position: "relative", width: windowSize.width, height: windowSize.height - 50 }}>
        <ProfilePicker
            exclude={profileName}
            folder={Folders.Profiles}
            open={openLoadProfile}
            height={windowSize.height * .6}
            onSelect={async (profileName: string) => {
                setProfileBusy(true);
                setOpenLoadProfile(false);
                await LoadProfile(profileName).finally(() => setProfileBusy(false))
                setRevision(prev => prev + 1);
            }}
            onClose={() => setOpenLoadProfile(false)}
        />
        <ProfilePicker
            folder={Folders.Buttons}
            open={openLoadButton > -1}
            height={windowSize.height * .6}
            onSelect={async (buttonName: string) => {
                setButtonBusy(openLoadButton)
                console.log("selected button", buttonName, openLoadButton)
                if (openLoadButton > -1) {
                    setOpenLoadButton(-1);
                    await loadButton(buttonName, openLoadButton).finally(() => setButtonBusy(-1));
                    //setRevision(prev => prev + 1)
                    setTimeout(() => setRevision(prev => prev + 1), 50);
                }
            }}
            onClose={() => setOpenLoadButton(-1)}
        />
        {colorPickerOpen > -1 && <MyColorPicker
            open={colorPickerOpen >= 0}
            title={profile.buttons[colorPickerOpen].name}
            top={100}
            height={250}
            width={colorWidth}
            color={profile.buttons[colorPickerOpen].color}
            isScreenNarrow={false}
            onSelect={(color: string) => {
                saveColor(colorPickerOpen, color);
                setColorPickerOpen(-1);
            }}
            onClose={() => setColorPickerOpen(-1)}
            onHeightChanged={(height: number) => {
            }}
            maxHeight={500} />}

        <SearchImage open={imageSearchOpen >= 0} onClose={() => setImageSearchOpen(-1)}
            onSelectImage={(url: string) => {
                saveImageUrl(imageSearchOpen, url);
                setImageSearchOpen(-1);
            }}
            isScreenNarrow={isScreenNarrow}
        />

        <ScrollView style={styles.settingHost}
            ref={scrollViewRef} >

            <View style={styles.settingTitle}>
                <Text allowFontScaling={false} style={styles.settingTitleText}>{translate("Settings")}</Text>
            </View>
            <View style={styles.closeButtonHost}>
                <Icon name="close" size={45} color={BTN_COLOR} onPress={() => onClose()} />
            </View>
            <TouchableOpacity style={[styles.section, marginHorizontal, dirStyle]} onPress={() => onAbout()}>
                <Icon name="infocirlceo" color={BTN_COLOR} size={35} />
                <Text allowFontScaling={false} style={{ fontSize: 20 }}>{translate("About")}</Text>
            </TouchableOpacity>
            <View style={[styles.section, marginHorizontal, dirStyle]} >
                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity style={{ width: 25, height: 25, backgroundColor: BACKGROUND.DARK, borderRadius: 12.5 }}
                        onPress={() => changeBackgroundColor(BACKGROUND.DARK)}>
                        {backgroundColor === BACKGROUND.DARK && <Icon name="check" color="white" size={25} />}
                    </TouchableOpacity>
                    <Spacer w={25} />
                    <TouchableOpacity style={{ width: 25, height: 25, backgroundColor: BACKGROUND.LIGHT, borderColor: "black", borderWidth: 1, borderRadius: 12.5 }}
                        onPress={() => changeBackgroundColor(BACKGROUND.LIGHT)}>
                        {backgroundColor === BACKGROUND.LIGHT && <Icon name="check" color="black" size={25} />}
                    </TouchableOpacity>
                    <Spacer w={5} />
                </View>
                <Text allowFontScaling={false} style={{ fontSize: 20 }}>{translate("BackgroundColor")}</Text>
            </View>

            <View style={[styles.section, marginHorizontal, dirStyle]} >
                <View style={{ flexDirection: isRTL() ? "row-reverse" : "row" }}>
                    {profileBusy && <ActivityIndicator color="#0000ff" size="large" />}
                    <Icon name="upload" style={{ fontSize: 30, color: BTN_COLOR, marginEnd: 15 }} onPress={() => setOpenLoadProfile(true)} />
                    <Icon name="addfile" style={{ fontSize: 30, color: BTN_COLOR, marginEnd: 15 }} onPress={() => addNewProfile()} />
                    <Icon name={profileName.length > 0 ? "edit" : "save"} style={{ fontSize: 33, color: BTN_COLOR, marginEnd: 15 }} onPress={handleProfileEditName} />
                </View>
                <View style={{ flexDirection: isRTL() ? "row-reverse" : "row" }}>
                    <Text allowFontScaling={false} style={{ fontSize: 20 }}>{translate("ProfileName")}:</Text>
                    <Text allowFontScaling={false} style={{ marginEnd: 10, marginStart: 10, fontSize: 20, textAlign: isRTL() ? "right" : "left" }}>{profileName.length > 0 ? profileName : translate("ProfileNoName")}</Text>
                </View>
            </View>

            <View style={[styles.section, marginHorizontal, dirStyle]} >
                <View style={styles.numberSelector}>
                    <Icon name="minuscircleo" color={profile.buttons.length == 1 ? "lightgray" : BTN_COLOR} size={35} onPress={() => changeNumOfButton(-1)} />
                    <Text allowFontScaling={false} style={{ fontSize: 30, marginHorizontal: 10 }}>{profile.buttons.length}</Text>
                    <Icon name="pluscircleo" color={profile.buttons.length == 4 ? "lightgray" : BTN_COLOR} size={35} onPress={() => changeNumOfButton(1)} />
                </View>
                <Text allowFontScaling={false} style={{ fontSize: 20 }}>{translate("Buttons")}</Text>
            </View>

            <View style={[styles.buttons, marginHorizontal]}>
                {
                    Array.from(Array(profile.buttons.length).keys()).map((i: any) => {
                        const textInput =
                            <View style={{ flexDirection: isRight2Left ? "row-reverse" : "row" }}>
                                <IconMI name="edit" style={{ fontSize: 30, color: BTN_COLOR }} onPress={() => handleEdit(i)} />
                                <Spacer w={10} />
                                <TextInput allowFontScaling={false} ref={textInputRef[i]}
                                    maxLength={25}
                                    style={{
                                        width: textWidth, fontSize: 20, textAlign: isRTL() ? "right" : "left",
                                        backgroundColor: textInEdit[i] ? "#F5F5F5" : "transparent",
                                        direction: isRTL() ? "rtl" : "ltr",
                                        //backgroundColor: "yellow"
                                    }}
                                    onChange={(e) => changeButtonsNames(i, e.nativeEvent.text)}
                                    onBlur={(e) => setTextInEdit(curr => {
                                        const newVal = [...curr];
                                        newVal[i] = !curr[i]
                                        return newVal;
                                    })}
                                >{profile.buttons[i].name}
                                </TextInput>
                            </View>

                        return <View key={i} style={[
                            styles.button, dirStyle,
                            { borderBottomWidth: (i == profile.buttons.length - 1 ? 0 : 3) },
                            isScreenNarrow ? { flexDirection: "column", height: 165 } : { height: 105 },
                        ]}>
                            <View style={{ flexDirection: isRight2Left ? "row" : "row-reverse" }}>
                                <View style={{ alignItems: isRTL() ? "flex-start" : "flex-end", justifyContent: "center" }}>
                                    <RecordButton name={i} backgroundColor={profile.buttons[i].color} size={60} height={60} />
                                    <View style={{ marginEnd: 5, flexDirection: isRTL() ? "row-reverse" : "row" }}>
                                        {buttonBusy == i && <ActivityIndicator size="large" color="#0000ff" />}
                                        <Icon name="upload" style={{ fontSize: 30, color: BTN_COLOR, marginEnd: 15 }} onPress={() => setOpenLoadButton(i)} />
                                        <Icon name="save" style={{ fontSize: 33, color: BTN_COLOR, marginEnd: 15 }} onPress={() => handleSaveButton(profile.buttons[i].name, i)} />
                                    </View>
                                </View>

                                {/*middle buttons (color, image and search) and preview */}
                                <View style={{ alignItems: "center", height: 100 }}>
                                    <View style={[{ borderColor: profile.buttons[i].color }, styles.buttonPreview]}>
                                        {profile.buttons[i].imageUrl.length > 0 && <>
                                            <Image source={{ uri: profile.buttons[i].imageUrl }} style={styles.buttonImage} />
                                            <IconIonic name="close" style={{ position: "absolute", right: -15, top: -10, fontSize: 30, color: "red" }} onPress={() => {
                                                deleteFile(profile.buttons[i].imageUrl);
                                                saveImageUrl(i, "")
                                            }} />
                                        </>}
                                    </View>
                                    <View style={{ flex: 1, flexDirection: "row", justifyContent: "center" }}>
                                        <IconIonic name="color-palette-outline" style={{ fontSize: 30, color: BTN_COLOR }} onPress={() => {
                                            setColorPickerOpen(curr => (curr === i) ? -1 : i)
                                        }} />
                                        <Spacer w={20} />
                                        <IconIonic name="image-outline" style={{ fontSize: 30, color: BTN_COLOR }} onPress={() => {
                                            SelectFromGallery().then((url) => {
                                                if (url !== "") {
                                                    saveImageUrl(i, url);
                                                }
                                            })
                                        }} />
                                        <Spacer w={20} />
                                        <IconMCI name="image-search-outline" style={{ fontSize: 30, color: BTN_COLOR }} onPress={() => {
                                            setImageSearchOpen(i);
                                        }} />

                                    </View>
                                </View>
                            </View>

                            <View style={[
                                styles.buttonRight,
                                { alignItems: isRTL() ? "flex-end" : "flex-start" },
                                { flexDirection: "column" }
                            ]}>
                                {textInput}
                                <TouchableOpacity style={{ flexDirection: isRight2Left ? "row-reverse" : "row", alignItems: "center", }}
                                    onPress={() => saveShowNames(i, !profile.buttons[i].showName)}>
                                    {profile.buttons[i].showName ?
                                        <IconMCI name="checkbox-outline" style={{ fontSize: 30, color: BTN_COLOR }} /> :
                                        <IconMCI name="checkbox-blank-outline" style={{ fontSize: 30, color: BTN_COLOR }} />
                                    }
                                    <Text allowFontScaling={false} >{translate("ShowName")}</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    })
                }
            </View>
            {textInEdit.find(t => t) && <Spacer h={keyboardHeight} />}
        </ScrollView >
    </View>
}


const styles = StyleSheet.create({
    settingHost: {
        width: "100%",
        flex: 1,
        backgroundColor: "#F5F5F5",
        position: "relative"
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
        right: 25,
        top: 50,
        zIndex: 100
    },

    closeButtonHost: {
        position: "absolute",
        right: 25,
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
        //margin: 10,
        borderBottomColor: '#E6E6E6',
        marginBottom: 10,
    },
    buttonRight: {
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
    buttonPreview: {
        alignItems: "center",
        justifyContent: "center",
        height: 64,
        width: 64,
        borderWidth: 5,
        borderStyle: "solid",
        borderRadius: 32,
        marginBottom: 5,
    },
    buttonImage: {
        height: 45,
        width: 45,
        margin: 7,
    },
})