import { Keyboard, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { BTN_COLOR, MainButton, Spacer } from "./uielements";
import { useEffect, useRef, useState } from "react";
import { RecordButton } from "./recording";
import { MyColorPicker } from "./color-picker";
import { fTranslate, isRTL, translate } from "./lang";
import { SearchImage, SelectFromGallery } from "./search-image";
import { ButtonPicker, DefaultProfileName, ProfilePicker } from "./profile-picker";
import { AlreadyExists, Button, deleteButton, deleteProfile, Folders, InvalidCharachters, InvalidFileName, isValidFilename, loadButton, LoadProfile, Profile, readCurrentProfile, renameProfile, ReservedFileName, saveButton, SaveProfile, verifyProfileNameFree } from "./profile";
import Toast from 'react-native-toast-message';
import { Settings } from './setting-storage';
import prompt from 'react-native-prompt-android';
import Svg, { G, Path, Polygon } from "react-native-svg";
import { MyCloseIcon, MyIcon } from "./common/icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenSubTitle, ScreenTitle } from "./common/settings-elements";
import { colors } from "./common/common-style";
import { IconButton } from "./common/components";
import { Checkbox } from "./common/check-box";

const removeIcon = <Svg width="23px" height="23px" viewBox="0 0 27 27">
    <G id="Design-IssieSays" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <G transform="translate(-1755.000000, -13133.000000)">
            <G transform="translate(1755.000000, 13133.000000)">
                <Path d="M3,27 C2.175,27 1.46875,26.70625 0.88125,26.11875 C0.29375,25.53125 0,24.825 0,24 L0,3 C0,2.175 0.29375,1.46875 0.88125,0.88125 C1.46875,0.29375 2.175,0 3,0 L15,0 L15,3 L3,3 L3,24 L24,24 L24,12 L27,12 L27,24 C27,24.825 26.70625,25.53125 26.11875,26.11875 C25.53125,26.70625 24.825,27 24,27 L3,27 Z M5,21 L23,21 L17.375,13 L12.875,19.4 L9.5,14.6 L5,21 Z M19.8,9 L18,7.2 L20.7,4.5 L18,1.8 L19.8,0 L22.5,2.7 L25.2,0 L27,1.8 L24.3321429,4.5 L27,7.2 L25.2,9 L22.5,6.33214286 L19.8,9 Z" id="Shape" fill="#5F6368" fill-rule="nonzero"></Path>
                <Polygon id="Path" fill="#FF0000" points="19.8 9 18 7.2 20.7 4.5 18 1.8 19.8 0 22.5 2.7 25.2 0 27 1.8 24.3321429 4.5 27 7.2 25.2 9 22.5 6.33214286"></Polygon>
            </G>
        </G>
    </G>
</Svg>


export const BUTTONS = {
    name: 'buttons'
}
export const ONE_AFTER_THE_OTHER = {
    name: 'one_after_the_other'
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

export const INSTALL = {
    fresh: 'fresh-install',
    firstTimeSettings: 'firstTimeSettings'
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

    const changeOneAfterTheOther = (newVal: boolean) => {
        Settings.set(ONE_AFTER_THE_OTHER.name, newVal);
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

    const saveAsNewProfile = async () => {
        handleProfileEditName("", false, () => setRevision(prev => prev + 1))
    }

    const colorWidth = Math.min(windowSize.width, windowSize.height);
    const dirStyle: any = { flexDirection: (isRTL() ? "row" : "row-reverse") }
    let marginHorizontal = {}
    if (windowSize.width < 450) {
        marginHorizontal = { marginHorizontal: 5 };
    }

    const doProfileSave = async (name: string, previousName: string, isCurrent: boolean, overwrite = false) => {
        console.log("doProfileSave")
        if (!isValidFilename(name)) {
            throw new InvalidFileName(name);
        }

        if (name.trim() == DefaultProfileName || name.trim() == translate(DefaultProfileName)) {
            throw new ReservedFileName();
        }
        if (previousName == "") {
            // new profile
            if (!overwrite) {
                return verifyProfileNameFree(name).then(async () => {
                    const currentProfile = await readCurrentProfile();
                    await SaveProfile(name, currentProfile, true);
                    Settings.set(CURRENT_PROFILE.name, name);
                });
            } else {
                Settings.set(CURRENT_PROFILE.name, name);
            }
            setRevision(prev => prev + 1);
        } else {
            // rename profile
            return renameProfile(previousName, name).then(() => {
                if (isCurrent) {
                    Settings.set(CURRENT_PROFILE.name, name);
                    setRevision(prev => prev + 1);
                }
            })
        }
    }

    const handleProfileDelete = async (name: string, afterDelete: () => void, force = false) => {
        const currName = Settings.getString(CURRENT_PROFILE.name, "");
        const isCurrent = name == currName;

        if (!force) {
            const msg = isCurrent ?
                fTranslate("DeleteCurrentProfileWarnning", name) :
                fTranslate("DeleteProfileWarnning", name);

            Alert.alert(translate("DeleteProfileTitle"), msg, [
                { text: translate("Cancel"), style: "cancel" },
                { text: translate("Delete"), style: "destructive", onPress: () => handleProfileDelete(name, afterDelete, true) }
            ]);
            return;
        }

        if (isCurrent) {
            await LoadProfile(DefaultProfileName);
            setTimeout(() => setRevision(prev => prev + 1), 100);
        }
        await deleteProfile(name);
        afterDelete();
    }

    const handleProfileEditName = (name: string, isRename: boolean, afterSave: () => void) => {
        const currName = Settings.getString(CURRENT_PROFILE.name, "");
        const isCurrent = currName == name;
        prompt(isRename ? translate("RenameProfile") : translate("SetProfileName"), undefined, [
            { text: translate("Cancel"), style: "cancel" },
            {
                text: translate("Save"),
                onPress: (newName) => {
                    console.log("save pressed", newName)
                    if (newName) {
                        doProfileSave(newName, name, isCurrent)
                            .then(() => {
                                afterSave();
                                Toast.show({
                                    autoHide: true,
                                    type: 'success',
                                    text1: translate(isRename ? "ProfileSuccessRenamed" : "ProfileSuccessfulyCreated")
                                })
                            })
                            .catch((err) => {
                                if (err instanceof AlreadyExists) {
                                    Alert.alert(translate("ProfileExistsTitle"), fTranslate("ProfileExists", name),
                                        [
                                            {
                                                text: translate("Overwrite"), onPress: () => {
                                                    doProfileSave(newName, name, isCurrent, true).then(() => {
                                                        afterSave();
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
                                } else if (err instanceof ReservedFileName) {
                                    Alert.alert(translate("ReservedName"));
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
        ], { type: 'plain-text', defaultValue: name });
    }


    const handleButtonEditName = (index: number) => {
        prompt(translate("SetButtonName"), undefined, [
            { text: translate("Cancel"), style: "cancel" },
            {
                text: translate("OK"),
                onPress: (newName) => {
                    console.log("OK pressed", newName)
                    if (newName) {
                        if (!isValidFilename(newName)) {
                            Alert.alert(fTranslate("InvalidName", InvalidCharachters));
                            return;
                        }
                        changeButtonsNames(index, newName);
                    }
                }
            },
        ], { type: 'plain-text', defaultValue: profile.buttons[index].name });
    }



    const handleSaveButton = (name: string, index: number) => {
        if (!name || name.trim().length == 0) {
            Alert.alert(translate("ButtonMissingName"), "", [{ text: translate("OK") }]);
            return;
        }
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
                    Alert.alert(translate("ButtonExistsTitle"), fTranslate("ButtonExists", name),
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

    const handleButtonDelete = async (name: string, afterDelete: () => void, force = false) => {

        if (!force) {
            Alert.alert(translate("DeleteButtonTitle"), fTranslate("DeleteButtonWarnning", name), [
                { text: translate("Cancel"), style: "cancel" },
                { text: translate("Delete"), style: "destructive", onPress: () => handleButtonDelete(name, afterDelete, true) }
            ]);
            return;
        }

        await deleteButton(name);
        afterDelete();
    }

    const safeAreaInsets = useSafeAreaInsets();


    return <View style={{ top: safeAreaInsets.top, position: "relative", width: windowSize.width, height: windowSize.height - 50 - safeAreaInsets.top }}>
        <ProfilePicker
            folder={Folders.Profiles}
            currentProfile={profileName}
            open={openLoadProfile}
            loadButton={{ name: translate("Load"), icon: "upload" }}
            exportButton={{ name: translate("Export") }}
            height={windowSize.height * .6}
            onSelect={async (name) => {
                console.log("Loading profile ", name)
                setProfileBusy(true);
                setOpenLoadProfile(false);
                await LoadProfile(name).finally(() => {
                    setProfileBusy(false)
                    setRevision(prev => prev + 1);
                });
            }}
            editButton={{ name: translate("Rename") }}
            onCreate={() => {
                saveAsNewProfile()
                //setShowEditProfileName({ name: "", afterSave: () => setRevision(prev => prev + 1) })
                setOpenLoadProfile(false);
            }}

            onEdit={(name, afterSave) => { }}

            //     setShowEditProfileName({
            //     name,
            //     afterSave
            // })}
            onDelete={(name, afterDelete) => handleProfileDelete(name, afterDelete)}
            onClose={() => setOpenLoadProfile(false)}
            //onExport={handleExportProfile}
            isNarrow={isScreenNarrow}
        />
        {/* <ProfilePicker
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
            onEdit={(name, onFinishEditing) => {
                handleProfileEditName(name, true, onFinishEditing);
            }}
            onDelete={handleProfileDelete}
            currentProfile={profileName}

        /> */}
        <ButtonPicker
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
            onDelete={handleButtonDelete}

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

        <ScreenTitle title={translate("Settings")} onClose={() => onClose()} onAbout={onAbout} icon={{ name: "check-bold", type: "MDI", size: 30, color: colors.titleBlue }} />

        {/* Profile Name */}
        <ScreenSubTitle
            titleIcon={{ name: "person-circle-outline", size: 45, color: colors.titleBlue, type: "Ionicons" }}
            elementTitle={translate("ProfileName")} elementName={profileName == DefaultProfileName ? translate(DefaultProfileName) : profileName}
            actionName={translate("ListProfiles")}
            actionIcon={{ name: "list", type: "Ionicons", color: colors.titleBlue, size: 25 }}
            onAction={() => setOpenLoadProfile(true)}
        />

        <ScrollView style={styles.settingHost}
            ref={scrollViewRef} >



            <View style={[styles.section, marginHorizontal, dirStyle]} >
                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity style={{ width: 25, height: 25, backgroundColor: BACKGROUND.DARK, borderRadius: 12.5 }}
                        onPress={() => changeBackgroundColor(BACKGROUND.DARK)}>
                        {backgroundColor === BACKGROUND.DARK &&
                            <MyIcon info={{ type: "AntDesign", name: "check", size: 25 }} />
                        }
                    </TouchableOpacity>
                    <Spacer w={25} />
                    <TouchableOpacity style={{ width: 25, height: 25, backgroundColor: BACKGROUND.LIGHT, borderColor: "black", borderWidth: 1, borderRadius: 12.5 }}
                        onPress={() => changeBackgroundColor(BACKGROUND.LIGHT)}>
                        {backgroundColor === BACKGROUND.LIGHT &&
                            <MyIcon info={{ type: "AntDesign", name: "check", color: "black", size: 25 }} />
                        }
                    </TouchableOpacity>
                    <Spacer w={5} />
                </View>
                <Text allowFontScaling={false} style={styles.sectionTitle}>{translate("BackgroundColor")}</Text>
            </View>

            <View style={[styles.section, marginHorizontal, dirStyle]} >
                <View style={{ direction: isRTL() ? "rtl" : "ltr", flexDirection: "row", alignItems: "center" }} >
                    <Checkbox size={30} caption={translate("OneAfterTheOther")} checked={profile.oneAfterTheOther}
                        onToggle={() => changeOneAfterTheOther(!profile.oneAfterTheOther)} />
                    <Spacer w={20} />
                    <View style={styles.numberSelector}>
                        <MyIcon info={{ type: "AntDesign", name: "minus-circle", color: profile.buttons.length == 1 ? "lightgray" : BTN_COLOR, size: 35 }}
                            onPress={() => changeNumOfButton(-1)} />

                        <Text allowFontScaling={false} style={{ fontSize: 30, marginHorizontal: 10 }}>{profile.buttons.length}</Text>
                        <MyIcon info={{ type: "AntDesign", name: "plus-circle", color: profile.buttons.length == 4 ? "lightgray" : BTN_COLOR, size: 35 }}
                            onPress={() => changeNumOfButton(1)} />
                    </View>

                </View>
                <Text allowFontScaling={false} style={styles.sectionTitle}>{translate("Buttons")}</Text>
            </View>

            <View style={[styles.buttons, marginHorizontal]}>
                {
                    Array.from(Array(profile.buttons.length).keys()).map((i: any) => (
                        <ButtonSettings
                            key={i}
                            index={i}
                            revision={revision}
                            profileButton={profile.buttons[i]}
                            isBusy={buttonBusy == i}
                            onOpenLoadButtons={() => setOpenLoadButton(i)}
                            onSaveButton={() => handleSaveButton(profile.buttons[i].name, i)}
                            onSetImageUrl={(url) => saveImageUrl(i, url)}
                            onSetColorPickerOpen={() => setColorPickerOpen(i)}
                            onSetShowNames={(show) => saveShowNames(i, show)}
                            onImageSearchOpen={() => setImageSearchOpen(i)}
                            onEditName={() => handleButtonEditName(i)}
                            isLast={i == profile.buttons.length - 1}
                            isScreenNarrow={isScreenNarrow}
                        />

                    ))
                }
            </View>
            {textInEdit.find(t => t) && <Spacer h={keyboardHeight} />}
        </ScrollView >
    </View >
}

function ButtonSettings({ index, revision, profileButton, isBusy,
    onOpenLoadButtons, onSaveButton, onSetImageUrl, onSetColorPickerOpen, onSetShowNames,
    onEditName,
    onImageSearchOpen, isLast, isScreenNarrow }: {
        index: 0 | 1 | 2 | 3,
        revision: number;
        profileButton: Button;
        isBusy: boolean;
        onOpenLoadButtons: () => void;
        onSaveButton: () => void;
        onSetImageUrl: (url: string) => void;
        onSetColorPickerOpen: () => void;
        onImageSearchOpen: () => void;
        onSetShowNames: (show: boolean) => void;
        onEditName: () => void;
        isLast: boolean;
        isScreenNarrow: boolean;
    }) {


    return <View style={[{
        direction: isRTL() ? "rtl" : "ltr",
        width: "100%",
        //height: 160,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomColor: "lightgray",
        borderBottomWidth: isLast ? 0 : 2,
        paddingBottom: 15,
        paddingTop: 15,
    }, isScreenNarrow && { flexDirection: "column", alignItems: "flex-start" }]}>
        {/* Buttons */}
        <View style={{ flexDirection: "column" }}>
            {/* Top Row */}
            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start", height: 60 }}>
                <Checkbox size={30} caption={translate("ShowName")} checked={profileButton.showName}
                    onToggle={() => onSetShowNames(!profileButton.showName)} />

                {isBusy && <ActivityIndicator size="large" color="#0000ff" />}
                <IconButton text={translate("Load")} onPress={() => onOpenLoadButtons()} />
                <IconButton text={translate("Save")} onPress={() => onSaveButton()} />
            </View>
            {/* Bottom Row */}
            <View style={{ flexDirection: "row", alignItems: "center", height: 60 }}>
                <MyIcon info={{ type: "MDI", name: "palette-outline", size: 30 }} onPress={() => onSetColorPickerOpen()} />
                <Spacer w={20} />
                <MyIcon info={{ type: "MDI", name: "image-outline", size: 30 }} onPress={() => {
                    SelectFromGallery().then((url) => {
                        if (url !== "") {
                            onSetImageUrl(url);
                        }
                    })
                }} />

                <Spacer w={20} />

                <TouchableOpacity onPress={() => onSetImageUrl("")}>
                    {removeIcon}
                </TouchableOpacity>
                <Spacer w={20} />
                <MyIcon info={{ type: "MDI", name: "image-search-outline", size: 30 }} onPress={() => {
                    onImageSearchOpen();
                }} />

                <Spacer w={20} />
                <View style={styles.verticalSeperator} />
                <Spacer w={20} />
                <RecordButton name={index + ""} backgroundColor={"#013D76"}
                    size={40} height={60} revision={revision} />
            </View>

        </View>

        {/* Preview */}
        <View>
            <View style={{ flexWrap: "nowrap", overflow: "visible", width: 140 }}>
                {/* <MainButton
                    name={profileButton.name}
                    showName={false}
                    fontSize={20}
                    width={80}
                    raisedLevel={3}
                    color={profileButton.color}
                    imageUrl={profileButton.imageUrl}
                    appBackground={BACKGROUND.LIGHT}
                    showProgress={false}
                    recName={"" + index}
                /> */}
                <View style={[styles.buttonPreview, { borderColor: profileButton.color }]} >
                    {profileButton.imageUrl?.length > 0 && <Image source={{ uri: profileButton.imageUrl }}
                        style={{
                            borderRadius: 80 * (5 / 12),
                            height: 80 * (5 / 6), width: 80 * (5 / 6),
                            transform: [{ scale: 0.9 }]
                        }} />}
                </View>
                <Spacer h={25} />
            </View>
            <View style={{ position: "absolute", flexDirection: "row", bottom: 0, [isRTL() ? "left" : "right"]: 0, height: 25, justifyContent: "flex-end" }}>
                <Text style={{ fontSize: 20, color: profileButton.showName ? "black" : "gray", paddingEnd: profileButton.name.length > 7 ? 0 : 27 }}>
                    {profileButton.name.length > 0 ? profileButton.name : translate("NoButtonName")}
                </Text>
                <MyIcon info={{ type: "MI", name: "edit", size: 25 }} onPress={onEditName} />
            </View>
        </View>

    </View >
}

const styles = StyleSheet.create({
    settingHost: {
        width: "100%",
        flex: 1,
        backgroundColor: "#F5F5F5",
        position: "relative"
    },
    settingTitleHost: {
        width: "100%",
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
    verticalSeperator: {
        width: 2,
        height: "80%",
        backgroundColor: "lightgray",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#0D3D63",
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
        borderRadius: 45,
        marginTop: 15,
        marginHorizontal: 40,
        height: "auto"
    },
    numberSelector: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        height: "100%"
    },

    buttonPreview: {
        alignItems: "center",
        justifyContent: "center",
        height: 80,
        width: 80,
        borderWidth: 2,
        borderStyle: "solid",
        borderRadius: 40,
        marginBottom: 5,
    }
})