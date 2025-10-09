import { Keyboard, ScrollView, StyleSheet, Text, TextInput, View, Alert } from "react-native";
import { BTN_COLOR } from "./uielements";
import { useEffect, useRef, useState } from "react";
import { fTranslate, isRTL, translate } from "./lang";
import { DefaultProfileName, ProfilePicker } from "./profile-picker";
import { AlreadyExists, Button, createNewProfile, deleteButton, deleteProfile, Folders, getRecordingFileName, InvalidCharachters, InvalidFileName, isValidFilename, loadButton, LoadProfile, Profile, readCurrentProfile, renameProfile, ReservedFileName, saveButton, SaveProfile, verifyProfileNameFree } from "./profile";
import Toast from 'react-native-toast-message';
import { Settings } from './setting-storage';
import { MyIcon } from "./common/icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenSubTitle, ScreenTitle } from "./common/settings-elements";
import { colors } from "./common/common-style";
import { ButtonCard } from "./button-card";
import { EditButton, EditedButton } from "./edit-button";
import { moveFile, unlink } from "react-native-fs";
import { EditText } from "./common/edit-text";
import { IconButton } from "./common/components";
import Share from 'react-native-share';
import { exportAll, exportProfile } from "./import-export";
import { getIsMobile } from "./utils";




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
    const [textInEdit, setTextInEdit] = useState<boolean[]>([false, false, false, false]);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [openLoadProfile, setOpenLoadProfile] = useState<boolean>(false);
    const [inputProfile, setInputProfile] = useState<boolean>(false);
    const [editProfileName, setEditProfileName] = useState<{ name: string, afterSave: () => void } | undefined>();

    const textInputRef = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)];
    const scrollViewRef = useRef<ScrollView>(null);

    const [profile, setProfile] = useState<Profile>(readCurrentProfile());
    const [profileName, setProfileName] = useState<string>(Settings.getString(CURRENT_PROFILE.name, ""));
    const [backgroundColor, setBackgroundColor] = useState<string>(Settings.getString(BACKGROUND.name, BACKGROUND.LIGHT));
    const [profileBusy, setProfileBusy] = useState<boolean>(false);
    const [editButton, setEditButton] = useState<number>(-1);
    const [busy, setBusy] = useState<boolean>(false);
    const isMobile = getIsMobile(windowSize)
    console.log("isMobile", isMobile, windowSize)

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

    const changeBackgroundColor = (color: string) => {
        Settings.set(BACKGROUND.name, color);
        setRevision(old => old + 1);
    }

    const changeOneAfterTheOther = (newVal: boolean) => {
        Settings.set(ONE_AFTER_THE_OTHER.name, newVal);
        if (newVal == false) {
            // limit num of buttons to 4
            const current = Settings.getNumber(BUTTONS.name, 1);
            if (current > 4) {
                Settings.set(BUTTONS.name, 4);
            }
        }
        setRevision(old => old + 1);
    }

    const changeNumOfButton = (delta: number) => {
        const current = Settings.getNumber(BUTTONS.name, 1);
        const oneAfterTheOther = Settings.getBoolean(ONE_AFTER_THE_OTHER.name, false);
        let newVal = current + delta;
        if (newVal < 1) return;
        if (oneAfterTheOther && newVal > 20 || !oneAfterTheOther && newVal > 4) return;
        Settings.set(BUTTONS.name, newVal);
        setRevision(old => old + 1);
    }

    const changeButtonName = (index: number, newName: string) => {
        console.log("change buttun text", index, newName)
        let newButtonNames = profile.buttons.map(b => b.name);
        newButtonNames[index] = newName
        Settings.setArray(BUTTONS_NAMES.name, newButtonNames);
    }

    const saveColor = (index: number, newVal: string) => {
        let newColors = profile.buttons.map(b => b.color);
        newColors[index] = newVal
        Settings.setArray(BUTTONS_COLOR.name, newColors);
    }

    const saveImageUrl = (index: number, newVal: string) => {
        let newBtnImageUrls = profile.buttons.map(b => b.imageUrl);
        newBtnImageUrls[index] = newVal
        Settings.setArray(BUTTONS_IMAGE_URLS.name, newBtnImageUrls);
        console.log("new button ImageUrl", newBtnImageUrls, index)
    }
    const saveShowNames = (index: number, newVal: boolean) => {
        let newBtnShowNames = profile.buttons.map(b => b.showName);
        newBtnShowNames[index] = newVal
        Settings.setArray(BUTTONS_SHOW_NAMES.name, newBtnShowNames);
    }

    const handleSaveButton = (index: number, btn: EditedButton) => {
        saveColor(index, btn.color);
        saveImageUrl(index, btn.imageUrl);
        saveShowNames(index, btn.showName);
        changeButtonName(index, btn.name);
        if (btn.audioName) {
            // copy the audio file
            const tmpFile = getRecordingFileName(btn.audioName)
            const targetFile = getRecordingFileName(index + "")
            unlink(targetFile).
                catch(() => {/** expected to be empty sometimes */ }).
                finally(() => moveFile(tmpFile, targetFile));
        }
        setRevision(old => old + 1);
    }

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

    const handleProfileEditName = (newName: string, prevName: string, isRename: boolean, afterSave: () => void) => {
        const currName = Settings.getString(CURRENT_PROFILE.name, "");
        const isCurrent = currName == prevName;

        doProfileSave(newName, prevName, isCurrent)
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
                    Alert.alert(translate("ProfileExistsTitle"), fTranslate("ProfileExists", newName),
                        [
                            {
                                text: translate("Overwrite"), onPress: () => {
                                    doProfileSave(newName, prevName, isCurrent, true).then(() => {
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

    async function handleExportProfile(name: string) {
        setBusy(true);
        const zipPath = (await exportProfile(name)
            .finally(() => setBusy(false))
        ) as string;

        const shareOptions = {
            title: translate("ShareProfileWithTitle"),
            subject: translate("ShareProfileEmailSubject"),
            urls: [zipPath],
        };

        Share.open(shareOptions).then(() => {
            Alert.alert(translate("ShareSuccessful"));
        }).catch(err => {
            Alert.alert(translate("ActionCancelled"));
        });
    }

    async function handleBackupAll() {
        setBusy(true)
        const zipPath = (await exportAll()
            .catch(err => console.log("export all failed", err))
            .finally(() => setBusy(false))
        ) as string;

        console.log("Export All", zipPath)
        const shareOptions = {
            title: translate("ShareBackupWithTitle"),
            subject: translate("ShareBackupEmailSubject"),
            urls: [zipPath],
        };

        Share.open(shareOptions).then(() => {
            Alert.alert(translate("ShareSuccessful"));
        }).catch(err => {
            Alert.alert(translate("ActionCancelled"));
        });
    }


    const safeAreaInsets = useSafeAreaInsets();
    const maxButtons = profile.oneAfterTheOther ? 20 : 4

    let buttonsInRow = windowSize.width > windowSize.height ? 4 : 2;
    const hMargin = isScreenNarrow ? 5 : 40;
    const buttonCardSize = Math.max((windowSize.width - safeAreaInsets.left - safeAreaInsets.right - 2 * hMargin) / buttonsInRow - 10, 150)

    if (editButton > -1) {
        return <EditButton index={editButton} button={profile.buttons[editButton]} isNarrow={isScreenNarrow} onClose={() => setEditButton(-1)}
            onDone={(btn: EditedButton) => {
                handleSaveButton(editButton, btn)
                setEditButton(-1);
            }}
            windowSize={windowSize}
        />
    }

    return <View style={{ top: safeAreaInsets.top, position: "relative", width: windowSize.width, height: windowSize.height - 50 - safeAreaInsets.top }}>
        <ProfilePicker
            folder={Folders.Profiles}
            currentProfile={profileName}
            open={openLoadProfile}
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
                setInputProfile(true);
                setOpenLoadProfile(false);
            }}

            onEdit={(name, afterSave) =>
                setEditProfileName({
                    name,
                    afterSave
                })}

            onDelete={(name, afterDelete) => handleProfileDelete(name, afterDelete)}
            onClose={() => setOpenLoadProfile(false)}
            onExport={handleExportProfile}
            isNarrow={isScreenNarrow}
        />

        {inputProfile && <EditText initialText="" label={translate("ProfileNameTitle")} onClose={() => setInputProfile(false)}
            onDone={async (name) => {
                setInputProfile(false);
                await createNewProfile(name);
                await LoadProfile(name).finally(() => {
                    setProfileBusy(false)
                    setRevision(prev => prev + 1);
                });
            }}
            width={Math.min(windowSize.width / 2, 300)}
            textHeight={70}
            textWidth={250}
            windowSize={windowSize}

        />}
        {editProfileName && <EditText initialText={editProfileName.name} label={translate("ProfileEditNameTitle")} onClose={() => setEditProfileName(undefined)}
            onDone={async (name) => {
                handleProfileEditName(name, editProfileName.name, true, editProfileName.afterSave);
                setEditProfileName(undefined);

            }}
            width={Math.min(windowSize.width / 2, 300)}
            textHeight={70}
            textWidth={250}
            windowSize={windowSize}

        />}

        <ScreenTitle title={translate("Settings")} onClose={() => onClose()} onAbout={onAbout} icon={{ name: "check-bold", type: "MDI", size: 30, color: colors.titleBlue }} />

        {/* Profile Name */}
        <ScreenSubTitle
            titleIcon={{ name: "person-circle-outline", size: 45, color: colors.titleBlue, type: "Ionicons" }}
            elementTitle={translate("ProfileName")} elementName={profileName == DefaultProfileName ? translate(DefaultProfileName) : profileName}
            actionName={translate("ListProfiles")}
            actionIcon={{ name: "list", type: "Ionicons", color: colors.titleBlue, size: 25 }}
            onAction={() => setOpenLoadProfile(true)}
        />

        <View style={styles.settingHost}>
            <View style={[styles.section, marginHorizontal, dirStyle]} >
                <View style={{ flexDirection: "row" }}>
                    <IconButton backgroundColor="black" onPress={() => changeBackgroundColor(BACKGROUND.DARK)}
                        icon={backgroundColor === BACKGROUND.DARK ? { name: "check", color: "white", size: 25 } : undefined} />
                    <IconButton backgroundColor="white" onPress={() => changeBackgroundColor(BACKGROUND.LIGHT)} borderWidth={1}
                        icon={backgroundColor === BACKGROUND.LIGHT ? { name: "check", color: "black", size: 25 } : undefined} />
                </View>
                <Text allowFontScaling={false} style={styles.sectionTitle}>{translate("BackgroundColor")}</Text>
            </View>

            <View style={[styles.section, marginHorizontal, dirStyle]} >
                <View style={{ flexDirection: "row" }}>
                    <IconButton backgroundColor={profile.oneAfterTheOther ? "lightgray" : "white"} borderWidth={profile.oneAfterTheOther ? 3 : 1} text={isMobile ? undefined : translate("OneAfterTheOtherBtn")} icon={{ name: "transition", type: "MDI", color: "black", size: 25 }} onPress={() => changeOneAfterTheOther(true)} />
                    <IconButton backgroundColor={profile.oneAfterTheOther ? "white" : "lightgray"} borderWidth={profile.oneAfterTheOther ? 1 : 3} text={isMobile ? undefined : translate("AllAtOnceBtn")} icon={{ name: "gamepad-circle-outline", type: "MDI", color: "black", size: 25 }} onPress={() => changeOneAfterTheOther(false)} />
                </View>
                <Text allowFontScaling={false} style={styles.sectionTitle}>{translate("ButtonsLayout")}</Text>
            </View>

            <View style={[styles.section, marginHorizontal, dirStyle]} >
                <IconButton backgroundColor="white" text={translate("BackupAll")} icon={{ name: "cloud-upload", type: "AntDesign" }}
                    onPress={handleBackupAll} />
                <Text allowFontScaling={false} style={styles.sectionTitle}>{translate("Backup")}</Text>
            </View>

            <View style={[styles.section, marginHorizontal, dirStyle]} >
                <View style={[styles.numberSelector, { direction: isRTL() ? "rtl" : "ltr", flexDirection: "row", alignItems: "center" }]}>
                    <MyIcon info={{ type: "AntDesign", name: "minus-circle", color: profile.buttons.length == 1 ? "lightgray" : BTN_COLOR, size: 35 }}
                        onPress={() => changeNumOfButton(-1)} />

                    <Text allowFontScaling={false} style={{ fontSize: 30, marginHorizontal: 10 }}>{profile.buttons.length}</Text>

                    <MyIcon info={{ type: "AntDesign", name: "plus-circle", color: profile.buttons.length == maxButtons ? "lightgray" : BTN_COLOR, size: 35 }}
                        onPress={() => changeNumOfButton(1)} />
                </View>

                <Text allowFontScaling={false} style={styles.sectionTitle}>{translate("Buttons")}</Text>
            </View>


            <ScrollView style={styles.settingButtosnHost} >
                <View style={[styles.buttons, marginHorizontal, { flexDirection: isRTL() ? "row-reverse" : "row" }]}>
                    {
                        profile.buttons.map((button: Button, i: number) => (
                            <ButtonCard key={i} button={button} width={buttonCardSize} height={buttonCardSize * .8}
                                onSetActive={() => { }}
                                onEditButton={() => setEditButton(i)}
                                recName={i + ""}
                            />
                        ))
                    }
                </View>

            </ScrollView>
            {/* {textInEdit.find(t => t) && <Spacer h={keyboardHeight} />} */}
        </View >
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
    settingButtosnHost: {
        width: "100%",
        flex: 1,
        backgroundColor: "#F5F5F5",
        position: "relative",
    },
    buttons: {
        marginTop: 10,
        marginHorizontal: 40,
        flexWrap: "wrap",
        justifyContent: "space-between",

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
    // buttons: {
    //     backgroundColor: "white",
    //     padding: 20,
    //     flexDirection: "column",
    //     borderRadius: 45,
    //     marginTop: 15,
    //     marginHorizontal: 40,
    //     height: "auto"
    // },
    numberSelector: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        height: "100%",
        paddingHorizontal: 10,
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